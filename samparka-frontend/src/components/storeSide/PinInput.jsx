export default function PinInput({
  pin,
  handleChange,
  handleKeyDown,
  handleSubmit,
  inputRefs,
  disabled = false,
}) {
  return (
    <div className="text-center flex flex-col items-center">
      <div className="flex gap-3 mb-6">
        {pin.map((digit, index) => (
          <input
            key={index}
            type="password"
            value={digit}
            maxLength="1"
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onKeyUp={(e) => e.key === "Enter" && !disabled && handleSubmit()}
            ref={(el) => (inputRefs.current[index] = el)}
            disabled={disabled}
            className={`w-12 h-12 text-center text-xl font-bold rounded-xl border transition-all duration-200
              ${disabled 
                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-1 focus:ring-green-600 focus:border-green-600'
              }`}
            style={{ fontFamily: 'monospace' }}
          />
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={disabled}
        className={`w-full px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-200
          ${disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white shadow-sm hover:bg-green-700'
          }`}
      >
        Submit
      </button>
    </div>
  );
}
