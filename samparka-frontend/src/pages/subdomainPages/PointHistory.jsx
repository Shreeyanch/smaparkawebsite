import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStoreAuth } from "../../context/StoreAuthContext";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../api/config";
import { Loader2, History, ChevronLeft, ChevronRight } from "lucide-react";
import PoweredBySamparkaFooter from "../../components/PoweredBySamparkaFooter";

const ITEMS_PER_PAGE = 10;

const PointHistory = ({ showPoweredBy = false }) => {
  const { authState } = useStoreAuth();
  const { userInfo: user, token } = authState;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { storeData } = queryClient.getQueryData(["store"]);

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!user || !token) {
      navigate("/register");
    }
  }, [user, token, navigate]);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await api.get(
          `/customer/pointsHistory?page=${page}&limit=${ITEMS_PER_PAGE}`,
          { headers: { token } }
        );
        setHistory(response.data.history);
        setTotalPages(response.data.totalPages);
        setTotal(response.data.total);
      } catch (err) {
        console.error("Error fetching points history:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchHistory();
    }
  }, [token, page]);

  const onBackClick = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  const startEntry = (page - 1) * ITEMS_PER_PAGE + 1;
  const endEntry = Math.min(page * ITEMS_PER_PAGE, total);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[480px] bg-white min-h-screen flex flex-col relative">
        {/* Header Section */}
        <div className="flex-none px-5 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBackClick}
              className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <svg
                className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <h1 className="text-base sm:text-sm font-bold text-gray-900">
              Point History
            </h1>

            <div className="w-8 h-8 sm:w-7 sm:h-7"></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-5 pb-4 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
            </div>
          ) : total === 0 ? (
            <div className="text-center py-16">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No point history yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <div
                  key={entry._id}
                  className="p-4 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            entry.points >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {entry.points >= 0 ? "+" : ""}
                          {entry.points} pts
                        </span>
                        {entry.billID && (
                          <span className="text-xs text-gray-400">
                            #{entry.billID}
                          </span>
                        )}
                      </div>

                      {entry.remarks && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {entry.remarks}
                        </p>
                      )}

                      {entry.outlet && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {entry.outlet}
                        </p>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-xs text-gray-500">
                        {new Date(entry.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(entry.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex-none px-5 py-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {startEntry}-{endEntry} of {total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={16} className="text-gray-600" />
                </button>
                <span className="text-xs font-medium text-gray-700 min-w-[60px] text-center">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        )}

        {showPoweredBy && <PoweredBySamparkaFooter />}
      </div>
    </div>
  );
};

export default PointHistory;
