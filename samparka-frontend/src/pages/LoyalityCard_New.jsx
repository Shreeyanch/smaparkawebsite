import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ensurePushSubscription, cachePushEndpoint, clearPushEndpoint } from "../utils/pushSubscription";
import Reward from "../components/Reward";
import PortalDrawer from "../components/PortalDrawer";
import L1 from "../components/L1";
import L2 from "../components/L2";
import L3 from "../components/L3";
import L4 from "../components/L4";
import L5Card from "../components/L5/L5Card";
import { L6Card } from "../components/L6";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/config";
import l5Api from "../api/l5Api";
import LoadingSpinner from "../components/LoadingSpinner";
import LoadingSpinnerH from "../components/LoadingSpinnerH";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useStoreAuth } from "../context/StoreAuthContext";
import Greeting from "../components/Greeting";
import InitialInstallationGuide from "../components/InitialInstallationGuide";
import { getDistance } from "geolib";
import Cookies from "js-cookie";
import BottomNavigation from "../components/BottomNavigation";
import PortalPopup from "../components/PortalPopup";
import RedeemPopup from "../components/RedeemPopup";
import L5RedeemPopup from "../components/L5/L5RedeemPopup";
import GuideModal from "../components/GuideModel";
import { Gem, Gift, User } from "lucide-react";
import Offers from "../components/Offers";
import PointEarnedCelebration from "../components/PointEarnedCelebration";

// ─── IndexedDB helpers (module-level, stable across renders) ─────────────────
// Mirror of the helpers in service-worker.js. The SW writes a pending
// celebration here when a push arrives; the page reads & clears it on mount.
const _IDB_NAME = "samparka-sw";
const _IDB_STORE = "pendingCelebration";

const _openCelebrationIDB = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(_IDB_NAME, 1);
    req.onupgradeneeded = (e) => e.target.result.createObjectStore(_IDB_STORE);
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });

const readAndClearPendingCelebration = () =>
  _openCelebrationIDB().then(
    (db) =>
      new Promise((resolve) => {
        const tx = db.transaction(_IDB_STORE, "readwrite");
        const store = tx.objectStore(_IDB_STORE);
        const getReq = store.get("pending");
        getReq.onsuccess = () => {
          const value = getReq.result;
          if (value) store.delete("pending");
          tx.oncomplete = () => resolve(value || null);
        };
        getReq.onerror = () => resolve(null);
      })
  );
// ─────────────────────────────────────────────────────────────────────────────

const fetchOffers = async (token, storeId) => {
  if (!token) {
    throw new Error("Token Not Provided");
  }

  try {
    const response = await api.get(`/customer/offers/${storeId}`, {
      headers: {
        token,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Don't throw - let useQuery handle the error gracefully
      return [];
    }
    throw new Error("Failed to fetch offers");
  }
};

// ── PointsBadge: floating pill shown on /loyality after earning ──────────────
const PointsBadge = ({ points, cardColor, onDismiss }) => {
  const color = cardColor || "#016e49";

  useEffect(() => {
    const t = setTimeout(() => onDismiss?.(), 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.85 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
        style={{
          position: "fixed",
          bottom: "90px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9000,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 22px",
          background: "#0a0a0a",
          borderRadius: "100px",
          border: `1px solid #2a2a2a`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${color}33`,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {/* Gold shimmer sweep */}
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ delay: 0.3, duration: 0.9, ease: "easeOut" }}
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, transparent 0%, rgba(245,200,66,0.18) 50%, transparent 100%)",
            pointerEvents: "none",
          }}
        />
        {/* Dot */}
        <motion.div
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#F5C842",
            boxShadow: "0 0 8px #F5C842",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "'Garet', 'Poppins', sans-serif",
            fontWeight: 800,
            fontSize: "18px",
            color: "#F5C842",
            letterSpacing: "-0.5px",
          }}
        >
          +{points}
        </span>
        <span
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            color: "#666",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          pts added
        </span>
      </motion.div>
    </AnimatePresence>
  );
};

const LoyalityCard = (subdomain) => {
  const queryClient = useQueryClient();
  // Safe read — AppStore always populates the cache before rendering this
  // component, but guard against undefined to satisfy Rules of Hooks and
  // prevent a crash if the cache is somehow cold.
  const storeQueryResult = queryClient.getQueryData(["store"]);
  const storeData = storeQueryResult?.storeData;

  // ── All hooks must be called unconditionally (Rules of Hooks) ──────────────
  const [points, setPoints] = useState(0);
  const [customerTier, setCustomerTier] = useState("");
  const [visitStreak, setVisitStreak] = useState(0);

  const [notificationPermission, setNotificationPermission] = useState();
  const { authState } = useStoreAuth();
  const { userInfo: user, token } = authState;
  const location = useLocation();

  // Points badge shown after earning
  const [justEarnedPoints, setJustEarnedPoints] = useState(() => {
    const earned = location.state?.justEarned;
    return earned ? Number(earned) : null;
  });

  // Clear the router state so refreshing doesn't re-show the badge
  useEffect(() => {
    if (location.state?.justEarned) {
      window.history.replaceState({}, "", location.pathname);
    }
  }, []);

  // Keep a ref to the latest points so the polling closure never goes stale
  const pointsRef = useRef(points);
  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  // L5 specific states
  const [l5PointsData, setL5PointsData] = useState(null);
  const [l5Redemptions, setL5Redemptions] = useState([]);
  const [l5CurrentRank, setL5CurrentRank] = useState(null);

  const [cardData, setCardData] = useState(() => {
    if (!storeData) return {};
    return {
    ...storeData.loyaltyCard,
    store: storeData.name,
    logo: storeData.logo,
    frontLogo: storeData.frontLogo,
    location: storeData.location,
    storeId: storeData._id,
    };
  });

  const { data: l6RewardsForIcon = [] } = useQuery({
    queryKey: ["L6 Rewards Icon", storeData?._id],
    queryFn: async () => {
      const res = await api.get(`/reward/getRewards/${storeData._id}`);
      return res.data?.rewards || [];
    },
    enabled: !!storeData?._id && cardData?.format === "L6",
    staleTime: 5 * 60 * 1000,
  });
  const streakRewards = useMemo(
    () =>
      Array.isArray(l6RewardsForIcon)
        ? l6RewardsForIcon
            .filter((r) => r.isStreakBased && r.streakGoal && r.streakIcon)
            .map((r) => ({ streakGoal: r.streakGoal, streakIcon: r.streakIcon }))
        : [],
    [l6RewardsForIcon]
  );
  const [loading, setLoading] = useState(false);
  const [isFrameOpen, setFrameOpen] = useState(false);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  // Centralized logout handler for 401 errors
  const handleUnauthorized = () => {
    console.warn("Token expired. Logging out...");
    // Safely clear subdomain cookies only
    Object.keys(Cookies.get()).forEach((cookieName) => {
      Cookies.remove(cookieName);
    });
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    // Redirect to login
    window.location.href = "/login";
  };

  // Refresh customer data after a successful reward redemption.
  // Called by RedeemPopup / L5RedeemPopup via onSuccess prop so we never
  // need a full page reload — which was causing intermittent sign-outs.
  const handleRedeemSuccess = useCallback(async () => {
    if (cardData?.format === "L5") {
      if (!storeData?._id) return;
      try {
        const pointsResponse = await l5Api.getPointsBalance(storeData._id, token);
        if (pointsResponse?.success) {
          setL5PointsData(pointsResponse.data);
          const l5Total = pointsResponse.data?.totalPoints || 0;
          if (l5Total >= 0) setPoints(l5Total);
        }
        const redemptionsResponse = await l5Api.getActiveRedemptions(storeData._id, token);
        if (redemptionsResponse?.success) {
          setL5Redemptions(redemptionsResponse.data?.activeRedemptions || []);
        }
      } catch (error) {
        if (error.response?.status === 401) handleUnauthorized();
        else console.error("[handleRedeemSuccess] L5 refresh failed:", error);
      }
    } else {
      try {
        const response = await api.get("/customer", { headers: { token } });
        setPoints(response.data.points);
        if (response.data.tier) setCustomerTier(response.data.tier);
        if (response.data.visitStreak != null) setVisitStreak(response.data.visitStreak);
      } catch (error) {
        if (error.response?.status === 401) handleUnauthorized();
        else console.error("[handleRedeemSuccess] customer refresh failed:", error);
      }
    }
  }, [cardData?.format, storeData?._id, token]);
  const isDropdownOpen = Boolean(anchorEl);
  const [notifications, setNotifications] = useState([]);
  const [showQR, setShowQR] = useState(false);
  // const [showOffers, setShowOffers] = useState(true);
  const [isRedeemPopupOpen, setRedeemPopupOpen] = useState(false);
  const [isL5PopupOpen, setL5PopupOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationPoints, setCelebrationPoints] = useState(0);

  // Memoize offerViewedDate to prevent infinite re-renders
  const offerViewedDate = useMemo(() => {
    const stored = localStorage.getItem("offerViewedDate");
    return stored ? new Date(stored) : new Date("1900");
  }, []); // Empty deps - only initialize once

  // Debug: Log all celebration state changes
  useEffect(() => {
    console.log('🎊 Celebration state:', { showCelebration, celebrationPoints });
  }, [showCelebration, celebrationPoints]);

  // Shared helper — trigger celebration if not already shown for this id
  const maybeTriggerCelebration = (earnedPoints, timestamp) => {
    const celebrationId = `${timestamp}-${earnedPoints}`;
    const celebratedIds = JSON.parse(localStorage.getItem("celebratedPointsIds") || "[]");
    if (celebratedIds.includes(celebrationId)) {
      console.log("⏭️ Celebration already shown for this event, skipping");
      return false;
    }
    if (earnedPoints > 0) {
      console.log("🎉 Triggering celebration:", { earnedPoints, celebrationId });
      setCelebrationPoints(earnedPoints);
      setShowCelebration(true);
      const updated = [...celebratedIds, celebrationId].slice(-10);
      localStorage.setItem("celebratedPointsIds", JSON.stringify(updated));
      return true;
    }
    return false;
  };

  // Detect if opened from notification and trigger celebration.
  // Checks two sources in priority order:
  //   1. URL search params  — set by notificationclick in the service worker
  //   2. IndexedDB          — written by the push event in the service worker
  //                           (persists across app kills; reliable for cold starts)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const notificationType = params.get("notification");

    console.log("🔔 Notification detection:", {
      notificationType,
      points: params.get("points"),
      storeName: params.get("storeName"),
      fullURL: window.location.href
    });

    // ── Path 1: URL params (user tapped the OS notification) ──────────────────
    if (notificationType === "points-earned") {
      const earnedPoints = parseFloat(params.get("points") || 0);
      const timestamp = params.get("timestamp") || Date.now();

      console.log("✅ Points-earned notification detected via URL params");

      // Clear URL params immediately so a refresh doesn't re-trigger
      setTimeout(() => window.history.replaceState({}, "", "/loyality"), 100);

      const triggered = maybeTriggerCelebration(earnedPoints, timestamp);

      // If we showed via URL params, still clear any IndexedDB entry so it
      // doesn't double-fire if the component remounts.
      if (triggered) {
        readAndClearPendingCelebration().catch(() => {});
      }
      return; // URL params take priority — skip IndexedDB check
    }

    // ── Path 2: IndexedDB (cold start after push received with app closed) ───
    // Runs when there are no URL params — covers the case where the user opens
    // the app manually (not by tapping the notification) after receiving points.
    readAndClearPendingCelebration()
      .then((pending) => {
        if (!pending) return;
        console.log("✅ Pending celebration found in IndexedDB:", pending);
        maybeTriggerCelebration(pending.points, pending.timestamp);
      })
      .catch((err) => console.error("❌ Failed to read IndexedDB celebration:", err));
  }, []); // Empty dependency array - only run on mount

  // Listen for service worker messages about points earned
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = (event) => {
      console.log('📨 Service Worker message received:', event.data);

      if (event.data?.type === 'POINTS_EARNED') {
        const { points, timestamp } = event.data;
        const celebrationId = `${timestamp}-${points}`;

        // Check if already celebrated to prevent duplicates
        const celebratedIds = JSON.parse(localStorage.getItem('celebratedPointsIds') || '[]');
        if (celebratedIds.includes(celebrationId)) {
          console.log('⏭️ Celebration already shown for this event, skipping');
          return;
        }

        console.log('🎉 Triggering celebration from service worker message');
        setCelebrationPoints(points);
        setShowCelebration(true);

        // Mark as celebrated
        const updated = [...celebratedIds, celebrationId].slice(-10);
        localStorage.setItem('celebratedPointsIds', JSON.stringify(updated));

        // Clear the IndexedDB pending entry so it doesn't re-fire on next cold start
        readAndClearPendingCelebration().catch(() => {});
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  // Debug: Check for notification subscription status
  useEffect(() => {
    if ('Notification' in window) {
      console.log('📣 Notification permission:', Notification.permission);
    }

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      console.log('✅ Service worker active');
    } else {
      console.warn('⚠️ No active service worker');
    }
  }, []);

  const openRedeemPopup = useCallback(() => {
    setRedeemPopupOpen(true);
  }, []);

  const closeRedeemPopup = useCallback(() => {
    setRedeemPopupOpen(false);
  }, []);

  const openL5Popup = useCallback(() => {
    setL5PopupOpen(true);
  }, []);

  const closeL5Popup = useCallback(() => {
    setL5PopupOpen(false);
  }, []);

  const handleCelebrationDone = useCallback(() => {
    setShowCelebration(false);
    setCelebrationPoints(0);
  }, []);

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

  const [show, setShow] = useState(false);

  // Set body background to white for this page to handle safe area/notch
  useEffect(() => {
    const originalBgColor = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#ffffff';
    
    // Update theme-color meta tag for status bar
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    const originalThemeColor = themeColorMeta?.getAttribute('content');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', '#ffffff');
    }
    
    return () => {
      document.body.style.backgroundColor = originalBgColor || '#1e1b1a';
      if (themeColorMeta && originalThemeColor) {
        themeColorMeta.setAttribute('content', originalThemeColor);
      }
    };
  }, []);

  useEffect(() => {
    setShow(true);
  }, []);

  function closePopup() {
    setShow(false);
  }

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

    // const alreadyClosed = localStorage.getItem("offersClosed");
    // if (!alreadyClosed) {
    //   setShowOffers(true);
    // }

    // checkLocation();
  }, []);

  const handleCloseOffer = () => {
    setShowOffers(false);
    // localStorage.setItem("offersClosed", "true");
    closePopup();
  };

  useEffect(() => {
    const getCustomerData = async () => {
      // Skip regular points fetch for L5 format - L5 uses outlet-specific points
      if (cardData?.format === "L5") {
        return;
      }

      try {
        const response = await api.get("/customer", { headers: { token } });
        setPoints(response.data.points);
        setCustomerTier(response.data.tier);
        if (response.data.visitStreak != null) {
          setVisitStreak(response.data.visitStreak);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          handleUnauthorized();
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
  }, [token, cardData?.format]);

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

  // L5 config state
  const [l5Config, setL5Config] = useState(null);

  // Fetch L5 data if format is L5
  useEffect(() => {
    const fetchL5Data = async () => {
      if (cardData?.format !== "L5" || !token || !storeData?._id) return;

      try {
        // Fetch L5 config first
        const configResponse = await l5Api.getConfig(storeData._id, token);
        if (configResponse?.success) {
          setL5Config(configResponse.data?.l5Config || storeData?.loyaltyCard?.l5Config);
        }

        // Fetch L5 points balance
        const pointsResponse = await l5Api.getPointsBalance(storeData._id, token);
        if (pointsResponse?.success) {
          setL5PointsData(pointsResponse.data);
          // Use L5 total points, or fall back to customer's main points field
          const l5Total = pointsResponse.data?.totalPoints || 0;
          if (l5Total > 0) {
            setPoints(l5Total);
          }
          // Also capture rewards from points response if config didn't have them
          if (pointsResponse.data?.rewards?.length > 0) {
            setL5Config(prev => ({
              ...prev,
              rewards: pointsResponse.data.rewards,
              redemptionThresholds: pointsResponse.data.thresholds || prev?.redemptionThresholds
            }));
          }
        }

        // If no L5 outlet points exist, fetch regular customer points as fallback
        if (!pointsResponse?.data?.outlets?.length || pointsResponse?.data?.totalPoints === 0) {
          try {
            const customerResponse = await api.get("/customer", { headers: { token } });
            if (customerResponse.data?.points > 0) {
              setPoints(customerResponse.data.points);
            }
          } catch (fallbackError) {
            if (fallbackError.response?.status === 401) {
              handleUnauthorized();
              return;
            }
            console.error("[L5] Fallback customer fetch error:", fallbackError);
          }
        }

        // Fetch active redemptions
        const redemptionsResponse = await l5Api.getActiveRedemptions(storeData._id, token);
        if (redemptionsResponse?.success) {
          setL5Redemptions(redemptionsResponse.data?.activeRedemptions || []);
        }

        // Fetch leaderboard for current rank
        const leaderboardResponse = await l5Api.getCurrentLeaderboard(storeData._id, token);
        if (leaderboardResponse?.success) {
          setL5CurrentRank(leaderboardResponse.data?.currentUserRank || null);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          handleUnauthorized();
          return;
        }
        console.error("[L5] Error fetching L5 data:", error);
        // On error, try to fetch regular customer points as fallback
        try {
          const customerResponse = await api.get("/customer", { headers: { token } });
          if (customerResponse.data?.points > 0) {
            setPoints(customerResponse.data.points);
          }
        } catch (fallbackError) {
          if (fallbackError.response?.status === 401) {
            handleUnauthorized();
            return;
          }
          console.error("[L5] Error fallback failed:", fallbackError);
        }
      }
    };

    fetchL5Data();
  }, [token, storeData?._id, cardData?.format]);

  // ── Polling: detect staff-awarded points from /store/customers ──────────────
  // Polls GET /customer every 8 s. When points increase, updates state and
  // shows the PointsBadge automatically — no page reload needed.
  useEffect(() => {
    if (!token) return;

    const poll = async () => {
      if (document.hidden) return; // skip when tab is backgrounded
      try {
        if (cardData?.format === "L5") {
          // L5 uses outlet-based points
          if (!storeData?._id) return;
          const res = await l5Api.getPointsBalance(storeData._id, token);
          if (res?.success) {
            const fresh = res.data?.totalPoints || 0;
            if (fresh > pointsRef.current) {
              const diff = parseFloat((fresh - pointsRef.current).toFixed(1));
              setPoints(fresh);
              setL5PointsData(res.data);
              // Show full celebration animation for points increase
              setCelebrationPoints(diff);
              setShowCelebration(true);
            }
          }
        } else {
          const res = await api.get("/customer", { headers: { token } });
          const fresh = res.data?.points ?? 0;
          if (fresh > pointsRef.current) {
            const diff = parseFloat((fresh - pointsRef.current).toFixed(1));
            setPoints(fresh);
            if (res.data?.tier) setCustomerTier(res.data.tier);
            if (res.data?.visitStreak != null) setVisitStreak(res.data.visitStreak);
            // Show full celebration animation for points increase
            setCelebrationPoints(diff);
            setShowCelebration(true);
          }
        }
      } catch (err) {
        // Silently ignore all polling errors — background polling is non-critical.
        // The Axios interceptor handles session expiry redirects if needed.
      }
    };

    const interval = setInterval(poll, 8000);

    // Immediately re-check when tab becomes visible again
    const onVisibility = () => {
      if (!document.hidden) poll();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [token, cardData?.format, storeData?._id]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get(
          `/customer/customer-notifications/${user._id}`,
          { headers: { token } }
        );
        setNotifications(response.data);
      } catch (err) {
        console.error("Error fetching customer notifications:", err);
      }
    };

    fetchNotifications();
  }, [token, user._id]);

  const { data: onGoingOffers } = useQuery({
    queryKey: ["On Going Offers"],
    queryFn: () => fetchOffers(token, storeData._id),
    enabled: !!token && !!storeData._id,
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if (error.message?.includes("401") || error.response?.status === 401) {
        handleUnauthorized();
        return false;
      }
      return failureCount < 3;
    },
  });

  const openFrame = useCallback(() => setFrameOpen(true), []);
  const closeFrame = useCallback(() => setFrameOpen(false), []);
  const handleNavigate = useCallback(
    (path) => () => navigate(path),
    [navigate]
  );


  const unseenNotifications = notifications.filter((n) => !n.read);
  const [unViewedOffers, setUnViewedOffers] = useState([]);

  // Filter to only active, non-expired offers — mirrors the logic inside Offers.jsx
  const activeOnGoingOffers = useMemo(() => {
    if (!onGoingOffers?.length) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return onGoingOffers.filter((offer) => {
      if (!offer.display) return false;
      if (!offer.expiryDate) return true;
      const expiryDate = new Date(offer.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);
      return expiryDate >= today;
    });
  }, [onGoingOffers]);

  useEffect(() => {
    if (activeOnGoingOffers.length > 0) {
      setUnViewedOffers(
        activeOnGoingOffers.filter(
          (offer) => new Date(offer.updatedAt) > offerViewedDate
        )
      );
      if (storeData?.services?.onGoingOffers) {
        const hasSeen = sessionStorage.getItem("seenOffers");
        if (!hasSeen) {
          setShow(true);
        }
      }
    } else {
      setUnViewedOffers([]);
    }
  }, [activeOnGoingOffers, storeData?.services?.onGoingOffers]);

  // Guard: all hooks above have run — now safe to bail out if store is missing.
  // AppStore always resolves storeData before rendering this, so this path
  // should never trigger in practice, but it keeps React happy and prevents
  // an accidental crash if the cache is somehow cold.
  if (!storeData) {
    return subdomain == "himalayanjavaexpress" ? (
      <LoadingSpinnerH />
    ) : (
      <>
        <LoadingSpinner />
        <PoweredBySamparka />
      </>
    );
  }

// testing build
  return (
    user && (
      <div className="min-h-screen w-full bg-white overflow-hidden" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        {/* Show celebration animation when points are earned */}
        {showCelebration && (
          <PointEarnedCelebration
            points={celebrationPoints}
            storeName={storeData?.name}
            onDone={handleCelebrationDone}
          />
        )}


        {/* Offers popup - only shown when there are actual active, non-expired offers */}
        {storeData?.services?.onGoingOffers &&
          activeOnGoingOffers.length > 0 &&
          show && <Offers allOffers={activeOnGoingOffers} onClose={closePopup} />}

        {loading && <LoadingSpinner />}
        <div
          className={`flex flex-col items-center py-4 justify-between box-border gap-[25px] text-left text-5xl1 min-h-screen font-poppins`}
        >
          <div className=" max-w-[400px] mx-[350px] top-0 left-0 right-0 flex items-center justify-between p-2 z-10">
            <Greeting />
            {storeData?.services?.onGoingOffers && (
              <div className="relative mr-1">
                <button
                  onClick={() => navigate("/offers")}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Gem className="w-4 h-5 sm:w-5 sm:h-5 text-gray-600" />
                </button>
                {unViewedOffers?.length > 0 && (
                  <span className="absolute top-0 right-0 block w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white" />
                )}  
              </div>
            )}

            
            {/* Profile Icon */}
            <div className="relative">
              <button
                onClick={() => navigate("/profile")}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <User className="w-4 h-5 sm:w-5 sm:h-5 text-gray-600" />
              </button>

              {/* Green dot indicator */}
              {(unseenNotifications.length > 0 ||
                unViewedOffers?.length > 0) && (
                <span className="absolute top-0 right-0 block w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white" />
              )}
            </div>
          </div>

          {/* Store Logo */}
          <div
            className={`self-stretch mb-2 flex items-center justify-between text-left text-xs-41 font-poppins lg1:pl-0 lg1:pr-0 lg1:box-border text-black`}
          >
            {/* Center - Logo and Location */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center gap-[px]">
              <div className="h-[74px] flex flex-col items-center justify-center">
                {storeData?._id !== "67ac59062cbe98f23d4cc28c" ? (
                  <img
                    className="w-auto relative h-[70px]"
                    alt=""
                    src={cardData.frontLogo || cardData.logo}
                  />
                ) : (
                  <img
                    className="w-auto relative h-[110px]"
                    alt=""
                    src={cardData.frontLogo || cardData.logo}
                  />
                )}
              </div>
              {storeData?._id !== "67ac59062cbe98f23d4cc28c" && (
                <div
                  className={
                    "relative tracking-[0.01em] font-medium text-black"
                  }
                >
                  {cardData.location}
                </div>
              )}
            </div>
            <br />
            <br />
          </div>

          {/* main loyalty card */}
          <>
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
              ) : cardData?.format === "L5" ? (
                <L5Card
                  customerName={user?.name || "Guest"}
                  outletBreakdown={l5PointsData?.outlets || []}
                  totalPoints={l5PointsData?.totalPoints || points || 0}
                  activeDiscounts={l5Redemptions}
                  currentRank={l5CurrentRank}
                  showQR={showQR}
                  setShowQR={setShowQR}
                  customerId={user?._id}
                  storeUrl={storeData?.url}
                  cardColor={cardData?.cardColor || "#1c1917"}
                  textColor={cardData?.textColor || "#ffffff"}
                  stamp={cardData?.stamp || "coffee"}
                  customStamp={cardData?.customStamp}
                  cardImage={cardData?.cardImage}
                />
              ) : cardData?.format === "L4" ? (
                <L4
                  {...cardData}
                  showQR={showQR}
                  setShowQR={setShowQR}
                  points={points || 0}
                  customerTier={customerTier || "Bronze"}
                />
              ) : cardData?.format === "L6" ? (
                <L6Card
                  {...cardData}
                  customerName={user?.name || "Guest"}
                  visitStreak={visitStreak}
                  streakRewards={streakRewards}
                  onRewardIconClick={() => navigate("/rewards", { state: { tab: "streak" } })}
                  points={points || 0}
                  customerTier={customerTier || ""}
                  showQR={showQR}
                  setShowQR={setShowQR}
                  customerId={user?._id}
                  storeUrl={storeData?.url}
                  l6Config={cardData?.l6Config || {}}
                />
              ) : (
                <>
                  <L3
                    {...cardData}
                    showQR={showQR}
                    setShowQR={setShowQR}
                    points={points || 0}
                    customerTier={customerTier || "Bronze"}
                  />
                </>
              )}
            </>
            {/* View Rewards Button */}
            {cardData?.format === "L5" ? (
              <div className="self-stretch flex flex-row items-center justify-center py-2 px-0 gap-1 text-sm">
                <div className="overflow-hidden shrink-0 flex flex-row items-center justify-center p-px box-border">
                  <img alt="View Rewards Icon" src="/vector.svg" />
                </div>
                <div
                  className="relative tracking-[0.01em] font-medium cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    openL5Popup();
                  }}
                >
                  View Rewards
                </div>
                <img alt="Frame Icon" src="/frame-1410103878.svg" />
              </div>
            ) : cardData?.format == "L3" || cardData?.format == "L34HA" ? (
              <div className="self-stretch flex flex-row items-center justify-center py-2 px-0 gap-1 text-sm">
                <div className="overflow-hidden shrink-0 flex flex-row items-center justify-center p-px box-border">
                  <img alt="View Rewards Icon" src="/vector.svg" />
                </div>
                <div
                  className="relative tracking-[0.01em] font-medium cursor-pointer"
                  onClick={() =>
                    navigate("/tier", {
                      state: { tier: cardData.tier, points },
                    })
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
                  // onClick={openFrame}
                  onClick={(e) => {
                    e.stopPropagation();
                    openRedeemPopup();
                  }}
                >
                  View Rewards
                </div>
                <img alt="Frame Icon" src="/frame-1410103878.svg" />
              </div>
            )}
          </>

          {/* Points and Redeem Section - Below Image */}
          <div className="flex items-center justify-between px-2 gap-4">
            {/* Points Display - Left Side */}
            {/* <div className="flex items-baseline gap-1">
              <span
                className={`font-black text-gray-900 transition-all duration-500 text-2xl sm:text-xl`}
              >
                {points || 0}
              </span>
            </div> */}

            {/* Redeem Button - Right Side */}
            {/* <button
              // onClick={(e) => {
              //   e.stopPropagation();
              //   setCurrentCardIndex(index);
              //   openRedeemPopup();
              // }}
              // disabled={card.points < card.maxPoints}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all transform duration-300 overflow-hidden bg-gradient-to-r from-black via-gray-900 to-black text-white hover:scale-105 hover:shadow-xl shadow-md `}
            >
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <>
                  <span className="text-sm">🎁</span>
                  <span>Redeem</span>
                </>
              </span>
            </button> */}
          </div>

          <div className="pb-14" />

          {/* Bottom Navigation */}
          {/* <div className="fixed mt-10 bottom-2 left-1/2 -translate-x-1/2 z-50"> */}
          <BottomNavigation cardColor={cardData.cardColor} />
          {/* </div> */}
        </div>

        {/* ── Points earned badge (shown after QR scan earn) ── */}
        {justEarnedPoints != null && (
          <PointsBadge
            points={justEarnedPoints}
            cardColor={cardData.cardColor}
            onDismiss={() => setJustEarnedPoints(null)}
          />
        )}

        {/* Extrass */}
        {/*  */}
        {/* {!localStorage.getItem("hideGuide") && (
          <div className="fixed bottom-0 z-[60] w-screen">
            <InitialInstallationGuide
              showGuide={showGuide}
              setShowGuide={setShowGuide}
            />
          </div>
        )} */}

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

        {/* Popups */}
        {isRedeemPopupOpen && (
          <PortalPopup
            overlayColor="rgba(84, 7, 7, 0.3)"
            placement="Centered"
            onOutsideClick={closeRedeemPopup}
          >
            <RedeemPopup
              onClose={closeRedeemPopup}
              onSuccess={handleRedeemSuccess}
              storeId={cardData.storeId}
              store={storeData}
              token={token}
              userPoints={points}
              cardColor={cardData.cardColor}
              customerTier={customerTier}
            />
          </PortalPopup>
        )}

        {/* L5 Rewards Popup */}
        {isL5PopupOpen && (
          <PortalPopup
            overlayColor="rgba(0, 0, 0, 0.5)"
            placement="Centered"
            onOutsideClick={closeL5Popup}
          >
            <L5RedeemPopup
              onClose={closeL5Popup}
              onSuccess={handleRedeemSuccess}
              storeId={storeData?._id}
              token={token}
              l5Config={l5Config || storeData?.loyaltyCard?.l5Config}
              l5PointsData={l5PointsData}
              l5Redemptions={l5Redemptions}
              cardColor={cardData.cardColor}
              fallbackPoints={points}
            />
          </PortalPopup>
        )}

        {/* powered by samparka */}
        {/* {storeData.services.powered && (
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
        )} */}
        {/* <BottomNav color={cardData.cardColor}/> */}
      </div>
    )
  );
};

export default LoyalityCard;
