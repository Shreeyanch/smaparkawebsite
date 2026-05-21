import { motion } from "framer-motion";

export default function SiriOrb({ size = "small", isAnimating = true }) {
  const sizes = {
    small: {
      container: "w-7 h-7",
      orb: "w-7 h-7",
      blur: "blur-[2px]",
      glowSize: 20,
      glowOpacity: 0.4,
    },
    large: {
      container: "w-24 h-24",
      orb: "w-24 h-24",
      blur: "blur-[3px]",
      glowSize: 60,
      glowOpacity: 0.6,
    },
  };

  const config = sizes[size];

  const pulseAnimation = isAnimating
    ? {
        scale: [1, 1.15, 1],
        opacity: [0.7, 1, 0.7],
        rotate: [0, 180, 360],
      }
    : {};

  const pulseTransition = isAnimating
    ? {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }
    : {};

  return (
    <div className={`relative flex items-center justify-center ${config.container}`}>
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)",
          filter: `blur(${config.glowSize}px)`,
        }}
        animate={
          isAnimating
            ? {
                opacity: [config.glowOpacity, config.glowOpacity * 1.5, config.glowOpacity],
                scale: [1, 1.2, 1],
              }
            : {}
        }
        transition={
          isAnimating
            ? {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : {}
        }
      />

      {/* Main orb with gradient */}
      <motion.div
        className={`relative ${config.orb} rounded-full bg-gradient-to-br from-green-400 via-teal-400 to-purple-500`}
        style={{
          boxShadow: "0 0 30px rgba(16, 185, 129, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.2)",
        }}
        animate={pulseAnimation}
        transition={pulseTransition}
      >
        {/* Inner highlight for depth */}
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent"
          style={{
            clipPath: "circle(40% at 30% 30%)",
          }}
        />

        {/* Animated shimmer effect */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-50"
          style={{
            background:
              "linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%)",
          }}
          animate={
            isAnimating
              ? {
                  rotate: [0, 360],
                }
              : {}
          }
          transition={
            isAnimating
              ? {
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }
              : {}
          }
        />
      </motion.div>

      {/* Additional particle glow */}
      {size === "large" && (
        <>
          <motion.div
            className="absolute w-3 h-3 rounded-full bg-green-300"
            style={{
              top: "10%",
              left: "20%",
              filter: "blur(3px)",
            }}
            animate={
              isAnimating
                ? {
                    y: [0, -10, 0],
                    x: [0, 5, 0],
                    opacity: [0.4, 0.8, 0.4],
                  }
                : {}
            }
            transition={
              isAnimating
                ? {
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
                : {}
            }
          />
          <motion.div
            className="absolute w-2 h-2 rounded-full bg-purple-400"
            style={{
              bottom: "15%",
              right: "25%",
              filter: "blur(2px)",
            }}
            animate={
              isAnimating
                ? {
                    y: [0, 8, 0],
                    x: [0, -4, 0],
                    opacity: [0.3, 0.7, 0.3],
                  }
                : {}
            }
            transition={
              isAnimating
                ? {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }
                : {}
            }
          />
        </>
      )}
    </div>
  );
}
