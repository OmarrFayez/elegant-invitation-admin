import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";

const AdminLayout = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-background">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AdminLayout;