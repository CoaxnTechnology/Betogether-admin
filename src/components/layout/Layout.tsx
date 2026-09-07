import React from "react";
import AppSidebar from "./AppSidebar";
import { Header } from "./Header";
import { SidebarProvider } from "../ui/sidebar"; // ✅ Import SidebarProvider

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      {" "}
      {/* ✅ Wrap everything inside */}
      <div className="min-h-screen flex w-full bg-background overflow-x-hidden">
        {/* Sidebar */}
        <AppSidebar />

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
