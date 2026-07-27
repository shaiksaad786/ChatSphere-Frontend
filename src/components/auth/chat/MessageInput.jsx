import { useState } from "react";

function MessageInput() {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;

    console.log("Message:", message);

    setMessage("");
  };

  return (
    <div className="p-4 border-t bg-white flex gap-4">

      <input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 border rounded-lg p-3"
      />

      <button
        onClick={handleSend}
        className="bg-indigo-600 text-white px-6 rounded-lg"
      >
        Send
      </button>

    </div>
  );
}

export default MessageInput;