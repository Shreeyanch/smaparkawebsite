import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart2, Inbox, RefreshCw } from "lucide-react";
import PropTypes from "prop-types";
import receiptApi from "../../api/receiptApi";
import ItemAnalyticsFilters from "./ItemAnalyticsFilters";
import ItemAnalyticsCharts from "./ItemAnalyticsCharts";
import ItemAnalyticsTable from "./ItemAnalyticsTable";

const LoadingSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-10 w-64 rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900" />
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-24 rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900"
        />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="h-80 rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900"
        />
      ))}
    </div>
    <div className="h-96 rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900" />
  </div>
);

const EmptyState = () => (
  <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900/50">
    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
      <Inbox size={20} className="text-gray-500 dark:text-gray-400" />
    </div>
    <p className="font-montserrat text-base font-semibold text-gray-900 dark:text-gray-100">
      No item data yet
    </p>
    <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
      Once approved receipts include extracted line items, this view will populate automatically.
    </p>
  </div>
);

const ErrorState = () => (
  <div className="rounded-2xl border border-red-200 bg-red-50/50 px-6 py-10 dark:border-red-900/60 dark:bg-red-950/20">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
          <BarChart2 size={18} />
        </div>
        <div>
          <p className="font-montserrat text-sm font-semibold text-red-800 dark:text-red-200">
            Could not load item analytics
          </p>
          <p className="text-xs text-red-600 dark:text-red-300">
            Please refresh and try again.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/40"
      >
        <RefreshCw size={14} /> Reload
      </button>
    </div>
  </div>
);

const ItemAnalyticsTab = ({ storeId, token }) => {
  const [dateRange, setDateRange] = useState("30d");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["itemAnalytics", storeId, dateRange],
    queryFn: () =>
      receiptApi.getItemAnalytics(token, storeId, dateRange).then((r) => r.data),
    enabled: !!storeId && !!token,
    staleTime: 60000,
  });

  const items = data?.data?.items || [];
  const totalQuantity = items.reduce((s, i) => s + i.totalQuantity, 0);
  const totalRevenue  = items.reduce((s, i) => s + i.totalRevenue, 0);

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorState />;

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-950/30 md:p-5">
      <ItemAnalyticsFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        totalItems={items.length}
        totalQuantity={totalQuantity}
        totalRevenue={totalRevenue}
      />
      {items.length === 0 ? <EmptyState /> : (
        <>
          <ItemAnalyticsCharts items={items} />
          <ItemAnalyticsTable items={items} />
        </>
      )}
    </div>
  );
};

ItemAnalyticsTab.propTypes = {
  storeId: PropTypes.string,
  token: PropTypes.string,
};

export default ItemAnalyticsTab;
