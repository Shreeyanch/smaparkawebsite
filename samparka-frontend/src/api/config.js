import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_BASE_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hostname = window.location.hostname;
      const isMainApp =
        hostname === "samparka.co" ||
        hostname === "www.samparka.co" ||
        hostname === "localhost" ||
        hostname === "127.0.0.1";
      const isStaffRoute = window.location.pathname.startsWith("/store");

      let loginPath;
      if (isMainApp) loginPath = "/login";
      else if (isStaffRoute) loginPath = "/store/login";
      else loginPath = "/";

      const isAlreadyOnLoginPage =
        loginPath === "/"
          ? window.location.pathname === "/"
          : window.location.pathname.startsWith(loginPath);

      if (!isAlreadyOnLoginPage) {
        Cookies.remove("userInfo");
        Cookies.remove("token");
        window.location.href = loginPath;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
