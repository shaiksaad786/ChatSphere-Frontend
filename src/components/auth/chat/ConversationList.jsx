function ConversationList({
  conversations,
  selectedId,
  onSelect,
  loading,
}) {
  return (
    <section className="w-full md:w-[310px] border-r bg-white flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Chats</h2>
        <input
          placeholder="Search conversations..."
          className="w-full mt-3 border rounded-xl px-4 py-2 outline-none"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <p className="p-5 text-gray-500">Loading conversations...</p>
        )}

        {!loading && conversations.length === 0 && (
          <p className="p-5 text-gray-500">
            No conversations yet.
          </p>
        )}

        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation._id}
            conversation={conversation}
            selected={selectedId === conversation._id}
            onClick={() => onSelect(conversation)}
          />
        ))}
      </div>
    </section>
  );
}

function ConversationItem({ conversation, selected, onClick }) {
  const currentUserId = getCurrentUserId();

  const other =
    conversation.participants?.find(
      (p) => String(p._id) !== String(currentUserId)
    ) || conversation.participants?.[0];

  const name = conversation.isGroup
    ? conversation.groupName
    : other?.name || "Unknown user";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex gap-3 p-4 border-b hover:bg-gray-50 ${
        selected ? "bg-indigo-50" : ""
      }`}
    >
      <img
        src={other?.profilePic || defaultAvatar}
        alt=""
        className="w-12 h-12 rounded-full object-cover"
      />

      <div className="min-w-0 flex-1">
        <div className="flex justify-between">
          <span className="font-semibold truncate">{name}</span>
          <span className="text-xs text-gray-400">
            {conversation.lastMessageTime
              ? new Date(conversation.lastMessageTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </span>
        </div>

        <p className="text-sm text-gray-500 truncate">
          {conversation.lastMessage || "Start a conversation"}
        </p>
      </div>
    </button>
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

const defaultAvatar =
  "https://ui-avatars.com/api/?name=User&background=6366f1&color=fff";

export default ConversationList;
