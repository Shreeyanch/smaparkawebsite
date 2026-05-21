import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

const formatAmount = (amount) => {
  const num = Number(amount);
  if (Number.isNaN(num)) return amount;
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const TotalAmountSelector = ({ candidates = [], amountValue, onAmountChange }) => {
  const [selectedKey, setSelectedKey] = useState("manual");

  const orderedCandidates = useMemo(() => {
    return Array.isArray(candidates) ? candidates : [];
  }, [candidates]);

  useEffect(() => {
    if (!orderedCandidates.length) {
      setSelectedKey("manual");
      return;
    }
    const recommended = orderedCandidates.find((c) => c.isRecommended) || orderedCandidates[0];
    if (recommended) {
      const key = recommended.id || `${recommended.type}_${recommended.amount}`;
      setSelectedKey(key);
      onAmountChange(String(recommended.amount));
    }
  }, [orderedCandidates, onAmountChange]);

  const handleCandidateSelect = (candidate) => {
    const key = candidate.id || `${candidate.type}_${candidate.amount}`;
    setSelectedKey(key);
    onAmountChange(String(candidate.amount));
  };

  return (
    <div className="flex flex-col gap-2">
      {!!orderedCandidates.length && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-3">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">Detected totals</p>
          <div className="flex flex-col gap-2">
            {orderedCandidates.map((candidate) => {
              const key = candidate.id || `${candidate.type}_${candidate.amount}`;
              return (
                <label key={key} className="flex items-center justify-between gap-2 text-sm text-gray-800 dark:text-gray-100 cursor-pointer">
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="detectedTotal"
                      checked={selectedKey === key}
                      onChange={() => handleCandidateSelect(candidate)}
                    />
                    <span>{candidate.label}</span>
                  </span>
                  <span className="font-semibold">{formatAmount(candidate.amount)}</span>
                </label>
              );
            })}
            <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-100 cursor-pointer">
              <input
                type="radio"
                name="detectedTotal"
                checked={selectedKey === "manual"}
                onChange={() => setSelectedKey("manual")}
              />
              <span>Other (manual)</span>
            </label>
          </div>
        </div>
      )}
      <input
        type="number"
        value={amountValue}
        onChange={(e) => {
          setSelectedKey("manual");
          onAmountChange(e.target.value);
        }}
        required
        step="0.01"
        min="0"
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
};

export default TotalAmountSelector;

TotalAmountSelector.propTypes = {
  candidates: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      type: PropTypes.string,
      label: PropTypes.string,
      amount: PropTypes.number,
      isRecommended: PropTypes.bool,
    })
  ),
  amountValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onAmountChange: PropTypes.func.isRequired,
};
