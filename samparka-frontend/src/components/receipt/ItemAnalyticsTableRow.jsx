import { ChevronDown } from "lucide-react";
import PropTypes from "prop-types";
import ItemCustomerList from "./ItemCustomerList";

const ItemAnalyticsTableRow = ({ item, idx, isExpanded, onToggle, pct, customerCount }) => (
  <tbody>
    <tr
      onClick={onToggle}
      className={`border-b border-gray-100 cursor-pointer transition-colors duration-150 dark:border-gray-800/80 ${
        isExpanded
          ? "bg-gray-50 dark:bg-gray-800/50"
          : "hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
      }`}
    >
      <td className="px-4 py-3 align-middle md:px-5">
        <ChevronDown
          size={14}
          className={`text-gray-500 transition-transform dark:text-gray-400 ${isExpanded ? "rotate-180" : ""}`}
        />
      </td>
      <td className="px-2 py-3">
        <span
          className={`text-xs font-semibold ${
            idx < 3
              ? "text-green-700 dark:text-green-300"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {idx + 1}
        </span>
      </td>
      <td className="px-2 py-3 text-sm capitalize text-gray-900 dark:text-gray-100">{item.name}</td>
      <td className="px-2 py-3 font-rubik text-sm text-gray-700 dark:text-gray-300">{item.totalQuantity.toLocaleString()}</td>
      <td className="px-2 py-3 font-rubik text-sm text-gray-700 dark:text-gray-300">{item.totalRevenue.toLocaleString()}</td>
      <td className="px-2 py-3 font-rubik text-sm text-gray-700 dark:text-gray-300">{item.receiptCount}</td>
      <td className="px-2 py-3 font-rubik text-xs text-gray-500 dark:text-gray-400">{pct}%</td>
      <td className="px-2 py-3">
        <span className="rounded-md border border-gray-200 px-2 py-1 font-rubik text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
          {customerCount}
        </span>
      </td>
    </tr>
    {isExpanded && (
      <tr className="bg-gray-50/80 dark:bg-gray-800/40">
        <td colSpan={8} className="p-0">
          <ItemCustomerList customers={item.customers} />
        </td>
      </tr>
    )}
  </tbody>
);

ItemAnalyticsTableRow.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    totalQuantity: PropTypes.number.isRequired,
    totalRevenue: PropTypes.number.isRequired,
    receiptCount: PropTypes.number.isRequired,
    customers: PropTypes.arrayOf(
      PropTypes.shape({
        customerId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        name: PropTypes.string,
        phone: PropTypes.string,
        orderCount: PropTypes.number,
        totalQty: PropTypes.number,
      })
    ),
  }).isRequired,
  idx: PropTypes.number.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  pct: PropTypes.number.isRequired,
  customerCount: PropTypes.number.isRequired,
};

export default ItemAnalyticsTableRow;
