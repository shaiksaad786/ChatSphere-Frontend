import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { usePreferences } from "../context/AppPreferences";

import ConversationList from "../components/auth/chat/ConversationList";
import ChatHeader from "../components/auth/chat/ChatHeader";
import ChatWindow from "../components/auth/chat/ChatWindow";
import MessageInput from "../components/auth/chat/MessageInput";

import AIAssistant from "../components/auth/ai/AIAssistant";
import PollModal from "../components/auth/features/PollModal";
import ToolsPanel from "../components/auth/features/ToolsPanel";
import GroupManager from "../components/auth/chat/GroupManager";
import CallManager from "../components/auth/chat/callManager";
import {
  getConversations,
  getMessages,
  markMessagesRead,
} from "../services/chatService";

import {
  deleteMessage,
} from "../services/messageService";

import {
  connectSocket,
  disconnectSocket,
} from "../services/socket";

function Chat() {
  const { t } = usePreferences();

  const [conversations, setConversations] =
    useState([]);

  const [selected, setSelected] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [loadingConversations, setLoadingConversations] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [aiOpen, setAiOpen] =
    useState(false);

  const [toolsOpen, setToolsOpen] =
    useState(false);

  const [pollOpen, setPollOpen] =
    useState(false);

  const [groupManagerOpen, setGroupManagerOpen] =
    useState(false);
  const [callRequest, setCallRequest] =
  useState(null);

  const [userPresence, setUserPresence] =
    useState({});

  const [typing, setTyping] =
    useState(false);

  /* Message search */
  const [messageSearch, setMessageSearch] =
    useState("");

  /* Message selection */
  const [selectionMode, setSelectionMode] =
    useState(false);

  const [selectedMessageIds, setSelectedMessageIds] =
    useState([]);

  const currentUserId =
    getCurrentUserId();

  /*
   * Select conversation
   */
  const selectConversation = useCallback(
    async (conversation) => {
      setSelected(conversation);

      setAiOpen(false);
      setToolsOpen(false);

      setMessageSearch("");

      setSelectionMode(false);
      setSelectedMessageIds([]);

      setLoadingMessages(true);

      try {
        const data =
          await getMessages(
            conversation._id
          );

        setMessages(
          Array.isArray(data)
            ? data
            : []
        );

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
    },
    []
  );

  /*
   * Load conversations
   */
  const loadConversations =
    useCallback(async () => {
      try {
        const data =
          await getConversations();

        const list =
          Array.isArray(data)
            ? data
            : [];

        setConversations(list);

        if (!selected && list.length > 0) {
          await selectConversation(
            list[0]
          );
        }
      } catch (error) {
        console.error(
          "Conversation loading error:",
          error
        );
      } finally {
        setLoadingConversations(false);
      }
    }, [
      selected,
      selectConversation,
    ]);

  /*
   * Initial conversation load
   */
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  /*
   * Socket.IO
   */
  useEffect(() => {
    if (!currentUserId) return;

    const socket =
      connectSocket();

    if (!socket) return;

    const refreshConversations =
      async () => {
        try {
          const data =
            await getConversations();

          setConversations(
            Array.isArray(data)
              ? data
              : []
          );
        } catch (error) {
          console.error(
            "Conversation refresh failed:",
            error
          );
        }
      };

    /*
     * New message
     */
    const handleNewMessage =
      (message) => {
        const messageConversationId =
          message.conversation ||
          message.conversationId;

        if (
          selected &&
          String(
            messageConversationId
          ) ===
            String(selected._id)
        ) {
          setMessages((prev) => {
            if (
              prev.some(
                (item) =>
                  String(item._id) ===
                  String(message._id)
              )
            ) {
              return prev;
            }

            return [
              ...prev,
              message,
            ];
          });
        }

        refreshConversations();
      };

    /*
     * Delivery receipt
     */
    const handleDelivery =
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
      };

    /*
     * Read receipt
     */
    const handleRead =
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
      };

    /*
     * Message updated
     */
    const handleUpdated =
      (updated) => {
        const updatedConversationId =
          updated.conversation ||
          updated.conversationId;

        if (
          selected &&
          String(
            updatedConversationId
          ) ===
            String(selected._id)
        ) {
          setMessages((prev) =>
            prev.map((message) =>
              String(message._id) ===
              String(updated._id)
                ? {
                    ...message,
                    ...updated,
                  }
                : message
            )
          );
        }

        refreshConversations();
      };

    /*
     * Message deleted
     */
    const handleDeleted =
      ({
        messageId,
        conversationId,
      }) => {
        if (
          selected &&
          String(conversationId) ===
            String(selected._id)
        ) {
          setMessages((prev) =>
            prev.filter(
              (message) =>
                String(message._id) !==
                String(messageId)
            )
          );
        }

        setSelectedMessageIds(
          (prev) =>
            prev.filter(
              (id) =>
                String(id) !==
                String(messageId)
            )
        );

        refreshConversations();
      };

    /*
     * Message expired
     */
    const handleExpired =
      ({ messageId }) => {
        setMessages((prev) =>
          prev.filter(
            (message) =>
              String(message._id) !==
              String(messageId)
          )
        );

        setSelectedMessageIds(
          (prev) =>
            prev.filter(
              (id) =>
                String(id) !==
                String(messageId)
            )
        );
      };

    /*
     * User online
     */
    const handleOnline =
      ({ userId }) => {
        setUserPresence((prev) => ({
          ...prev,
          [String(userId)]: {
            status: "online",
            lastSeen: null,
          },
        }));
      };

    /*
     * User offline
     */
    const handleOffline =
      ({
        userId,
        lastSeen,
      }) => {
        setUserPresence((prev) => ({
          ...prev,
          [String(userId)]: {
            status: "offline",
            lastSeen,
          },
        }));
      };

    /*
     * Typing
     */
    const handleTyping =
      ({
        senderId,
        userId,
        conversationId,
      }) => {
        const typingUserId =
          senderId || userId;

        if (
          selected &&
          conversationId &&
          String(conversationId) !==
            String(selected._id)
        ) {
          return;
        }

        if (
          selected?.participants?.some(
            (participant) =>
              String(participant._id) ===
              String(typingUserId)
          )
        ) {
          setTyping(true);
        }
      };

    /*
     * Stop typing
     */
    const handleStopTyping =
      ({
        senderId,
        userId,
        conversationId,
      }) => {
        const typingUserId =
          senderId || userId;

        if (
          selected &&
          conversationId &&
          String(conversationId) !==
            String(selected._id)
        ) {
          return;
        }

        if (
          !typingUserId ||
          selected?.participants?.some(
            (participant) =>
              String(participant._id) ===
              String(typingUserId)
          )
        ) {
          setTyping(false);
        }
      };

    /*
     * Register listeners
     */
    socket.on(
      "newMessage",
      handleNewMessage
    );

    socket.on(
      "deliveryReceipt",
      handleDelivery
    );

    socket.on(
      "readReceipt",
      handleRead
    );

    socket.on(
      "messageUpdated",
      handleUpdated
    );

    socket.on(
      "messageDeleted",
      handleDeleted
    );

    socket.on(
      "messageExpired",
      handleExpired
    );

    socket.on(
      "userOnline",
      handleOnline
    );

    socket.on(
      "userOffline",
      handleOffline
    );

    socket.on(
      "typing",
      handleTyping
    );

    socket.on(
      "stopTyping",
      handleStopTyping
    );

    /*
     * Cleanup
     */
    return () => {
      socket.off(
        "newMessage",
        handleNewMessage
      );

      socket.off(
        "deliveryReceipt",
        handleDelivery
      );

      socket.off(
        "readReceipt",
        handleRead
      );

      socket.off(
        "messageUpdated",
        handleUpdated
      );

      socket.off(
        "messageDeleted",
        handleDeleted
      );

      socket.off(
        "messageExpired",
        handleExpired
      );

      socket.off(
        "userOnline",
        handleOnline
      );

      socket.off(
        "userOffline",
        handleOffline
      );

      socket.off(
        "typing",
        handleTyping
      );

      socket.off(
        "stopTyping",
        handleStopTyping
      );
    };
  }, [
    currentUserId,
    selected,
  ]);

  /*
   * Disconnect socket on page unmount
   */
  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  /*
   * Add sent message
   */
  const addSentMessage =
    (message) => {
      setMessages((prev) => {
        if (
          prev.some(
            (item) =>
              String(item._id) ===
              String(message._id)
          )
        ) {
          return prev;
        }

        return [
          ...prev,
          message,
        ];
      });

      loadConversations();
    };

  /*
   * Current other participant
   */
  const otherParticipant =
    selected
      ? selected.participants?.find(
          (participant) =>
            String(
              participant._id
            ) !==
            String(currentUserId)
        )
      : null;

  const otherPresence =
    otherParticipant
      ? userPresence[
          String(
            otherParticipant._id
          )
        ]
      : null;

  const online =
    otherPresence?.status ===
    "online";
  const handleVoiceCall = () => {
    if (!selected || selected.isGroup) {
      return;
    }
  
    const receiverId =
      otherParticipant?._id;
  
    if (!receiverId) {
      alert("Unable to identify the user.");
      return;
    }
  
    setCallRequest({
      type: "voice",
      receiverId,
      conversationId: selected._id,
    });
  };
  
  const handleVideoCall = () => {
    if (!selected || selected.isGroup) {
      return;
    }
  
    const receiverId =
      otherParticipant?._id;
  
    if (!receiverId) {
      alert("Unable to identify the user.");
      return;
    }
  
    setCallRequest({
      type: "video",
      receiverId,
      conversationId: selected._id,
    });
  };
  /*
   * Search messages
   */
  const handleSearchMessages =
    (query) => {
      setMessageSearch(
        query || ""
      );
    };

  /*
   * Start message selection
   */
  const startMessageSelection =
    () => {
      setSelectionMode(true);
      setSelectedMessageIds([]);
      setMessageSearch("");
    };

  /*
   * Toggle message selection
   */
  const toggleMessageSelection =
    (messageId) => {
      setSelectedMessageIds(
        (prev) => {
          const exists =
            prev.some(
              (id) =>
                String(id) ===
                String(messageId)
            );

          if (exists) {
            return prev.filter(
              (id) =>
                String(id) !==
                String(messageId)
            );
          }

          return [
            ...prev,
            messageId,
          ];
        }
      );
    };

  /*
   * Cancel selection
   */
  const cancelMessageSelection =
    () => {
      setSelectionMode(false);
      setSelectedMessageIds([]);
    };

  /*
   * Delete selected messages
   */
  const deleteSelectedMessages =
    async () => {
      if (
        selectedMessageIds.length ===
        0
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `Delete ${selectedMessageIds.length} selected message${
            selectedMessageIds.length ===
            1
              ? ""
              : "s"
          }?`
        );

      if (!confirmed) {
        return;
      }

      try {
        /*
         * Delete only messages that belong
         * to the current user.
         */
        const selectedMessages =
          messages.filter(
            (message) =>
              selectedMessageIds.some(
                (id) =>
                  String(id) ===
                  String(message._id)
              )
          );

        const ownMessages =
          selectedMessages.filter(
            (message) =>
              String(
                message.sender?._id ||
                  message.sender
              ) ===
              String(currentUserId)
          );

        if (
          ownMessages.length === 0
        ) {
          alert(
            "You can only delete your own messages."
          );

          return;
        }

        await Promise.all(
          ownMessages.map(
            (message) =>
              deleteMessage(
                message._id
              )
          )
        );

        const deletedIds =
          new Set(
            ownMessages.map(
              (message) =>
                String(message._id)
            )
          );

        setMessages((prev) =>
          prev.filter(
            (message) =>
              !deletedIds.has(
                String(message._id)
              )
          )
        );

        setSelectedMessageIds(
          []
        );

        setSelectionMode(false);

        await loadConversations();
      } catch (error) {
        console.error(
          "Bulk message deletion failed:",
          error
        );

        alert(
          error.response?.data
            ?.message ||
            "Some messages could not be deleted."
        );
      }
    };

  return (
    <div className="app-surface flex h-full w-full overflow-hidden bg-gray-100">
      {/* Conversations */}
      <ConversationList
        conversations={
          conversations
        }
        selectedId={
          selected?._id
        }
        onSelect={
          selectConversation
        }
        onConversationCreated={async (
          user
        ) => {
          try {
            const {
              getOrCreateDirectConversation,
            } = await import(
              "../services/chatService"
            );

            const conversation =
              await getOrCreateDirectConversation(
                user._id
              );

            setConversations(
              (prev) => {
                const exists =
                  prev.some(
                    (item) =>
                      String(
                        item._id
                      ) ===
                      String(
                        conversation._id
                      )
                  );

                if (exists) {
                  return prev;
                }

                return [
                  conversation,
                  ...prev,
                ];
              }
            );

            await selectConversation(
              conversation
            );
          } catch (error) {
            console.error(
              "Conversation creation failed:",
              error
            );

            throw error;
          }
        }}
        loading={
          loadingConversations
        }
      />

      {/* Main chat */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <ChatHeader
          conversation={selected}
          online={online}
          lastSeen={
            otherPresence?.lastSeen
          }
          onGroupManage={() =>
            setGroupManagerOpen(
              true
            )
          }
          onSearchMessages={
            handleSearchMessages
          }
          onSelectMessages={
            startMessageSelection
          }
          onVoiceCall={
            handleVoiceCall
          }
          onVideoCall={
            handleVideoCall
          }
        />

        {/* Messages */}
        {loadingMessages ? (
          <div className="flex flex-1 items-center justify-center text-gray-500">
            {t("loadingMessages")}
          </div>
        ) : (
          <ChatWindow
            messages={messages}
            currentUserId={
              currentUserId
            }
            searchQuery={
              messageSearch
            }
            selectionMode={
              selectionMode
            }
            selectedMessageIds={
              selectedMessageIds
            }
            onToggleMessage={
              toggleMessageSelection
            }
            onDeleteSelected={
              deleteSelectedMessages
            }
            onCancelSelection={
              cancelMessageSelection
            }
          />
        )}

        {/* Typing */}
        {typing && (
          <div className="bg-white px-5 py-1 text-xs text-gray-500">
            {t("someoneTyping")}
          </div>
        )}

        {/* Feature buttons */}
        <div className="flex items-center gap-2 border-t bg-white px-3 py-2">
          {/* Poll */}
          <button
            type="button"
            onClick={() =>
              setPollOpen(true)
            }
            disabled={!selected}
            className="rounded-lg px-3 py-2 hover:bg-gray-100 disabled:opacity-40"
            title="Create Poll"
          >
            📊 {t("poll")}
          </button>

          {/* More tools */}
          <button
            type="button"
            onClick={() =>
              setToolsOpen(
                !toolsOpen
              )
            }
            className={`rounded-lg px-3 py-2 ${
              toolsOpen
                ? "bg-indigo-100 text-indigo-600"
                : "hover:bg-gray-100"
            }`}
            title="Bookmarks and scheduled messages"
          >
            ⭐ {t("more")}
          </button>
        </div>

        {/* Message input */}
        <MessageInput
          conversation={selected}
          onMessageSent={
            addSentMessage
          }
          onOpenAI={() =>
            setAiOpen(true)
          }
        />
      </main>
      {/* Voice / Video Call */}
      <CallManager
        conversation={selected}
        currentUserId={currentUserId}
        requestCall={
          callRequest
            ? callRequest.type === "voice"
              ? "audio"
              : "video"
            : null
        }
        onRequestHandled={() =>
          setCallRequest(null)
        }
      />

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

      {/* Group manager */}
      {groupManagerOpen &&
        selected?.isGroup && (
          <GroupManager
            group={selected}
            currentUserId={
              currentUserId
            }
            onClose={() =>
              setGroupManagerOpen(
                false
              )
            }
            onUpdated={(
              updated
            ) => {
              setSelected(
                updated
              );

              setConversations(
                (prev) =>
                  prev.map(
                    (conversation) =>
                      String(
                        conversation._id
                      ) ===
                      String(
                        updated._id
                      )
                        ? updated
                        : conversation
                  )
              );
            }}
            onDeleted={() => {
              setSelected(null);
              setMessages([]);
              loadConversations();
            }}
          />
        )}

      {/* Poll */}
      {pollOpen &&
        selected && (
          <PollModal
            conversationId={
              selected._id
            }
            onClose={() =>
              setPollOpen(false)
            }
            onCreated={() => {
              setPollOpen(false);

              alert(
                "Poll created successfully!"
              );

              selectConversation(
                selected
              );
            }}
          />
        )}
    </div>
  );
}

function getCurrentUserId() {
  try {
    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) return null;

    const payload =
      JSON.parse(
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