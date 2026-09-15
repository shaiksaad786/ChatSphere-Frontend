import { useEffect, useState } from "react";
import { searchUsers } from "../../../services/profileService";
import { usePreferences } from "../../../context/AppPreferences";

function NewChatModal({ onClose, onConversationCreated }) {
  const { t } = usePreferences();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(null);

  useEffect(() => {
    const value = query.trim();
    if (value.length < 2) {
      setUsers([]);
      return undefined;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        setUsers(await searchUsers(value));
      } catch (error) {
        console.error("User search failed", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const startChat = async (user) => {
    setStarting(user._id);
    try {
      await onConversationCreated(user);
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to start chat");
    } finally {
      setStarting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="surface-card rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="font-bold text-xl">{t("newChatTitle")}</h2>
          <button onClick={onClose} className="text-xl text-gray-500 hover:text-gray-900">×</button>
        </div>
        <div className="p-5">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchUsers")}
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <div className="mt-4 max-h-80 overflow-y-auto space-y-2">
            {loading && <p className="text-sm text-gray-500">{t("searching")}</p>}
            {!loading && query.trim().length >= 2 && users.length === 0 && (
              <p className="text-sm text-gray-500">{t("noUsers")}</p>
            )}
            {users.map((user) => (
              <button
                key={user._id}
                onClick={() => startChat(user)}
                disabled={starting === user._id}
                className="w-full flex items-center gap-3 p-3 rounded-xl border hover:bg-indigo-50 text-left disabled:opacity-50"
              >
                <img src={user.profilePic || "https://ui-avatars.com/api/?name=User&background=6366f1&color=fff"} className="w-11 h-11 rounded-full object-cover" alt="" />
                <span className="min-w-0 flex-1">
                  <strong className="block truncate">{user.name}</strong>
                  <small className="text-gray-500 block truncate">{user.email}</small>
                </span>
                <span className="text-indigo-600 text-sm">{starting === user._id ? t("loading") : t("startChat")}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewChatModal;
