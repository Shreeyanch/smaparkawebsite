import React from "react";
import { Check } from "lucide-react";

const PointsConfirmation = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      {/* Title */}
      <h1 className="text-2xl font-medium text-amber-600 mb-16">
        Congratulations
      </h1>

      {/* Circle Progress with Check */}
      <div className="relative w-24 h-24 mb-4">
        {/* Outer circle */}
        <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spinCircle" />

        {/* Inner circle with check */}
        <div className="absolute inset-0 flex items-center justify-center animate-pulseCircle">
          <div className="bg-orange-100 rounded-lg p-2">
            <Check className="w-6 h-6 text-orange-500" strokeWidth={3} />
          </div>
        </div>
      </div>

      {/* Points Label */}
      <div className="text-gray-900 font-medium mb-3">Points</div>

      {/* Points Earned Message */}
      <div className="text-amber-600">You have earned 1 points</div>
    </div>
  );
};

export default PointsConfirmation;
