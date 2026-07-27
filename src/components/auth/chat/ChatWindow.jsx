import MessageInput from "./MessageInput";

const messages = [
  {
    id: 1,
    sender: "me",
    text: "Hi Ravali!"
  },
  {
    id: 2,
    sender: "other",
    text: "Hello Saad!"
  },
  {
    id: 3,
    sender: "me",
    text: "How is the backend?"
  },
  {
    id: 4,
    sender: "other",
    text: "Completed successfully."
  }
];

function ChatWindow() {
  return (
    <div className="flex flex-col flex-1">

      <div className="flex-1 p-6 overflow-y-auto bg-gray-100">

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-4 flex ${
              msg.sender === "me"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-xl max-w-xs ${
                msg.sender === "me"
                  ? "bg-indigo-600 text-white"
                  : "bg-white"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

      </div>

      <MessageInput />

    </div>
  );
}

export default ChatWindow;