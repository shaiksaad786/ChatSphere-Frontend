import { Outlet } from "react-router-dom";
import Sidebar from "../chat/Sidebar";

function AppLayout() {
  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar stays on every page */}
      <Sidebar />

      {/* Only this section changes */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

    </div>
  );
}

export default AppLayout;