import { usePreferences } from "../../../context/AppPreferences";
function ChatHeader({ conversation, online, onGroupManage }) {
  const { t } = usePreferences();
  if (!conversation) return <header className="h-20 border-b bg-white flex items-center px-5 app-surface"><span className="text-gray-400">{t("selectConversation")}</span></header>;
  const currentUserId = getCurrentUserId();
  const other = conversation.participants?.find((p) => String(p._id) !== String(currentUserId)) || conversation.participants?.[0];
  const name = conversation.isGroup ? conversation.groupName : other?.name || t("unknownUser");
  const status = conversation.isGroup ? `${conversation.participants?.length || 0} ${t("members")}` : online ? t("online") : t("offline");
  return <header className="h-20 border-b bg-white flex items-center justify-between px-5 app-surface"><div className="flex items-center gap-3"><img src={conversation.isGroup ? "https://ui-avatars.com/api/?name=Group&background=6366f1&color=fff" : other?.profilePic || "https://ui-avatars.com/api/?name=User&background=6366f1&color=fff"} alt="" className="w-11 h-11 rounded-full object-cover" /><div><h2 className="font-bold">{name}</h2><p className="text-xs text-gray-500 flex items-center gap-1">{!conversation.isGroup && <span className={`w-2 h-2 rounded-full ${online ? "bg-green-500" : "bg-gray-400"}`} />}{status}</p></div></div><div className="flex gap-2"><button className="p-3 rounded-full hover:bg-gray-100">🔍</button><button className="p-3 rounded-full hover:bg-gray-100">📞</button><button onClick={conversation.isGroup ? onGroupManage : undefined} className="p-3 rounded-full hover:bg-gray-100">⋮</button></div></header>;
}
function getCurrentUserId() { try { const token = localStorage.getItem("token"); if (!token) return null; const payload = JSON.parse(atob(token.split(".")[1])); return payload.id || payload._id || payload.userId; } catch { return null; } }
export default ChatHeader;
