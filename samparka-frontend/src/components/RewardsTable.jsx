import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function RewardsTable({ analytics }) {
  // Theme
  const { isDarkMode } = useTheme();
  // Sort the redeemed rewards by redeemDate in descending order (most recent first)
  const sortedRewards = analytics.redeemedRewards?.sort((a, b) =>
    new Date(b.redeemDate) - new Date(a.redeemDate)
  );

  // State to manage the current page of data
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate the rewards to display for the current page
  const rewardsToDisplay = sortedRewards?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate the total number of pages
  const totalPages = Math.ceil(sortedRewards?.length / itemsPerPage);

  // Function to handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className={`mt-6 p-6 rounded-lg shadow-sm border transition-colors ${
      isDarkMode 
        ? 'bg-gray-900 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 transition-colors ${
        isDarkMode ? 'text-white' : 'text-gray-800'
      }`}>Rewards Redeemed</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className={`border-b transition-colors ${
              isDarkMode ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <th className={`text-left px-4 py-3 text-sm font-medium transition-colors ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Reward</th>
              <th className={`text-left px-4 py-3 text-sm font-medium transition-colors ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Customer</th>
              <th className={`text-left px-4 py-3 text-sm font-medium transition-colors ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Date</th>
            </tr>
          </thead>
          <tbody>
            {rewardsToDisplay?.length > 0 ? (
              rewardsToDisplay.map((reward, index) => (
                <tr key={index} className={`border-b transition-colors ${
                  isDarkMode 
                    ? 'border-gray-700 hover:bg-gray-800' 
                    : 'border-gray-100 hover:bg-gray-50'
                }`}>
                  <td className={`px-4 py-3 text-sm transition-colors ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    {reward.reward.name}
                  </td>
                  <td className={`px-4 py-3 text-sm transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {reward.customer.name}
                  </td>
                  <td className={`px-4 py-3 text-sm transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {new Date(reward.redeemDate).toLocaleDateString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className={`text-center px-4 py-8 transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  No rewards redeemed yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md transition-colors ${
              currentPage === 1
                ? isDarkMode 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Previous
          </button>
          <span className={`text-sm transition-colors ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md transition-colors ${
              currentPage === totalPages
                ? isDarkMode 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
