import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-20 bg-indigo-700 text-white flex flex-col items-center py-6 gap-8">

      <h1 className="text-2xl font-bold">💬</h1>

      <Link
        to="/chat"
        className="text-3xl hover:scale-110 transition"
      >
        🏠
      </Link>

      <Link
        to="/dashboard/profile"
        className="text-3xl hover:scale-110 transition"
      >
        👤
      </Link>

      <Link
        to="/dashboard/settings"
        className="text-3xl hover:scale-110 transition"
      >
        ⚙️
      </Link>

    </div>
  );
}

export default Sidebar;