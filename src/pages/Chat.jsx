import Sidebar from "../components/auth/chat/Sidebar";
import ConversationList from "../components/auth/chat/ConversationList";
import ChatHeader from "../components/auth/chat/ChatHeader";
import ChatWindow from "../components/auth/chat/ChatWindow";

function Chat() {
  return (
    <div className="flex h-screen">

      <Sidebar />

      <ConversationList />

      <div className="flex flex-col flex-1">

        <ChatHeader />

        <ChatWindow />

      </div>

    </div>
  );
}

export default Chat;