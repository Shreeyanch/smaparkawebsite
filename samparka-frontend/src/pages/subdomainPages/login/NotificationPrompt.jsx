/* eslint-disable react/prop-types */
const NotificationPrompt = ({ onAllow, onSkip, isLoading }) => {
  return (
    <div className="fixed inset-0 z-[90] bg-black/60 flex items-end justify-center font-poppins">
      <div className="bg-white w-full max-w-sm rounded-t-3xl px-6 pt-8 pb-12">
        <div className="text-5xl mb-4 text-center">🔔</div>
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
          Stay in the loop
        </h2>
        <p className="text-sm text-gray-400 text-center mb-8">
          Get notified about your points, rewards, and exclusive offers from this store.
        </p>
        <button
          onClick={onAllow}
          disabled={isLoading}
          className="w-full bg-seagreen-100 text-white font-semibold py-4 rounded-2xl text-base transition-opacity disabled:opacity-40 mb-3"
        >
          {isLoading ? "Setting up…" : "Allow notifications"}
        </button>
        <button
          onClick={onSkip}
          disabled={isLoading}
          className="w-full text-gray-400 font-medium py-2 text-sm"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
};

export default NotificationPrompt;
