const shimmerStyles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  @keyframes pulse-soft {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  @keyframes float-0 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(5px, -5px); } }
  @keyframes float-1 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-5px, 5px); } }
  @keyframes float-2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(5px, 5px); } }
  @keyframes float-3 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-5px, -5px); } }
`;

export default function OutletCardSkeleton({ isDarkMode }) {
  const bg = isDarkMode ? "bg-gray-700/50" : "bg-gray-200/70";
  const line = isDarkMode ? "bg-gray-700/60" : "bg-gray-300/70";
  const lineFaint = isDarkMode ? "bg-gray-700/40" : "bg-gray-300/50";
  const dot = isDarkMode ? "bg-gray-700/70" : "bg-gray-300/80";
  const rowBg = isDarkMode ? "bg-gray-900/40" : "bg-white/50";
  const sectionBg = isDarkMode ? "bg-gray-900/30" : "bg-gray-50";
  const borderColor = isDarkMode ? "border-gray-700" : "border-gray-200";
  const cardBg = isDarkMode
    ? "bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700"
    : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200";
  const shimmerGrad = isDarkMode
    ? "linear-gradient(90deg, transparent 0%, rgba(74, 222, 128, 0.08) 50%, transparent 100%)"
    : "linear-gradient(90deg, transparent 0%, rgba(34, 197, 94, 0.12) 50%, transparent 100%)";

  return (
    <>
      <style>{shimmerStyles}</style>
      <div
        className={`rounded-lg p-5 border-2 overflow-hidden relative ${cardBg}`}
        style={{ animation: "pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
      >
        <div className="absolute inset-0 -translate-x-full" style={{ background: shimmerGrad, animation: "shimmer 2.5s ease-in-out infinite" }} />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-1">
            <div className={`p-2 rounded-lg animate-pulse ${bg}`} style={{ animationDelay: "0.1s", animationDuration: "1.8s" }}>
              <div className={`w-5 h-5 rounded ${isDarkMode ? "bg-gray-600" : "bg-gray-300"}`} />
            </div>
            <div className="flex-1 space-y-2">
              <div className={`h-4 rounded-md animate-pulse ${line}`} style={{ width: "60%", animationDelay: "0.15s", animationDuration: "1.8s" }} />
              <div className={`h-3 rounded-md animate-pulse ${lineFaint}`} style={{ width: "40%", animationDelay: "0.2s", animationDuration: "1.8s" }} />
            </div>
          </div>
          <div className={`w-5 h-5 rounded animate-pulse ${isDarkMode ? "bg-gray-700/50" : "bg-gray-300/60"}`} style={{ animationDelay: "0.25s", animationDuration: "1.8s" }} />
        </div>

        {/* Metrics rows */}
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-3 rounded-lg relative overflow-hidden ${rowBg}`}
              style={{ animation: "pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite", animationDelay: `${0.1 * i}s` }}
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: isDarkMode
                    ? `radial-gradient(circle at ${20 + i * 10}% 50%, rgba(74, 222, 128, 0.1), transparent 70%)`
                    : `radial-gradient(circle at ${20 + i * 10}% 50%, rgba(34, 197, 94, 0.15), transparent 70%)`,
                  animation: `float-${i} 3s ease-in-out infinite`,
                  animationDelay: `${0.5 * i}s`,
                }}
              />
              <div className="flex items-center gap-2 z-10">
                <div className={`w-4 h-4 rounded-full animate-pulse ${dot}`} style={{ animationDelay: `${0.1 * i}s`, animationDuration: "1.8s" }} />
                <div className={`h-3 rounded-md animate-pulse ${line}`} style={{ width: `${80 + i * 10}px`, animationDelay: `${0.15 + 0.1 * i}s`, animationDuration: "1.8s" }} />
              </div>
              <div className={`h-6 rounded-lg animate-pulse ${dot}`} style={{ width: `${50 + i * 5}px`, animationDelay: `${0.2 + 0.1 * i}s`, animationDuration: "1.8s" }} />
            </div>
          ))}
        </div>

        {/* Points section */}
        <div className={`mt-4 pt-4 border-t ${borderColor}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-4 h-4 rounded-full animate-pulse ${dot}`} style={{ animationDelay: "0.3s", animationDuration: "1.8s" }} />
            <div className={`h-3 w-24 rounded-md animate-pulse ${line}`} style={{ animationDelay: "0.35s", animationDuration: "1.8s" }} />
          </div>
          <div className={`p-4 rounded-lg text-center mb-3 ${sectionBg} border ${borderColor}`}>
            <div className={`h-3 w-20 mx-auto mb-2 rounded animate-pulse ${line}`} style={{ animationDelay: "0.4s", animationDuration: "1.8s" }} />
            <div className={`h-7 w-24 mx-auto rounded animate-pulse ${dot}`} style={{ animationDelay: "0.45s", animationDuration: "1.8s" }} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`p-2 rounded-lg ${sectionBg}`}>
                <div className={`h-2.5 w-12 mx-auto mb-1 rounded animate-pulse ${line}`} style={{ animationDelay: `${0.5 + i * 0.05}s`, animationDuration: "1.8s" }} />
                <div className={`h-4 w-14 mx-auto rounded animate-pulse ${dot}`} style={{ animationDelay: `${0.55 + i * 0.05}s`, animationDuration: "1.8s" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
