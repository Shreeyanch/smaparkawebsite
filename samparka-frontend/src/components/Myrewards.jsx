import { useEffect, useState } from "react";
import { format } from "date-fns";
import PropTypes from "prop-types";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "sonner";
import api from "../api/config";

const MyRewards = ({ className = "", onClose, token }) => {
  const [loading, setLoading] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const getMyRewards = async () => {
    setLoading(true);
    try {
      const response = await api.get("/customer/myRewards", {
        headers: { token },
      });

      if (response.data.success) {
        setRewards(response.data.myRewards);

        // Store statuses in an array
        const statuses = response.data.myRewards.map((redemption) => {
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

  useEffect(() => {
    getMyRewards();
    const scrollAnimElements = document.querySelectorAll(
      "[data-animate-on-scroll]"
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            const targetElement = entry.target;
            targetElement.classList.add("animate");
            observer.unobserve(targetElement);
          }
        }
      },
      {
        threshold: 0.15,
      }
    );
    for (let i = 0; i < scrollAnimElements.length; i++) {
      observer.observe(scrollAnimElements[i]);
    }

    return () => {
      for (let i = 0; i < scrollAnimElements.length; i++) {
        observer.unobserve(scrollAnimElements[i]);
      }
    };
  }, []);

  return (
    <div className={`w-full ${className}`}>
      {loading && <LoadingSpinner />}
      {/* <FrameComponent3 redemption={rewards} /> */}
      {rewards.length > 0 ? (
        rewards
          .filter((reward) => reward.type !== "constant")
          .map((reward, index) => (
            <div
              key={index}
              className="self-stretch flex flex-row items-center justify-center flex-wrap content-center gap-[53px] text-left text-xs-4 text-black font-poppins mb-4"
            >
              {/* Add your Reward component content here */}
              <div className="w-[270px] shadow-[0px_4px_12.2px_rgba(0,_0,_0,_0.25)] rounded-3xs1 bg-white h-58 flex flex-col items-center justify-start py-4 px-4 box-border relative gap-2.5">
                <div className="self-stretch flex flex-row items-center justify-center gap-[3px]">
                  {reward.status === "expired" ? (
                    <div className="w-2.5 relative rounded-62xl1 bg-red-800 border-red-900 border-[1px] border-solid box-border h-2.5" />
                  ) : reward.status === "claimed" ? (
                    <div className="w-2.5 relative rounded-62xl1 bg-green-800 border-green-900 border-[1px] border-solid box-border h-2.5" />
                  ) : (
                    <div className="w-2.5 relative rounded-62xl1 bg-teal-200 border-teal-200 border-[1px] border-solid box-border h-2.5" />
                  )}
                  <div className="flex flex-row items-center justify-center">
                    <div className="relative font-medium">
                      {statuses[index]}
                    </div>
                  </div>
                </div>
                <div className="self-stretch flex-1 flex flex-col items-start justify-center gap-2.5 text-left">
                  <div className="self-stretch flex flex-col items-start justify-center py-0 px-3.5 gap-px">
                    <div className="self-stretch flex flex-row items-center justify-start">
                      <div className="w-[125.9px] relative font-medium inline-block shrink-0">
                        {reward.reward.name}
                      </div>
                    </div>
                    <div className="self-stretch relative font-montserrat text-darkgray-200">
                      {reward.reward.points}
                    </div>
                  </div>
                  <div className="self-stretch h-[34px] flex flex-row items-center justify-center py-0 px-3.5 box-border">
                    <div className="flex-1 relative">
                      <p className="m-0">
                        <span className="font-medium">{`Redeem Date: `}</span>
                        <span className="font-montserrat text-darkgray-200">
                          {reward.redeemDate
                            ? format(reward.redeemDate, "dd MMM yyyy")
                            : "N/A"}
                        </span>
                      </p>
                      <p className="m-0">
                        <span className="font-medium">{`Expiry Date: `}</span>
                        <span className="font-montserrat text-darkgray-200">
                          {reward.expiryDate
                            ? format(reward.expiryDate, "dd MMM yyyy")
                            : "N/A"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
      ) : (
        <span>No Redemed Rewards</span>
      )}
    </div>
  );
};

MyRewards.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
};

export default MyRewards;
