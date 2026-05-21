import { useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect, useCallback, useRef } from "react";

const WhackAMoleGame = () => {
  const queryClient = useQueryClient();
  const { storeData } = queryClient.getQueryData(["store"]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [moles, setMoles] = useState(
    Array(9).fill({
      visible: false,
      hit: false,
      emerging: false,
      retreating: false,
    })
  );
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const spawnIntervalRef = useRef(null);
  const moleTimeoutsRef = useRef([]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || "ontouchstart" in window);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Calculate game speed based on score/time
  const getGameSpeed = () => {
    const currentLevel = Math.floor(score / 100) + 1;
    const baseSpeed = Math.max(800 - currentLevel * 100, 300);
    const hideSpeed = Math.max(2000 - currentLevel * 150, 800);
    return { spawnSpeed: baseSpeed, hideSpeed: hideSpeed };
  };

  // Enhanced mole spawning with realistic animations
  const spawnMole = useCallback(() => {
    if (!gameActive) return;

    const availableHoles = moles
      .map((mole, index) => ({
        index,
        visible: mole.visible,
        emerging: mole.emerging,
      }))
      .filter((hole) => !hole.visible && !hole.emerging)
      .map((hole) => hole.index);

    if (availableHoles.length === 0) return;

    // Spawn multiple moles at higher levels
    const maxMoles = Math.min(Math.floor(score / 150) + 1, 3);
    const molesToSpawn = Math.min(maxMoles, availableHoles.length);

    for (let i = 0; i < molesToSpawn; i++) {
      const randomIndex = Math.floor(Math.random() * availableHoles.length);
      const randomHole = availableHoles.splice(randomIndex, 1)[0];

      // Start emerging animation
      setMoles((prev) =>
        prev.map((mole, index) =>
          index === randomHole
            ? { visible: false, hit: false, emerging: true, retreating: false }
            : mole
        )
      );

      // Fully emerge after animation
      const emergeTimeout = setTimeout(() => {
        setMoles((prev) =>
          prev.map((mole, index) =>
            index === randomHole
              ? {
                  visible: true,
                  hit: false,
                  emerging: false,
                  retreating: false,
                }
              : mole
          )
        );
      }, 150);

      // Start retreating
      const { hideSpeed } = getGameSpeed();
      const retreatTimeout = setTimeout(() => {
        setMoles((prev) =>
          prev.map((mole, index) =>
            index === randomHole ? { ...prev[index], retreating: true } : mole
          )
        );

        // Fully hide after retreat animation
        setTimeout(() => {
          setMoles((prev) =>
            prev.map((mole, index) =>
              index === randomHole
                ? {
                    visible: false,
                    hit: false,
                    emerging: false,
                    retreating: false,
                  }
                : mole
            )
          );
        }, 150);
      }, hideSpeed);

      moleTimeoutsRef.current.push(emergeTimeout, retreatTimeout);
    }
  }, [gameActive, moles, score]);

  // Game timer and level tracking
  useEffect(() => {
    let timer;
    if (gameActive && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      setLevel(Math.floor((30 - timeLeft) / 5) + 1);
    } else if (timeLeft === 0 && gameActive) {
      setGameActive(false);
      setGameOver(true);
      if (score > highScore) {
        setHighScore(score);
      }
      // Clear all timeouts
      moleTimeoutsRef.current.forEach(clearTimeout);
      moleTimeoutsRef.current = [];
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameActive, score, highScore]);

  // Dynamic spawn system
  useEffect(() => {
    if (gameActive) {
      const { spawnSpeed } = getGameSpeed();

      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }

      spawnIntervalRef.current = setInterval(() => {
        spawnMole();
      }, spawnSpeed);
    }

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, [gameActive, spawnMole, score]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setLevel(1);
    setGameActive(true);
    setGameOver(false);
    setMoles(
      Array(9).fill({
        visible: false,
        hit: false,
        emerging: false,
        retreating: false,
      })
    );
    moleTimeoutsRef.current.forEach(clearTimeout);
    moleTimeoutsRef.current = [];
  };

  const whackMole = (index, event) => {
    // Prevent event bubbling and ensure proper hit detection
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const mole = moles[index];
    if (!gameActive || (!mole.visible && !mole.emerging) || mole.hit) return;

    const points = mole.emerging ? 20 : 10; // Bonus for quick reflexes
    setScore((prev) => prev + points);

    setMoles((prev) =>
      prev.map((m, i) =>
        i === index ? { ...m, hit: true, retreating: true } : m
      )
    );

    // Hide hit mole after animation
    setTimeout(() => {
      setMoles((prev) =>
        prev.map((m, i) =>
          i === index
            ? { visible: false, hit: false, emerging: false, retreating: false }
            : m
        )
      );
    }, 200);
  };

  const MoleComponent = ({ mole, index }) => {
    const getTransform = () => {
      if (mole.hit) return "translateY(20px) scale(0.8)";
      if (mole.retreating) return "translateY(60px)";
      if (mole.emerging) return "translateY(30px)";
      if (mole.visible) return "translateY(0px)";
      return "translateY(80px)";
    };

    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      whackMole(index, e);
    };

    const handleTouch = (e) => {
      e.preventDefault();
      e.stopPropagation();
      whackMole(index, e);
    };

    return (
      <div
        className={`relative overflow-hidden ${
          isMobile
            ? "w-16 h-16 sm:w-20 sm:h-20"
            : "w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
        }`}
      >
        {/* Hole with depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-800 to-amber-900 rounded-full shadow-inner border-2 sm:border-4 border-amber-700">
          <div className="absolute inset-1 sm:inset-2 bg-gradient-to-b from-black/80 to-black rounded-full shadow-2xl">
            <div className="absolute inset-0.5 sm:inset-1 bg-gradient-to-b from-black/60 to-black/90 rounded-full"></div>
          </div>
        </div>

        {/* Clickable Area - Larger for better mobile interaction */}
        <div
          className="absolute inset-0 cursor-pointer z-20 rounded-full"
          onClick={handleClick}
          onTouchStart={handleTouch}
          style={{
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
          }}
        >
          {/* Realistic Mole */}
          <div
            className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 transition-all duration-150 ease-out pointer-events-none ${
              mole.hit ? "animate-pulse" : ""
            }`}
            style={{
              transform: `translateX(-50%) ${getTransform()}`,
              zIndex: mole.visible || mole.emerging ? 10 : 5,
              transition:
                "transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            {/* Mole Body */}
            <div
              className={`relative ${
                isMobile
                  ? "w-10 h-12 sm:w-12 sm:h-14"
                  : "w-12 h-14 md:w-14 md:h-16 lg:w-16 lg:h-20"
              }`}
            >
              {/* Main body */}
              <div
                className={`absolute bottom-0 bg-gradient-to-b from-amber-800 to-amber-900 rounded-full shadow-lg ${
                  isMobile
                    ? "w-10 h-10 sm:w-12 sm:h-12"
                    : "w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16"
                }`}
              >
                <div className="absolute inset-0.5 sm:inset-1 bg-gradient-to-b from-amber-700 to-amber-800 rounded-full">
                  <div className="absolute inset-0.5 sm:inset-1 bg-gradient-to-b from-amber-600 to-amber-700 rounded-full"></div>
                </div>
              </div>

              {/* Head */}
              <div
                className={`absolute top-0 left-1/2 transform -translate-x-1/2 bg-gradient-to-b from-amber-700 to-amber-800 rounded-full shadow-md ${
                  isMobile
                    ? "w-8 h-8 sm:w-9 sm:h-9"
                    : "w-9 h-9 md:w-10 md:h-10 lg:w-12 lg:h-12"
                }`}
              >
                <div className="absolute inset-0.5 sm:inset-1 bg-gradient-to-b from-amber-600 to-amber-700 rounded-full">
                  {/* Eyes */}
                  <div
                    className={`absolute bg-black rounded-full shadow-sm ${
                      isMobile
                        ? "top-1 left-1 w-1 h-1 sm:top-1.5 sm:left-1.5 sm:w-1.5 sm:h-1.5"
                        : "top-1.5 left-1.5 w-1.5 h-1.5 md:top-2 md:left-2 md:w-2 md:h-2"
                    }`}
                  >
                    <div className="absolute top-0 left-0 w-0.5 h-0.5 bg-white rounded-full"></div>
                  </div>
                  <div
                    className={`absolute bg-black rounded-full shadow-sm ${
                      isMobile
                        ? "top-1 right-1 w-1 h-1 sm:top-1.5 sm:right-1.5 sm:w-1.5 sm:h-1.5"
                        : "top-1.5 right-1.5 w-1.5 h-1.5 md:top-2 md:right-2 md:w-2 md:h-2"
                    }`}
                  >
                    <div className="absolute top-0 left-0 w-0.5 h-0.5 bg-white rounded-full"></div>
                  </div>

                  {/* Nose */}
                  <div
                    className={`absolute left-1/2 transform -translate-x-1/2 bg-pink-400 rounded-full shadow-sm ${
                      isMobile
                        ? "top-2.5 w-1 h-0.5 sm:top-3 sm:w-1.5 sm:h-1"
                        : "top-3 w-1.5 h-1 md:top-4 md:w-1.5 md:h-1"
                    }`}
                  ></div>

                  {/* Whiskers - Only show on larger screens */}
                  {!isMobile && (
                    <>
                      <div className="absolute top-3 left-0 w-2 h-0.5 bg-amber-800 rounded-full transform -rotate-12 md:top-4 md:w-3"></div>
                      <div className="absolute top-4 left-0 w-2 h-0.5 bg-amber-800 rounded-full transform rotate-12 md:top-5 md:w-3"></div>
                      <div className="absolute top-3 right-0 w-2 h-0.5 bg-amber-800 rounded-full transform rotate-12 md:top-4 md:w-3"></div>
                      <div className="absolute top-4 right-0 w-2 h-0.5 bg-amber-800 rounded-full transform -rotate-12 md:top-5 md:w-3"></div>
                    </>
                  )}

                  {/* Ears */}
                  <div
                    className={`absolute bg-gradient-to-b from-amber-600 to-amber-700 rounded-full transform -rotate-12 ${
                      isMobile
                        ? "-top-0.5 left-0.5 w-1.5 h-2 sm:-top-1 sm:left-1 sm:w-2 sm:h-3"
                        : "-top-1 left-1 w-2 h-3"
                    }`}
                  ></div>
                  <div
                    className={`absolute bg-gradient-to-b from-amber-600 to-amber-700 rounded-full transform rotate-12 ${
                      isMobile
                        ? "-top-0.5 right-0.5 w-1.5 h-2 sm:-top-1 sm:right-1 sm:w-2 sm:h-3"
                        : "-top-1 right-1 w-2 h-3"
                    }`}
                  ></div>
                </div>
              </div>

              {/* Arms/Paws - Only show on larger screens */}
              {!isMobile && (
                <>
                  <div className="absolute bottom-6 -left-1.5 w-2.5 h-5 bg-gradient-to-b from-amber-700 to-amber-800 rounded-full transform -rotate-12 md:bottom-8 md:-left-2 md:w-3 md:h-6"></div>
                  <div className="absolute bottom-6 -right-1.5 w-2.5 h-5 bg-gradient-to-b from-amber-700 to-amber-800 rounded-full transform rotate-12 md:bottom-8 md:-right-2 md:w-3 md:h-6"></div>
                </>
              )}
            </div>

            {/* Hit Effect */}
            {mole.hit && (
              <div
                className={`absolute left-1/2 transform -translate-x-1/2 ${
                  isMobile ? "-top-6 sm:-top-8" : "-top-8"
                }`}
              >
                <div
                  className={`font-bold text-yellow-300 animate-bounce ${
                    isMobile ? "text-lg sm:text-2xl" : "text-2xl"
                  }`}
                >
                  +{mole.emerging ? "20" : "10"}
                </div>
                <div
                  className={`animate-spin ${
                    isMobile ? "text-2xl sm:text-3xl" : "text-3xl"
                  }`}
                >
                  💫
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-2 sm:p-4">
      <div
        style={{ backgroundColor: storeData.loyaltyCard.cardColor }}
        className="backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/20 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl"
      >
        <h1
          className={`font-bold text-white mb-4 sm:mb-6 text-center drop-shadow-lg ${
            isMobile
              ? "text-2xl sm:text-3xl"
              : "text-3xl md:text-4xl lg:text-5xl"
          }`}
        >
          🔨 Whac-A-Mole 🔨
        </h1>

        {/* Enhanced Game Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6 text-white">
          <div className="bg-black/20 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-2 backdrop-blur text-center">
            <div className="text-xs opacity-80">Score</div>
            <div
              className={`font-bold ${
                isMobile ? "text-lg sm:text-xl" : "text-xl"
              }`}
            >
              {score}
            </div>
          </div>
          <div className="bg-black/20 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-2 backdrop-blur text-center">
            <div className="text-xs opacity-80">Time</div>
            <div
              className={`font-bold ${
                isMobile ? "text-lg sm:text-xl" : "text-xl"
              }`}
            >
              {timeLeft}s
            </div>
          </div>
          <div className="bg-black/20 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-2 backdrop-blur text-center">
            <div className="text-xs opacity-80">Level</div>
            <div
              className={`font-bold ${
                isMobile ? "text-lg sm:text-xl" : "text-xl"
              }`}
            >
              {level}
            </div>
          </div>
          <div className="bg-black/20 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-2 backdrop-blur text-center">
            <div className="text-xs opacity-80">Best</div>
            <div
              className={`font-bold ${
                isMobile ? "text-lg sm:text-xl" : "text-xl"
              }`}
            >
              {highScore}
            </div>
          </div>
        </div>

        {/* Game Grid */}
        <div className="flex flex-col items-center">
          <div
            className={`grid grid-cols-3 mb-4 sm:mb-6 bg-gradient-to-b from-amber-800/30 to-amber-900/40 rounded-xl sm:rounded-2xl backdrop-blur shadow-inner ${
              isMobile
                ? "gap-3 p-4 sm:gap-4 sm:p-6"
                : "gap-4 p-6 md:gap-6 md:p-8"
            }`}
          >
            {moles.map((mole, index) => (
              <MoleComponent key={index} mole={mole} index={index} />
            ))}
          </div>
        </div>

        {/* Game Controls */}
        <div className="text-center">
          {!gameActive && !gameOver && (
            <button
              onClick={startGame}
              className={`bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl ${
                isMobile
                  ? "py-3 px-6 text-lg sm:py-4 sm:px-8 sm:text-xl"
                  : "py-4 px-8 text-xl"
              }`}
            >
              🎮 Start Game
            </button>
          )}

          {gameOver && (
            <div className="space-y-3 sm:space-y-4">
              <div className="text-white text-center">
                <h2
                  className={`font-bold mb-2 ${
                    isMobile ? "text-2xl sm:text-3xl" : "text-3xl"
                  }`}
                >
                  Game Over! 🎯
                </h2>
                <p
                  className={`opacity-80 ${
                    isMobile ? "text-lg sm:text-xl" : "text-xl"
                  }`}
                >
                  Final Score: {score}
                </p>
                <p
                  className={`opacity-60 ${
                    isMobile ? "text-base sm:text-lg" : "text-lg"
                  }`}
                >
                  Reached Level: {level}
                </p>
                {score === highScore && score > 0 && (
                  <p className="text-yellow-300 font-bold animate-pulse">
                    🏆 New High Score!
                  </p>
                )}
              </div>
              <button
                onClick={startGame}
                className={`bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl ${
                  isMobile
                    ? "py-3 px-6 text-lg sm:py-4 sm:px-8 sm:text-xl"
                    : "py-4 px-8 text-xl"
                }`}
              >
                🔄 Play Again
              </button>
            </div>
          )}

          {gameActive && (
            <div className="text-white text-center space-y-2">
              <div
                className={`font-semibold animate-pulse ${
                  isMobile ? "text-base sm:text-lg" : "text-lg"
                }`}
              >
                Level {level} - Whack those moles! 🔨
              </div>
              <div
                className={`opacity-80 ${
                  isMobile ? "text-xs sm:text-sm" : "text-sm"
                }`}
              >
                Bonus points for quick reflexes! (+20 for emerging moles)
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div
          className={`mt-4 sm:mt-6 text-center text-white/80 space-y-1 ${
            isMobile ? "text-xs sm:text-sm" : "text-sm"
          }`}
        >
          <p>
            🎯 {isMobile ? "Tap" : "Click"} moles as they emerge from holes!
          </p>
          <p>⚡ Hit emerging moles for bonus points (+20)</p>
          <p>📈 Game gets faster and spawns more moles as you progress!</p>
          <p>🏆 30 seconds to set your high score!</p>
        </div>
      </div>
    </div>
  );
};
export default WhackAMoleGame;
