import { useState } from "react";
import { cn } from "../../lib/utils.js";
import { AlertCircle } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const StaffAmountDisplay = ({ extracted, amount, onAmountChange }) => {
  const { isDarkMode } = useTheme();
  const [editing, setEditing] = useState(false);

  if (!extracted) return null;

  if (extracted.failed) {
    return (
      <div className="flex items-center gap-2 text-red-400 text-sm">
        <AlertCircle size={15} /> OCR failed — enter amount manually
        <input
          autoFocus
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0"
          className={cn(
            "ml-2 w-24 px-2 py-1 rounded border text-sm focus:outline-none focus:ring-1 focus:ring-green-500",
            isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
          )}
        />
      </div>
    );
  }

  const confidence = extracted.confidence ?? 0;
  const confidenceLabel = confidence >= 0.8 ? "High" : confidence >= 0.5 ? "Medium" : "Low";
  const confidenceColor = confidence >= 0.8 ? "text-green-500" : confidence >= 0.5 ? "text-yellow-500" : "text-red-400";
  const base = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";

  return (
    <div className={`rounded-xl border p-4 space-y-2 ${base}`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          Extracted Total
        </span>
        <span className={`text-xs font-medium ${confidenceColor}`}>
          {confidenceLabel} confidence
        </span>
      </div>
      {editing ? (
        <input
          autoFocus
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          onBlur={() => setEditing(false)}
          className={cn(
            "w-full text-2xl font-bold px-2 py-1 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500/30",
            isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
          )}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={`text-3xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}
        >
          {amount ? `Rs. ${amount}` : <span className="text-gray-400 text-lg">Tap to enter amount</span>}
        </button>
      )}
      <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>Tap amount to correct</p>
    </div>
  );
};

export default StaffAmountDisplay;
