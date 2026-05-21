import { useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/config";
import { useStoreAuth } from "../../context/StoreAuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import PointEarnedCelebration from "../../components/PointEarnedCelebration";
import PointsConfirmModal from "../../components/PointsConfirmModal";
import LoyalityCard from "../LoyalityCard_New";
import Cookies from "js-cookie";
import { useQuery } from "@tanstack/react-query";
import fetchStoreData from "../../api/fetchStore";

const GetOutletPoints = ({ url: subdomain }) => {
  const { data: storeQueryData, isLoading: storeLoading } = useQuery({
    queryKey: ["store"],
    queryFn: () => fetchStoreData(subdomain),
    enabled: !!subdomain,
    staleTime: Infinity,
  });
  const store = storeQueryData?.storeData;

  const { storeId, outletId } = useParams();
  const [points, setPoints] = useState(0);
  const [earnedCustomer, setEarnedCustomer] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const hasCalledRef = useRef(false);

  const navigate = useNavigate();
  const { authState, updateAuth } = useStoreAuth();
  const { token } = authState;

  const handleConfirm = useCallback(async () => {
    if (hasCalledRef.current) return;
    hasCalledRef.current = true;
    setIsClaiming(true);

    try {
      const response = await api.put(
        `/customer/getOutletPoints/${storeId}/${outletId}`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        setPoints(response.data.points);
        setEarnedCustomer(response.data.customer);
        setShowCelebration(true);
      } else {
        navigate("/loyality");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.warn("Token expired. Logging out...");
        Object.keys(Cookies.get()).forEach((cookieName) => {
          Cookies.remove(cookieName);
        });
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
      } else {
        console.error("Unhandled error:", error);
        navigate("/loyality");
      }
    } finally {
      setIsClaiming(false);
    }
  }, [storeId, outletId, token, navigate]);

  const handleCelebrationDone = useCallback(async () => {
    if (earnedCustomer) {
      await updateAuth(earnedCustomer, token);
    }
    navigate("/loyality", { state: { justEarned: points } });
  }, [earnedCustomer, token, points, updateAuth, navigate]);

  // Wait for auth token and store data before showing the modal
  if (!token || storeLoading || !store) {
    return <LoadingSpinner />;
  }

  // Always render LoyalityCard as background; overlay modal or celebration on top
  return (
    <>
      {/* Background: user's loyalty page, non-interactive while overlay is showing */}
      <div style={{ pointerEvents: "none", userSelect: "none" }}>
        <LoyalityCard url={subdomain} />
      </div>

      {showCelebration ? (
        <PointEarnedCelebration
          points={points}
          storeName={store?.name}
          onDone={handleCelebrationDone}
        />
      ) : (
        <PointsConfirmModal
          storeName={store?.name}
          storeLogo={store?.frontLogo || store?.logo}
          onConfirm={handleConfirm}
          isLoading={isClaiming}
        />
      )}
    </>
  );
};

export default GetOutletPoints;
