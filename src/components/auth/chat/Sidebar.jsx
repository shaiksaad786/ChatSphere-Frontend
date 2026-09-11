import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
      isActive
        ? "bg-indigo-600 text-white"
        : "text-gray-700 hover:bg-indigo-50"
    }`;

  return (
    <aside className="w-64 bg-white border-r flex flex-col h-full">
      <div className="p-5 border-b">
        <h1 className="text-2xl font-extrabold text-indigo-600">
          ChatSphere
        </h1>
        <p className="text-xs text-gray-500">Connect • Chat • Collaborate</p>
      </div>

      <nav className="p-4 space-y-2 flex-1">
        <NavLink to="/chat" className={linkClass}>
          💬 Chats
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          👤 Profile
        </NavLink>
        <NavLink to="/settings" className={linkClass}>
          ⚙️ Settings
        </NavLink>
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 text-left"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
