import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";

const AdminLayout = () => {
  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen flex bg-background">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </ProtectedAdminRoute>
  );
};

export default AdminLayout;