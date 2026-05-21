import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import api from "../api/config";

const STORAGE_KEY = "samparka_ai_conversations";
const STORAGE_VERSION_KEY = "samparka_ai_conversations_version";
const CURRENT_VERSION = "2.0"; // Increment to force clear old data
const MAX_CONVERSATIONS = 50;

let msgCounter = 0;
const uid = () => `msg_${++msgCounter}_${Date.now()}`;
const convId = () => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const generateTitle = (firstUserMessage) => {
  const text = firstUserMessage.trim();
  if (text.length <= 50) return text;
  return text.substring(0, 47) + "...";
};

export default function useAIChat() {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dailyLimit, setDailyLimit] = useState({
    allowed: true,
    remaining: 5,
    used: 0,
    dailyLimit: 5,
    isAdmin: false,
    resetTime: null,
  });

  // Load conversations from localStorage on mount
  useEffect(() => {
    try {
      const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
      
      // Clear old data if version mismatch
      if (storedVersion !== CURRENT_VERSION) {
        console.log("Clearing old AI conversation data due to version change");
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
        return;
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setConversations(data.conversations || []);
        setCurrentConversationId(data.currentConversationId || null);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0 || currentConversationId) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            conversations,
            currentConversationId,
          })
        );
      } catch (err) {
        console.error("Failed to save conversations:", err);
      }
    }
  }, [conversations, currentConversationId]);

  const getCurrentConversation = useCallback(() => {
    return conversations.find((c) => c.id === currentConversationId);
  }, [conversations, currentConversationId]);

  const getConversationsByStore = useCallback((storeId) => {
    if (!storeId) return [];
    return conversations.filter((c) => c.storeId === storeId);
  }, [conversations]);

  const createNewConversation = useCallback((storeId) => {
    const newConv = {
      id: convId(),
      title: "New conversation",
      storeId,
      messages: [],
      timestamp: Date.now(),
    };

    setConversations((prev) => {
      const updated = [newConv, ...prev];
      // Limit to MAX_CONVERSATIONS
      if (updated.length > MAX_CONVERSATIONS) {
        return updated.slice(0, MAX_CONVERSATIONS);
      }
      return updated;
    });
    setCurrentConversationId(newConv.id);
    return newConv.id;
  }, []);

  const selectConversation = useCallback((conversationId) => {
    setCurrentConversationId(conversationId);
  }, []);

  const deleteConversation = useCallback((conversationId) => {
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
    }
  }, [currentConversationId]);

  const fetchDailyLimitStatus = useCallback(async (storeId, token) => {
    if (!storeId || !token) {
      setDailyLimit({
        allowed: true,
        remaining: 5,
        used: 0,
        dailyLimit: 5,
        isAdmin: false,
        resetTime: null,
      });
      return;
    }

    try {
      const res = await api.get(`/api/aiChat/${storeId}/limit`, { headers: { token } });
      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        setDailyLimit({
          allowed: data.allowed,
          remaining: data.remaining,
          used: data.used,
          dailyLimit: data.dailyLimit,
          isAdmin: !!data.isAdmin,
          resetTime: data.resetTime,
        });
      }
    } catch (err) {
      console.error("Failed to fetch AI daily limit status:", err);
    }
  }, []);

  const sendMessage = async (text, storeId, token) => {
    if (!storeId) {
      toast.error("Please select a store first");
      return;
    }
    if (!text.trim()) return;

    // Check if limit already hit (client-side check)
    if (!dailyLimit.allowed) {
      const resetTime = dailyLimit.resetTime 
        ? new Date(dailyLimit.resetTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : 'midnight';
      toast.error(`Daily limit reached. Resets at ${resetTime}`);
      return;
    }

    // Create new conversation if none exists or if current conversation is for different store
    let convId = currentConversationId;
    const currentConv = getCurrentConversation();
    
    if (!currentConv || currentConv.storeId !== storeId) {
      convId = createNewConversation(storeId);
    }

    const userMessage = { id: uid(), role: "user", text: text.trim() };

    // Update conversation with user message
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          const updatedMessages = [...c.messages, userMessage];
          const updatedTitle = c.messages.length === 0 ? generateTitle(text) : c.title;
          return {
            ...c,
            messages: updatedMessages,
            title: updatedTitle,
            timestamp: Date.now(),
          };
        }
        return c;
      })
    );

    setIsLoading(true);

    try {
      const conv = conversations.find((c) => c.id === convId) || getCurrentConversation();
      const messagesToSend = [...(conv?.messages || []), userMessage].map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await api.post(
        `/api/aiChat/${storeId}`,
        { messages: messagesToSend },
        { headers: { token } }
      );

      if (res.data.success) {
        const modelMessage = { id: uid(), role: "model", text: res.data.data.reply };
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === convId) {
              return {
                ...c,
                messages: [...c.messages, modelMessage],
                timestamp: Date.now(),
              };
            }
            return c;
          })
        );
        await fetchDailyLimitStatus(storeId, token);
      } else {
        // Check for rate limit error in response
        if (res.status === 429) {
          const errorMsg = res.data.message || "Daily question limit reached (5/day). Try again tomorrow.";
          toast.error(errorMsg);
          await fetchDailyLimitStatus(storeId, token);
        } else {
          toast.error("AI failed to respond. Please try again.");
        }
        // Remove user message on error
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === convId) {
              return {
                ...c,
                messages: c.messages.filter((m) => m.id !== userMessage.id),
              };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.error("AI chat error:", err);
      
      // Handle rate limit (429) specifically
      if (err.response?.status === 429) {
        const errorMsg = err.response?.data?.message || "Daily question limit reached (5/day). Try again tomorrow.";
        toast.error(errorMsg);
        await fetchDailyLimitStatus(storeId, token);
      } else {
        toast.error("Could not reach AI. Please try again.");
      }
      
      // Remove user message on error
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === convId) {
            return {
              ...c,
              messages: c.messages.filter((m) => m.id !== userMessage.id),
            };
          }
          return c;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearCurrentConversation = useCallback(() => {
    if (!currentConversationId) return;
    
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === currentConversationId) {
          return {
            ...c,
            messages: [],
            title: "New conversation",
            timestamp: Date.now(),
          };
        }
        return c;
      })
    );
  }, [currentConversationId]);

  const messages = getCurrentConversation()?.messages || [];

  return {
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
    clearCurrentConversation,
    getConversationsByStore,
  };
}
