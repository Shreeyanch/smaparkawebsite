// import PropTypes from "prop-types";
// import { useState } from "react";

// const FrameComponent1 = ({ className = "" }) => {
//   const icons = ["/vector1.svg", "/vector2.svg", "/vector3.svg"];
//   const [slots, setSlots] = useState([icons[0], icons[1], icons[2]]);
//   const [spinning, setSpinning] = useState(false);

//   const spinSlots = () => {
//     setSpinning(true);
//     const interval = setInterval(() => {
//       setSlots([
//         icons[Math.floor(Math.random() * icons.length)],
//         icons[Math.floor(Math.random() * icons.length)],
//         icons[Math.floor(Math.random() * icons.length)],
//       ]);
//     }, 100);

//     setTimeout(() => {
//       clearInterval(interval);
//       setSpinning(false);
//       checkWin();
//     }, 3000);
//   };

//   const checkWin = () => {
//     if (slots[0] === slots[1] && slots[1] === slots[2]) {
//       alert("Winner! 🎉");
//     } else {
//       alert("Try again!");
//     }
//   };

//   return (
//     <div
//       className={`w-60 flex flex-col items-center justify-center gap-[13px] z-[1] text-left text-mini text-black font-poppins ${className}`}
//     >
//       <div className="relative tracking-[0.01em] font-medium mq350small:text-smi">
//         “Match 3 icons to win”
//       </div>
//       <div className="w-60 shadow-[0px_25px_58px_rgba(1,_110,_73,_0.5)] rounded bg-seagreen-100 flex flex-row items-center justify-center py-[18px] px-2.5 box-border gap-1.5">
//         {slots.map((slot, index) => (
//           <div
//             key={index}
//             className="w-[66px] rounded [background:linear-gradient(#fff,_#fff),_linear-gradient(#fff,_#fff),_#fff] h-[108px] md:flex-col md:flex-wrap flex items-center justify-center"
//           >
//             <img src={slot} alt={`slot-${index}`} className="w-[50px] h-[90px]" />
//           </div>
//         ))}
//       </div>
//       <button
//         className="w-[95px] rounded-6xs bg-seagreen-100 flex flex-row items-end justify-center py-[9px] px-0 box-border text-sm text-white lg:gap-2.5"
//         onClick={spinSlots}
//         disabled={spinning}
//       >
//         <div className="relative tracking-[0.01em] leading-[149.7%] font-medium">
//           {spinning ? "Spinning..." : "Start✨"}
//         </div>
//       </button>
//     </div>
//   );
// };

// FrameComponent1.propTypes = {
//   className: PropTypes.string,
// };

// export default FrameComponent1;



import PropTypes from "prop-types";
import { useState, useEffect } from "react";

const FrameComponent1 = ({ className = "" }) => {
  const icons = ["/vector1.svg", "/vector2.svg", "/vector3.svg"];
  const [slots, setSlots] = useState([icons[0], icons[1], icons[2]]);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState("");
  const [cookie, setCookie] = useState(null);
  const [gameCount, setGameCount] = useState(0);
  const [rewardCode, setRewardCode] = useState(1000); // Reward code starts from 1000
  const [timer, setTimer] = useState(null);
  const [hasWon, setHasWon] = useState(false); // Track if user has won
  const maxPlays = 3;
  const winPlayThreshold = 50; // Set winning play count threshold, e.g., 50th play = guaranteed win
  const winProbability = 50; // 50% probability of winning

  useEffect(() => {
    // Check if the cookie exists and set the game count
    const storedCookie = document.cookie.split("; ").find(row => row.startsWith("slotGameCookie="));
    if (storedCookie) {
      const [name, value] = storedCookie.split("=");
      setCookie(value);
      setGameCount(parseInt(value));
      calculateTimer();
    }
  }, []);

  const setCookieAndResetGame = () => {
    const newGameCount = gameCount + 1;
    const expiryTime = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 hours from now
    document.cookie = `slotGameCookie=${newGameCount}; expires=${new Date(expiryTime).toUTCString()}`;
    setCookie(newGameCount);
    setGameCount(newGameCount);
    calculateTimer();
  };

  const calculateTimer = () => {
    const storedCookie = document.cookie.split("; ").find(row => row.startsWith("slotGameCookie="));
    if (storedCookie) {
      const [name, value] = storedCookie.split("=");
      const expiryTime = new Date(value).getTime(); // Extract expiry time from the cookie value
      const now = new Date().getTime();
      const remainingTime = expiryTime - now;

      if (remainingTime > 0) {
        const timerInterval = setInterval(() => {
          const now = new Date().getTime();
          const timeLeft = expiryTime - now;
          if (timeLeft <= 0) {
            clearInterval(timerInterval);
            setMessage("You can play again now!");
            setTimer(null); // Stop the countdown once time is up
          } else {
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            setTimer(`${hours}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
          }
        }, 1000);
      } else {
        setMessage("You can play again now!");
        setTimer(null); // Reset the timer if cookie has expired
      }
    }
  };

  const spinSlots = () => {
    if (gameCount >= maxPlays || hasWon) {
      setMessage(hasWon ? "You have already won. Please come back tomorrow!" : "Play again tomorrow!");
      return;
    }
    setSpinning(true);
    setMessage("");
    const interval = setInterval(() => {
      // Check if this is the 50th play or any other play that triggers a win
      if (gameCount === winPlayThreshold - 1 || Math.random() < winProbability / 100) {
        // Show matching icons for the winning play
        setSlots([icons[0], icons[0], icons[0]]);
      } else {
        // Random icons for all other plays
        setSlots([
          icons[Math.floor(Math.random() * icons.length)],
          icons[Math.floor(Math.random() * icons.length)],
          icons[Math.floor(Math.random() * icons.length)],
        ]);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setSpinning(false);
      setCookieAndResetGame(); // Update the cookie on game completion
      checkWin();
    }, 4000); // Set spinning time to 4 seconds
  };

  const checkWin = () => {
    // If the player gets 3 matching icons
    if (slots[0] === slots[1] && slots[1] === slots[2]) {
      setHasWon(true); // Set hasWon to true
      setMessage(`Congratulations, you win! Your reward code is #${rewardCode}. Please show it to the store manager.`);
      setRewardCode(rewardCode + 1); // Increment reward code for the next winner
    } else {
      if (gameCount < maxPlays - 1) {
        setMessage("Try again!");
      } else {
        setMessage("Play again tomorrow!");
      }
    }
  };

  return (
    <div
      className={`w-60 flex flex-col items-center justify-center gap-[13px] z-[1] text-left text-mini text-black font-poppins ${className}`}
    >
      <div className="relative tracking-[0.01em] font-medium mq350small:text-smi">
        “Match 3 icons to win”
      </div>
      <div className="w-60 shadow-[0px_25px_58px_rgba(1,_110,_73,_0.5)] rounded bg-seagreen-100 flex flex-row items-center justify-center py-[18px] px-2.5 box-border gap-1.5">
        {slots.map((slot, index) => (
          <div
            key={index}
            className="w-[66px] rounded [background:linear-gradient(#fff,_#fff),_linear-gradient(#fff,_#fff),_#fff] h-[108px] md:flex-col md:flex-wrap flex items-center justify-center"
          >
            <img src={slot} alt={`slot-${index}`} className="w-[50px] h-[90px]" />
          </div>
        ))}
      </div>
      <button
        className="w-[95px] rounded-6xs bg-seagreen-100 flex flex-row items-end justify-center py-[9px] px-0 box-border text-sm text-white lg:gap-2.5"
        onClick={spinSlots}
        disabled={spinning || gameCount >= maxPlays || hasWon} // Disable if the user has already won or max plays reached
      >
        <div className="relative tracking-[0.01em] leading-[149.7%] font-medium">
          {spinning ? "Spinning..." : "Start✨"}
        </div>
      </button>

      {message && (
        <div className="mt-4 text-sm text-black font-medium text-center">
          {message}
        </div>
      )}

      {!hasWon && gameCount < maxPlays && !timer && (
        <div className="mt-4 text-sm text-black font-medium">
          {maxPlays - gameCount} {maxPlays - gameCount === 1 ? "play" : "plays"} left.
        </div>
      )}

      {timer && (
        <div className="mt-4 text-sm text-black font-medium">
          You can play again in: {timer}
        </div>
      )}
    </div>
  );
};

FrameComponent1.propTypes = {
  className: PropTypes.string,
};

export default FrameComponent1;
