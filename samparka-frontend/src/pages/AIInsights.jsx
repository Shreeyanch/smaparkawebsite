import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import StoreSelector from "../components/common/StoreSelector";
import useAIChat from "../hooks/useAIChat";
import ChatMessage from "../components/aiChat/ChatMessage";
import ChatInput from "../components/aiChat/ChatInput";
import SuggestionChips from "../components/aiChat/SuggestionChips";
import ConversationSidebar from "../components/aiChat/ConversationSidebar";
import SiriOrb from "../components/aiChat/SiriOrb";

export default function AIInsights() {
  const { authState } = useAuth();
  const { isDarkMode } = useTheme();
  const { token } = authState;
  const {
    messages,
    isLoading,
    conversations,
    currentConversationId,
    dailyLimit,
    sendMessage,
    createNewConversation,
    selectConversation,
    deleteConversation,
    fetchDailyLimitStatus,
  } = useAIChat();
  const messagesEndRef = useRef(null);

  const [storeId, setStoreId] = useState(localStorage.getItem("selectedValue") || "");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Clear current conversation when store changes to ensure store isolation
  useEffect(() => {
    if (currentConversationId && storeId) {
      const currentConv = conversations.find((c) => c.id === currentConversationId);
      // If current conversation belongs to different store, clear it
      if (currentConv && currentConv.storeId !== storeId) {
        selectConversation(null);
      }
    }
  }, [storeId, currentConversationId, conversations, selectConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetchDailyLimitStatus(storeId, token);
  }, [storeId, token, fetchDailyLimitStatus]);

  const handleSend = (text) => sendMessage(text, storeId, token);

  const handleStoreChange = (id) => {
    setStoreId(id);
    localStorage.setItem("selectedValue", id);
  };

  const handleNewConversation = () => {
    if (storeId) {
      createNewConversation(storeId);
    }
    setIsSidebarOpen(false);
  };

  const handleSelectConversation = (convId) => {
    selectConversation(convId);
    setIsSidebarOpen(false);
  };

  const handleDeleteConversation = (convId) => {
    deleteConversation(convId);
  };

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const showChips = messages.length === 0 || userMessageCount < 3;
  const limitLabel = dailyLimit.isAdmin
    ? "Unlimited today"
    : `${dailyLimit.remaining}/${dailyLimit.dailyLimit || 5} questions left today`;

  return (
    <div
      className={`ml-0 lg:ml-64 min-h-screen flex ${
        isDarkMode ? "bg-[#343541]" : "bg-white"
      }`}
    >
      {/* Conversation Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        currentStoreId={storeId}
        onNewConversation={handleNewConversation}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isDarkMode={isDarkMode}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <div
          className={`flex items-center justify-between gap-4 px-4 lg:px-6 py-3 border-b ${
            isDarkMode ? "border-gray-700 bg-[#343541]" : "border-gray-200 bg-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1
              className={`text-base font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
          
              {messages.length > 0
                ? conversations.find((c) => c.id === currentConversationId)?.title ||
                  "Spark AI"
                :  "Spark AI"}
            </h1>
            {storeId && (
              <span
                className={`text-xs px-2.5 py-1 rounded-full border ${
                  dailyLimit.allowed
                    ? isDarkMode
                      ? "text-gray-300 border-gray-600 bg-[#40414f]"
                      : "text-gray-600 border-gray-300 bg-gray-50"
                    : isDarkMode
                    ? "text-orange-300 border-orange-700 bg-orange-900/20"
                    : "text-orange-700 border-orange-300 bg-orange-50"
                }`}
              >
                {limitLabel}
              </span>
            )}
          </div>
          <div className="min-w-[200px]">
            <StoreSelector
              selectedStoreId={storeId}
              onStoreIdChange={handleStoreChange}
              persistToLocalStorage={false}
              variant="styled"
            />
          </div>
        </div>

        {!storeId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <SiriOrb size="large" isAnimating={true} />
              <p
                className={`text-sm mt-6 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Select a store to start chatting with AI
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Daily limit warning banner */}
            {!dailyLimit.allowed && (
              <div
                className={`px-4 py-3 mx-4 mt-4 rounded-lg border ${
                  isDarkMode
                    ? "bg-orange-900/20 border-orange-700 text-orange-300"
                    : "bg-orange-50 border-orange-200 text-orange-800"
                }`}
              >
                <p className="text-sm font-medium">⚠️ Daily question limit reached (5 questions per day)</p>
                <p className="text-xs mt-1">
                  Resets at{" "}
                  {dailyLimit.resetTime
                    ? new Date(dailyLimit.resetTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "midnight"}
                </p>
              </div>
            )}

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-8 px-4 pb-32">
                  <SiriOrb size="large" isAnimating={true} />
                  <div className="text-center max-w-2xl">
                    <h2
                      className={`text-2xl font-semibold mb-2 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      How can I help you today?
                    </h2>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      I can analyze your customer data and suggest strategies to boost loyalty and
                      upsells.
                    </p>
                  </div>
                  {showChips && (
                    <div className="w-full max-w-3xl">
                      <SuggestionChips onSelect={handleSend} isDarkMode={isDarkMode} />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {messages.map((m, index) => (
                    <ChatMessage
                      key={m.id}
                      message={m}
                      isDarkMode={isDarkMode}
                      index={index}
                    />
                  ))}
                  {isLoading && (
                    <div
                      className={`w-full py-6 px-4 ${
                        isDarkMode
                          ? messages.length % 2 === 0
                            ? "bg-[#343541]"
                            : "bg-[#444654]"
                          : messages.length % 2 === 0
                          ? "bg-white"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="max-w-3xl mx-auto flex gap-4 items-start">
                        <div className="flex-shrink-0 mt-1">
                          <SiriOrb size="small" isAnimating={true} />
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-xs font-medium mb-2 ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Spark AI
                          </p>
                          <div
                            className={`text-sm ${
                              isDarkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            <span className="animate-pulse">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Suggestion chips for ongoing conversation */}
            {messages.length > 0 && showChips && (
              <div
                className={`px-4 py-3 border-t ${
                  isDarkMode ? "border-gray-700 bg-[#343541]" : "border-gray-100 bg-white"
                }`}
              >
                <div className="max-w-3xl mx-auto">
                  <SuggestionChips onSelect={handleSend} isDarkMode={isDarkMode} />
                </div>
              </div>
            )}

            {/* Chat input */}
            <ChatInput
              onSend={handleSend}
              isLoading={isLoading}
              isDarkMode={isDarkMode}
              disabled={!dailyLimit.allowed}
            />
          </>
        )}
      </div>
    </div>
  );
}
