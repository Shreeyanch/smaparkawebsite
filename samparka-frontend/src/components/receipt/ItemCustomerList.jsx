import PropTypes from "prop-types";

const CustomerRow = ({ c, isTop }) => {
  const initial = c.name?.[0]?.toUpperCase() || "?";

  return (
    <div className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-white/80 dark:hover:bg-gray-900/70 md:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white font-rubik text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
          {initial}
        </span>

        <div className="min-w-0 flex-1">
          {c.name ? (
            <p className="truncate text-sm text-gray-900 dark:text-gray-100">
              {isTop && "★ "}{c.name}
            </p>
          ) : (
            <p className="text-sm italic text-gray-400">Unknown</p>
          )}
          <p className="font-rubik text-xs text-gray-500 dark:text-gray-400">
            {c.phone || "—"}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-5">
        <span className="font-rubik text-xs text-gray-500 dark:text-gray-400">
          {c.orderCount} {c.orderCount === 1 ? "order" : "orders"}
        </span>
        <span className="w-16 text-right font-rubik text-xs text-gray-500 dark:text-gray-400">
          {c.totalQty} units
        </span>
      </div>
    </div>
  );
};

const ItemCustomerList = ({ customers }) => {
  if (!customers || customers.length === 0) {
    return (
      <div className="bg-gray-50 px-5 py-5 text-sm text-gray-500 dark:bg-gray-900/60 dark:text-gray-400">
        No customer data available.
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
      <div className="border-b border-gray-200 px-5 py-3 dark:border-gray-700">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
          Customers who ordered this item
        </span>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {customers.map((c, idx) => (
          <CustomerRow key={c.customerId?.toString() || idx} c={c} isTop={idx === 0} />
        ))}
      </div>
    </div>
  );
};

const customerShape = PropTypes.shape({
  customerId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  name: PropTypes.string,
  phone: PropTypes.string,
  orderCount: PropTypes.number,
  totalQty: PropTypes.number,
});

CustomerRow.propTypes = {
  c: customerShape.isRequired,
  isTop: PropTypes.bool.isRequired,
};

ItemCustomerList.propTypes = {
  customers: PropTypes.arrayOf(customerShape),
};

export default ItemCustomerList;
