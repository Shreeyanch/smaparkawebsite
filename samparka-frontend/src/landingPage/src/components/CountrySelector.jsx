import { cn } from "@/lib/utils";

const COUNTRY_OPTIONS = [
  { code: "NP", label: "Nepal", flag: "🇳🇵" },
  { code: "IN", label: "India", flag: "🇮🇳" },
  { code: "GLOBAL", label: "Global", flag: "🌍" },
];

/**
 * Presentational dropdown for manual pricing region override.
 *
 * Props:
 *  country   — current region code ("NP" | "IN" | "GLOBAL")
 *  setCountry — callback from useGeoPricing; persists to localStorage automatically
 */
export function CountrySelector({ country, setCountry }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 font-medium">Pricing for:</span>
      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className={cn(
          "text-sm font-semibold bg-white border border-gray-200 rounded-lg px-3 py-1.5",
          "focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer",
          "transition-colors hover:border-gray-400"
        )}
        aria-label="Select your pricing region"
      >
        {COUNTRY_OPTIONS.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.flag} {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CountrySelector;
