import StoreSelector from "../common/StoreSelector";

export default function AnalyticsHeader({ isDarkMode, selected, setSelected, stores }) {
  return (
    <header className={`p-4 lg:p-6 border-b transition-colors ${
      isDarkMode ? "bg-gray-900 border-gray-700" : "bg-[#f2f5f9] border-gray-200"
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h1 className={`text-2xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Visit Analytics
        </h1>
        <div className="w-full sm:w-64">
          <StoreSelector
            selectedStoreId={selected}
            onStoreIdChange={setSelected}
            variant="default"
            customStores={stores}
            fetchOnMount={false}
          />
        </div>
      </div>
    </header>
  );
}
