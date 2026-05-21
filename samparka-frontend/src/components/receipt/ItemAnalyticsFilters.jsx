import PropTypes from "prop-types";

const DATE_PRESETS = [
  { id: "7d",  label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "3m",  label: "3 Months" },
  { id: "all", label: "All Time" },
];

const StatTile = ({ label, value, helper, active = false }) => (
  <div
    className={`rounded-2xl border px-4 py-4 transition-colors md:px-5 ${
      active
        ? "border-green-300 bg-green-50/70 dark:border-green-900/60 dark:bg-green-950/20"
        : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
    }`}
  >
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">{label}</p>
    <p className="mt-2 font-rubik text-3xl font-semibold leading-none text-gray-900 dark:text-gray-100">{value}</p>
    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{helper}</p>
  </div>
);

const ItemAnalyticsFilters = ({ dateRange, onDateRangeChange, totalItems, totalQuantity, totalRevenue }) => {
  const formattedRevenue = new Intl.NumberFormat("en-NP", {
    maximumFractionDigits: 0,
  }).format(totalRevenue || 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-montserrat text-lg font-semibold text-gray-900 dark:text-gray-100">Item Analytics</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">What customers buy most, how often, and from which receipts.</p>
        </div>
        <div className="inline-flex w-fit items-center rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900">
        {DATE_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => onDateRangeChange(p.id)}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all md:px-4 ${
              dateRange === p.id
                ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            }`}
          >
            {p.label}
          </button>
        ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatTile label="Unique Items" value={totalItems.toLocaleString()} helper="Distinct line items detected" />
        <StatTile label="Units Sold" value={totalQuantity.toLocaleString()} helper="Quantity across all receipts" active />
        <StatTile label="Revenue" value={`Rs ${formattedRevenue}`} helper="Total estimated item revenue" />
      </div>
    </div>
  );
};

StatTile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  helper: PropTypes.string.isRequired,
  active: PropTypes.bool,
};

ItemAnalyticsFilters.propTypes = {
  dateRange: PropTypes.string.isRequired,
  onDateRangeChange: PropTypes.func.isRequired,
  totalItems: PropTypes.number.isRequired,
  totalQuantity: PropTypes.number.isRequired,
  totalRevenue: PropTypes.number.isRequired,
};

export default ItemAnalyticsFilters;
