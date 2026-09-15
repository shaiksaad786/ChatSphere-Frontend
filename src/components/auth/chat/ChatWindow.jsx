import { useEffect, useRef, useState } from "react";

import BookmarkButton from "./BookmarkButton";
import SelfDestructSelector from "./SelfDestructSelector";
import { editMessage, deleteMessage } from "../../../services/messageService";
import { usePreferences } from "../../../context/AppPreferences";

function ChatWindow({
  messages,
  currentUserId,
}) {
  const { t } = usePreferences();
  const bottomRef = useRef(null);

  const [openMenu, setOpenMenu] =
    useState(null);

  const [localMessages, setLocalMessages] =
    useState(messages);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [localMessages]);

  if (!localMessages.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 bg-[#f7f8fc]">
        <div className="text-center">
          <div className="text-5xl mb-3">
            💬
          </div>

          <p className="font-medium">
            No messages yet
          </p>

          <p className="text-sm mt-1">
            Say hello 👋
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-[#f7f8fc]">

      <div className="max-w-4xl mx-auto space-y-4">

        {localMessages.map((message) => {

          const mine =
            String(
              message.sender?._id ||
                message.sender
            ) ===
            String(currentUserId);

          return (
            <div
              key={message._id}
              className={`flex ${
                mine
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              <div className="relative max-w-[75%]">

                {/* Message bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 shadow-sm ${
                    mine
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-white text-gray-800 rounded-bl-sm"
                  }`}
                >

                  <MessageContent
                    message={message}
                  />

                  {/* Bottom information */}
                  <div
                    className={`mt-2 flex items-center gap-2 text-[10px] ${
                      mine
                        ? "text-indigo-100"
                        : "text-gray-400"
                    }`}
                  >

                    <span>
                      {message.createdAt
                        ? new Date(
                            message.createdAt
                          ).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : ""}
                    </span>

                    {/* Delivery / read */}
                    {mine && (
                      <span>
                        {message.isRead
                          ? "✓✓"
                          : message.isDelivered
                          ? "✓✓"
                          : "✓"}
                      </span>
                    )}

                    {/* Self destruct */}
                    {message.isSelfDestruct && (
                      <span>
                        💣{" "}
                        {getExpiryText(
                          message
                        )}
                      </span>
                    )}

                  </div>
                </div>

                {/* Menu button */}
                <button
                  onClick={() =>
                    setOpenMenu(
                      openMenu ===
                        message._id
                        ? null
                        : message._id
                    )
                  }
                  className="absolute -right-9 top-1 w-8 h-8 rounded-full hover:bg-gray-200 text-gray-500"
                >
                  ⋮
                </button>

                {/* Menu */}
                {openMenu ===
                  message._id && (
                  <div className="absolute right-0 top-10 z-30 bg-white border rounded-xl shadow-xl p-2 min-w-[190px]">

                    {mine && message.messageType === "text" && !message.isRead && (
                      <button
                        className="w-full text-left px-2 py-2 hover:bg-gray-50 rounded-lg text-sm"
                        onClick={async () => {
                          const next = window.prompt("Edit message", message.text || "");
                          if (next === null || !next.trim() || next.trim() === message.text) return;
                          try {
                            const result = await editMessage(message._id, next.trim());
                            const updated = result.data?.message || result.data || result;
                            setLocalMessages(prev => prev.map(item => item._id === message._id ? { ...item, ...updated, text: next.trim() } : item));
                            setOpenMenu(null);
                          } catch (error) { alert(error.response?.data?.message || "Unable to edit message"); }
                        }}
                      >✏️ Edit message</button>
                    )}
                    {mine && (
                      <button
                        className="w-full text-left px-2 py-2 hover:bg-red-50 rounded-lg text-sm text-red-600"
                        onClick={async () => {
                          if (!window.confirm("Delete this message?")) return;
                          try { await deleteMessage(message._id); setLocalMessages(prev => prev.filter(item => item._id !== message._id)); setOpenMenu(null); }
                          catch (error) { alert(error.response?.data?.message || "Unable to delete message"); }
                        }}
                      >🗑️ Delete message</button>
                    )}

                    {/* Bookmark */}
                    <div className="px-2 py-2 flex items-center justify-between hover:bg-gray-50 rounded-lg">

                      <span className="text-sm">
                        Bookmark
                      </span>

                      <BookmarkButton
                        messageId={
                          message._id
                        }
                      />

                    </div>

                    {/* Self destruct */}
                    <div className="px-2 py-2 border-t mt-1">

                      <p className="text-xs text-gray-500 mb-2">
                        Self-destruct
                      </p>

                      <SelfDestructSelector
                        messageId={
                          message._id
                        }
                        onUpdated={(
                          updated
                        ) => {
                          setLocalMessages(
                            (prev) =>
                              prev.map(
                                (item) =>
                                  item._id ===
                                  message._id
                                    ? {
                                        ...item,
                                        ...updated,
                                      }
                                    : item
                              )
                          );
                        }}
                      />

                    </div>

                  </div>
                )}

              </div>

            </div>
          );
        })}

        <div ref={bottomRef} />

      </div>
    </div>
  );
}

function MessageContent({
  message,
}) {

  // Image
  if (
    message.messageType ===
      "image" &&
    message.image
  ) {
    return (
      <img
        src={message.image}
        alt="attachment"
        className="max-w-full max-h-80 rounded-xl object-cover"
      />
    );
  }

  // Audio
  if (
    message.messageType ===
      "audio" &&
    message.audio
  ) {
    return (
      <audio
        controls
        src={message.audio}
        className="max-w-full"
      />
    );
  }

  // Video
  if (
    message.messageType ===
      "video" &&
    message.video
  ) {
    return (
      <video
        controls
        src={message.video}
        className="max-w-full max-h-80 rounded-xl"
      />
    );
  }

  // Normal text
  return (
    <p className="whitespace-pre-wrap break-words">
      {message.text}
    </p>
  );
}

function getExpiryText(message) {
  if (!message.expiresAt) {
    return "self-destruct";
  }

  const seconds = Math.max(
    0,
    Math.round(
      (new Date(
        message.expiresAt
      ) -
        Date.now()) /
        1000
    )
  );

  return seconds > 0
    ? `${seconds}s`
    : "expired";
}

export default ChatWindow;