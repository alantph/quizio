import { useEffect } from "react";
import { Outlet } from "react-router";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

const AdminLayout = () => {
  const { token, setupApiClient } = useAdminAuth();

  useEffect(() => {
    setupApiClient();
  }, [setupApiClient]);

  if (!token) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
