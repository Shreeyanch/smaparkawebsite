import { useRef, useEffect } from "react";

const GlareHover = ({
  children,
  image,
  glareColor = "#ffffff",
  glareOpacity = 0.5,
  glareAngle = -45,
  glareSize = 250,
  transitionDuration = 700,
  loopDelay = 2500,
  className = "",
  style = {},
}) => {
  const hex = glareColor.replace("#", "");
  let rgba = glareColor;
  if (/^[\dA-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  } else if (/^[\dA-Fa-f]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }

  const overlayRef = useRef(null);

  const animateGlare = () => {
    const el = overlayRef.current;
    if (!el) return;

    // Reset to start position (top)
    el.style.transition = "none";
    el.style.backgroundPosition = "0% -100%, 0 0";

    // Trigger animation after a small delay (move to bottom)
    setTimeout(() => {
      el.style.transition = `${transitionDuration}ms ease`;
      el.style.backgroundPosition = "0% 200%, 0 0";
    }, 50);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      animateGlare();
    }, loopDelay);

    // Run the first animation after component mounts
    const initialTimeout = setTimeout(() => {
      animateGlare();
    }, 500);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [loopDelay, transitionDuration]);

  const animateIn = () => {
    const el = overlayRef.current;
    if (!el) return;

    el.style.transition = "none";
    el.style.backgroundPosition = "-100% -100%, 0 0";
    el.style.transition = `${transitionDuration}ms ease`;
    el.style.backgroundPosition = "100% 100%, 0 0";
  };

  const animateOut = () => {
    const el = overlayRef.current;
    if (!el) return;

    if (playOnce) {
      el.style.transition = "none";
      el.style.backgroundPosition = "-100% -100%, 0 0";
    } else {
      el.style.transition = `${transitionDuration}ms ease`;
      el.style.backgroundPosition = "-100% -100%, 0 0";
    }
  };

  const overlayStyle = {
    position: "absolute",
    inset: 0,
    background: `linear-gradient(${glareAngle}deg,
        hsla(0,0%,0%,0) 60%,
        ${rgba} 70%,
        hsla(0,0%,0%,0) 100%)`,
    backgroundSize: `${glareSize}% ${glareSize}%, 100% 100%`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "0% -100%, 0 0",
    pointerEvents: "none",
  };

  return (
    <div
      className={`relative grid place-items-center overflow-hidden cursor-pointer ${className}`}
      style={{
        ...style,
      }}
    >
      <div ref={overlayRef} style={overlayStyle} />
      {image && (
        <img src={image} alt="" className="w-full h-full object-cover" />
      )}
      {children}
    </div>
  );
};

export default GlareHover;
