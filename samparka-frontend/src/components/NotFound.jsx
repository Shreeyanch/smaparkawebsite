import React from "react";
import { Compass, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const handleHomeClick = () => {
    window.location.href = "/login";
  };

  const handleBackClick = () => {
    window.history.back();
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="text-center">
        {/* Animated Compass */}
        <div className="mb-8 relative">
          <div className="animate-spin-slow">
            <Compass className="w-32 h-32 text-pink-300" strokeWidth={1} />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl font-bold text-white">
            🤪
          </div>
        </div>

        {/* Animated Text */}
        <div className="space-y-4 mb-12">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 animate-shimmer">
            4
            <span className="animate-bounce inline-block text-blue-300">0</span>
            4
          </h1>
          <p className="text-xl text-gray-300 font-light">
            Oops! Looks like you've wandered into uncharted territory
          </p>
          <p className="text-gray-400 max-w-md mx-auto">
            The page you're looking for has drifted away into the digital abyss.
            Let's get you back on course!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleHomeClick}
            className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full flex items-center gap-2 transition-all duration-300 hover:scale-105"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
          <button
            onClick={handleBackClick}
            className="px-6 py-3 border border-purple-400 text-purple-400 hover:bg-purple-400/10 rounded-full flex items-center gap-2 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous Page
          </button>
        </div>

        {/* Background Decoration */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
