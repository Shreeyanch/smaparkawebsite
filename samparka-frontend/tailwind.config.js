/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        pulseCircle: "pulseCircle 2s infinite",
        spinCircle: "spinCircle 2s linear infinite",
        glow: "glow 1.5s infinite alternate",
        shine: "shine 3s infinite",
      },
      keyframes: {
        spinCircle: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px #2ecc71" },
          "100%": { boxShadow: "0 0 15px #2ecc71" },
        },
        pulseCircle: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.2)", opacity: "0.5" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shine: {
          "0%": { transform: "translateX(-100%) skewX(-12deg)" },
          "100%": { transform: "translateX(200%) skewX(-12deg)" },
        },
      },
      dropShadow: {
        glow: "0 0 10px #2ecc71",
        neon: "0 0 8px #2ecc71, 0 0 16px #2ecc71",
      },
      colors: {
        white: "#fff",
        seagreen: {
          100: "#016e49",
          200: "rgba(1, 110, 73, 0.31)",
        },
        whitesmoke: {
          100: "#f1f4f7",
          200: "#f2f2f2",
        },
        black: "#000",
        sienna: "rgba(139, 61, 61, 0.25)",
        darkgray: {
          100: "#9ea1a1",
          200: "#969696",
        },
        // gray: "rgba(0, 0, 0, 0.54)",
        red1: "#ff0004",
        darkslategray: "#0b2b23",
        lime1: "#00ff00",
      },
      fontFamily: {
        // sans: ["Poppins", "sans-serif"],
        poppins: "Poppins",
        garet: "Garet",
        h1: "Inter",
        rubik: "Rubik",
        montserrat: "Montserrat",
        satoshi: "Satoshi",
      },
      borderRadius: {
        "3xs1": "10px",
        "6xs1": "7px",
        xl1: "20px",
        "62xl1": "81px",
        "sm-41": "13.4px",
      },
      fontSize: {
        mini1: "15px",
        smi1: "13px",
        sm1: "14px",
        "3xs1": "10px",
        xl1: "20px",
        base1: "13px",
        "5xl1": "24px",
        "11xl1": "30px",
        "2xs1": "11px",
        "xs-41": "11.4px",
        inherit: "inherit",
      },
      screens: {
        lg1: {
          max: "1200px",
        },
        md1: {
          max: "960px",
        },
        sm1: {
          max: "420px",
        },
        mq350small1: {
          raw: "screen and (max-width: 350px)",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
