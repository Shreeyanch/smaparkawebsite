export default function errorFunction(navigate) {
  // redirect to login or try refresh token
  console.warn("Token expired. Logging out...");

  // Clear localStorage and sessionStorage
  const outletId = localStorage.getItem("outletId");
  localStorage.removeItem("storeToken");
  sessionStorage.clear();

  // Redirect
  if (outletId) {
    navigate(`/store/login?outlet=${outletId}`, { replace: true });
  } else {
    navigate(`/store/login`, { replace: true });
  }
}
