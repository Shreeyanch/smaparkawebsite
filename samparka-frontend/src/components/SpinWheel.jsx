import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Wheel } from "react-custom-roulette";
import { getSegments, spinWheel } from "../api/wheelApi";
import { useNavigate } from "react-router-dom";
import { useStoreAuth } from "../context/StoreAuthContext";
import { useEffect } from "react";

export default function SpinWheel() {
  const { authState } = useStoreAuth();
  const { userInfo: user, token } = authState;
  const queryClient = useQueryClient();
  const { storeData } = queryClient.getQueryData(["store"]);
  const navigate = useNavigate();

  if (!storeData) return <PoweredBySamparka />;

  useEffect(() => {
    if (
      storeData.loyaltyCard?.format == "L3" ||
      storeData.loyaltyCard?.format == "L34HA"
    ) {
      navigate("/loyality");
    }
    if (user && token) {
      navigate("/loyality");
    }
    if (sessionStorage.getItem("pendingReward")) {
      navigate("/loyality");
    }
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["wheelSegments", storeData._id], // storeID in queryKey for cache separation
    queryFn: () => getSegments(storeData._id).then((res) => res.data),
  });

  const mutation = useMutation({
    mutationFn: spinWheel,
  });

  const [spinning, setSpinning] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [result, setResult] = useState(null);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Loading segments...
      </div>
    );

  if (!data || data.length === 0)
    return (
      <div className="flex items-center justify-center h-screen text-red-400 text-lg">
        No wheel segments found.
      </div>
    );

  const wheelData =
    data?.length > 0
      ? data.map((s) => ({
          option: s.type == "rewards" ? s.reward.name : s.label,
          style: {
            backgroundColor: s.color,
            fontSize: "14",
          },
        }))
      : [
          {
            option: "No Data",
            style: { backgroundColor: "#ccc" },
          },
        ];

  const handleSpin = async () => {
    try {
      const res = await mutation.mutateAsync();
      const index = data.findIndex((s) => s._id === res.data.reward._id);
      setPrizeNumber(index >= 0 ? index : 0);
      setSpinning(true);
      setResult(null);
    } catch (err) {
      console.error("Spin error:", err);
    }
  };

  const handlePostSpin = async (result) => {
    if (result) {
      sessionStorage.setItem("pendingReward", JSON.stringify(result));
    }

    // Wait for 2 seconds (2000 ms)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Then redirect
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-white px-4 py-8">
      <div
        style={{ backgroundColor: storeData.loyaltyCard.cardColor }}
        className="rounded-2xl shadow-xl border border-stone-700 p-6 sm:p-10 flex flex-col items-center w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold mb-6">🎯 Lucky Spin Wheel</h2>

        <Wheel
          mustStartSpinning={spinning}
          prizeNumber={prizeNumber}
          data={wheelData}
          textColors={["#ffffff"]}
          outerBorderWidth={4}
          radiusLineColor="#333333" // This is the key: shows lines between segments
          radiusLineWidth={3}
          onStopSpinning={() => {
            setSpinning(false);
            setResult(data[prizeNumber]);
            handlePostSpin(data[prizeNumber]);
          }}
        />

        <button
          onClick={handleSpin}
          disabled={spinning || result}
          className="mt-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {spinning ? "Spinning..." : "🎡 Spin the Wheel"}
        </button>

        {result &&
          (result.type === "neutral" ? (
            <div className="mt-6 text-green-400 text-xl font-semibold text-center animate-pulse">
              <span className="underline">{result.label}</span>
            </div>
          ) : (
            <div className="mt-6 text-green-400 text-xl font-semibold text-center animate-pulse">
              🎉 Congratulation You won:{" "}
              <span className="underline">
                {result.type == "rewards" ? result.reward.name : result.label}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
