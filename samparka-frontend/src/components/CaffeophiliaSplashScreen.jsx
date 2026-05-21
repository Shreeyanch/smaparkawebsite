import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

const PATH_D =
  "M37.2777 9.26889C37.2192 9.17448 36.1163 7.44365 34.1547 6.45131C33.6993 4.65754 34.138 3.21203 34.4576 2.48613C34.8963 2.4127 35.6275 2.23647 35.6087 1.87352C35.5815 1.35952 35.4394 0.876986 34.631 1.05741C34.3323 1.12245 34.1631 1.19588 34.1422 2.12528C33.81 2.80083 33.2606 4.29039 33.6555 6.22263C33.6283 6.21214 33.6011 6.19955 33.574 6.18906C32.6026 4.23165 32.9661 2.29312 33.1416 1.61757C33.5113 1.3763 34.1338 0.910553 33.9688 0.581171C33.739 0.121715 33.4152 -0.262215 32.7468 0.226613C32.4961 0.409137 32.3728 0.549702 32.7384 1.43295C32.5775 1.9973 32.237 3.57498 32.776 5.36036C31.6145 3.74911 31.5372 1.98681 31.531 1.64904C31.813 1.29868 32.166 0.767891 31.9383 0.526624C31.5874 0.151086 31.1675 -0.121651 30.6661 0.539212C30.4698 0.799361 30.3967 0.975591 31.1006 1.81478C31.1278 2.46096 31.3242 4.28829 32.6486 5.91213C32.5295 5.88695 32.4125 5.85758 32.2893 5.8387C30.0917 5.49463 27.7082 6.68208 26.4882 8.72132C26.1038 9.36539 25.4165 10.7081 24.6645 12.2354C14.675 16.1796 11.0235 23.9757 9.70537 29.6591L9.67613 29.6507C9.65733 29.7095 7.71458 35.6593 0.215163 38.8818L0.0041763 38.9867L-1.65205e-06 39.1986C-0.00209063 39.3455 0.0856463 39.4818 0.225608 39.5469C0.279921 39.572 0.336323 39.5846 0.392725 39.5846C0.40317 39.5846 0.415704 39.5804 0.426149 39.5804C0.693538 39.6203 1.7798 39.7672 3.56379 39.7672C6.86646 39.7672 12.5568 39.2636 19.8369 36.6726C21.8465 38.8986 25.4395 39.7986 25.5962 39.8364L26.2793 40.0021L25.9639 39.3706C24.1548 35.7516 27.048 32.8837 27.1713 32.7641L27.1671 32.7578C28.0821 31.7823 28.8592 30.6053 29.4253 29.1787C29.8828 28.029 30.1836 26.9338 30.3695 25.889H30.3779C30.3779 25.889 30.3799 25.8555 30.3841 25.8072C30.5116 25.0687 30.5868 24.3533 30.6014 23.6694C30.8876 21.177 31.462 17.0377 32.4313 13.6306C33.2815 10.6452 34.5642 9.99688 35.1052 9.85632C35.7006 9.76401 36.3231 9.73044 36.9811 9.7745L37.6141 9.81646L37.2777 9.27518V9.26889ZM25.0155 12.9949C25.4374 13.339 26.2292 14.046 27.0585 15.0971C25.7779 16.8594 24.581 18.8671 23.361 20.9106C22.6466 22.1085 21.9071 23.3484 21.1383 24.5631C17.9025 29.6738 14.6583 32.6236 12.5171 34.1949C18.0884 28.2073 21.9321 19.5238 21.976 19.4273C22.4042 18.4517 23.7683 15.5439 25.0155 12.9949ZM24.2237 13.1292C23.0288 15.5817 21.7838 18.2356 21.3786 19.1629C21.3305 19.272 16.5363 30.1039 9.93307 35.7873L9.74297 35.9509C9.70537 35.974 9.66777 35.995 9.62808 36.016C9.57794 33.5383 9.94143 19.2091 24.2237 13.1292ZM9.25624 32.0382C8.92201 34.3565 8.97214 36.0076 8.98885 36.3663C6.49671 37.665 3.8834 38.3258 2.20178 38.6447C6.02878 36.5824 8.15326 33.8991 9.25624 32.0382ZM3.24209 39.1063C4.99265 38.7161 7.33439 38.0174 9.58212 36.7943C10.2945 36.9118 12.1077 37.1657 14.3909 37.1657C15.0281 37.1657 15.6986 37.1468 16.3943 37.0964C10.5013 38.8231 5.94313 39.1336 3.24209 39.1042M25.0969 39.0014C24.0357 38.6594 21.9217 37.8433 20.5263 36.4461C22.2121 36.0118 23.8749 35.3383 25.3455 34.3187C24.7878 35.5209 24.418 37.1615 25.099 39.0014M29.7303 25.8051C29.5464 26.7954 29.2561 27.836 28.8216 28.929C25.4333 37.4636 14.0943 36.7293 10.4908 36.2635C10.5681 36.2153 10.6475 36.167 10.7248 36.1167C12.1808 35.3593 16.8998 32.4788 21.6898 24.9114C22.4627 23.6904 23.2043 22.4463 23.9208 21.2441C25.1199 19.2343 26.2668 17.3104 27.4637 15.632C28.7652 17.4447 30.0206 20.084 29.9684 23.4743C29.818 24.7645 29.7428 25.6457 29.7303 25.8051ZM31.8067 13.4439C31.1466 15.7663 30.6661 18.4203 30.3361 20.6756C29.8681 18.372 28.855 16.5048 27.8418 15.1138C29.4671 12.9257 31.2009 11.2116 33.292 10.3535C32.7635 10.9892 32.2287 11.9606 31.8067 13.4439ZM35.3998 9.1514C35.3559 9.1493 35.1637 9.14511 34.8817 9.22483C31.8652 9.74932 29.5297 11.8242 27.4387 14.5852C26.5362 13.4522 25.6965 12.7096 25.3121 12.3949C26.0307 10.9389 26.6825 9.6696 27.0501 9.05489C28.0131 7.44365 29.7804 6.43033 31.5226 6.43033C31.7461 6.43033 31.9717 6.44711 32.1932 6.48068C34.2404 6.79957 35.6943 8.28704 36.3461 9.09266C36.0244 9.09476 35.7089 9.11574 35.4018 9.1514";

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function preloadImages(urls) {
  return Promise.all(
    urls.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = img.onerror = resolve;
          img.src = src;
        })
    )
  );
}

// imagesToPreload: string[] of URLs to preload while the animation plays.
// Pass an empty array if there's nothing to preload.
// The splash won't dismiss until both the animation AND all images are ready.
export default function CaffeophiliaSplashScreen({ onComplete, imagesToPreload = [] }) {
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const [animDone, setAnimDone] = useState(() => prefersReducedMotion());
  const [imagesDone, setImagesDone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Preload images as soon as URLs are available
  useEffect(() => {
    const urls = imagesToPreload.filter(Boolean);
    if (urls.length === 0) {
      setImagesDone(true);
      return;
    }
    preloadImages(urls).then(() => setImagesDone(true));
  }, [imagesToPreload.join(",")]);

  // Dismiss once both animation and images are ready
  useEffect(() => {
    if (animDone && imagesDone && !dismissed) {
      setDismissed(true);
      onComplete?.();
    }
  }, [animDone, imagesDone]);

  useLayoutEffect(() => {
    if (animDone) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const ctx = gsap.context(() => {
      const svgPath = pathRef.current;
      const totalLength = svgPath.getTotalLength() * 1.05;

      gsap.set(svgPath, {
        strokeDasharray: totalLength,
        strokeDashoffset: totalLength,
        fill: "none",
        stroke: "#B24A50",
        strokeWidth: 1.5,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      });

      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = prevOverflow;
          setAnimDone(true);
        },
      });

      // Phase 1 — draw the stroke
      tl.to(svgPath, {
        strokeDashoffset: 0,
        duration: 3.5,
        ease: "power1.inOut",
      });

      // Phase 2 — fill with brand color, dissolve stroke
      tl.to(svgPath, {
        fill: "#B24A50",
        strokeWidth: 0,
        duration: 1.2,
        ease: "power2.out",
      });

      tl.to({}, { duration: 0.4 });
    }, containerRef);

    return () => {
      ctx.revert();
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (dismissed) return null;

  return (
    <div ref={containerRef} style={S.container}>
      <svg
        viewBox="-0.01 -0.28 37.63 40.30"
        style={S.icon}
        aria-hidden="true"
        overflow="visible"
      >
        <path ref={pathRef} d={PATH_D} vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

const S = {
  container: {
    position: "fixed",
    inset: 0,
    background: "#ffffff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    overflow: "hidden",
  },
  icon: {
    width: "clamp(200px, 60vw, 340px)",
    height: "auto",
    display: "block",
  },
};
