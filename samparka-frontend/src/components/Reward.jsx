import { useState, useCallback, useEffect } from "react";
import Description from "./Description";
import MyRewards from "./Myrewards";
import PropTypes from "prop-types";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "sonner";
import api from "../api/config";
import { ArrowUpRight } from "lucide-react";

const Reward = ({ className = "", onClose, storeId, store, token, color }) => {
  const [isRewardView, setIsRewardView] = useState(true);
  const [isDescriptionPopupOpen, setDescriptionPopupOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [activePopup, setActivePopup] = useState(null); // Tracks which reward card has an open popup

  const openDescriptionPopup = useCallback((index) => {
    setActivePopup(index);
  }, []);

  const closeDescriptionPopup = useCallback(() => {
    setActivePopup(null);
  }, []);

  const toggleView = () => {
    setIsRewardView((prevView) => !prevView);
  };

  const getRewards = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reward/getRewards/${storeId}`, {
        headers: { token },
      });
      if (response.data.success) {
        setRewards(response.data.rewards);
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
    getRewards();
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

  const redeemReward = async (rewardId) => {
    // if (store.needBillIDForReward) {
    //   const billId = prompt("Please enter your bill ID to redeem the reward:");
    //   if (!billId) {
    //     toast.error("Bill ID is required to redeem the reward.", {
    //       duration: 2000,
    //     });
    //     return;
    //   }
    //   // Add billId to the request
    //   storeId = `${storeId}&billID=${billId}`;
    // }
    setLoading(true);
    try {
      const response = await api.put(
        `/customer/redeemReward/${rewardId}?storeID=${storeId}`,
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

  return (
    <>
      {loading && <LoadingSpinner />}
      <div
        className={`w-full relative flex flex-col items-center justify-center gap-2.5 max-h-[90%] overflow-auto text-center text-3xs1 text-darkslategray font-poppins ${className}`}
      >
        <div className="w-[46px] relative rounded bg-white h-[3px]" />
        <div className="self-stretch rounded-t-xl1 rounded-b-none bg-white h-[527px] flex flex-col items-center justify-start pt-7 px-0 pb-[42px] box-border gap-7 w-full max-h-[100%] overflow-auto">
          {/* Tab Switcher */}
          <div className="rounded-62xl bg-gradient-to-r from-[#f5f2ed] via-[#f4f5f0] to-[#edf5f3] flex flex-row items-center justify-center p-[3px]">
            <div
              className={`w-[84px] h-[25px] flex flex-row items-center justify-center cursor-pointer ${
                isRewardView
                  ? "bg-white shadow-[0px_4px_10px_rgba(10,_19,_8,_0.12)] text-darkslategray"
                  : "text-darkgray-100"
              }`}
              onClick={toggleView}
            >
              <div className="flex-1 relative tracking-[-0.02em]">Rewards</div>
            </div>
            <div
              className={`w-[84px] h-[25px] flex flex-row items-center justify-center cursor-pointer ${
                !isRewardView
                  ? "bg-white shadow-[0px_4px_10px_rgba(10,_19,_8,_0.12)] text-darkslategray"
                  : "text-darkgray-100"
              }`}
              onClick={toggleView}
            >
              <div className="flex-1 relative tracking-[-0.02em]">
                My Rewards
              </div>
            </div>
          </div>

          {/* Rewards Grid */}
          {isRewardView ? (
            <div className="self-stretch flex flex-row items-center justify-center flex-wrap content-center gap-[53px] text-left text-xs-4 text-black font-poppins relative">
              {rewards.length > 0 ? (
                rewards
                  .filter((reward) => reward.type !== "constant")
                  .map((reward, index) => (
                    <div
                      key={index}
                      className="w-[270px] shadow-[0px_4px_12.2px_rgba(0,_0,_0,_0.25)] rounded-3xs1 bg-white h-68 flex flex-col items-center justify-start p-4 box-border relative gap-2.5"
                    >
                      <img
                        className="w-60 relative rounded-6xs1 h-[130px] object-cover z-[0]"
                        alt=""
                        src={reward.image || reward.template?.image}
                      />
                      <img
                        className="w-6 absolute !m-[0] top-[17px] left-[225px] h-6 cursor-pointer z-[1]"
                        alt=""
                        src="/frame-1410103886.svg"
                        onClick={() => openDescriptionPopup(index)}
                      />
                      <div className="self-stretch flex flex-col items-start justify-center py-0 px-3.5 relative gap-px z-[2]">
                        {/* Reward Details */}
                        <div className="self-stretch flex flex-row items-center justify-between w-full">
                          <div className="flex flex-col">
                            <div className="flex flex-row items-center">
                              <span className="text-2xs1 font-medium">
                                {reward.name}
                              </span>
                            </div>
                            <span className="text-xs1 text-gray-500">
                              {reward.points} Points
                            </span>
                          </div>
                          {/* Redeem Button */}
                          <button
                            style={{ backgroundColor: color }}
                            onClick={() => redeemReward(reward._id)}
                            className="flex items-center gap-2 bg-green-500 text-white text-2xs1 font-medium px-3 py-1 rounded-md shadow-sm hover:bg-green-600 transition"
                          >
                            Redeem
                            {/* <img
                            className="w-3 h-3"
                            alt="Redeem"
                            src="/reedem-button-arrow.svg"
                          /> */}
                            <ArrowUpRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Description Popup */}
                      {activePopup === index && (
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white bg-opacity-90 z-50 rounded-3xs1 shadow-lg">
                          <Description
                            onClose={closeDescriptionPopup}
                            description={reward.description}
                          />
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                <div>No Rewards Found</div>
              )}
            </div>
          ) : (
            <MyRewards token={token} />
          )}
        </div>
      </div>
      {isDescriptionPopupOpen && (
        <PortalPopup
          overlayColor="rgba(113, 113, 113, 0.3)"
          placement="Centered"
          onOutsideClick={closeDescriptionPopup}
        >
          <Description onClose={closeDescriptionPopup} />
        </PortalPopup>
      )}
    </>
  );
};

Reward.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
  storeId: PropTypes.string.isRequired,
  token: PropTypes.string.isRequired,
};

export default Reward;
