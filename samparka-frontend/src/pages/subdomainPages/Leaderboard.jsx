import React from "react";
import { X, Flame, Clock } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../api/config";
import { useStoreAuth } from "../../context/StoreAuthContext";
import { useNavigate } from "react-router-dom";
import LeaderboardPodium from "./LeaderboardPodium";
import LeaderboardRankList from "./LeaderboardRankList";

const PAGE_BG = "#F2EAD8";

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const SkeletonBar = ({ h }) => (
  <div
    className="flex-1 rounded-t-2xl animate-pulse"
    style={{ height: h, background: "rgba(0,0,0,0.08)" }}
  />
);

const LoadingSkeleton = () => (
  <div className="flex flex-col min-h-screen bg-white" >
    <div className="flex items-end justify-center gap-2 px-4 pt-16 pb-0">
      <SkeletonBar h={140} />
      <SkeletonBar h={180} />
      <SkeletonBar h={110} />
    </div>
    <div className="px-4 mt-6 flex flex-col gap-2">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-14 rounded-2xl animate-pulse"
          style={{ background: "rgba(0,0,0,0.07)" }}
        />
      ))}
    </div>
  </div>
);

// const CoffeeHeroBanner = ({ hero }) => (
//   <div
//     className="mx-4 mb-4 px-4 py-3 rounded-2xl flex items-center gap-3"
//     style={{ background: "rgba(255,168,0,0.12)", border: "1px solid rgba(255,168,0,0.3)" }}
//   >
//     <div
//       className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
//       style={{ background: "rgba(255,168,0,0.2)" }}
//     >
//       <Flame className="w-4 h-4" style={{ color: "#E08000" }} />
//     </div>
//     <div className="flex-1 min-w-0">
//       <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#A06000" }}>
//         Coffee Hero
//       </p>
//       <p className="font-bold text-sm truncate" style={{ color: "#5A3000" }}>
//         {hero.customer?.name || "Champion"}
//       </p>
//     </div>
//     <p className="text-xs font-semibold shrink-0" style={{ color: "#E08000" }}>
//       30 Days Free
//     </p>
//   </div>
// );

const Leaderboard = () => {
  const { authState } = useStoreAuth();
  const { userInfo: userData, token } = authState;
  const queryClient = useQueryClient();
  const { storeData } = queryClient.getQueryData(["store"]);
  const navigate = useNavigate();

  const isL5Format = storeData?.loyaltyCard?.format === "L5";

  const { data: l5Data, isLoading: l5Loading, error: l5Error } = useQuery({
    queryKey: ["l5Leaderboard", storeData._id],
    queryFn: async () => {
      const res = await api.get(`/api/l5/leaderboard/${storeData._id}/current`, {
        headers: { token },
      });
      return res.data;
    },
    enabled: isL5Format,
  });

  const { data: customers, isLoading: customersLoading, error: customersError } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await api.get(`/customer/getCustomers/${storeData._id}`, {
        headers: { token },
      });
      return res.data.customers;
    },
    enabled: !isL5Format,
  });

  const isLoading = isL5Format ? l5Loading : customersLoading;
  const error = isL5Format ? l5Error : customersError;

  if (isLoading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500" style={{ background: PAGE_BG }}>
        {error.message}
      </div>
    );
  }

  let topCustomers = [], userRank = 0, coffeeHero = null, month = null, year = null;

  if (isL5Format && l5Data?.data) {
    topCustomers = (l5Data.data.leaderboard || []).slice(0, 10).map((e) => ({
      _id: e.customer?._id,
      name: e.customer?.name || "Unknown",
      points: e.totalPointsEarned,
      isQualified: e.isQualified,
      customer: e.customer,
    }));
    userRank = l5Data.data.currentUserRank || 0;
    coffeeHero = l5Data.data.coffeeHero;
    month = l5Data.data.month;
    year = l5Data.data.year;
  } else if (!isL5Format) {
    const sorted = (customers || []).slice().sort((a, b) => b.points - a.points);
    topCustomers = sorted.slice(0, 10).map((c, i) => ({ ...c, rank: i + 1 }));
    userRank = sorted.findIndex((c) => c._id === userData?._id) + 1;
    const now = new Date();
    month = now.getMonth() + 1;
    year = now.getFullYear();
  }

  const top3 = topCustomers.slice(0, 3);
  const rest = topCustomers.slice(3, 10);
  const showYourRankStrip = userRank > 10;

  return (
    <div className="min-h-screen pb-24 font-poppins bg-white " >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <button
          onClick={() => navigate("/loyality")}
          className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm"
          style={{ background: "rgba(255,255,255,0.8)" }}
        >
          <X className="w-4 h-4" style={{ color: "#333" }} />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-lg" style={{ color: "#1C1C1E" }}>Leaderboard</h1>
          {month && year && (
            <p className="text-xs" style={{ color: "#8E8E93" }}>
              {monthNames[month - 1]} {year}
            </p>
          )}
        </div>
        <div className="w-9" />
      </div>

      {/* Coffee Hero */}
      {/* {coffeeHero && <CoffeeHeroBanner hero={coffeeHero} />} */}

      {/* Podium */}
      {top3.length >= 3 && <LeaderboardPodium top3={top3} />}


      {/* Ranks 4–10 */}
      {rest.length > 0 && (
        <LeaderboardRankList
          entries={rest}
          currentUserId={userData?._id}
          startRank={4}
        />
      )}

      {/* Sticky your-rank strip */}
      {showYourRankStrip && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
          <div
            className="px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2"
            style={{ background: "#FFFFFF" }}
          >
            <span className="text-sm" style={{ color: "#8E8E93" }}>Your rank</span>
            <span className="font-bold text-sm" style={{ color: "#1C1C1E" }}>#{userRank}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
