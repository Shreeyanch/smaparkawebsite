/**
 * Single source of truth for geo-based pricing.
 *
 * To add a new region (e.g. Bangladesh, UAE):
 *   1. Add a new key below with region/currency/symbol/flag/plans/saveText
 *   2. Update the country-code mapping in useGeoPricing.js
 *   No other changes needed.
 *
 * NOTE: This is display-only pricing.
 * Backend billing must validate price independently.
 */
export const pricingConfig = {
  NP: {
    region: "Nepal",
    currency: "NPR",
    symbol: "Rs.",
    flag: "🇳🇵",
    plans: {
      monthly: 2500,
      quarterly: 7500,
      yearly: 25600,
    },
    saveText: "",
  },
  IN: {
    region: "India",
    currency: "INR",
    symbol: "₹",
    flag: "🇮🇳",
    plans: {
      monthly: 1565,
      quarterly: 4690,
      yearly: 16000,
    },
    saveText: "",
  },
  GLOBAL: {
    region: "Global",
    currency: "USD",
    symbol: "$",
    flag: "🌍",
    plans: {
      monthly: 40,
      quarterly: 120,
      yearly: 480,
    },
    saveText: "",
  },
};

export const DEFAULT_REGION = "GLOBAL";
