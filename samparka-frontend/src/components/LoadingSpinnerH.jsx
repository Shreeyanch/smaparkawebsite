import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-white flex justify-center items-center z-[100]">
      <div className="h-12 w-12 border-4 border-green-800 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;
