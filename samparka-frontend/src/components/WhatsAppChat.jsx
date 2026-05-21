import React, { useState, useEffect, useRef } from "react";
import { X, Search, MessageCircle, Send, ChevronLeft } from "lucide-react";
import api from "../api/config";

// Chat Drawer Component
export const ChatDrawer = ({ isOpen, onClose, onChatSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch chat list grouped by phone number
  useEffect(() => {
    if (isOpen) {
      fetchChatList();
    }
  }, [isOpen]);

  const fetchChatList = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      const response = await api.get("/api/whatsapp/chats/list");
      const data = await response.data;

      // Group messages by phone and get last message
      const groupedChats = data.reduce((acc, chat) => {
        if (!acc[chat.phone]) {
          acc[chat.phone] = {
            phone: chat.phone,
            lastMessage: chat.message,
            lastMessageTime: chat.timestamp,
            direction: chat.direction,
            unreadCount: chat.direction === "in" ? 1 : 0,
          };
        } else {
          // Update if this message is newer
          if (
            new Date(chat.timestamp) > new Date(acc[chat.phone].lastMessageTime)
          ) {
            acc[chat.phone].lastMessage = chat.message;
            acc[chat.phone].lastMessageTime = chat.timestamp;
            acc[chat.phone].direction = chat.direction;
          }
          if (chat.direction === "in") {
            acc[chat.phone].unreadCount += 1;
          }
        }
        return acc;
      }, {});

      const chatList = Object.values(groupedChats).sort(
        (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
      );

      setChats(chatList);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = chats.filter((chat) => chat.phone.includes(searchTerm));

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="bg-[#075e54] dark:bg-gray-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle size={24} />
            <h2 className="text-xl font-semibold">Chats</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="overflow-y-auto h-[calc(100vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
              <MessageCircle size={48} className="mb-2 opacity-50" />
              <p>No chats yet</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.phone}
                onClick={() => onChatSelect(chat.phone)}
                className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-700 transition-colors"
              >
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {chat.phone.slice(-4)}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      +{chat.phone}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {formatTime(chat.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {chat.direction === "out" && "You: "}
                      {console.log("Last Message:", chat)}
                      {chat.lastMessage}
                    </p>
                    {chat.unreadCount > 0 && chat.direction === "in" && (
                      <span className="bg-green-600 text-white text-xs rounded-full px-2 py-1 ml-2">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

// Chat Modal Component
export const ChatModal = ({ isOpen, onClose, phone }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && phone) {
      fetchMessages();
    }
  }, [isOpen, phone]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      const response = await api.get(`/api/whatsapp/chats/${phone}`);
      const data = await response.data;
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      // Add API call to send message
      const response = await api.post(
        "/api/whatsapp/send-quick-message",
        {
          phone,
          message: newMessage,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.ok) {
        setMessages([
          ...messages,
          {
            _id: Date.now().toString(),
            phone,
            direction: "out",
            message: newMessage,
            timestamp: new Date(),
          },
        ]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#075e54] dark:bg-gray-900 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="hover:bg-white/10 p-1 rounded-full transition-colors lg:hidden"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center font-semibold">
              {phone?.slice(-4)}
            </div>
            <div>
              <h3 className="font-semibold">+{phone}</h3>
              <p className="text-xs text-gray-200">WhatsApp Chat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/10 p-2 rounded-full transition-colors hidden lg:block"
          >
            <X size={24} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#e5ddd5] dark:bg-gray-900 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <p>No messages yet</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${
                  msg.direction === "out" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
                    msg.direction === "out"
                      ? "bg-[#dcf8c6] dark:bg-green-900 text-gray-900 dark:text-white"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.message}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatMessageTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-100 dark:bg-gray-800 border-t dark:border-gray-700 rounded-b-xl">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-3 rounded-full transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
