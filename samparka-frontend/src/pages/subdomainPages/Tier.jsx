import Position from "../../components/l3Components/Position";
import Reward from "../../components/l3Components/Reward";
import React, { useEffect, useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/scrollbar";
import "swiper/css/pagination";
import { Keyboard, Mousewheel, Pagination, Scrollbar } from "swiper/modules";
import { useStoreAuth } from "../../context/StoreAuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PoweredBySamparka from "../../components/PoweredBySamparka";
import api from "../../api/config";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import LoadingSpinnerH from "../../components/LoadingSpinnerH.jsx";
import userTier from "../../hooks/userTier";
import { toast } from "sonner";

const Tier = (subdomain) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [userT, setUserT] = useState("Bronze");
  const [loading, setLoading] = useState(false);
  const [myRewards, setMyRewards] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [points, setPoints] = useState(0);

  const { authState, updateAuth } = useStoreAuth();
  const { userInfo: user, token } = authState;
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!location.state) {
      navigate("/loyality");
    } else {
      const { tier, points, customerTier } = location.state;
      setUserT(customerTier || userTier(tier, points));
      setPoints(points);
    }
  }, []);

  const queryClient = useQueryClient();
  const { storeData } = queryClient.getQueryData(["store"]);
  if (!storeData)
    return subdomain == "himalayanjavaexpress" ? (
      <LoadingSpinnerH />
    ) : (
      <>
        <LoadingSpinner />
        <PoweredBySamparka />
      </>
    );

  const getMyRewards = async () => {
    setLoading(true);
    try {
      const response = await api.get("/customer/myRewards", {
        headers: { token },
      });

      if (response.data.success) {
        setMyRewards(
          response.data.myRewards.filter(
            (redemption) => redemption.reward.redeemable === true
          )
        );

        // Store statuses in an array
        const statuses = response.data.myRewards
          .filter((redemption) => redemption.reward.redeemable === true)
          .map((redemption) => {
            switch (redemption.status) {
              case "pending":
                return "Pending Approval";
              case "claimed":
                return "Reward Claimed";
              case "expired":
                return "Reward Expired";
              default:
                return "Unknown Status";
            }
          });

        setStatuses(statuses);
      }
    } catch (error) {
      toast.error(error.message, {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const redeemReward = async (rewardId) => {
    setLoading(true);
    try {
      const endpoint =
        storeData.loyaltyCard.format === "L4" || storeData.loyaltyCard.format === "L6"
        ? `/customer/redeemL4Reward/${rewardId}?storeID=${storeData._id}`
        : `/customer/redeemL3Reward/${rewardId}?storeID=${storeData._id}`;
      
      const response = await api.put(
        endpoint,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message, {
          duration: 2000,
        });
      } else {
        toast.error(response.data.message, {
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error(error.message, {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !token) {
      navigate("/");
      return;
    }
    if (
      storeData.loyaltyCard.format !== "L3" &&
      storeData.loyaltyCard.format !== "L34HA" &&
      storeData.loyaltyCard.format !== "L4" &&
      storeData.loyaltyCard.format !== "L6"
    ) {
      navigate("/loyality");
      return;
    }
    getMyRewards();
  }, [token, storeData]);

  const fetchConstantRewards = async (storeURL) => {
    const response = await api.get(`/reward/getRewards/${storeData._id}`);
    const rewardType =
      storeData.loyaltyCard.format === "L4"
        ? "l4"
        : storeData.loyaltyCard.format === "L6"
          ? "l6"
          : "constant";
    return response.data.rewards.filter((reward) => reward.type === rewardType);
  };

  const {
    data: rewards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["rewards"],
    queryFn: () => fetchConstantRewards(storeData._id),
    enabled: !!storeData,
  });
  if (error) {
  }
  const onVectorIconClick = useCallback(() => {
    navigate(-1);
  }, [navigate]);
  return (
    <div className="bg-white min-h-screen">
      <div
        style={{
          background: `linear-gradient(210deg, ${storeData?.loyaltyCard?.tier[activeIndex].color}, rgba(204, 204, 204, 0.3))`,
        }}
      >
        {(isLoading || loading) && <LoadingSpinner />}
        <button
          className="cursor-pointer border-none mb-16 py-[15px] px-2.5 bg-transparent self-stretch flex items-center justify-start"
          onClick={onVectorIconClick}
        >
          <img
            className="w-[11.8px] h-[21px] cursor-pointer"
            alt="Back"
            src="/vector4.svg"
          />
        </button>
        <Swiper
          pagination={true}
          modules={[Pagination, Mousewheel, Scrollbar, Keyboard]}
          className="mySwiper"
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        >
          {storeData?.loyaltyCard?.tier?.map((tier, index) => (
            <SwiperSlide key={tier._id} id={index.toString()}>
              <div className="pb-16">
                <div className="flex justify-center items-center drop-shadow-2xl">
                  <Position tier={tier} userTier={userT} />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Render the respective rewards based on the active index */}
      {storeData?.loyaltyCard?.tier[activeIndex] && (
        <Reward
          tier={storeData?.loyaltyCard?.tier[activeIndex]}
          rewards={rewards}
          statuses={statuses}
          myRewards={myRewards}
          redeemReward={redeemReward}
          format={storeData.loyaltyCard.format === "L6" ? "L4" : storeData.loyaltyCard.format}
          customerPoints={points}
        />
      )}
    </div>
  );
};

export default Tier;
