import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const testComponent = () => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000); // Confetti for 3s
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          gravity={0.3}
          numberOfPieces={250}
          colors={["#000"]} // black confetti
        />
      )}

      {/* Green Curly Circle */}
      <DotLottieReact
        className="w-42 h-42 flex items-center justify-center "
        src="https://lottie.host/9ff39448-e462-4d0c-a7d7-5aeb93ccfa6a/X4wM0tlY7o.lottie"
        // loop
        autoplay
      />

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center"
      >
        <h1 className="text-3xl font-bold text-gray-800">Congratulations!</h1>
        <p className="text-lg text-gray-600 mt-2">
          You have earned{" "}
          <span className="text-green-600 font-semibold">2 </span> points
        </p>
      </motion.div>
    </div>
  );
};

export default testComponent;
