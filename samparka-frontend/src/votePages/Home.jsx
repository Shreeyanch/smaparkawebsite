import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="text-white">
      <div className="flex flex-col items-center justify-center h-screen">
        <button
          onClick={() => navigate("/enter")}
          className="px-4 py-2 bg-black rounded-full text-3xl"
        >
          Vote
        </button>
      </div>
    </div>
  );
};

export default Home;
