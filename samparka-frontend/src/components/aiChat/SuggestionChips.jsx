const SUGGESTIONS = [
  "Summarize my store performance",
  "Who are my at-risk customers?",
  "How can I improve my retention rate?",
  "What promotions should I run?",
  "How do I convert first-time visitors?",
  "Which customer segment needs attention?",
];

export default function SuggestionChips({ onSelect, isDarkMode }) {
  return (
    <div className="flex flex-wrap gap-2.5 justify-center">
      {SUGGESTIONS.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className={`text-sm px-4 py-2.5 rounded-xl border-2 transition-all hover:scale-105 ${
            isDarkMode
              ? "border-gray-600 text-gray-300 hover:border-green-500 hover:bg-gray-700 bg-[#40414f]"
              : "border-gray-300 text-gray-700 hover:border-green-400 hover:bg-gray-50 bg-white shadow-sm"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
