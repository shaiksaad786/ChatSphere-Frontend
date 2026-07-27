const conversations = [
  {
    id: 1,
    name: "Ravali",
    lastMessage: "Are you free?",
  },
  {
    id: 2,
    name: "Project Team",
    lastMessage: "Meeting at 4 PM",
  },
  {
    id: 3,
    name: "Family",
    lastMessage: "Call me",
  },
  {
    id: 4,
    name: "Friends",
    lastMessage: "Let's go out!",
  },
];

function ConversationList() {
  return (
    <div className="w-80 border-r bg-white overflow-y-auto">

      <h2 className="text-2xl font-bold p-5">
        Chats
      </h2>

      {conversations.map((chat) => (
        <div
          key={chat.id}
          className="p-4 border-b cursor-pointer hover:bg-gray-100"
        >
          <h3 className="font-semibold">
            {chat.name}
          </h3>

          <p className="text-gray-500 text-sm">
            {chat.lastMessage}
          </p>
        </div>
      ))}

    </div>
  );
}

export default ConversationList;