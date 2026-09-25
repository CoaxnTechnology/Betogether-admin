import React from "react";
import { Toaster } from "react-hot-toast";
import AppSidebar from "./AppSidebar";
import { Header } from "./Header";
import { SidebarProvider } from "../ui/sidebar"; // ✅ Import SidebarProvider
import { useAdminNotifications } from "@/hooks/useAdminNotifications";

const Layout = ({ children }: { children: React.ReactNode }) => {
  // Polled once here (not per-page) so the sidebar badge + urgent-report
  // toast work from anywhere in the admin panel, not just the Reports page.
  const notifications = useAdminNotifications();

  return (
    <SidebarProvider>
      {" "}
      {/* ✅ Wrap everything inside */}
      <Toaster position="top-right" />
      <div className="min-h-screen flex w-full bg-background overflow-x-hidden">
        {/* Sidebar */}
        <AppSidebar notificationCount={notifications.total} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <Header />

          {/* Page Content */}
          <main className="flex-1 min-w-0 p-3 sm:p-4 bg-gray-50 overflow-y-auto overflow-x-hidden">
            {children}
          </main>

        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
