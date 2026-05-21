import React from "react";
import { Gamepad, Clock, Target, Trophy } from "lucide-react";

const games = [
  {
    name: "Whack-a-Mole",
    description: "Tap moles as fast as you can before time runs out!",
    icon: <Target className="w-6 h-6 text-blue-600" />,
    path: "/games/whack-a-mole",
  },
  {
    name: "Coming Soon....",
    description: "New exciting games are on the way!",
  },
  //   {
  //     name: "Quick Timer",
  //     description: "Test your reflexes with a countdown challenge.",
  //     icon: <Clock className="w-6 h-6 text-green-600" />,
  //     path: "/games/quick-timer",
  //   },
  //   {
  //     name: "Memory Match",
  //     description: "Flip cards and match pairs to train your memory.",
  //     icon: <Trophy className="w-6 h-6 text-yellow-600" />,
  //     path: "/games/memory-match",
  //   },
];

const Games = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-900 mb-8">
          🎮 Available Games
        </h1>
        {/* <h3 className="text-xl font-bold text-center text-blue-900 mb-8">
          Play Games to Earn Points!
        </h3> */}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game, index) => (
            <a
              key={index}
              href={game.path}
              className="block bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-transform duration-200 group"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-700">
                  {game.name}
                </h2>
                {game.icon}
              </div>
              <p className="text-sm text-gray-600">{game.description}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Games;
