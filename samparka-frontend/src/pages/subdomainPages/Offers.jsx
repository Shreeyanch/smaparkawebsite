import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStoreAuth } from "../../context/StoreAuthContext";
import api from "../../api/config";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

const fetchOffers = async (token, storeId) => {
  if (!token) {
    throw new Error("Token Not Provided");
  }

  try {
    const response = await api.get(`/customer/offers/${storeId}`, {
      headers: { token },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch offers");
  }
};

const OffersPage = () => {
  const queryClient = useQueryClient();
  const { storeData } = queryClient.getQueryData(["store"]);
  const { authState } = useStoreAuth();
  const { userInfo: user, token } = authState;
  const [previewImage, setPreviewImage] = useState(null);

  const navigate = useNavigate();

  // Store viewed date
  const offerViewedDate = localStorage.getItem("offerViewedDate")
    ? new Date(localStorage.getItem("offerViewedDate"))
    : new Date("1900");

  useEffect(() => {
    if (!user || !token) {
      navigate("/register");
    }

    if (!storeData?.services?.onGoingOffers) navigate("/");

    // Update viewed date when user opens this page
    localStorage.setItem("offerViewedDate", new Date().toISOString());
  }, [user, token, navigate]);

  const onBackClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const { data: offers, isLoading } = useQuery({
    queryKey: ["On Going Offers"],
    queryFn: () => fetchOffers(token, storeData._id),
    enabled: !!token && !!storeData._id,
  });

  // Filter only active offers
  const activeOffers = (offers || []).filter(
    (offer) => offer.isActive === true
  );

  // Identify unviewed (new) offers
  const unViewedOffers = activeOffers.filter(
    (offer) => new Date(offer.updatedAt) > offerViewedDate
  );

  // Double points banner: check if today is a configured double-points day
  const isDoublePointsToday = (() => {
    if (!storeData?.doublePoints || !Array.isArray(storeData.doublePointsDays) || storeData.doublePointsDays.length === 0) return false;
    const tz = storeData.timezone || "Asia/Kathmandu";
    const dayIndex = new Date(new Date().toLocaleString("en-US", { timeZone: tz })).getDay();
    return storeData.doublePointsDays.includes(dayIndex);
  })();

  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const doublePointsDayNames = storeData?.doublePointsDays?.map((d) => DAY_NAMES[d]) || [];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[480px] bg-white min-h-screen flex flex-col relative">
        {/* Header Section */}
        <div className="flex-none px-5 pt-8 pb-4">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={onBackClick}
              className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <svg
                className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <h1 className="text-base sm:text-sm font-bold text-gray-900">
              On Going Offers
            </h1>

            <div className="w-8 h-8 sm:w-7 sm:h-7"></div>
          </div>
        </div>

        {/* Offers List */}
        <div className="flex-1 px-5 pb-6 space-y-3 overflow-y-auto">
          {/* Double Points Banner */}
          {storeData?.doublePoints && doublePointsDayNames.length > 0 && (
            <div
              className={`mt-4 rounded-xl overflow-hidden border ${
                isDoublePointsToday
                  ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div
                className={`flex items-center gap-2 px-4 py-2 ${
                  isDoublePointsToday ? "bg-yellow-400" : "bg-gray-200"
                }`}
              >
                <span className="text-lg">⚡</span>
                <span className={`text-xs font-bold uppercase tracking-wide ${isDoublePointsToday ? "text-yellow-900" : "text-gray-600"}`}>
                  {isDoublePointsToday ? "Get 2x Points Today" : "Double Points Days"}
                </span>
                {isDoublePointsToday && (
                  <span className="ml-auto text-xs font-semibold bg-yellow-900 text-yellow-100 px-2 py-0.5 rounded-full">
                    2×
                  </span>
                )}
              </div>
              <div className="px-4 py-3">
                <p className={`text-sm font-semibold ${isDoublePointsToday ? "text-orange-800" : "text-gray-700"}`}>
                  {isDoublePointsToday
                    ? "You earn double points on every purchase today!"
                    : "You earn 2x points on every purchase on " + doublePointsDayNames.join(", ")}
                </p>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center text-gray-500 mt-10">Loading...</div>
          ) : activeOffers.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              No ongoing offers
            </div>
          ) : (
            activeOffers
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((offer) => {
                const isNew = new Date(offer.updatedAt) > offerViewedDate;
                return (
                  <div
                    key={offer._id}
                    className={`mt-6 rounded-lg p-4 transition-all border flex justify-between items-start ${
                      isNew
                        ? "border-green-400 bg-green-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    {/* Left: Title, Description, Dates */}
                    <div className="flex-1 pr-4">
                      <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-sm text-gray-900">
                          {offer.title}
                        </h2>
                        {isNew && (
                          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1 text-xs">
                        {offer.description}
                      </p>
                      <div className="text-xs text-gray-500 mt-2 flex gap-4">
                        <span>
                          Start:{" "}
                          {offer.startDate
                            ? format(new Date(offer.startDate), "dd MMM yyyy")
                            : "-"}
                        </span>
                        <span>
                          End:{" "}
                          {offer.expiryDate
                            ? format(new Date(offer.expiryDate), "dd MMM yyyy")
                            : "-"}
                        </span>
                      </div>
                      {/* <div className="mt-2 text-xs">
                        Status:{" "}
                        <span
                          className={`font-medium ${
                            offer.isActive ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {offer.isActive ? "Active" : "Inactive"}
                        </span>
                      </div> */}
                    </div>

                    {/* Right: Image Thumbnail */}
                    {offer.image && (
                      <img
                        src={offer.image}
                        alt={offer.title}
                        className="w-20 h-20 object-cover rounded-md cursor-pointer flex-shrink-0"
                        onClick={() => setPreviewImage(offer.image)}
                      />
                    )}
                  </div>
                );
              })
          )}
        </div>
      </div>
      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 text-white bg-gray-800 bg-opacity-70 hover:bg-opacity-100 rounded-full p-1 transition"
            >
              ✕
            </button>

            <img
              src={previewImage}
              alt="Preview"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersPage;
