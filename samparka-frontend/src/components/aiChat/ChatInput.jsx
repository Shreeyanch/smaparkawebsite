import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

export default function ChatInput({ onSend, isLoading, isDarkMode, disabled = false }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (!text.trim() || isLoading || disabled) return;
    onSend(text.trim());
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`w-full border-t ${
        isDarkMode ? "border-gray-700 bg-[#343541]" : "border-gray-200 bg-white"
      }`}
    >
      <div className="max-w-3xl mx-auto p-4">
        <div
          className={`relative flex items-end gap-3 rounded-2xl shadow-lg border transition-colors ${
            isDarkMode
              ? "bg-[#40414f] border-gray-600 focus-within:border-green-500"
              : "bg-white border-gray-300 focus-within:border-green-400"
          }`}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Daily limit reached. Resets at midnight." : "Message Spark AI..."}
            rows={1}
            disabled={isLoading || disabled}
            className={`flex-1 resize-none bg-transparent px-4 py-3 pr-12 text-sm outline-none leading-relaxed max-h-[200px] overflow-y-auto ${
              isDarkMode
                ? "text-gray-100 placeholder-gray-500"
                : "text-gray-800 placeholder-gray-400"
            }`}
            style={{ minHeight: "52px" }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || isLoading || disabled}
            className={`absolute bottom-3 right-3 flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              !text.trim() || isLoading || disabled
                ? isDarkMode
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transform hover:scale-105"
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p
          className={`text-xs text-center mt-2 ${
            isDarkMode ? "text-gray-500" : "text-gray-400"
          }`}
        >
          AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
