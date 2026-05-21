import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";

const StoreAuthContext = createContext();

// Read auth synchronously from cookies so the very first render already has
// the real auth state. This prevents StoreProtectedRoute from firing a
// redirect to "/" before the async useEffect has a chance to run — which was
// causing the QR/NFC points URLs (/loyality/:pointsId) to be lost on cold start.
const readAuthFromCookies = () => {
  const encryptedData = Cookies.get("userInfo");
  const token = Cookies.get("token");
  if (encryptedData && token) {
    try {
      const bytes = CryptoJS.AES.decrypt(
        encryptedData,
        import.meta.env.VITE_CLIENT_SECRET_KEY
      );
      const userInfo = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      return { userInfo, token };
    } catch (error) {
      console.error("Error decrypting user data on init:", error);
      Cookies.remove("userInfo");
      Cookies.remove("token");
    }
  }
  return { userInfo: null, token: null };
};

export const StoreAuthProvider = ({ children }) => {
  // Initialize synchronously — no null/null → redirect race on first render
  const [authState, setAuthState] = useState(readAuthFromCookies);

  // Function to update auth state & set cookies
  const updateAuth = async (userInfo, token) => {
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(userInfo),
      import.meta.env.VITE_CLIENT_SECRET_KEY
    ).toString();

    Cookies.set("userInfo", encryptedData, {
      expires: 3650,
      secure: true,
      sameSite: "Strict",
    });
    Cookies.set("token", token, {
      expires: 3650,
      secure: true,
      sameSite: "Strict",
    });

    setAuthState({ userInfo, token });
  };

  // Function to log out the user
  const logout = async () => {
    Cookies.remove("userInfo");
    Cookies.remove("token");
    setAuthState({ userInfo: null, token: null });
  };

  useEffect(() => {
    // Re-sync if cookies change in another tab
    const handleStorageChange = () => {
      setAuthState(readAuthFromCookies());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <StoreAuthContext.Provider value={{ authState, updateAuth, logout }}>
      {children}
    </StoreAuthContext.Provider>
  );
};

export const useStoreAuth = () => useContext(StoreAuthContext);
