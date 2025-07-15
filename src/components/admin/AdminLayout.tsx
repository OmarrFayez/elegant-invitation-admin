import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;