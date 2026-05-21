import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

// All three shapes use identical SVG command structure (M + 4 C + Z)
// for seamless GSAP attr.d interpolation without MorphSVG plugin.

const CIRCLE_PATH =
  "M50,2 C76.51,2 98,23.49 98,50 C98,76.51 76.51,98 50,98 C23.49,98 2,76.51 2,50 C2,23.49 23.49,2 50,2 Z";

const ROUNDED_SQ_PATH =
  "M50,4 C78,4 96,14 96,50 C96,86 78,96 50,96 C22,96 4,86 4,50 C4,14 22,4 50,4 Z";

const DIAMOND_PATH =
  "M50,2 C58,2 98,42 98,50 C98,58 58,98 50,98 C42,98 2,58 2,50 C2,42 42,2 50,2 Z";

// Default Samparka logo paths (used when no logo prop is provided)
const DEFAULT_LOGO_PATHS = [
  "M46.4,18.8a3.51,3.51,0,0,0,.41,0l13.24-.66s.05,0,.06-.05,0,0,0-.13a5.58,5.58,0,0,0-1.76-1.1,13.59,13.59,0,0,0-8.19-.65,7,7,0,0,0-2.8,1.19,2.13,2.13,0,0,0-1,1.36m.41,1.43a4.58,4.58,0,0,0,.63.63,18.65,18.65,0,0,0,2,1,11.24,11.24,0,0,0,3.29.7A13.28,13.28,0,0,0,58,22.06a5.87,5.87,0,0,0,2.14-1.16,1.84,1.84,0,0,0,.71-1.31l-14,.64m11.7-4.81a2.29,2.29,0,0,0-.14-.38c-1.42-2.39-2.86-4.78-4.28-7.17-.54-.92-1.24-.75-1.68,0-1.29,2.32-2.65,4.6-4,6.9-.09.16-.16.34-.29.62a15.85,15.85,0,0,1,10.38,0m-13.33,5c-.94,1.5-1.78,3-2.64,4.5,1,.15,21.2,.11,21.7,0a22,22,0,0,0-2.41-3.81,7.92,7.92,0,0,1-5.31,2.74,15,15,0,0,1-5.42-.07c-2.3-.45-4.44-1.2-5.92-3.34M70.69,8.5c-.16,1.33-.1,13.93.06,14.45h5.4c.63-.35.67-.83.37-1.46L75.2,20.31,72.65,18a1.78,1.78,0,0,1-.57-1.74,3.46,3.46,0,0,1,.64-1.53c1-1.36,2-2.74,3-4.11A1.61,1.61,0,0,0,76,8.85a1.65,1.65,0,0,0-1.17-.36h-4.1M28.48,9.76V27.21h-5c-.16-.57-.2-21.56,0-22.53.24,0,.49,0,.74,0h9.91a4.77,4.77,0,0,1,4.6,3,7.11,7.11,0,0,1,.65,2.6,12.65,12.65,0,0,1,0,2.22,5.18,5.18,0,0,1-2,3.49c-.18.15-.36.29-.55.42a2,2,0,0,0-.64,2.71c.91,1.68,1.93,3.31,2.94,5a2.44,2.44,0,0,0,.33-.37q3.26-5.39,6.49-10.79L51,4.45c.29-.48.55-1,.88-1.44a1.57,1.57,0,0,1,2.5-.41A5.82,5.82,0,0,1,55.7,4.07c1.75,2.85,3.46,5.73,5.18,8.61q2.16,3.59,4.3,7.17a2.44,2.44,0,0,0,.31.24V4.79a1,1,0,0,1,.11-.28H76.25a5.71,5.71,0,0,1,4,1.63A2.46,2.46,0,0,1,81,7.6a5.65,5.65,0,0,1-.49,3.72A29.16,29.16,0,0,1,78.29,15a4.65,4.65,0,0,0-.34.52,1.38,1.38,0,0,0,.34,1.8,4.15,4.15,0,0,0,.68.48,4.42,4.42,0,0,1,2.25,4.32,5,5,0,0,1-2.1,4.15,4.86,4.86,0,0,1-2.83.83l-11.45,0h-30a4,4,0,0,1-.31-.44c-1.34-2.35-2.69-4.7-4-7.06A4.38,4.38,0,0,1,30,17.84a2.48,2.48,0,0,1,.68-2c1.11-1.2,2.23-2.4,3.33-3.61a2.41,2.41,0,0,0,.52-.75,1.49,1.49,0,0,0-1.22-1.8c-1.51,0-3,0-4.53,0,0,0-.09,0-.26.11",
  "M10.82,11.82h-.17c-.26.71-.53,1.42-.79,2.14s-.54,1.43-.79,2.16a14.2,14.2,0,0,0-.75,2.17h4.83l-2.33-6.46M21.34,27.08H16.39L14.61,22.2H6.79C6.2,23.82,5.61,25.42,5,27.1c-1.62,0-3.25,0-5,0,.24-.7.45-1.32.67-1.93l3.81-10.3c1-2.69,2-5.38,3-8a3.41,3.41,0,0,1,3.08-2.29A3.53,3.53,0,0,1,14,6.8c.53,1.42,1.05,2.84,1.57,4.26L20.11,23.6c.34.93.69,1.87,1,2.81.06.18.11.38.2.67",
  "M117.81,11.67a43.74,43.74,0,0,0-2.33,6.55,22.25,22.25,0,0,0,4.69,0l-2.36-6.51m10.59,15.4h-5c-.58-1.59-1.18-3.21-1.78-4.87h-7.73c-.59,1.62-1.18,3.22-1.79,4.87h-5c.11-.38.2-.71.32-1q3.42-9.3,6.85-18.58a7.38,7.38,0,0,1,.87-1.7,3.28,3.28,0,0,1,4.94-.24,4.31,4.31,0,0,1,1,1.69q1.48,4.11,3,8.22l4.08,11.1c.06.16.09.32.15.54",
  "M105.44,4.63V10h-.64c-1.51,0-3,.05-4.54,0a5.12,5.12,0,0,0-5.05,3.18,6.73,6.73,0,0,0,1,7.18A5.22,5.22,0,0,0,100.09,22c1.51,0,3,0,4.53,0h.83c.07,1.78,0,3.48,0,5.21a2.11,2.11,0,0,1-.47.13c-2,0-3.89,0-5.84-.05a8.91,8.91,0,0,1-5.94-2.71A11.24,11.24,0,0,1,90,18.39a13,13,0,0,1,.27-6.23,10.81,10.81,0,0,1,5.35-6.53,7.94,7.94,0,0,1,3.9-1h6",
  "M83,4.52h4.92c.16.62.17,22,0,22.64H83.06c-.15-.59-.2-21.17,0-22.64",
  "M129.35,9.33A4.4,4.4,0,1,0,125,5a4.4,4.4,0,0,0,4.39,4.29m0,.53a4.93,4.93,0,1,1,4.93-4.77,4.92,4.92,0,0,1-4.93,4.77",
  "M131.43,4.15c0,.13-.07.26-.1.38l-.24,1c-.09.34-.17.68-.25,1,0,0,0,0,0,0s0,.08-.1.08h-.5s-.06,0-.06,0l-.22-.85c-.05-.22-.11-.43-.16-.64s-.11-.43-.16-.65l-.06-.24a.05.05,0,0,0,0,0v.42c0,.67,0,1.33,0,2,0,0,0,0,0,0H129s-.05,0-.05,0V3.45s0-.05.05-.05h.89s0,0,.06,0c.05.18.09.36.14.54s.13.49.2.74.13.5.2.76a.23.23,0,0,0,0,.09c0-.07,0-.15.06-.21l.18-.69.18-.69.15-.54s0,0,.05,0H132s.06,0,.06.05V6.58s0,0-.05,0h-.51s-.05,0-.05,0V4.2s0,0,0,0",
  "M126.91,5.29c0-.43,0-.86,0-1.29a.05.05,0,0,0-.06-.06H126c-.05,0-.06,0-.06-.06V3.45s0-.05,0-.05h2.46s.06,0,.06.05v.44s0,.06-.06.06h-.84c-.05,0-.06,0-.06.07V6.56c0,.07,0,.07-.07.07H127s-.07,0-.07-.06c0-.43,0-.86,0-1.28",
];

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function preloadAssets() {
  return Promise.resolve();
}

/**
 * SplashScreen — reusable animated splash with geometric evolution.
 *
 * Props:
 *   logo        — React node to display as the final logo. Defaults to the Samparka SVG.
 *                 Can be an <img>, <svg>, or any JSX.
 *   logoSrc     — Shorthand: pass an image URL and the component renders an <img> for you.
 *   onComplete  — Called when the 3.5s animation finishes.
 *
 * Usage examples:
 *   <SplashScreen />                                           // default Samparka logo
 *   <SplashScreen logoSrc="/stores/cafe-bliss/logo.png" />     // image URL
 *   <SplashScreen logo={<MyCustomSvgLogo />} />                // custom JSX
 */
export default function SplashScreen({ logo, logoSrc, onComplete }) {
  const containerRef = useRef(null);
  const shapeRef = useRef(null);
  const pathRef = useRef(null);
  const logoRef = useRef(null);
  const [done, setDone] = useState(() => prefersReducedMotion());

  // Resolve which logo to render
  const logoContent = logo
    || (logoSrc ? <img src={logoSrc} alt="Store logo" style={S.logoImg} /> : null)
    || <DefaultLogo />;

  useLayoutEffect(() => {
    if (done) {
      onComplete?.();
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    preloadAssets();

    const ctx = gsap.context(() => {
      const shape = shapeRef.current;
      const path = pathRef.current;
      const logoEl = logoRef.current;

      gsap.set(shape, { scale: 0 });
      gsap.set(logoEl, { scale: 0.96, visibility: "hidden" });

      const tl = gsap.timeline({
        onComplete: () => {
          setDone(true);
          document.body.style.overflow = prevOverflow;
          onComplete?.();
        },
      });

      // ─── Phase 1 (0–0.5s): Circle scales in ───
      tl.to(shape, {
        scale: 1,
        duration: 0.5,
        ease: "power3.out",
      }, 0);

      // ─── Phase 2 (0.5–1.2s): Circle → rounded square + rotate 0→20° ───
      tl.to(path, {
        attr: { d: ROUNDED_SQ_PATH },
        duration: 0.7,
        ease: "power2.inOut",
      }, 0.5);

      tl.to(shape, {
        rotation: 20,
        duration: 0.7,
        ease: "power2.inOut",
      }, 0.5);

      // ─── Phase 3 (1.2–1.8s): Rounded square → diamond + scale 1→1.2 ───
      tl.to(path, {
        attr: { d: DIAMOND_PATH },
        duration: 0.6,
        ease: "power2.inOut",
      }, 1.2);

      tl.to(shape, {
        scale: 1.2,
        rotation: 45,
        duration: 0.6,
        ease: "power2.inOut",
      }, 1.2);

      // ─── Phase 4 (1.8–2.6s): Diamond scales 1.2→25, white takeover ───
      tl.to(shape, {
        scale: 25,
        duration: 0.8,
        ease: "power4.inOut",
      }, 1.8);

      // ─── Phase 5 (2.6–3.5s): Remove shape, reveal logo ───
      tl.set(containerRef.current, {
        backgroundColor: "#FFFFFF",
      }, 2.6);

      tl.set(shape, {
        visibility: "hidden",
      }, 2.6);

      tl.to(logoEl, {
        visibility: "visible",
        scale: 1,
        duration: 0.9,
        ease: "expo.out",
      }, 2.6);

    }, containerRef);

    return () => {
      ctx.revert();
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (done) {
    return (
      <div style={S.final}>
        <div style={S.logoWrapDone}>{logoContent}</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={S.container}>
      <svg ref={shapeRef} viewBox="0 0 100 100" style={S.shape}>
        <path ref={pathRef} d={CIRCLE_PATH} fill="#FFFFFF" />
      </svg>

      <div ref={logoRef} style={S.logoWrap}>
        {logoContent}
      </div>
    </div>
  );
}

function DefaultLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 140 32"
      style={S.logo}
      aria-label="Samparka"
    >
      {DEFAULT_LOGO_PATHS.map((d, i) => (
        <path key={i} d={d} fill="#1a1a1a" />
      ))}
    </svg>
  );
}

const S = {
  container: {
    position: "fixed",
    inset: 0,
    background: "#000000",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    zIndex: 9999,
  },
  final: {
    position: "fixed",
    inset: 0,
    background: "#FFFFFF",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  shape: {
    position: "absolute",
    width: "25vw",
    maxWidth: 120,
    height: "25vw",
    maxHeight: 120,
    zIndex: 2,
    willChange: "transform",
    transformOrigin: "center center",
  },
  logoWrap: {
    position: "absolute",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
    visibility: "hidden",
    willChange: "transform",
  },
  logoWrapDone: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "min(70vw, 280px)",
    height: "auto",
  },
  logoImg: {
    width: "min(70vw, 280px)",
    height: "auto",
    objectFit: "contain",
  },
};
