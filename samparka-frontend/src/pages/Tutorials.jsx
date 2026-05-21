import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { BookOpen, Play, ChevronRight } from "lucide-react";

const Tutorials = () => {
  const { isDarkMode } = useTheme();
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Handle ESC key to close modal and prevent body scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && selectedVideo) {
        setSelectedVideo(null);
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleEscape);

    // Prevent body scroll when modal is open
    if (selectedVideo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [selectedVideo]);

  const tutorialCategories = [
    {
      title: "Getting Started",
      description: "Learn the basics of setting up and managing your store",
      icon: "🚀",
      videos: [


        {
          id: "m-UuglfEmq0",
          title: "How to setup loyalty points and design loyalty card",
          description: "Configure your loyalty points system and design your card"
        },
        {
          id: "H-KtytzklYo",
          title: "How to give loyalty points to customers",
          description: "Award points to customers for their purchases and visits"
        },
        {
          id: "BtIxD5CAlGs",
          title: "How to create a loyalty reward",
          description: "Create attractive rewards for your loyal customers"
        },
        {
          id: "c_12ABV5PXA",
          title: "How to download your loyalty app",
          description: "Get your branded loyalty app for customers"
        }
      ]
    },
    {
      title: "Sub admin or Staff Portal",
      description: "Set up and customize your loyalty rewards program",
      icon: "⭐",
      videos: [
        {
          id: "Sk_VjspxtF8",
          title: "How to use sub admin",
          description: "Learn to add and manage sub-admins for your store"
        },
      ]
    },
    {
      title: "Notifications & Communication",
      description: "Engage with your customers through notifications",
      icon: "📧",
      videos: [
        {
          id: "_GxCRr7cldU",
          title: "How to send customer notification",
          description: "Send targeted notifications to your customer base"
        },
        {
          id: "DO3_JXuAXtw",
          title: "How to setup email SMTP and SMS tokens",
          description: "Configure email and SMS settings for notifications"
        }
      ]
    },
    {
      title: "Marketing & Offers",
      description: "Promote your business with offers and advertisements",
      icon: "🎯",
      videos: [
        {
          id: "LODRYmYtYAM",
          title: "How to add offer ads in your loyalty page",
          description: "Create and display promotional offers on your loyalty page"
        }
      ]
    },
    {
      title: "Build your own Ecommerce Website",
      description: "",
      icon: "🛒",
      videos: [
        {
          id: "48XCqCKmWbk",
          title: "How to use store",
          description: "Complete guide to setting up and using your store dashboard"
        },
      ]
    }
  ];

  const VideoCard = ({ video, categoryIcon }) => (
    <div
      onClick={() => setSelectedVideo(video)}
      className={`group cursor-pointer rounded-lg border transition-all duration-200 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] ${isDarkMode
          ? "bg-gray-900 border-gray-700 hover:border-green-600 hover:shadow-green-900/20"
          : "bg-white border-gray-200 hover:border-green-500 hover:shadow-green-500/10"
        }`}
    >
      <div className="relative overflow-hidden rounded-t-lg bg-gray-800">
        <img
          src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
          alt={video.title}
          className="w-full h-40 sm:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-green-600 rounded-full p-3 sm:p-4 shadow-lg transform group-hover:scale-110 transition-transform duration-200">
            <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="white" />
          </div>
        </div>
        {/* Duration badge - you can add this if you have duration data */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
          Video Tutorial
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-2 mb-2">
          <span className="text-xl sm:text-2xl flex-shrink-0">{categoryIcon}</span>
          <h3
            className={`font-semibold text-base sm:text-lg leading-tight transition-colors group-hover:text-green-600 ${isDarkMode ? "text-white" : "text-gray-900"
              }`}
          >
            {video.title}
          </h3>
        </div>
        <p
          className={`text-xs sm:text-sm transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
        >
          {video.description}
        </p>
      </div>
    </div>
  );

  const VideoModal = ({ video, onClose }) => {
    if (!video) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-80 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn"
        onClick={onClose}
      >
        <style>
          {`
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
            @keyframes slideUp {
              from {
                transform: translateY(20px);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
            .animate-fadeIn {
              animation: fadeIn 0.2s ease-out;
            }
            .animate-slideUp {
              animation: slideUp 0.3s ease-out;
            }
          `}
        </style>
        <div
          className={`relative w-full max-w-5xl rounded-lg overflow-hidden shadow-2xl transition-all duration-200 animate-slideUp border ${isDarkMode
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className={`absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 z-10 p-1.5 sm:p-2 rounded-lg transition-all duration-200 shadow-lg ${isDarkMode
                ? "bg-gray-800/90 hover:bg-gray-700 text-white border border-gray-700"
                : "bg-white/90 hover:bg-gray-100 text-gray-900 border border-gray-200"
              } backdrop-blur-sm`}
            title="Close (Esc)"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          {/* Video Container */}
          <div className="aspect-video bg-black">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>

          {/* Video Info */}
          <div className={`p-3 sm:p-4 md:p-6 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}>
            <h3
              className={`text-base sm:text-lg md:text-xl font-semibold mb-2 transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
                }`}
            >
              {video.title}
            </h3>
            <p
              className={`text-xs sm:text-sm transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
            >
              {video.description}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`px-2 sm:px-0 md:px-4 lg:px-0 sm:ml-0 lg:ml-64 min-h-screen transition-colors ${isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
    >
      {/* Header Section */}
      <div
        className={`border-b shadow-sm transition-colors ${isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-100"
          }`}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen
              className={`w-8 h-8 ${isDarkMode ? "text-green-500" : "text-green-600"
                }`}
            />
            <h1
              className={`text-2xl font-semibold transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
                }`}
            >
              Tutorials
            </h1>
          </div>
          <p
            className={`text-sm transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
          >
            Watch video tutorials to learn how to make the most of Samparka's
            features
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Tutorial Categories */}
        {tutorialCategories.map((category, index) => (
          <div key={index} className="mb-8">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{category.icon}</span>
                <h2
                  className={`text-xl font-semibold transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                >
                  {category.title}
                </h2>
              </div>
              <p
                className={`text-sm ml-12 transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
              >
                {category.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {category.videos.map((video, videoIndex) => (
                <VideoCard
                  key={videoIndex}
                  video={video}
                  categoryIcon={category.icon}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Need Help Section */}
        <div
          className={`mt-8 p-4 sm:p-6 rounded-lg border transition-colors ${isDarkMode
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
            }`}
        >
          <h3
            className={`text-lg sm:text-xl font-semibold mb-2 transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
              }`}
          >
            Need More Help?
          </h3>
          <p
            className={`text-sm mb-4 transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
          >
            Can't find what you're looking for? Contact our support team for
            personalized assistance.
          </p>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg transition-all duration-200 inline-flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md"
          >
            Contact Support
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </div>
  );
};

export default Tutorials;
