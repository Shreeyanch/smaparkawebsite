import { useState } from "react";
import { MessageSquarePlus, Trash2, MoreVertical, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";

export default function ConversationSidebar({
  conversations,
  currentConversationId,
  currentStoreId,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  isOpen,
  onClose,
  isDarkMode,
}) {
  const [activeMenu, setActiveMenu] = useState(null);

  // Filter conversations to only show those for the current store
  const storeConversations = currentStoreId 
    ? conversations.filter(c => c.storeId === currentStoreId)
    : [];

  const groupByDate = (convos) => {
    const today = dayjs();
    const groups = {
      Today: [],
      Yesterday: [],
      "Last 7 days": [],
      "Last 30 days": [],
      Older: [],
    };

    convos.forEach((convo) => {
      const convoDate = dayjs(convo.timestamp);
      const diff = today.diff(convoDate, "day");

      if (diff === 0) groups.Today.push(convo);
      else if (diff === 1) groups.Yesterday.push(convo);
      else if (diff <= 7) groups["Last 7 days"].push(convo);
      else if (diff <= 30) groups["Last 30 days"].push(convo);
      else groups.Older.push(convo);
    });

    return groups;
  };

  const grouped = groupByDate(storeConversations);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            className={`fixed lg:relative top-0 left-0 h-screen lg:h-screen z-50 flex flex-col ${
              isDarkMode ? "bg-[#202123]" : "bg-gray-50"
            }`}
            initial={{ x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -260, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={{ width: "260px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-700">
              <button
                onClick={onNewConversation}
                className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm transition-colors"
              >
                <MessageSquarePlus className="w-4 h-4" />
                New chat
              </button>
              <button
                onClick={onClose}
                className="lg:hidden ml-2 p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conversations list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-4">
              {Object.entries(grouped).map(([groupName, groupConvos]) => {
                if (groupConvos.length === 0) return null;

                return (
                  <div key={groupName}>
                    <h3 className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {groupName}
                    </h3>
                    <div className="space-y-1">
                      {groupConvos.map((convo) => (
                        <div
                          key={convo.id}
                          className={`group relative rounded-lg transition-colors ${
                            currentConversationId === convo.id
                              ? "bg-gray-800"
                              : "hover:bg-gray-800/50"
                          }`}
                        >
                          <button
                            onClick={() => onSelectConversation(convo.id)}
                            className="w-full text-left px-3 py-2.5 pr-10"
                          >
                            <p
                              className={`text-sm truncate ${
                                currentConversationId === convo.id
                                  ? "text-white font-medium"
                                  : "text-gray-300"
                              }`}
                            >
                              {convo.title || "New conversation"}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {convo.messages.length} messages
                            </p>
                          </button>

                          {/* Actions menu */}
                          <div className="absolute right-2 top-2.5">
                            <button
                              onClick={() => setActiveMenu(activeMenu === convo.id ? null : convo.id)}
                              className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            <AnimatePresence>
                              {activeMenu === convo.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className={`absolute right-0 top-full mt-1 w-40 rounded-lg shadow-lg border z-10 ${
                                    isDarkMode
                                      ? "bg-gray-800 border-gray-700"
                                      : "bg-white border-gray-200"
                                  }`}
                                >
                                  <button
                                    onClick={() => {
                                      onDeleteConversation(convo.id);
                                      setActiveMenu(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {storeConversations.length === 0 && (
                <div className="px-3 py-8 text-center">
                  <p className="text-sm text-gray-500">No conversations yet</p>
                  <p className="text-xs text-gray-600 mt-1">Start a new chat to begin</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
