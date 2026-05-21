import { useState, useEffect } from "react";
import { Search, User, ChevronRight, Loader2 } from "lucide-react";
import api from "../../api/config.js";
import { cn } from "../../lib/utils.js";
import { useTheme } from "../../context/ThemeContext";

const StaffCustomerSearch = ({ storeId, onSelect }) => {
  const { isDarkMode } = useTheme();
  const token = localStorage.getItem("storeToken");
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/store/getCustomersS/${storeId}`, {
          headers: { token },
          params: { lite: true },
        });
        if (res.data.success) setCustomers(res.data.customers);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [storeId]);

  const filtered = query.trim()
    ? customers.filter((c) =>
        [c.name, c.phone, c.email].some((f) =>
          String(f || "").toLowerCase().includes(query.toLowerCase())
        )
      )
    : [];

  const base = isDarkMode
    ? "bg-gray-800 border-gray-700 text-white"
    : "bg-white border-gray-200 text-gray-900";

  return (
    <div className="space-y-3">
      <p className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
        Search customer by name or phone
      </p>
      <div className="relative">
        <Search
          size={15}
          className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-gray-400" : "text-gray-400"}`}
        />
        <input
          type="text"
          autoFocus
          placeholder="Name or phone..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={cn(
            "w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500",
            base
          )}
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={20} className="animate-spin text-green-500" />
        </div>
      )}

      {!loading && query.trim() && filtered.length === 0 && (
        <p className={`text-sm text-center py-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
          No customer found
        </p>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1" style={{ scrollbarWidth: "none" }}>
          {filtered.slice(0, 8).map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => onSelect(c)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors text-left",
                isDarkMode
                  ? "border-gray-700 hover:border-green-600 hover:bg-green-900/20"
                  : "border-gray-100 hover:border-green-400 hover:bg-green-50"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                isDarkMode ? "bg-gray-700" : "bg-gray-100"
              )}>
                <User size={14} className={isDarkMode ? "text-gray-300" : "text-gray-500"} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {c.name}
                </p>
                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {c.phone} · {c.points ?? 0} pts
                </p>
              </div>
              <ChevronRight size={14} className={isDarkMode ? "text-gray-500" : "text-gray-400"} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffCustomerSearch;
