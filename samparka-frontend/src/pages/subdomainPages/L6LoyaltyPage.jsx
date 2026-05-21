import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import { Gem, Gift, User } from "lucide-react";

import api from "../../api/config";
import { L6Card } from "../../components/L6";
import MissionCardsSection from "../../components/L6/MissionCardsSection";
import LoadingSpinner from "../../components/LoadingSpinner";
import LoadingSpinnerH from "../../components/LoadingSpinnerH";
import Greeting from "../../components/Greeting";
import BottomNavigation from "../../components/BottomNavigation";
import Offers from "../../components/Offers";
import PointEarnedCelebration from "../../components/PointEarnedCelebration";
import PoweredBySamparka from "../../components/PoweredBySamparka";
import { useStoreAuth } from "../../context/StoreAuthContext";
import { ensurePushSubscription, cachePushEndpoint, clearPushEndpoint } from "../../utils/pushSubscription";

// ─── IndexedDB helpers (same as LoyalityCard_New) ────────────────────────────
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

// ─── Fetch offers helper ─────────────────────────────────────────────────────
const fetchOffers = async (token, storeId) => {
  if (!token) throw new Error("Token Not Provided");
  try {
    const response = await api.get(`/customer/offers/${storeId}`, {
      headers: { token },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) return [];
    throw new Error("Failed to fetch offers");
  }
};

const fetchL6Rewards = async (storeId) => {
  if (!storeId) return [];
  try {
    const response = await api.get(`/reward/getRewards/${storeId}`);
    return response.data?.rewards || [];
  } catch (error) {
    console.error("❌ Failed to fetch L6 rewards:", error);
    return [];
  }
};

const normalizeMissionArray = (missions) => {
  if (!Array.isArray(missions)) return [];
  return missions.filter((mission) => mission && typeof mission === "object");
};

const extractMissionBasedRewardMissions = (rewards) => {
  if (!Array.isArray(rewards)) return [];
  return rewards
    .flatMap((reward) => {
      const rewardId = reward?._id ? String(reward._id) : null;

      const rewardImage = reward?.image || null;

      if (Array.isArray(reward?.l6Missions) && reward.l6Missions.length > 0) {
        return reward.l6Missions.map((mission) => ({
          ...mission,
          _rewardId: rewardId,
          rewardImage,
        }));
      }

      if (typeof reward?.l6Missions === "string") {
        try {
          const parsed = JSON.parse(reward.l6Missions);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((mission) => ({
              ...mission,
              _rewardId: rewardId,
              rewardImage,
            }));
          }
        } catch {
          // Ignore parse errors and use fallback mission below
        }
      }

      const fallbackTitle = (reward?.mission || reward?.name || "").trim();
      if (!fallbackTitle) return [];

      return [
        {
          title: fallbackTitle,
          subtitle: reward?.description || "Complete to earn rewards",
          icon: "target",
          stampColor: "#3b82f6",
          missionType: "simple",
          progress: 0,
          goal: 100,
          _rewardId: rewardId,
          rewardImage,
        },
      ];
    })
    .filter((mission) => mission && typeof mission === "object");
};

const isMissionBasedReward = (reward) => {
  if (reward?.type !== "l6") return false;
  return (
    reward?.isMissionBased === true ||
    reward?.isMissionBased === "true" ||
    reward?.isMissionBased === 1 ||
    reward?.isMissionBased === "1"
  );
};

const mergeUniqueMissions = (first = [], second = []) => {
  const isSignedUrl = (value) => typeof value === "string" && value.startsWith("https://");

  const signatureOf = (m) => [
    (m.title || "").trim().toLowerCase(),
    m.missionType || "simple",
    Array.isArray(m.items) ? m.items.length : 0,
    Number(m.goal || 0),
  ].join("|");

  // Index second array by signature so we can enrich first-array entries
  const secondBySig = {};
  for (const m of normalizeMissionArray(second)) {
    secondBySig[signatureOf(m)] = m;
  }

  const seen = new Set();
  const merged = [...normalizeMissionArray(first), ...normalizeMissionArray(second)];
  return merged.filter((mission) => {
    const sig = signatureOf(mission);
    if (seen.has(sig)) return false;
    seen.add(sig);
    // Prefer signed asset URLs from reward-derived missions
    const match = secondBySig[sig];
    if (match?.backgroundImage && (!mission.backgroundImage || (!isSignedUrl(mission.backgroundImage) && isSignedUrl(match.backgroundImage)))) {
      mission.backgroundImage = match.backgroundImage;
    }
    if (match?.rewardImage && (!mission.rewardImage || (!isSignedUrl(mission.rewardImage) && isSignedUrl(match.rewardImage)))) {
      mission.rewardImage = match.rewardImage;
    }
    return true;
  });
};

// ─── Header ──────────────────────────────────────────────────────────────────
const L6Header = ({ storeData, cardData, unseenNotifications, unViewedOffers, activeOnGoingOffers }) => {
  const navigate = useNavigate();
  return (
    <div className="max-w-[400px] mx-auto w-full flex items-center justify-between px-10 pt-6 pb-2">
      <StoreLogo storeData={storeData} cardData={cardData} />
      <div className="flex items-center gap-2">
        {storeData?.services?.onGoingOffers && (
          <div className="relative">
            <button
              onClick={() => navigate("/offers")}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <Gem className="w-4 h-5 sm:w-5 sm:h-5 text-gray-600" />
            </button>
            {activeOnGoingOffers?.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 block w-3 h-3 bg-orange-500 rounded-full ring-2 ring-white" />
            )}
            {unViewedOffers?.length > 0 && (
              <span className="absolute top-0 right-0 block w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white" />
            )}
          </div>
        )}
        <div className="relative">
          <button
            onClick={() => navigate("/profile")}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <User className="w-4 h-5 sm:w-5 sm:h-5 text-gray-600" />
          </button>
          {(unseenNotifications.length > 0 || unViewedOffers?.length > 0) && (
            <span className="absolute top-0 right-0 block w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white" />
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Store Logo ──────────────────────────────────────────────────────────────
const StoreLogo = ({ storeData, cardData }) => {
  if (!cardData?.frontLogo && !cardData?.logo) return null;
  return (
    <div className="flex flex-col items-center gap-1 py-2">
      <img
        className="w-auto h-12"
        alt={storeData?.name || ""}
        src={cardData.frontLogo || cardData.logo}
      />
      {/* {cardData.location && (
        <div className="text-sm tracking-wide font-medium text-black">
          {cardData.location}
        </div>
      )} */}
    </div>
  );
};

const L6LoyaltyPage = ({ url, storeData: storeDataProp }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { authState } = useStoreAuth();
  const { userInfo: user, token } = authState;

  // Use storeData from prop or query cache
  const storeQueryResult = queryClient.getQueryData(["store"]);
  const storeData = storeDataProp || storeQueryResult?.storeData;

  const cardData = useMemo(() => {
    if (!storeData) return {};
    return {
      ...storeData.loyaltyCard,
      store: storeData.name,
      logo: storeData.logo,
      frontLogo: storeData.frontLogo,
      location: storeData.location,
      storeId: storeData._id,
    };
  }, [storeData]);

  const [customerL6Data, setCustomerL6Data] = useState(null);

  // Merge store mission definitions with this customer's per-item progress
  const missionsWithProgress = useMemo(() => {
    const raw = cardData?.l6Config?.missions;
    if (!Array.isArray(raw) || raw.length === 0) return [];
    const mProg = customerL6Data?.missionProgress || {};
    return raw.map((mission) => {
      if (mission.missionType !== "multiItem" || !Array.isArray(mission.items)) return mission;
      const missionKey = mission?._missionId || mission.title;
      const itemProg = mProg[missionKey] || mProg[mission.title] || {};
      return {
        ...mission,
        items: mission.items.map((item) => ({
          ...item,
          progress: Math.min(itemProg[item.itemName] || 0, Math.max(1, Number(item.goal) || 1)),
        })),
      };
    });
  }, [cardData, customerL6Data]);

  // ── State ──────────────────────────────────────────────────────────────────
  const [points, setPoints] = useState(0);
  const [customerTier, setCustomerTier] = useState("");
  const [visitStreak, setVisitStreak] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationPoints, setCelebrationPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showOffers, setShowOffers] = useState(false);

  const handleClaimRewardClick = useCallback(() => {
    navigate("/rewards");
  }, [navigate]);

  const pointsRef = useRef(points);
  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  // Points badge from navigation state
  const [justEarnedPoints, setJustEarnedPoints] = useState(() => {
    const earned = location.state?.justEarned;
    return earned ? Number(earned) : null;
  });

  useEffect(() => {
    if (location.state?.justEarned) {
      window.history.replaceState({}, "", location.pathname);
    }
  }, []);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !token) {
      navigate("/");
    }
  }, [user, token]);

  const handleUnauthorized = () => {
    console.warn("Token expired. Logging out...");
    Object.keys(Cookies.get()).forEach((cookieName) => {
      Cookies.remove(cookieName);
    });
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  };

  // ── Celebration helpers ────────────────────────────────────────────────────
  const maybeTriggerCelebration = (earnedPoints, timestamp) => {
    const celebrationId = `${timestamp}-${earnedPoints}`;
    const celebratedIds = JSON.parse(localStorage.getItem("celebratedPointsIds") || "[]");
    if (celebratedIds.includes(celebrationId)) return false;
    if (earnedPoints > 0) {
      setCelebrationPoints(earnedPoints);
      setShowCelebration(true);
      const updated = [...celebratedIds, celebrationId].slice(-10);
      localStorage.setItem("celebratedPointsIds", JSON.stringify(updated));
      return true;
    }
    return false;
  };

  const handleCelebrationDone = useCallback(() => {
    setShowCelebration(false);
    setCelebrationPoints(0);
  }, []);

  // ── Notification detection (URL params + IndexedDB) ────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const notificationType = params.get("notification");

    if (notificationType === "points-earned") {
      const earnedPoints = parseFloat(params.get("points") || 0);
      const timestamp = params.get("timestamp") || Date.now();
      setTimeout(() => window.history.replaceState({}, "", "/loyality"), 100);
      const triggered = maybeTriggerCelebration(earnedPoints, timestamp);
      if (triggered) readAndClearPendingCelebration().catch(() => { });
      return;
    }

    readAndClearPendingCelebration()
      .then((pending) => {
        if (!pending) return;
        maybeTriggerCelebration(pending.points, pending.timestamp);
      })
      .catch((err) => console.error("❌ Failed to read IndexedDB celebration:", err));
  }, []);

  // ── Service worker message listener ────────────────────────────────────────
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const handleMessage = (event) => {
      if (event.data?.type === "POINTS_EARNED") {
        const { points: earned, timestamp } = event.data;
        const celebrationId = `${timestamp}-${earned}`;
        const celebratedIds = JSON.parse(localStorage.getItem("celebratedPointsIds") || "[]");
        if (celebratedIds.includes(celebrationId)) return;
        setCelebrationPoints(earned);
        setShowCelebration(true);
        const updated = [...celebratedIds, celebrationId].slice(-10);
        localStorage.setItem("celebratedPointsIds", JSON.stringify(updated));
        readAndClearPendingCelebration().catch(() => { });
      }
    };
    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => navigator.serviceWorker.removeEventListener("message", handleMessage);
  }, []);

  // ── Fetch customer data (points, tier, streak) ─────────────────────────────
  useEffect(() => {
    const getCustomerData = async () => {
      try {
        const response = await api.get("/customer", { headers: { token } });
        setPoints(response.data.points);
        setCustomerTier(response.data.tier);
        if (response.data.l6Data) setCustomerL6Data(response.data.l6Data);
        if (response.data.visitStreak != null) {
          setVisitStreak(response.data.visitStreak);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          handleUnauthorized();
        } else {
          console.error("❌ Error fetching customer data:", error);
        }
      }
    };
    if (token) getCustomerData();
  }, [token]);

  // ── Push subscription management ───────────────────────────────────────────
  useEffect(() => {
    if (user?._id && "Notification" in window && Notification.permission === "granted") {
      ensurePushSubscription(user._id);
    }
  }, [user?._id]);

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

  // ── Polling: detect staff-awarded points ───────────────────────────────────
  useEffect(() => {
    if (!token) return;
    const poll = async () => {
      if (document.hidden) return;
      try {
        const res = await api.get("/customer", { headers: { token } });
        const fresh = res.data?.points ?? 0;
        if (fresh > pointsRef.current) {
          const diff = parseFloat((fresh - pointsRef.current).toFixed(1));
          setPoints(fresh);
          if (res.data?.tier) setCustomerTier(res.data.tier);
          if (res.data?.visitStreak != null) setVisitStreak(res.data.visitStreak);
          setCelebrationPoints(diff);
          setShowCelebration(true);
        }
      } catch (err) {
        if (err.response?.status === 401) handleUnauthorized();
      }
    };
    const interval = setInterval(poll, 8000);
    const onVisibility = () => { if (!document.hidden) poll(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [token]);

  // ── Fetch notifications ────────────────────────────────────────────────────
  useEffect(() => {
    if (!token || !user?._id) return;
    const fetchNotifications = async () => {
      try {
        const response = await api.get(
          `/customer/customer-notifications/${user._id}`,
          { headers: { token } }
        );
        setNotifications(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          handleUnauthorized();
          return;
        }
        console.error("❌ Error fetching notifications:", err);
      }
    };
    fetchNotifications();
  }, [token, user?._id]);

  // ── Offers ─────────────────────────────────────────────────────────────────
  const offerViewedDate = useMemo(() => {
    const stored = localStorage.getItem("offerViewedDate");
    return stored ? new Date(stored) : new Date("1900");
  }, []);

  const { data: onGoingOffers } = useQuery({
    queryKey: ["On Going Offers"],
    queryFn: () => fetchOffers(token, storeData._id),
    enabled: !!token && !!storeData?._id,
    retry: (failureCount, error) => {
      if (error.message?.includes("401") || error.response?.status === 401) {
        handleUnauthorized();
        return false;
      }
      return failureCount < 3;
    },
  });

  const { data: l6Rewards = [] } = useQuery({
    queryKey: ["L6 Rewards", storeData?._id],
    queryFn: () => fetchL6Rewards(storeData?._id),
    enabled: !!storeData?._id,
  });

  const streakRewards = useMemo(
    () =>
      Array.isArray(l6Rewards)
        ? l6Rewards
            .filter((r) => r.isStreakBased && r.streakGoal && r.streakIcon)
            .map((r) => ({ streakGoal: r.streakGoal, streakIcon: r.streakIcon }))
        : [],
    [l6Rewards]
  );

  const missionSectionMissions = useMemo(() => {
    const missionRewards = Array.isArray(l6Rewards)
      ? l6Rewards.filter(isMissionBasedReward)
      : [];

    const rewardMissions = extractMissionBasedRewardMissions(missionRewards);
    // Use missionsWithProgress as base so customer progress is reflected
    return mergeUniqueMissions(missionsWithProgress, rewardMissions);
  }, [l6Rewards, missionsWithProgress]);

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

  const [unViewedOffers, setUnViewedOffers] = useState([]);

  useEffect(() => {
    if (activeOnGoingOffers.length > 0) {
      setUnViewedOffers(
        activeOnGoingOffers.filter(
          (offer) => new Date(offer.updatedAt) > offerViewedDate
        )
      );
      if (storeData?.services?.onGoingOffers) {
        const hasSeen = sessionStorage.getItem("seenOffers");
        if (!hasSeen) setShowOffers(true);
      }
    } else {
      setUnViewedOffers([]);
    }
  }, [activeOnGoingOffers, storeData?.services?.onGoingOffers]);

  const handleOffersClose = useCallback(() => {
    sessionStorage.setItem("seenOffers", "true");
    setShowOffers(false);
  }, []);

  // ── Body background ───────────────────────────────────────────────────────
  useEffect(() => {
    const originalBgColor = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#ffffff";
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    const originalThemeColor = themeColorMeta?.getAttribute("content");
    if (themeColorMeta) themeColorMeta.setAttribute("content", "#ffffff");
    return () => {
      document.body.style.backgroundColor = originalBgColor || "#1e1b1a";
      if (themeColorMeta && originalThemeColor) {
        themeColorMeta.setAttribute("content", originalThemeColor);
      }
    };
  }, []);

  const unseenNotifications = notifications.filter((n) => !n.read);

  // ── Loading guard ──────────────────────────────────────────────────────────
  if (!storeData) {
    return url === "himalayanjavaexpress" ? (
      <LoadingSpinnerH />
    ) : (
      <>
        <LoadingSpinner />
        <PoweredBySamparka />
      </>
    );
  }

  if (!user) return null;

  return (
    <div
      className="min-h-screen w-full bg-white overflow-hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {showCelebration && (
        <PointEarnedCelebration
          points={celebrationPoints}
          storeName={storeData?.name}
          onDone={handleCelebrationDone}
        />
      )}


      {storeData?.services?.onGoingOffers &&
        activeOnGoingOffers.length > 0 &&
        showOffers && (
          <Offers
            allOffers={activeOnGoingOffers}
            onClose={handleOffersClose}
          />
        )}

      {loading && <LoadingSpinner />}

      <div className="flex flex-col items-center justify-between min-h-screen pb-24">
        <L6Header
          storeData={storeData}
          cardData={cardData}
          unseenNotifications={unseenNotifications}
          unViewedOffers={unViewedOffers}
          activeOnGoingOffers={activeOnGoingOffers}
        />


        {/* L6 Card + View Rewards behind it */}
        <div className="relative flex flex-col items-center px-4 py-4">
          {/* View Rewards button — sits behind the card, peeking at bottom */}
          <button
            onClick={() => navigate("/rewards")}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 z-0 w-[336px] flex items-center justify-center gap-2 cursor-pointer border-none rounded-b-3xl"
            style={{
              paddingTop: 40,
              paddingBottom: 14,
              background: cardData?.cardColor || "#3b1a1a",
              color: "#ffffff",
              fontFamily: "var(--font-poppins, Poppins, sans-serif)",
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            <Gift size={16} />
            Redeem Rewards
          </button>

          {/* Card on top */}
          <div className="relative z-10 w-full flex justify-center" style={{ marginBottom: 28 }}>
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
          </div>
        </div>

        {/* Mission Section */}
        {missionSectionMissions.length > 0 && (
          <div className="mt-10 relative z-20 w-full flex justify-center">
            <MissionCardsSection
              missions={missionSectionMissions}
              onClaimReward={handleClaimRewardClick}
              cardColor={cardData?.cardColor}
            />
          </div>
        )}

        {/* Spacer for bottom nav */}
        <div className="flex-1" />
      </div>

      <BottomNavigation cardColor={cardData?.cardColor} />
    </div>
  );
};

export default L6LoyaltyPage;
