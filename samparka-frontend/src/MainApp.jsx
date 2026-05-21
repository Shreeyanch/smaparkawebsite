import React, { useEffect, useState } from "react";
import { Toaster } from "sonner";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import SubscriptionExpired from "./components/SubscriptionExpired";
import api from "./api/config";
import Dashboard from "./pages/admin/Dashboard";
import MessageForm from "./pages/MessageForm";
import ScheduledMessage from "./pages/admin/ScheduledMessage";
import Sidebar from "./components/Sidebar";
import Store from "./pages/Store";
import EditStore from "./pages/EditStore";
import Loyality from "./pages/CustomizeLoyalityCard";
import Reward from "./pages/Reward";
import CreateReward from "./pages/CreateReward";
import Customers from "./pages/Customers";
import EmailSetting from "./pages/EmailSetting";
import EditReward from "./pages/EditReward";
import ConfigSMTP from "./pages/ConfigSMTP";
import PoweredBySamparka from "./components/PoweredBySamparka";
import Products from "./pages/Products";
import AddProducts from "./pages/AddProducts";
import ConfigSMS from "./pages/ConfigSMS";
import SMSSetting from "./pages/SMSSetting";
import Orders from "./pages/Orders";
import Services from "./pages/admin/Services";
import Checkout from "./pages/user/Checkout";
import Leaderboard from "./pages/AdminLeaderboard";
import L4SettlementReport from "./pages/admin/L4SettlementReport";
import CryptoJS from "crypto-js";
import Cookies from "js-cookie";
import { useAuth } from "./context/AuthContext";
import { MantineProvider } from "@mantine/core";
import PointsHistory from "./pages/PointsHistory";
import ChangePIN from "./pages/ChangePIN";
import CreateConstantReward from "./pages/CreateConstantReward";
import EditConstantReward from "./pages/EditConstantReward";
import Analytics from "./pages/Analytics";
import Category from "./pages/Category";
import PointsAnalytics from "./pages/PointsAnalytics";
import CustomerAnalytics from "./pages/CustomerAnalytics";
import VisitAnalytics from "./pages/VisitAnalytics";
import Messaging from "./pages/Messaging";
import GiftCardAnalytics from "./pages/GiftCardAnalytics";
import CreateOutlet from "./pages/admin/CreateOutlet";
import AdminWheelDashboard from "./pages/AdminWheelDashboard";
import Game from "./Game";
import ReservationSetting from "./pages/ReservationSetting";
import Reservation from "./pages/Reservation";
import NotificationSetting from "./pages/NotificationSetting";
import Config from "./pages/Config";
import MessageNotificationSetting from "./pages/MessageNotificationSetting";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import PrivacyPolicy from "./PrivacyPolicy";
import Whatsapp from "./pages/Whatsapp";
import LandingApp from "./landingPage/src/App";
import TermsAndConditions from "./components/termsAndConditions";

//Google Auth
import GoogleCallback from "./pages/GoogleCallback";

// testing commnet 4

// Signup Flow
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import CompleteProfile from "./pages/CompleteProfile";
import Billing from "./pages/Billing";
import Impact from "./pages/Impact";
import AIInsights from "./pages/AIInsights";
import MessageNotificationSettingModal from "./components/MessageNotificationSettingModal";
import OffersPage from "./pages/OffersPage";
import StoreSettings from "./pages/StoreSettings";
import LoyaltyCardSettings from "./pages/LoyaltyCardSettings";
import Tutorials from "./pages/Tutorials";
import SplashScreen from "./components/SplashScreen";
import AdminReceiptReview from "./pages/AdminReceiptReview";

const MainApp = () => {
  const { authState, updateAuth, isLoading } = useAuth();

  useEffect(() => {
    const handleStorageChange = async () => {
      const encryptedData = Cookies.get("userInfo");
      if (encryptedData) {
        const bytes = CryptoJS.AES.decrypt(
          encryptedData,
          import.meta.env.VITE_CLIENT_SECRET_KEY
        );
        const userInfo = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        const token = Cookies.get("token");

        // 🔥 Update global auth state
        await updateAuth(userInfo, token);
      }
    };

    // Listen for storage changes
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      // Render a loading state while loading auth data
      return <PoweredBySamparka />;
    }

    if (!authState.userInfo || !authState.token) {
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  // Check store subscription status for regular users
  const StoreSubscriptionRoute = ({ children }) => {
    const [storeCheck, setStoreCheck] = useState({ loading: true, hasActiveStore: false, hasStores: false });
    const { userInfo, token } = authState;

    useEffect(() => {
      const checkStoreSubscription = async () => {
        // Admins bypass subscription check
        if (userInfo?.role === "admin") {
          setStoreCheck({ loading: false, hasActiveStore: true, hasStores: true });
          return;
        }

        // Regular users need active store subscription
        if (userInfo?.role === "user" && token) {
          try {
            const response = await api.get("/store/myStores", { headers: { token } });
            if (response.data.success) {
              const stores = response.data.stores;
              const hasStores = stores && stores.length > 0;
              // Check if user has at least one active store
              const hasActive = stores.some(store => store.status === "active");
              setStoreCheck({ loading: false, hasActiveStore: hasActive, hasStores });
            } else {
              setStoreCheck({ loading: false, hasActiveStore: false, hasStores: false });
            }
          } catch (error) {
            console.error("Error checking store subscription:", error);
            setStoreCheck({ loading: false, hasActiveStore: false, hasStores: false });
          }
        } else {
          setStoreCheck({ loading: false, hasActiveStore: false, hasStores: false });
        }
      };

      checkStoreSubscription();
    }, [userInfo, token]);

    if (storeCheck.loading) {
      return <PoweredBySamparka />;
    }

    // Show subscription expired only if user has stores but they are inactive
    if (storeCheck.hasStores && !storeCheck.hasActiveStore && userInfo?.role === "user") {
      return <SubscriptionExpired />;
    }

    return children;
  };

  // Public route (redirect if logged in)
  const PublicRoute = ({ children }) => {
    if (authState.userInfo && authState.token) {
      if (authState.userInfo.role === "admin") {
        return <Navigate to="/dashboard" replace />;
      } else if (authState.userInfo.role === "user") {
        return <Navigate to="/store" replace />;
      }
    }
    return children;
  };

  return (
    <MantineProvider>
      <Router>
        <Toaster richColors expand={false} position="top-right" />
        <Routes>
          {/* Public Route */}
          {/* <Route path="/" element={<Home />} /> */}
          {/* <Route path="/blog" element={<Blog />} /> */}
          {/* <Route path="/blog/:id" element={<BlogPost />} /> */}
          {/*  */}

          {/* GoogleCallback handles its own auth flow and redirects - do not wrap in PublicRoute */}
          <Route
            path="/auth/google/callback"
            element={<GoogleCallback />}
          />

          <Route path="/game" element={<Game />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          {/* Verification pages - accessible without auth */}
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />

          <Route
            path="/forgotPassword"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              // <PublicRoute>
              <ResetPassword />
              // </PublicRoute>
            }
          />
          {/*  */}
          {/*  */}
          {/* Protected Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <StoreSubscriptionRoute>
                  <Sidebar />
                  <Dashboard />
                </StoreSubscriptionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/whatsapp"
            element={
              <ProtectedRoute>
                <Sidebar />
                <Whatsapp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <Sidebar />
                <Billing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sms"
            element={
              <>
                <ProtectedRoute>
                  <Sidebar />
                  {authState.userInfo && authState.userInfo.role === "admin" ? (
                    <ScheduledMessage />
                  ) : (
                    <MessageForm />
                  )}
                </ProtectedRoute>
              </>
            }
          />{" "}
          <Route path="/store">
            <Route
              index
              element={
                <>
                  <ProtectedRoute>
                    <StoreSubscriptionRoute>
                      <Sidebar />
                      <Store />
                    </StoreSubscriptionRoute>
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="reservationSetting"
              element={
                <>
                  <ProtectedRoute>
                    <Sidebar />
                    <ReservationSetting />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="spin-the-wheel"
              element={
                <>
                  <ProtectedRoute>
                    <Sidebar />
                    <AdminWheelDashboard />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="loyalityCard"
              element={
                <>
                  <ProtectedRoute>
                    <Sidebar />
                    <Loyality />
                  </ProtectedRoute>
                </>
              }
            />
            <Route path="services">
              <Route
                index
                element={
                  <>
                    <ProtectedRoute>
                      <Sidebar />
                      <Services />
                    </ProtectedRoute>
                  </>
                }
              />
            </Route>
            <Route path="createOutlet">
              <Route
                index
                element={
                  <>
                    <ProtectedRoute>
                      <Sidebar />
                      <CreateOutlet />
                    </ProtectedRoute>
                  </>
                }
              />
            </Route>
            <Route
              path="config"
              element={
                <>
                  <ProtectedRoute>
                    <Sidebar />
                    <Config />
                  </ProtectedRoute>
                </>
              }
            />
            {/* <Route
              path="SMTPConfig"
              element={
                <>
                  <ProtectedRoute>
                    <Sidebar />
                    <ConfigSMTP />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="SMSConfig"
              element={
                <>
                  <ProtectedRoute>
                    <Sidebar />
                    <ConfigSMS />
                  </ProtectedRoute>
                </>
              }
            /> */}
            <Route
              path="messageNotificationSetting"
              element={
                <>
                  <ProtectedRoute>
                    <Sidebar />
                    <MessageNotificationSetting />
                  </ProtectedRoute>
                </>
              }
            />
            {/* <Route
              path="emailSetting"
              element={
                <>
                  <ProtectedRoute>
                    <Sidebar />
                    <EmailSetting />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="smsSetting"
              element={
                <>
                  <ProtectedRoute>
                    <Sidebar />
                    <SMSSetting />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="notificationSetting"
              element={
                <>
                  <ProtectedRoute>
                    <Sidebar />
                    <NotificationSetting />
                  </ProtectedRoute>
                </>
              }
            /> */}
          </Route>
          <Route
            path="/changePin"
            element={
              <>
                <ProtectedRoute>
                  <Sidebar />
                  <ChangePIN />
                </ProtectedRoute>
              </>
            }
          />
          <Route
            path="/reservation"
            element={
              <>
                <ProtectedRoute>
                  <Sidebar />
                  <Reservation />
                </ProtectedRoute>
              </>
            }
          />
          <Route
            path="/editStore"
            element={
              <>
                <ProtectedRoute>
                  <Sidebar />
                  <EditStore />
                </ProtectedRoute>
              </>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <>
                <ProtectedRoute>
                  <Sidebar />
                  <Leaderboard />
                </ProtectedRoute>
              </>
            }
          />
          <Route
            path="/l4-settlement-report"
            element={
              <>
                <ProtectedRoute>
                  <Sidebar />
                  <L4SettlementReport />
                </ProtectedRoute>
              </>
            }
          />
          <Route path="/reward">
            <Route
              index
              element={
                <>
                  <ProtectedRoute>
                    <Sidebar />
                    <Reward />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="createConstantReward"
              element={
                <>
                  <ProtectedRoute>
                    <Sidebar />
                    <CreateConstantReward />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="editConstantReward"
              element={
                <>
                  <ProtectedRoute>
                    <Sidebar />
                    <EditConstantReward />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="createReward/:status"
              element={
                <>
                  <ProtectedRoute>
                    <Sidebar />
                    <CreateReward />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="editReward/:status"
              element={
                <>
                  <ProtectedRoute>
                    <Sidebar />
                    <EditReward />
                  </ProtectedRoute>
                </>
              }
            />
          </Route>
          <Route path="/customers">
            <Route
              index
              element={
                <>
                  <ProtectedRoute>
                    <StoreSubscriptionRoute>
                      <Sidebar />
                      <Customers />
                    </StoreSubscriptionRoute>
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="pointsHistory"
              element={
                <>
                  <ProtectedRoute>
                    <Sidebar />
                    <PointsHistory />
                  </ProtectedRoute>
                </>
              }
            />
          </Route>
          <Route
            path="/products"
            element={
              <>
                <ProtectedRoute>
                  <Sidebar />
                  <Products />
                </ProtectedRoute>
              </>
            }
          />
          {/* <Route
        path="/ecomForm"
        element={
          <ProtectedRoute>
            <Sidebar/>
            <EcomForm/>
          </ProtectedRoute>
        }
        /> */}
          <Route
            path="/addProducts"
            element={
              <>
                <ProtectedRoute>
                  <Sidebar />
                  <AddProducts />
                </ProtectedRoute>
              </>
            }
          />
          <Route
            path="/orders"
            element={
              <>
                <ProtectedRoute>
                  <Sidebar />
                  <Orders />
                </ProtectedRoute>
              </>
            }
          />
          <Route
            path="/category"
            element={
              <>
                <ProtectedRoute>
                  <Sidebar />
                  <Category />
                </ProtectedRoute>
              </>
            }
          />
          <Route
            path="/analytics"
            element={
              <>
                <ProtectedRoute>
                  <StoreSubscriptionRoute>
                    <Sidebar />
                    <Analytics />
                  </StoreSubscriptionRoute>
                </ProtectedRoute>
              </>
            }
          />
          <Route
            path="/points_analytics"
            element={
              <>
                <ProtectedRoute>
                  <Sidebar />
                  <PointsAnalytics />
                </ProtectedRoute>
              </>
            }
          />
          <Route
            path="/customer_analytics"
            element={
              <>
                <ProtectedRoute>
                  <Sidebar />
                  <CustomerAnalytics />
                </ProtectedRoute>
              </>
            }
          />
          <Route
            path="/visit_analytics"
            element={
              <>
                <ProtectedRoute>
                  <Sidebar />
                  <VisitAnalytics />
                </ProtectedRoute>
              </>
            }
          />
          <Route
            path="/impact"
            element={
              <>
                <ProtectedRoute>
                  <StoreSubscriptionRoute>
                    <Sidebar />
                    <Impact />
                  </StoreSubscriptionRoute>
                </ProtectedRoute>
              </>
            }
          />
          <Route
            path="/ai-insights"
            element={
              <>
                <ProtectedRoute>
                  <Sidebar />
                  <AIInsights />
                </ProtectedRoute>
              </>
            }
          />
          <Route
            path="/receipt-review"
            element={
              <>
                <ProtectedRoute>
                  <Sidebar />
                  <AdminReceiptReview />
                </ProtectedRoute>
              </>
            }
          />
          <Route
            path="/messaging"
            element={
              <>
                <ProtectedRoute>
                  <Sidebar />
                  <Messaging />
                </ProtectedRoute>
              </>
            }
          />
          <Route
            path="/notification"
            element={
              <>
                <ProtectedRoute>
                  <Sidebar />
                  <MessageNotificationSetting/>
                </ProtectedRoute>
              </>
            }
          />
          <Route
            path="/tutorials"
            element={
              <>
                <ProtectedRoute>
                  <Sidebar />
                  <Tutorials />
                </ProtectedRoute>
              </>
            }
          />
          <Route
            path="/offer"
            element={
              <>
                <ProtectedRoute>
                  <Sidebar />
                  <OffersPage/>
                </ProtectedRoute>
              </>
            }
          />
          <Route
            path="/store-settings"
            element={
              <>
                <ProtectedRoute>
                  <Sidebar />
                  <StoreSettings />
                </ProtectedRoute>
              </>
            }
          />
          <Route
            path="/loyalty-card-settings"
            element={
              <>
                <ProtectedRoute>
                  <Sidebar />
                  <LoyaltyCardSettings />
                </ProtectedRoute>
              </>
            }
          />
          <Route
            path="/giftcard_analytics"
            element={
              <>
                <ProtectedRoute>
                  <Sidebar />
                  <GiftCardAnalytics />
                </ProtectedRoute>
              </>
            }
          />
          <Route
            path="/splash-screen"
            element={
              <>
                <ProtectedRoute>
                  <SplashScreen/>
                </ProtectedRoute>
              </>
            }
          />
          {/* Landing page routes - catch-all at the end */}
          <Route path="/*" element={<LandingApp />} />
        </Routes>
      </Router>
    </MantineProvider>
  );
};

export default MainApp;
