import React from "react";

const Pod = () => {
  return (
    <div className="h-[400px] w-full flex items-center justify-center relative overflow-hidden z-10">
      {/* Wave effects */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Circles with different delays */}
        <div className="circles circle1"></div>
        <div className="circles circle2"></div>
        <div className="circles circle3"></div>
        {/* <div className="circles circle4"></div> */}
      </div>

      {/* Pod image */}
      <div className="relative z-10">
        <img src="images/pod.png" alt="" className="h-60" />
      </div>

      {/* Custom styles for wave animations */}
      <style jsx>{`
        .circles {
          animation: growAndFade 3s infinite ease-out;
          background-color: rgba(134, 216, 229, 1);
          border: 3px solid rgba(134, 216, 229, 1);
          border-radius: 50%;
          height: 200px;
          opacity: 0;
          position: absolute;
          width: 200px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }

        .circles.circle1 {
          animation-delay: 0s;
        }

        .circles.circle2 {
          animation-delay: 1s;
        }

        .circles.circle3 {
          animation-delay: 2s;
        }

        // .circles.circle4 {
        //   animation-delay: 3s;
        // }

        @keyframes growAndFade {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.5);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(2);
          }
        }
      `}</style>
    </div>
  );
};

export default Pod;
