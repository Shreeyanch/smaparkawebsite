import React, { useState, useEffect, useCallback } from "react";
import { ensurePushSubscription, cachePushEndpoint, clearPushEndpoint } from "../utils/pushSubscription";
import ViewReward from "../components/ViewReward";
import Reward from "../components/Reward";
import PortalDrawer from "../components/PortalDrawer";
import L1 from "../components/L1";
import L2 from "../components/L2";
import L3 from "../components/L3";
import L4 from "../components/L4";
import { Outlet, useNavigate } from "react-router-dom";
import api from "../api/config";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "sonner";
import { BellOff, BellRing, ScanQrCode, ShoppingBag } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useStoreAuth } from "../context/StoreAuthContext";
import Greeting from "../components/Greeting";
import InitialInstallationGuide from "../components/InitialInstallationGuide";
import { getDistance } from "geolib";
import Cookies from "js-cookie";
import {
  Badge,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Switch,
  Typography,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import BottomNav from "../components/BottomNav";
import BottomNavigation from "../components/BottomNavigation";

const LoyalityCard = () => {
  const queryClient = useQueryClient();
  const { storeData } = queryClient.getQueryData(["store"]);
  if (!storeData) return <PoweredBySamparka />;
  const greetings = ["Namaste!", "Jwojwolapa!", "Sewaro!", "Tashi Delek!"];
  const [points, setPoints] = useState(0);
  const [customerTier, setCustomerTier] = useState("");
  const [notificationPermission, setNotificationPermission] = useState();
  const { authState, updateAuth } = useStoreAuth();
  const { userInfo: user, token } = authState;
  const [showGuide, setShowGuide] = useState(true);
  const [cardData, setCardData] = useState({
    ...storeData.loyaltyCard,
    store: storeData.name,
    logo: storeData.logo,
    frontLogo: storeData.frontLogo,
    location: storeData.location,
    storeId: storeData._id,
  });
  const [loading, setLoading] = useState(false);
  const [isFrameOpen, setFrameOpen] = useState(false);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const isDropdownOpen = Boolean(anchorEl);
  const [notifications, setNotifications] = useState([]);
  const [showQR, setShowQR] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const toggleNotification = () => {
    // setNotificationPermission((prev) => !prev);
    // Perform the action based on the toggle state
    if (notificationPermission) {
      removeNotification(); // Call the removeNotification function
    } else {
      showNotification(); // Call the showNotification function
    }
  };

  const showNotification = async () => {
    if (!("Notification" in window)) {
      toast.info("This browser does not support notifications.");
      return;
    }
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.info("Please go to settings and enable notifications.");
        return;
      }
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        toast.error("Service worker not found.");
        return;
      }
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          "BNOFxo-K_WdOwjUVeBqxg4T-9OMCLsdC4PkV49pDPufEC9v-gAcKdXs_6FN7zQoea6hTQH5Ny7zpkoAkJ4cy0gU",
      });

      const userId = user._id;
      await api.post(
        "/subscribe",
        { userId, subscription },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      cachePushEndpoint(userId, subscription);
      setNotificationPermission(true);
    } catch (error) {
      console.error("Error subscribing to notifications:", error);
      toast.error("Failed to subscribe to notifications.");
    } finally {
      setLoading(false);
    }
  };
  const removeNotification = async () => {
    setLoading(true);
    try {
      const userId = user._id;
      await api.delete(
        `/unsubscribe/${userId}`,
        { userId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      clearPushEndpoint(userId);
      setNotificationPermission(false);
    } catch (error) {
      console.error("Error unsubscribing to notifications:", error);
      toast.error("Failed to unsubscribe to notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !token) {
      navigate("/");
      return;
    }

    const checkLocation = async () => {
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const storeLat = storeData?.lat;
        const storeLng = storeData?.lng;

        if (!storeLat || !storeLng) return;

        const distance = getDistance(
          { latitude, longitude },
          { latitude: storeLat, longitude: storeLng }
        );
        if (distance > 1000) return;

        try {
          await api.post(
            "/customer/check-proximity",
            { lat: latitude, lng: longitude }, // send as JS object
            {
              headers: {
                token,
                "Content-Type": "application/json",
              },
            }
          );
        } catch (error) {
          console.error("Location check failed:", error);
        }
      });
    };

    const handleNfcScan = async () => {
      if ("NDEFReader" in window) {
        try {
          const ndef = new NDEFReader();
          await ndef.scan();

          ndef.onreading = (event) => {
            const { message } = event;
            for (const record of message.records) {
              if (record.recordType === "url") {
                const textDecoder = new TextDecoder();
                const url = textDecoder.decode(record.data);
                // Navigate to the scanned URL
                window.location.href = url;
              }
            }
          };
        } catch (error) {
          console.error("NFC scan failed:", error);
        }
      } else {
        alert("Web NFC not supported on this device/browser.");
      }
    };

    // checkLocation();

    // const interval = setInterval(checkLocation, 1000 * 60 * 2); // every 2 minutes

    // return () => clearInterval(interval);

    // handleNfcScan();

    // const interval = setInterval(handleNfcScan, 1000); // every 2 minutes

    // return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const getCustomerData = async () => {
      try {
        const response = await api.get("/customer", { headers: { token } });
        setPoints(response.data.points);
        setCustomerTier(response.data.tier);
      } catch (error) {
        if (error.response?.status === 401) {
          // redirect to login or try refresh token
          console.warn("Token expired. Logging out...");
          // Safely clear subdomain cookies only
          Object.keys(Cookies.get()).forEach((cookieName) => {
            Cookies.remove(cookieName); // affects only current subdomain
          });

          // Clear localStorage and sessionStorage
          localStorage.clear();
          sessionStorage.clear();

          // Redirect
          window.location.href = "/login";
        } else {
          console.error("Unhandled error:", error);
        }
      }
    };

    const checkNotificationPermission = async () => {
      if (!("Notification" in window)) {
        setNotificationPermission(false);
        return;
      }
      const permission = Notification.permission;

      if (permission !== "granted") {
        setNotificationPermission(false);
        return;
      }

      try {
        const res = await api.get(
          `/customer/checkNotificationSubscription/${user._id}`,
          { headers: { token } }
        );
        setNotificationPermission(res.data.hasSubscription);
      } catch (err) {
        console.error("Failed to fetch notification subscription:", err);
        setNotificationPermission(false);
      }
    };

    if (token) {
      getCustomerData();
      checkNotificationPermission();
    }
  }, [token]);

  // Silently re-register push subscription with backend if the endpoint changed
  // (e.g. after a service worker update). No user interaction required.
  useEffect(() => {
    if (user?._id && "Notification" in window && Notification.permission === "granted") {
      ensurePushSubscription(user._id);
    }
  }, [user?._id]);

  // Listen for SUBSCRIPTION_CHANGED messages from the service worker
  // (fired by the pushsubscriptionchange handler when the browser rotates the endpoint)
  useEffect(() => {
    if (!navigator.serviceWorker) return;
    const handler = (event) => {
      if (event.data?.type === "SUBSCRIPTION_CHANGED" && user?._id) {
        ensurePushSubscription(user._id);
      }
    };
    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, [user?._id]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get(
          `/customer/customer-notifications/${user._id}`,
          { headers: { token } }
        );
        // const data = await response.json();
        setNotifications(response.data);
      } catch (err) {
        console.error("Error fetching customer notifications:", err);
      }
    };

    if (notificationPermission) {
      fetchNotifications();
    }
  }, [notificationPermission, token, user._id]);

  const openFrame = useCallback(() => setFrameOpen(true), []);
  const closeFrame = useCallback(() => setFrameOpen(false), []);
  const handleNavigate = useCallback(
    (path) => () => navigate(path),
    [navigate]
  );


  return (
    user && (
      <div className="min-h-screen w-full bg-white overflow-hidden">

        {loading && <LoadingSpinner />}
        <div
          className={`flex flex-col items-center py-4 justify-start box-border gap-[25px] text-left text-5xl1  font-poppins`}
        >
          {/* <div className="flex justify-start left-0"> */}
          {/* Greeting Section */}
          <div className=" max-w-[400px] mx-[350px] top-0 left-0 right-0 flex items-center justify-between p-2 z-10">
            <Greeting />
            <Button
              className="hover:scale-110 cursor-pointer transition-all"
              onClick={handleClick}
              id="basic-button"
              aria-controls={isDropdownOpen ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={isDropdownOpen ? "true" : undefined}
            >
              {notificationPermission ? (
                <BellRing style={{ color: cardData.cardColor }} />
              ) : (
                <BellOff style={{ color: cardData.cardColor }} />
              )}
            </Button>
            {/* Notification history dropdown */}
            <Menu
              id="basic-menu"
              open={isDropdownOpen}
              anchorEl={anchorEl}
              onClose={handleClose}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
              PaperProps={{
                sx: { width: 300, maxHeight: 400, p: 1 },
              }}
            >
              {/* Notification Toggle */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                px={1}
                py={1}
              >
                <Typography fontWeight="bold">Notifications</Typography>

                {/* <Switch
                  checked={notificationPermission}
                  onChange={toggleNotification}
                  size="small"
                /> */}
              </Box>

              <Divider />

              {/* Notification Lists */}
              <List dense disablePadding>
                {notificationPermission ? (
                  notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <ListItem key={notif._id} alignItems="flex-start">
                        <ListItemIcon>
                          <Badge
                            color={notif.read ? "default" : "primary"}
                            variant="dot"
                          >
                            <NotificationsNoneIcon fontSize="small" />
                          </Badge>
                        </ListItemIcon>
                        <ListItemText
                          primary={notif.title}
                          secondary={
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {notif.message} <br />
                              {new Date(notif.createdAt).toLocaleString()}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Box textAlign="center" p={2}>
                      <Typography variant="body2" color="text.secondary">
                        No notifications yet.
                      </Typography>
                    </Box>
                  )
                ) : (
                  <Box textAlign="center" p={2}>
                    <Typography variant="body2" color="text.secondary">
                      Notifications are turned off
                    </Typography>
                  </Box>
                )}
              </List>
            </Menu>
          </div>

          {/* Store Logo and some side buttons */}
          <ViewReward
            storeData={storeData}
            location={cardData.location}
            group1410103762={cardData.frontLogo || cardData.logo}
            vector="/send.svg"
            color={cardData.cardColor}
          />

          {/* main loyalty card */}
          <>
            {cardData?.format === "L1" ? (
              <L1
                {...cardData}
                showQR={showQR}
                setShowQR={setShowQR}
                points={points || 0}
              />
            ) : cardData?.format === "L2" ? (
              <L2
                {...cardData}
                showQR={showQR}
                setShowQR={setShowQR}
                points={points || 0}
              />
            ) : cardData?.format === "L4" ? (
              <>
                <L4
                  {...cardData}
                  showQR={showQR}
                  setShowQR={setShowQR}
                  points={points || 0}
                  customerTier={customerTier || "Bronze"}
                />
              </>
            ) : (
              <>
                <L3
                  {...cardData}
                  showQR={showQR}
                  setShowQR={setShowQR}
                  points={points || 0}
                  customerTier={customerTier || "Bronze"}
                />
                {/* <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shine" /> */}
              </>
            )}
          </>

          {/* View Rewards Button */}
          {cardData?.format == "L3" || cardData?.format == "L34HA" || cardData?.format == "L4" ? (
            <div className="self-stretch flex flex-row items-center justify-center py-2 px-0 gap-1 text-sm">
              <div className="overflow-hidden shrink-0 flex flex-row items-center justify-center p-px box-border">
                <img alt="View Rewards Icon" src="/vector.svg" />
              </div>
              <div
                className="relative tracking-[0.01em] font-medium cursor-pointer"
                onClick={() =>
                  navigate("/tier", { state: { tier: cardData.tier, points } })
                }
              >
                View Rewards
              </div>
              <img alt="Frame Icon" src="/frame-1410103878.svg" />
            </div>
          ) : (
            <div className="self-stretch flex flex-row items-center justify-center py-2 px-0 gap-1 text-sm">
              <div className="overflow-hidden shrink-0 flex flex-row items-center justify-center p-px box-border">
                <img alt="View Rewards Icon" src="/vector.svg" />
              </div>
              <div
                className="relative tracking-[0.01em] font-medium cursor-pointer"
                onClick={openFrame}
              >
                View Rewards
              </div>
              <img alt="Frame Icon" src="/frame-1410103878.svg" />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="w-full flex flex-row items-center justify-between px-0 gap-1 lg1:gap-1">
            <div>
              {/* {storeData.services?.leaderboard && (
                <div
                  style={{ backgroundColor: cardData.cardColor }}
                  className="w-[70px] h-12 flex items-center justify-center rounded-tr-md rounded-br-md cursor-pointer transition-transform"
                  onClick={() => navigate("/leaderboard")}
                >
                  {/* <Leaderboard className="text-white w-6 h-6" /> *
                  <img
                    src="/leaderboard.svg"
                    alt=""
                    className="text-white w-9"
                  />
                </div>
              )} */}
              {storeData.services?.ecommerce?.status && (
                <div className="w-full flex flex-row items-center justify-between py-2 px-0 gap-1 lg1:gap-1">
                  <div
                    style={{ backgroundColor: cardData.cardColor }}
                    className="w-[70px] h-12 flex items-center justify-center rounded-tr-md rounded-br-md cursor-pointer transition-transform"
                    onClick={() =>
                      navigate("/products", { state: { ...cardData } })
                    }
                  >
                    <ShoppingBag className="text-white" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col items-end justify-center">
              <div
                style={{ backgroundColor: cardData.cardColor }}
                className="w-[70px] h-12 flex items-center justify-center rounded-tl-md rounded-bl-md cursor-pointer transition-transform"
                onClick={() => setShowQR((prev) => !prev)}
              >
                <ScanQrCode className="text-white" />
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          {/* <div className="absolute bottom-0 left-0 right-0">
            <BottomNavigation />
          </div> */}
        </div>
        {!localStorage.getItem("hideGuide") && (
          <div className="fixed bottom-0 z-[60] w-screen">
            <InitialInstallationGuide
              showGuide={showGuide}
              setShowGuide={setShowGuide}
            />
          </div>
        )}
        {/* Reward Modal */}
        {isFrameOpen && (
          <PortalDrawer
            overlayColor="rgba(113, 113, 113, 0.3)"
            placement="Bottom"
            onOutsideClick={closeFrame}
          >
            <Reward
              onClose={closeFrame}
              storeId={cardData.storeId}
              store={storeData}
              token={token}
              color={cardData.cardColor}
            />
          </PortalDrawer>
        )}
        {storeData.services.powered && (
          <div className="flex flex-row items-center justify-center gap-2 z-6 text-3xs1 text-darkslategray-100 font-poppins">
            <a
              href="https://www.samparka.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <p className="text-2xs1 text-center">Powered By</p>
              <img
                src="/SAMPARKA.png"
                alt="Samparka Logo"
                className="w-[80px] object-contain"
              />
            </a>
          </div>
        )}
        {/* <BottomNav color={cardData.cardColor}/> */}
      </div>
    )
  );
};

export default LoyalityCard;
