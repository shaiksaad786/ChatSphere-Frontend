import { useEffect, useState } from "react";
import {
  getBookmarks,
  getScheduledMessages,
  cancelScheduledMessage,
} from "../../../services/chatService";

function ToolsPanel({ onClose }) {
  const [tab, setTab] = useState("bookmarks");
  const [bookmarks, setBookmarks] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      if (tab === "bookmarks") {
        setBookmarks(await getBookmarks());
      } else {
        setScheduled(await getScheduledMessages());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tab]);

  const cancel = async (id) => {
    try {
      await cancelScheduledMessage(id);
      await load();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel");
    }
  };

  return (
    <aside className="w-full md:w-[330px] bg-white border-l">
      <div className="p-4 border-b flex justify-between">
        <h2 className="font-bold">More</h2>
        <button onClick={onClose}>×</button>
      </div>

      <div className="p-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => setTab("bookmarks")}
          className={`p-2 rounded-lg ${
            tab === "bookmarks"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100"
          }`}
        >
          ⭐ Bookmarks
        </button>
        <button
          onClick={() => setTab("scheduled")}
          className={`p-2 rounded-lg ${
            tab === "scheduled"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100"
          }`}
        >
          🕐 Scheduled
        </button>
      </div>

      <div className="p-4 overflow-y-auto">
        {loading && <p>Loading...</p>}

        {tab === "bookmarks" &&
          bookmarks.map((item) => (
            <div
              key={item._id}
              className="border rounded-xl p-3 mb-2"
            >
              <p className="text-sm">
                {item.message?.text || "Media message"}
              </p>
            </div>
          ))}

        {tab === "scheduled" &&
          scheduled.map((item) => (
            <div
              key={item._id}
              className="border rounded-xl p-3 mb-2"
            >
              <p className="text-sm">{item.text}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(item.scheduledAt).toLocaleString()}
              </p>
              <button
                onClick={() => cancel(item._id)}
                className="text-red-500 text-sm mt-2"
              >
                Cancel
              </button>
            </div>
          ))}
      </div>
    </aside>
  );
}

export default ToolsPanel;
