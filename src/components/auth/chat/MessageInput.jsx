import { useEffect, useRef, useState } from "react";
import { sendMessage, scheduleMessage } from "../../../services/chatService";

function MessageInput({
  conversation,
  onMessageSent,
  onOpenAI,
}) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [expiresIn, setExpiresIn] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [sending, setSending] = useState(false);
  const fileRef = useRef(null);

  const currentUserId = getCurrentUserId();

  const other =
    conversation?.participants?.find(
      (p) => String(p._id) !== String(currentUserId)
    ) || conversation?.participants?.[0];

  const send = async () => {
    if ((!text.trim() && !file) || !other?._id) return;

    setSending(true);

    try {
      const message = await sendMessage({
        receiverId: other._id,
        text: text.trim(),
        imageFile: file,
        expiresIn: expiresIn || undefined,
      });

      setText("");
      setFile(null);
      setExpiresIn("");
      onMessageSent(message);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const schedule = async () => {
    if (!text.trim() || !scheduledAt || !conversation?._id || !other?._id) {
      alert("Enter message and future date/time.");
      return;
    }

    try {
      await scheduleMessage({
        conversationId: conversation._id,
        receiverId: other._id,
        text: text.trim(),
        scheduledAt: new Date(scheduledAt).toISOString(),
        messageType: "text",
      });

      alert("Message scheduled successfully.");
      setText("");
      setScheduledAt("");
      setShowSchedule(false);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to schedule message");
    }
  };

  useEffect(() => {
    const handler = (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        send();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  if (!conversation) return null;

  return (
    <div className="bg-white border-t p-3">
      {file && (
        <div className="mb-2 flex items-center justify-between bg-gray-100 p-2 rounded-lg">
          <span className="text-sm truncate">📎 {file.name}</span>
          <button onClick={() => setFile(null)}>×</button>
        </div>
      )}

      {showMore && (
        <div className="mb-3 flex flex-wrap gap-2">
          <label className="px-3 py-2 bg-gray-100 rounded-lg cursor-pointer">
            🖼️ Image
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          <button
            onClick={() =>
              setExpiresIn(expiresIn ? "" : "30")
            }
            className={`px-3 py-2 rounded-lg ${
              expiresIn ? "bg-red-100 text-red-600" : "bg-gray-100"
            }`}
          >
            💣 Self-destruct {expiresIn ? "(30s)" : ""}
          </button>

          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className="px-3 py-2 bg-gray-100 rounded-lg"
          >
            🕐 Schedule
          </button>
        </div>
      )}

      {showSchedule && (
        <div className="mb-3 p-3 border rounded-xl bg-gray-50">
          <label className="text-sm font-medium">Send at</label>
          <div className="flex gap-2 mt-2">
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="border rounded-lg px-3 py-2 flex-1"
            />
            <button
              onClick={schedule}
              className="bg-indigo-600 text-white px-4 rounded-lg"
            >
              Schedule
            </button>
          </div>
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          onClick={() => setShowMore(!showMore)}
          className="w-11 h-11 rounded-full hover:bg-gray-100 text-xl"
        >
          +
        </button>

        <textarea
          rows="1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 resize-none border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
        />

        <button
          onClick={onOpenAI}
          className="w-11 h-11 rounded-full bg-purple-100 text-purple-600 font-bold"
          title="AI Assistant"
        >
          ✨
        </button>

        <button
          onClick={send}
          disabled={sending}
          className="w-11 h-11 rounded-full bg-indigo-600 text-white disabled:opacity-50"
        >
          ➤
        </button>
      </div>
    </div>
  );
}

function getCurrentUserId() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id || payload._id || payload.userId;
  } catch {
    return null;
  }
}

export default MessageInput;
