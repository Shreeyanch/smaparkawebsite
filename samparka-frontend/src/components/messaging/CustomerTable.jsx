import { Check } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const SEGMENT_CONFIG = {
  first_visit: { label: "1st Visit" },
  second_visit: { label: "2nd Visit" },
  third_visit: { label: "3rd Visit" },
  fourth_visit: { label: "4th Visit" },
  "5+_visits": { label: "5+ Visits" },
  at_risk: { label: "At-Risk" },
  churned: { label: "Churned" },
  no_visits: { label: "New Signup" },
};

export default function CustomerTable({
  customers,
  selectedCustomers,
  matchingCustomers = [],
  isLoading,
  onCustomerToggle,
  pagination,
  onPageChange,
  totalAllCustomers = 0,
}) {
  const { isDarkMode } = useTheme();

  const isCustomerSelected = (customer) => {
    return selectedCustomers.some(c => c.customer === customer.customer);
  };

  const isCustomerMatching = (customer) => {
    return matchingCustomers.some(c => c.customer === customer.customer);
  };

  return (
    <>
      {/* Table */}
      <div className={`border rounded-lg overflow-hidden ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
        <table className="w-full">
          <thead className={isDarkMode ? "bg-gray-800" : "bg-gray-50"}>
            <tr>
              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Select
              </th>
              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Customer
              </th>
              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Phone
              </th>
              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Segments
              </th>
              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Last Visit
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}>
            {!isLoading && customers.length > 0 ? (
              customers.map((c) => {
                const selected = isCustomerSelected(c);
                const segConfig = SEGMENT_CONFIG[c.segment];
                
                return (
                  <tr
                    key={c.customer}
                    onClick={() => onCustomerToggle({
                      customer: c.customer,
                      customerName: c.customerName,
                      customerPhone: c.customerPhone,
                      customerEmail: c.customerEmail,
                    })}
                    className={`cursor-pointer transition-colors ${
                      selected
                        ? isDarkMode
                          ? "bg-green-900/20"
                          : "bg-green-50"
                        : isDarkMode
                        ? "hover:bg-gray-800"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selected
                          ? "bg-[#4caf50] border-[#4caf50]"
                          : isDarkMode
                          ? "border-gray-600"
                          : "border-gray-300"
                      }`}>
                        {selected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          {c.customerName}
                        </p>
                        {c.customerEmail && (
                          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {c.customerEmail}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className={`px-4 py-3 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {c.customerPhone}
                    </td>
                    <td className="px-4 py-3">
                      {c.segment && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isDarkMode
                            ? "bg-gray-700 text-gray-300 border border-gray-600"
                            : "bg-gray-100 text-gray-700 border border-gray-200"
                        }`}>
                          {segConfig?.label || c.segment}
                        </span>
                      )}
                    </td>
                    <td className={`px-4 py-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {c.lastVisit ? dayjs(c.lastVisit).fromNow() : "-"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className={`px-4 py-8 text-center ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {isLoading ? "Loading..." : "No customers found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            {totalAllCustomers > 0 && pagination.total !== totalAllCustomers && (
              <span className={`ml-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                ({totalAllCustomers.toLocaleString()} total in store)
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`px-3 py-1 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Previous
            </button>
            <span className={`px-3 py-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className={`px-3 py-1 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
