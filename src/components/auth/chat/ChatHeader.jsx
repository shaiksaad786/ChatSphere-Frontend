function ChatHeader() {
  return (
    <div className="h-20 border-b bg-white flex items-center justify-between px-6">

      <div>

        <h2 className="text-xl font-bold">
          Ravalii
        </h2>

        <p className="text-green-600">
          ● Online
        </p>

      </div>

      <div className="flex gap-6 text-2xl">

        📞

        📹

        ⋮

      </div>

    </div>
  );
}

export default ChatHeader;