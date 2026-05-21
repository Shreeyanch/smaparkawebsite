import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/config";
import { toast } from "sonner";

const contestants = [
  {
    id: 1,
    name: "Alice Johnson",
    description: "A talented singer with a passion for R&B and soul.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 2,
    name: "Bob Martinez",
    description: "An energetic dancer known for his powerful stage presence.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 3,
    name: "Carla Nguyen",
    description: "A multi-instrumentalist and composer with a unique sound.",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    id: 4,
    name: "David Kim",
    description:
      "A magician who blends storytelling with incredible illusions.",
    image: "https://randomuser.me/api/portraits/men/77.jpg",
  },
  {
    id: 5,
    name: "Emma Wilson",
    description: "A stand-up comedian who leaves everyone in stitches.",
    image: "https://randomuser.me/api/portraits/women/52.jpg",
  },
];

const Vote = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const phone = localStorage.getItem("phoneNumber");
    if (!phone) {
      navigate("/enter");
    }
  }, [navigate]);

  const handleVote = async (contestant) => {
    const confirmVote = window.confirm(
      `Are you sure you want to vote for ${contestant.name}?`
    );
    if (!confirmVote) return;

    const phoneNumber = localStorage.getItem("phoneNumber");

    if (!phoneNumber) {
      alert("Phone number not found. Please go back and enter your number.");
      return;
    }

    try {
      const res = await api.post("/vote", {
        contestantName: contestant.name,
        votersPhoneNumber: phoneNumber,
      });

      if (res.data.success) {
        localStorage.removeItem("phoneNumber");
        navigate("/thank-you", { replace: true });
      } else {
        toast.error(res.data.message || "Something went wrong.");
        localStorage.removeItem("phoneNumber");

        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Vote failed:", error);
      toast.error(
        error.response?.data?.message ||
          "Vote failed. You may have already voted or something went wrong."
      );
      localStorage.removeItem("phoneNumber");
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Vote for Your Favorite Contestant
        </h1>

        <div className="grid gap-6">
          {contestants.map((contestant) => (
            <div
              key={contestant.id}
              className="border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition duration-200 flex items-center gap-6"
            >
              <img
                src={contestant.image}
                alt={contestant.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-700">
                  {contestant.name}
                </h2>
                <p className="text-gray-500 mt-1">{contestant.description}</p>
                <button
                  className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-300"
                  onClick={() => handleVote(contestant)}
                >
                  Vote
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Vote;
