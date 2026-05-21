import { useState, useEffect } from "react";
import { pricingConfig, DEFAULT_REGION } from "./pricingConfig";

/**
 * Multiple geo APIs tried in order — first successful response wins.
 * Each has a different provider so they don't share the same failure mode.
 */
const GEO_APIS = [
  {
    url: "https://ipapi.co/json/",
    extract: (d) => d?.country_code,
  },
  {
    url: "https://ipwho.is/",
    extract: (d) => d?.country_code,
  },
  {
    url: "https://api.country.is/",
    extract: (d) => d?.country,
  },
  {
    url: "https://freeipapi.com/api/json",
    extract: (d) => d?.countryCode,
  },
];

/** Map ISO-3166-1 alpha-2 country code → our pricing region key */
const toRegion = (code) => {
  if (!code || typeof code !== "string") return DEFAULT_REGION;
  const upper = code.toUpperCase();
  if (upper === "NP") return "NP";
  if (upper === "IN") return "IN";
  // Add more here as new regions are added to pricingConfig
  return DEFAULT_REGION;
};

/** fetch() with a hard timeout — aborts if the API hangs */
const fetchWithTimeout = async (url, ms = 5000) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Tries each geo API in sequence.
 * Returns the first valid 2-letter country code found, or DEFAULT_REGION if all fail.
 */
async function detectRegion() {
  for (const api of GEO_APIS) {
    try {
      const res = await fetchWithTimeout(api.url, 5000);
      if (!res.ok) continue;
      const data = await res.json();
      const code = api.extract(data);
      if (typeof code === "string" && code.length === 2) {
        return toRegion(code);
      }
    } catch {
      // This provider failed (timeout / blocked / CORS) — try the next one
    }
  }
  return DEFAULT_REGION; // All providers failed
}

/**
 * Detects user region via cascading IP geo APIs.
 *
 * Behavior:
 *  - Renders with GLOBAL immediately (no flicker, SEO-safe)
 *  - Tries ipapi.co → ipwho.is → country.is → freeipapi.com in order
 *  - Each call has a 5 s hard timeout; failure moves to the next provider
 *  - All providers exhausted → stays on GLOBAL, never crashes
 *  - Always fetches fresh — no localStorage, so VPN / travel always reflects correctly
 *
 * Returns: { pricing, country, loading }
 */
export function useGeoPricing() {
  const [country, setCountry] = useState(DEFAULT_REGION);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectRegion()
      .then(setCountry)
      .finally(() => setLoading(false));
  }, []);

  const pricing = pricingConfig[country] ?? pricingConfig[DEFAULT_REGION];

  return { pricing, country, loading };
}
