import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

import ConversationList from "../components/auth/chat/ConversationList";
import ChatHeader from "../components/auth/chat/ChatHeader";
import ChatWindow from "../components/auth/chat/ChatWindow";
import MessageInput from "../components/auth/chat/MessageInput";

import AIAssistant from "../components/auth/ai/AIAssistant";
import PollModal from "../components/auth/features/PollModal";
import ToolsPanel from "../components/auth/features/ToolsPanel";

import {
  getConversations,
  getMessages,
  markMessagesRead,
} from "../services/chatService";

const SOCKET_URL = "http://localhost:3000";

function Chat() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);

  const [loadingConversations, setLoadingConversations] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [aiOpen, setAiOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [pollOpen, setPollOpen] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState({});
  const [typing, setTyping] = useState(false);

  const currentUserId = useMemo(
    getCurrentUserId,
    []
  );

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Socket.IO
  useEffect(() => {
    if (!currentUserId) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);

      socket.emit("join", currentUserId);
    });

    // New message
    socket.on("newMessage", (message) => {
      if (
        selected &&
        String(message.conversation) ===
          String(selected._id)
      ) {
        setMessages((prev) => {
          if (
            prev.some(
              (item) => item._id === message._id
            )
          ) {
            return prev;
          }

          return [...prev, message];
        });
      }

      loadConversations();
    });

    // Delivered
    socket.on(
      "deliveryReceipt",
      ({ messageId }) => {
        setMessages((prev) =>
          prev.map((message) =>
            String(message._id) ===
            String(messageId)
              ? {
                  ...message,
                  isDelivered: true,
                }
              : message
          )
        );
      }
    );

    // Read
    socket.on(
      "readReceipt",
      ({ messageId }) => {
        setMessages((prev) =>
          prev.map((message) =>
            String(message._id) ===
            String(messageId)
              ? {
                  ...message,
                  isRead: true,
                }
              : message
          )
        );
      }
    );

    // Self destruct
    socket.on(
      "messageExpired",
      ({ messageId }) => {
        setMessages((prev) =>
          prev.filter(
            (message) =>
              String(message._id) !==
              String(messageId)
          )
        );
      }
    );

    // Online
    socket.on(
      "userOnline",
      ({ userId }) => {
        setOnlineUsers((prev) => ({
          ...prev,
          [String(userId)]: true,
        }));
      }
    );

    // Offline
    socket.on(
      "userOffline",
      ({ userId }) => {
        setOnlineUsers((prev) => ({
          ...prev,
          [String(userId)]: false,
        }));
      }
    );

    // Typing
    socket.on(
      "typing",
      ({ senderId }) => {
        if (
          selected?.participants?.some(
            (participant) =>
              String(participant._id) ===
              String(senderId)
          )
        ) {
          setTyping(true);
        }
      }
    );

    socket.on("stopTyping", () => {
      setTyping(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUserId, selected]);

  // Load conversations
  const loadConversations = async () => {
    try {
      const data = await getConversations();

      setConversations(data);

      if (!selected && data.length > 0) {
        await selectConversation(data[0]);
      }
    } catch (error) {
      console.error(
        "Conversation loading error:",
        error
      );
    } finally {
      setLoadingConversations(false);
    }
  };

  // Select conversation
  const selectConversation = async (
    conversation
  ) => {
    setSelected(conversation);
    setAiOpen(false);
    setToolsOpen(false);

    setLoadingMessages(true);

    try {
      const data = await getMessages(
        conversation._id
      );

      setMessages(data);

      await markMessagesRead(
        conversation._id
      ).catch(() => {});
    } catch (error) {
      console.error(
        "Message loading error:",
        error
      );

      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Message sent
  const addSentMessage = (message) => {
    setMessages((prev) => {
      if (
        prev.some(
          (item) => item._id === message._id
        )
      ) {
        return prev;
      }

      return [...prev, message];
    });

    loadConversations();
  };

  // Online status
  const online = selected
    ? selected.participants?.some(
        (participant) =>
          String(participant._id) !==
            String(currentUserId) &&
          onlineUsers[
            String(participant._id)
          ]
      )
    : false;

  return (
    <div className="h-full w-full flex bg-gray-100 overflow-hidden">

      {/* Conversations */}
      <ConversationList
        conversations={conversations}
        selectedId={selected?._id}
        onSelect={selectConversation}
        loading={loadingConversations}
      />

      {/* Main chat */}
      <main className="flex-1 min-w-0 flex flex-col">

        {/* Header */}
        <ChatHeader
          conversation={selected}
          online={online}
        />

        {/* Messages */}
        {loadingMessages ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Loading messages...
          </div>
        ) : (
          <ChatWindow
            messages={messages}
            currentUserId={currentUserId}
          />
        )}

        {/* Typing */}
        {typing && (
          <div className="px-5 py-1 bg-white text-xs text-gray-500">
            Someone is typing...
          </div>
        )}

        {/* Feature buttons */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white border-t">

          {/* Poll */}
          <button
            onClick={() => setPollOpen(true)}
            disabled={!selected}
            className="px-3 py-2 rounded-lg hover:bg-gray-100 disabled:opacity-40"
            title="Create Poll"
          >
            📊 Poll
          </button>

          {/* More */}
          <button
            onClick={() =>
              setToolsOpen(!toolsOpen)
            }
            className={`px-3 py-2 rounded-lg ${
              toolsOpen
                ? "bg-indigo-100 text-indigo-600"
                : "hover:bg-gray-100"
            }`}
            title="Bookmarks and scheduled messages"
          >
            ⭐ More
          </button>

        </div>

        {/* Message input */}
        <MessageInput
          conversation={selected}
          onMessageSent={addSentMessage}
          onOpenAI={() => setAiOpen(true)}
        />
      </main>

      {/* AI */}
      {aiOpen && (
        <AIAssistant
          messages={messages}
          onUseReply={(reply) => {
            window.dispatchEvent(
              new CustomEvent(
                "chatsphere-use-reply",
                {
                  detail: reply,
                }
              )
            );
          }}
          onClose={() =>
            setAiOpen(false)
          }
        />
      )}

      {/* Bookmarks / Scheduled */}
      {toolsOpen && (
        <ToolsPanel
          onClose={() =>
            setToolsOpen(false)
          }
        />
      )}

      {/* Poll */}
      {pollOpen && selected && (
        <PollModal
          conversationId={selected._id}
          onClose={() =>
            setPollOpen(false)
          }
          onCreated={() => {
            setPollOpen(false);

            alert(
              "Poll created successfully!"
            );

            selectConversation(selected);
          }}
        />
      )}

    </div>
  );
}

function getCurrentUserId() {
  try {
    const token =
      localStorage.getItem("token");

    if (!token) return null;

    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    return (
      payload.id ||
      payload._id ||
      payload.userId
    );
  } catch {
    return null;
  }
}

export default Chat;