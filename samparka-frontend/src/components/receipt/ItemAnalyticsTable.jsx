import { useMemo, useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import PropTypes from "prop-types";
import ItemAnalyticsTableRow from "./ItemAnalyticsTableRow";

const SORT_COLS = [
  { key: "name",          label: "Item Name" },
  { key: "totalQuantity", label: "Units Sold" },
  { key: "totalRevenue",  label: "Revenue" },
  { key: "receiptCount",  label: "Receipts" },
];

const SortIcon = ({ field, sortField, sortDir }) => {
  if (sortField !== field) return <ArrowUpDown size={12} className="opacity-30" />;
  return sortDir === "asc"
    ? <ArrowUp size={12} className="text-gray-900 dark:text-white" />
    : <ArrowDown size={12} className="text-gray-900 dark:text-white" />;
};

const TableHeaderButton = ({ label, onClick, sortField, field, sortDir }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
  >
    {label}
    <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
  </button>
);

const ItemAnalyticsTable = ({ items }) => {
  const [sortField, setSortField] = useState("totalQuantity");
  const [sortDir,   setSortDir]   = useState("desc");
  const [expandedRow, setExpandedRow] = useState(null);

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  const toggleExpand = (name) => setExpandedRow((prev) => (prev === name ? null : name));

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const av = a[sortField], bv = b[sortField];
      if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [items, sortField, sortDir]);

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-800 md:px-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
          Ranked Item List ({items.length})
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px]">
          <thead className="sticky top-0 z-10 bg-white dark:bg-gray-900">
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="w-10 px-4 py-3 md:px-5" />
              <th className="w-10 px-2 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                #
              </th>
              {SORT_COLS.map((col) => (
                <th key={col.key} className="px-2 py-3 text-left">
                  <TableHeaderButton
                    label={col.label}
                    onClick={() => handleSort(col.key)}
                    field={col.key}
                    sortField={sortField}
                    sortDir={sortDir}
                  />
                </th>
              ))}
              <th className="px-2 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                %
              </th>
              <th className="px-2 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                Customers
              </th>
            </tr>
          </thead>
          {sorted.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={8} className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">No items found</td>
              </tr>
            </tbody>
          ) : (
            sorted.map((item, idx) => {
              const isExpanded = expandedRow === item.name;
              const maxQty = sorted[0]?.totalQuantity || 1;
              const pct = Math.round((item.totalQuantity / maxQty) * 100);
              const customerCount = item.customers?.length || 0;
              return (
                <ItemAnalyticsTableRow
                  key={item.name}
                  item={item}
                  idx={idx}
                  isExpanded={isExpanded}
                  onToggle={() => toggleExpand(item.name)}
                  pct={pct}
                  customerCount={customerCount}
                />
              );
            })
          )}
        </table>
      </div>
    </section>
  );
};

const customerShape = PropTypes.shape({
  customerId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  name: PropTypes.string,
  phone: PropTypes.string,
  orderCount: PropTypes.number,
  totalQty: PropTypes.number,
});

const itemShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  totalQuantity: PropTypes.number.isRequired,
  totalRevenue: PropTypes.number.isRequired,
  receiptCount: PropTypes.number.isRequired,
  customers: PropTypes.arrayOf(customerShape),
});

SortIcon.propTypes = {
  field: PropTypes.string.isRequired,
  sortField: PropTypes.string.isRequired,
  sortDir: PropTypes.oneOf(["asc", "desc"]).isRequired,
};

TableHeaderButton.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  sortField: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  sortDir: PropTypes.oneOf(["asc", "desc"]).isRequired,
};

ItemAnalyticsTable.propTypes = {
  items: PropTypes.arrayOf(itemShape).isRequired,
};

export default ItemAnalyticsTable;
