import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import PropTypes from "prop-types";

const truncateName = (name, max = 20) =>
  name.length > max ? name.slice(0, max) + "…" : name;

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <p className="font-semibold capitalize text-gray-900 dark:text-gray-100">{d?.name}</p>
      <p className="mt-1 font-rubik text-[11px] text-gray-600 dark:text-gray-300">{payload[0]?.value} units</p>
      {d?.revenue != null && (
        <p className="font-rubik text-[11px] text-green-700 dark:text-green-300">Rs {d.revenue.toLocaleString()}</p>
      )}
    </div>
  );
};

const ChartCard = ({ title, subtitle, children }) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:p-5">
    <div className="mb-4">
      <p className="font-montserrat text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
    </div>
    {children}
  </section>
);

const DistributionRow = ({ item }) => (
  <div className="group rounded-lg px-2 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/70">
    <div className="mb-1.5 flex items-center justify-between gap-3">
      <p className="truncate text-sm capitalize text-gray-800 dark:text-gray-100">{truncateName(item.name, 28)}</p>
      <div className="flex items-center gap-3 text-xs font-rubik">
        <span className="text-gray-500 dark:text-gray-400">{item.qty}</span>
        <span className="w-11 text-right font-semibold text-gray-800 dark:text-gray-100">{item.percentage}%</span>
      </div>
    </div>
    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
      <div
        className="h-full rounded-full bg-gray-900 transition-all duration-500 group-hover:bg-green-600 dark:bg-gray-100 dark:group-hover:bg-green-400"
        style={{ width: `${item.percentage}%` }}
      />
    </div>
  </div>
);

const ItemAnalyticsCharts = ({ items }) => {
  const top10 = items.slice(0, 10);
  const top6  = items.slice(0, 6);

  const barData = top10.map((i) => ({
    name:    truncateName(i.name),
    qty:     i.totalQuantity,
    revenue: i.totalRevenue,
  }));

  // Calculate percentages for top 6
  const totalQty = items.reduce((sum, item) => sum + item.totalQuantity, 0);
  const listData = top6.map((i) => ({
    name: i.name,
    qty: i.totalQuantity,
    percentage: ((i.totalQuantity / totalQty) * 100).toFixed(1),
  }));

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <ChartCard title="Top Items by Units" subtitle="Top 10 ranked by quantity sold in selected range">
        <div className="animate-[slide-in-bottom_450ms_ease-out]">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} layout="vertical" margin={{ left: 2, right: 8, top: 4, bottom: 4 }}>
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "Rubik, sans-serif" }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 11, fill: "#4b5563", fontFamily: "Montserrat, sans-serif" }}
                axisLine={false}
                tickLine={false}
                style={{ textTransform: "capitalize" }}
              />
              <Tooltip content={<ChartTooltip />} cursor={false} />
              <Bar dataKey="qty" radius={8} maxBarSize={16}>
                {barData.map((_, idx) => (
                  <Cell 
                    key={idx} 
                    fill={idx === 0 ? "#0f766e" : "#111827"}
                    className="dark:fill-gray-200 dark:[&:first-child]:fill-green-300"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Sales Distribution" subtitle="Share of top 6 items by quantity">
        <div className="space-y-1.5 animate-[slide-in-bottom_550ms_ease-out]">
          {listData.map((item, idx) => (
            <DistributionRow key={`${item.name}-${idx}`} item={item} />
          ))}
        </div>
        <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Total Units</p>
            <p className="font-rubik text-2xl font-semibold text-gray-900 dark:text-gray-100">{totalQty.toLocaleString()}</p>
          </div>
        </div>
      </ChartCard>
    </div>
  );
};

ChartTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number,
      payload: PropTypes.shape({
        name: PropTypes.string,
        revenue: PropTypes.number,
      }),
    })
  ),
};

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

DistributionRow.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    qty: PropTypes.number.isRequired,
    percentage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
};

ItemAnalyticsCharts.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      totalQuantity: PropTypes.number.isRequired,
      totalRevenue: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default ItemAnalyticsCharts;
