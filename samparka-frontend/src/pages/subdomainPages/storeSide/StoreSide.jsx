import { useEffect, useState } from "react";
import { toast } from "sonner";
import LoadingSpinner from "../../../components/LoadingSpinner";
import api from "../../../api/config";
import SetPoints from "../../../components/storeSide/SetPoints";
import { useNavigate } from "react-router-dom";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import errorFunction from "./errorFunction";
import StoreEventsBanner from "../../../components/adminControl/StoreEventsBanner";

const StoreSide = (subdomain) => {
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [points, setPoints] = useState("");
  const [billID, setBillID] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [outlet, setOutlet] = useState("");
  const token = localStorage.getItem("storeToken");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { storeData } = queryClient.getQueryData(["store"]);
  const [outletId, setOutletId] = useState("");
  const [storedPoints, setStoredPoints] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlOutletId = searchParams.get("outlet");
    const storedOutletId = localStorage.getItem("outletId");
    
    // Set outletId from URL or localStorage
    let currentOutletId = null;
    if (urlOutletId) {
      localStorage.setItem("outletId", urlOutletId);
      setOutletId(urlOutletId);
      currentOutletId = urlOutletId;
    } else if (storedOutletId) {
      setOutletId(storedOutletId);
      currentOutletId = storedOutletId;
    }

    if (!token) {
      navigate("/store/login");
    }
    setLoading(true);

    // Use the currentOutletId directly instead of state
    if (storeData.services.multipleOutlets && currentOutletId) {
      getOutletsPointsDetail();
    } else {
      getPointsDetail();
    }

    // const checkNotificationPermission = async () => {
    //   const permission = Notification.permission;

    //   if (permission !== "granted") {
    //     setNotificationPermission(false);
    //     return;
    //   }

    //   try {
    //     const res = await api.get(`/checkSub/${storeData._id}`);
    //     setNotificationPermission(res.data);
    //   } catch (err) {
    //     console.error("Failed to fetch notification subscription:", err);
    //     setNotificationPermission(false);
    //   }
    // };

    // if (token) {
    //   checkNotificationPermission();
    // }

    setLoading(false);
  }, [token]);

  const getOutletsPointsDetail = async () => {
    setLoading(true);
    try {
      const currentOutletId = outletId || localStorage.getItem("outletId");
      
      const response = await api.get(
        `/store/getOutletPointsDetail/${storeData._id}?outletID=${currentOutletId}`,
        { headers: { token } }
      );
      
      
      if (response.data.success && response.data.points) {
        setQrCodeUrl(
          `https://${subdomain.url}.samparka.co/loyality/${response.data.points.store}/${response.data.points.outlet._id}`
        );
        setStoredPoints(response.data.points.points);
        setOutlet(response.data.points.outlet.location);
      } else if (response.data.success && !response.data.points) {
        // No outlet points record found - fetch outlet info separately
        const outletResponse = await api.get(`/store/getOutlets/${storeData._id}`);
        const currentOutlet = outletResponse.data.outlets?.find(o => o._id === currentOutletId);
        if (currentOutlet) {
          setOutlet(currentOutlet.location);
          setQrCodeUrl(
            `https://${subdomain.url}.samparka.co/loyality/${storeData._id}/${currentOutletId}`
          );
          setStoredPoints(0);
        } else {
          console.error("Outlet not found");
          toast.error("Outlet not found");
        }
      } else {
        console.error("Invalid response structure:", response.data);
        toast.error("Failed to load outlet details");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // redirect to login or try refresh token
        console.warn("Token expired. Logging out...");

        // Clear localStorage and sessionStorage
        const outletId = localStorage.getItem("outletId");
        localStorage.removeItem("storeToken");
        sessionStorage.clear();

        // Redirect
        navigate(`/store/login?outlet=${outletId}`, { replace: true });
      } else {
        console.error("Error fetching outlet details:", error);
        toast.error("Failed to load outlet details");
      }
    } finally {
      setLoading(false);
    }
  };

  const getPointsDetail = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/store/getPointsDetail/${subdomain.url}`,
        { headers: { token } }
      );
      if (response.data.success) {
        setQrCodeUrl(
          `https://${subdomain.url}.samparka.co/loyality/${response.data.points._id}`
        );
        setStoredPoints(response.data.points.points);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // redirect to login or try refresh token
        console.warn("Token expired. Logging out...");

        // Clear localStorage and sessionStorage
        localStorage.removeItem("storeToken");
        sessionStorage.clear();

        // Redirect
        navigate(`/store/login`, { replace: true });
      } else {
        console.error("Unhandled error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePointsChange = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submission
    setIsSubmitting(true);
    setLoading(true);
    try {
      let response;
      if (storeData.services.multipleOutlets && outletId) {
        response = await api.put(
          `/store/changeOutletPoints/${storeData._id}?outletID=${outletId}`,
          {
            billID,
            points,
          },
          { headers: { token } }
        );
      } else {
        response = await api.put(
          `/store/changePoints/${subdomain.url}`,
          {
            billID,
            points,
          },
          { headers: { token } }
        );
      }
      if (response.data.success) {
        setPoints("");
        setBillID("");
        toast.success(response.data.message, {
          duration: 2000,
          // onAutoClose: window.location.reload(),
        });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        errorFunction(navigate);
      } else {
        toast.error(error.message, { duration: 2000 });
      }
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleCreatePoints = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submission
    setIsSubmitting(true);
    setLoading(true);
    const rate = Number(storeData.conversionRate);
    if (!rate || rate <= 0 || isNaN(rate)) {
      toast.error("Conversion rate is not configured. Set it in Points System Configuration.");
      setIsSubmitting(false);
      setLoading(false);
      return;
    }
    let point;
    if (storeData.isRounded) {
      point = Math.round(Number(billAmount) / rate);
    } else {
      point = Math.round((Number(billAmount) / rate) * 10) / 10;
    }
    try {
      let response;
      if (storeData.services.multipleOutlets && outletId) {
        response = await api.put(
          `/store/changeOutletPoints/${storeData._id}?outletID=${outletId}`,
          {
            billID,
            points: point,
          },
          { headers: { token } }
        );
      } else {
        response = await api.put(
          `/store/changePoints/${subdomain.url}`,
          {
            billID,
            points: point,
          },
          { headers: { token } }
        );
      }
      if (response.data.success) {
        setBillAmount("");
        setBillID("");
        toast.success(response.data.message, {
          duration: 2000,
          // onAutoClose: window.location.reload(),
        });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        errorFunction(navigate);
      } else {
        toast.error(error.message, { duration: 2000 });
      }
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="">
      {/* Main Content */}
      <main className="flex-1 bg-gray-200">
        {loading && <LoadingSpinner />}

        <StoreEventsBanner storeId={storeData._id} />

        <SetPoints
          token={token}
          points={points}
          qrCodeUrl={qrCodeUrl}
          setPoints={setPoints}
          setBillID={setBillID}
          handlePointsChange={handlePointsChange}
          handleCreatePoints={handleCreatePoints}
          setBillAmount={setBillAmount}
          billID={billID}
          billAmount={billAmount}
          outlet={outlet}
          isSubmitting={isSubmitting}
        />
        {/* )} */}
      </main>
    </div>
  );
};

export default StoreSide;
