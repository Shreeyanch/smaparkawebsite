import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GREEN = "#16d65a";

// eslint-disable-next-line react/prop-types
const PointsConfirmModal = ({ storeName, storeLogo, onConfirm, isLoading }) => {
  const [dotPhase, setDotPhase] = useState(0);
  const intervalRef = useRef(null);

  // Dot animation when loading
  const startDots = () => {
    intervalRef.current = setInterval(() => {
      setDotPhase((p) => (p + 1) % 3);
    }, 360);
  };
  const stopDots = () => {
    clearInterval(intervalRef.current);
    setDotPhase(0);
  };

  // Track loading state for dots
  const prevLoading = useRef(false);
  if (isLoading && !prevLoading.current) { startDots(); prevLoading.current = true; }
  if (!isLoading && prevLoading.current) { stopDots(); prevLoading.current = false; }

  return (
    <AnimatePresence>
      <motion.div
        key="confirm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          backgroundColor: "rgba(10, 10, 10, 0.50)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
          padding: "32px 24px",
          cursor: "default",
        }}
      >
        {/* Store logo or fallback icon */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ marginBottom: 28 }}
        >
          {storeLogo ? (
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
            }}>
              <img
                src={storeLogo}
                alt={storeName || "Store"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ) : (
            <div style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: `linear-gradient(145deg, #16d65a 0%, #09a33c 100%)`,
              boxShadow: "0 8px 32px rgba(9,163,60,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
              </svg>
            </div>
          )}
        </motion.div>

        {/* Heading */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            margin: "0 0 8px",
            fontSize: "clamp(20px, 5.5vw, 24px)",
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.3,
            letterSpacing: "-0.02em",
          }}
        >
          You&apos;re about to receive points
        </motion.p>

        {/* Store name */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          style={{
            margin: "0 0 40px",
            fontSize: 14,
            fontWeight: 500,
            color: GREEN,
            textAlign: "center",
            letterSpacing: "0.01em",
          }}
        >
          {storeName ? `at ${storeName}` : "from this store"}
        </motion.p>

        {/* Continue button */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          whileTap={isLoading ? {} : { scale: 0.96 }}
          onClick={isLoading ? undefined : onConfirm}
          disabled={isLoading}
          style={{
            width: 220,
            height: 54,
            borderRadius: 28,
            border: "none",
            background: isLoading
              ? "rgba(22,214,90,0.15)"
              : `linear-gradient(145deg, #16d65a 0%, #09a33c 100%)`,
            color: "#fff",
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: "0.01em",
            cursor: isLoading ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            boxShadow: isLoading ? "none" : "0 6px 28px rgba(9,163,60,0.45)",
            transition: "box-shadow 0.2s ease, background 0.2s ease",
            WebkitTapHighlightColor: "transparent",
            outline: "none",
          }}
        >
          {isLoading ? (
            <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: dotPhase === i ? 1 : 0.25, scale: dotPhase === i ? 1.3 : 1 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    display: "inline-block",
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: GREEN,
                  }}
                />
              ))}
            </span>
          ) : (
            "Continue"
          )}
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
};

export default PointsConfirmModal;
