import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import CustomerLogin from "./pages/subdomainPages/CustomerLogin";
import Verification from "./pages/subdomainPages/Verification";
import StoreSide from "./pages/subdomainPages/storeSide/StoreSide";
import GetPoints from "./pages/subdomainPages/GetPoints";
import LoyalityCard from "./pages/LoyalityCard_New";
import LoyalityCard2 from "./pages/LoyalityCard";
import PoweredBySamparka from "./components/PoweredBySamparka";
import StoreSidebar from "./components/storeSide/StoreSidebar";
import ViewRewards from "./pages/subdomainPages/storeSide/ViewRewards";
import HomePageStore from "./pages/user/HomePageStore";
import SingleProduct from "./pages/user/SingleProduct";
import Checkout from "./pages/user/Checkout";
import { CartProvider } from "./context/CartProvider";
import StoreLogin from "./pages/subdomainPages/storeSide/StoreLogin";
import api from "./api/config";
import Customers from "./pages/subdomainPages/storeSide/Customers";
import { useQuery } from "@tanstack/react-query";
import fetchStoreData from "./api/fetchStore";
import Leaderboard from "./pages/subdomainPages/Leaderboard";
import { useStoreAuth } from "./context/StoreAuthContext";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import ScanQr from "./pages/subdomainPages/storeSide/ScanQr";
import PointsHistory from "./pages/subdomainPages/storeSide/PointsHistory";
import Tier from "./pages/subdomainPages/Tier";
import GetOutletPoints from "./pages/subdomainPages/GetOutletPoints";
import GetPrintPoints from "./pages/subdomainPages/GetPrintPoints";
import TestComponent from "./components/testComponent";
import Games from "./pages/subdomainPages/Games";
import WhackAMoleGame from "./components/WhackAMoleGame";
import SpinWheel from "./components/SpinWheel";
import Reservation from "./pages/subdomainPages/Reservation";
import ViewReservation from "./pages/subdomainPages/storeSide/Reservation";
import Profile from "./pages/subdomainPages/Profile";
import Rewards from "./pages/subdomainPages/RewardHistory";
import ProfileSetting from "./pages/subdomainPages/ProfileSetting";
import Notifications from "./pages/subdomainPages/Notifications";
import PointHistory from "./pages/subdomainPages/PointHistory";
import ReservationHistory from "./pages/subdomainPages/ReservationHistory";
import OffersPage from "./pages/subdomainPages/Offers";
import LoadingSpinner from "./components/LoadingSpinner";
import ReservationForm from "./pages/subdomainPages/ReservationForm";
import SubscriptionExpired from "./components/SubscriptionExpired";
import LoadingSpinnerH from "./components/LoadingSpinnerH";
import SplashScreen from "./components/SplashScreen";
import CaffeophiliaSplashScreen from "./components/CaffeophiliaSplashScreen";
import L5LoyaltyPage from "./pages/subdomainPages/L5LoyaltyPage";
import L6LoyaltyPage from "./pages/subdomainPages/L6LoyaltyPage";
import L6RewardsPage from "./pages/subdomainPages/L6RewardsPage";
import OutletMap from "./pages/subdomainPages/OutletMap";
import L5AdminDashboard from "./pages/subdomainPages/storeSide/L5AdminDashboard";
import StoreVisitAnalytics from "./pages/storeSide/StoreVisitAnalytics";
// import ScanReceipt from "./pages/subdomainPages/ScanReceipt"; // Commented out - customer receipt scan disabled
import ReceiptReviewDashboard from "./pages/subdomainPages/storeSide/ReceiptReviewDashboard";
// import SubscriptionExpired from "./components/SubscriptionExpired";

// Component to dynamically update page title based on route
const TitleUpdater = ({ storeName }) => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const isAdmin = path.startsWith("/store");
    
    // Set title based on route
    if (isAdmin) {
      document.title = "Admin - " + storeName;
    } else {
      document.title = storeName;
    }
  }, [location.pathname, storeName]);

  return null;
};

import PoweredBySamparkaFooter from "./components/PoweredBySamparkaFooter";

const AppStore = ({ subdomain }) => {
  const { authState, updateAuth } = useStoreAuth();
  const [storeStatus, setStoreStatus] = useState();
  const [storeData, setStoreData] = useState({});
  const [showSplash, setShowSplash] = useState(true);
  const [splashDone, setSplashDone] = useState(false);

  const [showPoweredBy, setShowPoweredBy] = useState(false);

  useEffect(() => {
    if (storeData?.services?.powered !== undefined) {
      setShowPoweredBy(storeData.services.powered);
    }
  }, [storeData]);

  useEffect(() => {
    try {
      const encryptedData = Cookies.get("userInfo");
      const token = Cookies.get("token");

      if (encryptedData && token) {
        const bytes = CryptoJS.AES.decrypt(
          encryptedData,
          import.meta.env.VITE_CLIENT_SECRET_KEY
        );
        const userInfo = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

        updateAuth(userInfo, token);
      }
    } catch (e) {
      console.error("AppStore: failed to re-hydrate auth from cookie:", e);
    }
  }, []);

  useEffect(() => {
    const checkStore = async () => {
      if (subdomain && subdomain !== "" && subdomain !== "www") {
        try {
          const path = window.location.pathname;
          const isAdmin = path.startsWith("/store");
          const manifestType = isAdmin ? "admin" : "user";

          const outletId = localStorage.getItem("outletId");
          const manifestUrl = `${
            import.meta.env.VITE_SERVER_BASE_URL
          }manifest.json?subdomain=${subdomain}&type=${manifestType}${
            outletId ? `&outletId=${outletId}` : ""
          }`;

          fetch(manifestUrl)
            .then((res) => res.json())
            .then((store) => {
              // Set document title
              document.title = store.name;

              // Add favicon
              if (store.icons && store.icons.length > 0) {
                document
                  .querySelectorAll("link[rel='icon']")
                  .forEach((el) => el.remove());

                const newFavicon = document.createElement("link");
                newFavicon.rel = "icon";
                newFavicon.type = "image/png";
                newFavicon.sizes = "16x16";
                newFavicon.href = store.icons[0].src;
                document.head.appendChild(newFavicon);
              }

              // Apple-specific
              const metaTitle = document.createElement("meta");
              metaTitle.name = "apple-mobile-web-app-title";
              metaTitle.content = store.name;

              const touchIcon = document.createElement("link");
              touchIcon.rel = "apple-touch-icon";
              touchIcon.href = store.icons[0].src;

              document.head.appendChild(metaTitle);
              document.head.appendChild(touchIcon);

              // Inject manifest link for PWA installability
              // Must be at AppStore level so Chrome detects it on every route (not just logged-in pages)
              const existingManifest = document.querySelector('link[rel="manifest"]');
              if (existingManifest) existingManifest.remove();
              const manifestLink = document.createElement("link");
              manifestLink.rel = "manifest";
              manifestLink.href = manifestUrl;
              document.head.appendChild(manifestLink);
            })
            .catch((error) =>
              console.error("Failed to fetch store data:", error)
            );
        } catch (error) {
          console.log(error);
        }
      }
    };
    checkStore();
  }, [subdomain]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["store"],
    queryFn: () => fetchStoreData(subdomain),
    enabled: !!subdomain,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (data) {
      const { storeData, success } = data;
      setStoreData(storeData);
      setStoreStatus(success);
    }
  }, [data]);

  // Caffeophilia splash — stable overlay. Always rendered at the same JSX position
  // so React never remounts it while mainContent transitions (loading → router).
  const caffeSplash = subdomain === "caffeophilia" && !splashDone ? (
    <CaffeophiliaSplashScreen
      imagesToPreload={[storeData?.frontLogo, storeData?.logo, storeData?.backgroundImage].filter(Boolean)}
      onComplete={() => { setSplashDone(true); setShowSplash(false); }}
    />
  ) : null;

  const StoreProtectedRoute = ({ children, requiredService }) => {
    if (authState.userInfo === undefined || authState.token === undefined) {
      return subdomain == "himalayanjavaexpress" ? (
        <LoadingSpinnerH />
      ) : (
        <>
          <LoadingSpinner />
          <PoweredBySamparka />
        </>
      );
    }
    if (requiredService && storeData.services?.[requiredService] === false) {
      return <Navigate to="/loyality" replace />;
    }
    if (!authState.userInfo || !authState.token) {
      // Save the intended URL so CustomerLogin can redirect back after login.
      // Only save loyality sub-routes (QR/NFC paths) — not admin routes.
      const intended = window.location.pathname + window.location.search;
      if (intended.startsWith("/loyality/")) {
        sessionStorage.setItem("postLoginRedirect", intended);
      }
      return <Navigate to="/" replace />;
    }
    return children;
  };

  const StorePublicRoute = ({ children }) => {
    const { userInfo, token } = authState;
    const isLoading = userInfo === undefined || token === undefined;
    const isAuthenticated = !!userInfo && !!token;

    const navigate = useNavigate();

    useEffect(() => {
      if (isAuthenticated) {
        navigate("/loyality", { replace: true });
      }
    }, [isAuthenticated]);

    if (isLoading)
      return subdomain == "himalayanjavaexpress" ? (
        <LoadingSpinnerH />
      ) : (
        <>
          <LoadingSpinner />
          <PoweredBySamparka />
        </>
      );

    return children;
  };

  // Determine what to show underneath the splash overlay.
  // The splash is fixed/z-9999 so mainContent can be anything — it runs in parallel.
  let mainContent;

  if (isLoading) {
    mainContent = subdomain === "himalayanjavaexpress" ? (
      <LoadingSpinnerH />
    ) : caffeSplash ? null : ( // splash already covers the screen for caffeophilia
      <>
        <PoweredBySamparka />
        <LoadingSpinner />
      </>
    );
  } else if (error) {
    mainContent = <div>Error: {error.message}</div>;
  } else if (data && storeStatus === false) {
    const isStoreAdminRoute = window.location.pathname.startsWith("/store");
    mainContent = <SubscriptionExpired subdomain={subdomain} isCustomerView={!isStoreAdminRoute} />;
  } else if (data && (!data.storeData || data.error)) {
    mainContent = <div>Store not found</div>;
  } else if (storeStatus) {
    mainContent = (
      <Router>
        {showSplash && subdomain === "arabicacoffeedemo" && (
          <SplashScreen
            // logoSrc={storeData?.frontLogo || storeData?.logo}
            onComplete={() => setShowSplash(false)}
          />
        )}
        {showSplash && subdomain === "himalayanjavaexpress" && (
          <SplashScreen
            logoSrc={storeData?.frontLogo || storeData?.logo}
            onComplete={() => setShowSplash(false)}
          />
        )}

        
        <TitleUpdater storeName={storeData.name} />
        <Toaster richColors expand={false} position="top-right" />
        <Routes>
          {/* Public Route: Only accessible if NOT logged in */}
          <Route
            index
            element={
              <StorePublicRoute>
              <CustomerLogin url={subdomain} />
              </StorePublicRoute>
            }
          />
          <Route path="/spin-the-wheel" element={<SpinWheel />} />
          <Route
            path="/tier"
            element={
              <StoreProtectedRoute>
                <Tier url={subdomain} />
              </StoreProtectedRoute>
            }
          />

          <Route
            path="/rewards"
            element={
              <StoreProtectedRoute>
                <L6RewardsPage />
              </StoreProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <StoreProtectedRoute>
                <Profile  />
              </StoreProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <StoreProtectedRoute>
                <Notifications showPoweredBy={showPoweredBy} />
              </StoreProtectedRoute>
            }
          />

          <Route
            path="/pointHistory"
            element={
              <StoreProtectedRoute>
                <PointHistory showPoweredBy={showPoweredBy} />
              </StoreProtectedRoute>
            }
          />

          <Route
            path="/ProfileSetting"
            element={
              <StoreProtectedRoute>
                <ProfileSetting showPoweredBy={showPoweredBy} />
              </StoreProtectedRoute>
            }
          />

          <Route
            path="/myRewards"
            element={
              <StoreProtectedRoute>
                <Rewards showPoweredBy={showPoweredBy} />
              </StoreProtectedRoute>
            }
          />

          <Route
            path="/offers"
            element={
              <StoreProtectedRoute>
                <OffersPage />
              </StoreProtectedRoute>
            }
          />

          <Route
            path="/myReservations"
            element={
              <StoreProtectedRoute>
                <ReservationHistory showPoweredBy={showPoweredBy} />
              </StoreProtectedRoute>
            }
          />

          <Route
            path="/l5"
            element={
              <StoreProtectedRoute>
                <L5LoyaltyPage url={subdomain} storeData={storeData} />
              </StoreProtectedRoute>
            }
          />

          {/* Receipt scan - Commented out for customer side */}
          {/* <Route
            path="/scanReceipt"
            element={
              <StoreProtectedRoute>
                <ScanReceipt />
              </StoreProtectedRoute>
            }
          /> */}

          <Route path="/loyality">
            <Route
              index
              element={
                <StoreProtectedRoute>
                  {storeData?.loyaltyCard?.format === "L6" ? (
                    <L6LoyaltyPage url={subdomain} storeData={storeData} />
                  ) : (
                    <LoyalityCard url={subdomain} />
                  )}
                </StoreProtectedRoute>
              }
            />
            <Route
              path=":storeId/:outletId"
              element={
                <StoreProtectedRoute>
                  <GetOutletPoints url={subdomain} />
                </StoreProtectedRoute>
              }
            />
            <Route
              path="scan/:pointsId"
              element={
                <StoreProtectedRoute>
                  <GetPrintPoints url={subdomain} />
                </StoreProtectedRoute>
              }
            />
            <Route
              path=":pointsId"
              element={
                <StoreProtectedRoute>
                  <GetPoints url={subdomain} />
                </StoreProtectedRoute>
              }
            />
          </Route>

          {/* Protected Routes: Require store login */}
          <Route path="/store">
            <Route
              path="login"
              element={
                <>
                  <StoreLogin url={subdomain} />
                </>
              }
            />
            <Route
              path="points"
              element={
                <>
                  <StoreSidebar store={storeData} />
                  <StoreSide url={subdomain} />
                </>
              }
            />
            <Route
              path="viewRewards"
              element={
                <>
                  <StoreSidebar store={storeData} />
                  <ViewRewards url={subdomain} />
                </>
              }
            />
            <Route
              path="viewReservations"
              element={
                <>
                  <StoreSidebar store={storeData} />
                  <ViewReservation />
                </>
              }
            />
            <Route
              path="scanQr"
              element={
                <>
                  <StoreSidebar store={storeData} />
                  <ScanQr store={storeData} />
                </>
              }
            />
            <Route
              path="history"
              element={
                <>
                  <StoreSidebar store={storeData} />
                  <PointsHistory store={storeData} />
                </>
              }
            />
            <Route
              path="visit-analytics"
              element={
                <>
                  <StoreSidebar store={storeData} />
                  <StoreVisitAnalytics />
                </>
              }
            />
            <Route
              path="customers"
              element={
                <>
                  <StoreSidebar store={storeData} />
                  <Customers url={subdomain} store={storeData} />
                </>
              }
            />
            <Route
              path="l5"
              element={
                <>
                  <StoreSidebar store={storeData} />
                  <L5AdminDashboard store={storeData} />
                </>
              }
            />
            <Route
              path="receipts"
              element={
                <>
                  <StoreSidebar store={storeData} />
                  <ReceiptReviewDashboard store={storeData} />
                </>
              }
            />
          </Route>

          <Route
            path="/verification"
            element={
              <Verification />
              // <StoreProtectedRoute>
              // </StoreProtectedRoute>
            }
          />
          <Route path="/games">
            <Route
              index
              element={
                <StoreProtectedRoute requiredService="games">
                  <Games />
                </StoreProtectedRoute>
              }
            />
            <Route
              path="whack-a-mole"
              element={
                <StoreProtectedRoute requiredService="games">
                  <WhackAMoleGame />
                </StoreProtectedRoute>
              }
            />
          </Route>

          <Route
            path="/leaderboard"
            element={
              <StoreProtectedRoute>
                <Leaderboard />
              </StoreProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <StoreProtectedRoute>
                <OutletMap />
              </StoreProtectedRoute>
            }
          />
          {/* <Route
          path="/rewards"
          element={
            <StoreProtectedRoute>
              <Rewards />
            </StoreProtectedRoute>
          }
        /> */}
          <Route
            path="/reservation"
            element={
              <StoreProtectedRoute>
                <Reservation url={subdomain} />
              </StoreProtectedRoute>
            }
          />

          <Route
            path="/reservationForm"
            element={
              <StoreProtectedRoute>
                <ReservationForm/>
              </StoreProtectedRoute>
            }
          />

          {storeData.services?.ecommerce?.status && (
            <Route path="/products">
              <Route
                index
                element={
                  <CartProvider>
                    <HomePageStore url={subdomain} store={storeData} />
                  </CartProvider>
                }
              />
              <Route
                path=":productId"
                element={
                  <CartProvider>
                    <SingleProduct />
                  </CartProvider>
                }
              />
              <Route
                path="checkout"
                element={
                  <CartProvider>
                    <Checkout url={subdomain} store={storeData} />
                  </CartProvider>
                }
              />
            </Route>
          )}

          {/* Redirect /login to customer home */}
          <Route path="/login" element={<Navigate to="/" replace />} />

          {/* Catch-all Route */}
          <Route path="*" element={<PoweredBySamparka />} />
        </Routes>
      </Router>
    );
  } else {
    mainContent = subdomain === "himalayanjavaexpress" ? (
      <LoadingSpinnerH />
    ) : caffeSplash ? null : (
      <>
        <LoadingSpinner />
        <PoweredBySamparka />
      </>
    );
  }

  // Single return — caffeSplash is always at position [1] in the fragment so
  // React keeps the same instance mounted while mainContent transitions.
  return (
    <>
      {mainContent}
      {caffeSplash}
    </>
  );
};

export default AppStore;
