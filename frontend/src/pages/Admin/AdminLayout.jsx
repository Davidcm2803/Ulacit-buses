import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}