import React from "react";
import AppSidebar from "./AppSidebar";
import {Header} from "./Header";
import { SidebarProvider } from "../ui/sidebar"; // ✅ Import SidebarProvider

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>  {/* ✅ Wrap everything inside */}
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <Header />

          {/* Page Content */}
          <main className="flex-1 p-4 bg-gray-50 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
