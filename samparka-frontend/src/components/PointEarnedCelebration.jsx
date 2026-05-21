import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import successAnimation from "../assets/success.json";

// ─── Main Component ────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const PointEarnedCelebration = ({ points, storeName, onDone }) => {
  const [isExiting, setIsExiting] = useState(false);
  const onDoneRef = useRef(onDone);

  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  useEffect(() => {
    if (navigator.vibrate) navigator.vibrate([40, 20, 60]);
  }, []);

  // Auto-close after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => handleDone(), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleDone = () => {
    setIsExiting(true);
    setTimeout(() => onDoneRef.current?.(), 380);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="celebration"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={handleDone}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(10, 10, 10, 0.50)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {/* Lottie animation — scaled up so the 120×120 animation fills nicely */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ width: 260, height: 260, pointerEvents: "none" }}
          >
            <Lottie
              animationData={successAnimation}
              loop={false}
              autoplay={true}
              style={{ width: "100%", height: "100%" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PointEarnedCelebration;
