import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight,Trash2  } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Layers,
  Briefcase,
  UserX,
  CreditCard,
  CalendarCheck ,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
  
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// Type definition for navigation items
interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  subItems?: { title: string; url: string }[];
  hasSubmenu?: boolean;
}

// Main navigation items
const navigationItems: NavItem[] = [
  { title: "Dashboard", url: "/Home", icon: LayoutDashboard },
  { title: "User", url: "/user", icon: Users },
  { title: "Category", url: "/category", icon: Layers },
  { title: "Service", url: "/service", icon: Briefcase },
  { title: "Fake-User", url: "/FakeUser", icon: UserX },
  { title: "Payment", url: "/Payment", icon: CreditCard },
   { title: "Booking", url: "/booking", icon: CalendarCheck },
   { title: "Request", url: "/request", icon: Trash2 },
];

export function AppSidebar() {
  const { state } = useSidebar(); // only state
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const isSubmenuActive = (subItems?: { title: string; url: string }[]) =>
    subItems?.some((item) => currentPath === item.url) ?? false;

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth relative",
      isActive
        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-blue-500"
    );

  const getSubmenuCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "group flex items-center gap-3 rounded-lg px-3 py-2 ml-6 text-sm transition-smooth relative",
      isActive
        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
        : "text-sidebar-foreground/80 hover:bg-sidebar-submenu hover:text-sidebar-foreground"
    );

  return (
    <Sidebar
      className={cn(
        "border-r border-sidebar-border transition-smooth bg-gradient-sidebar",
        collapsed ? "w-14" : "w-64"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-elegant">
            <span className="text-white font-bold text-lg">BT</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sidebar-foreground font-bold text-xl tracking-tight">
                BeTogether
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 uppercase tracking-wider text-xs font-semibold mb-3">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => {
                const isExpanded = expandedItems.includes(item.title);
                const hasActiveSubmenu = isSubmenuActive(item.subItems);

                return (
                  <div key={item.title}>
                    <SidebarMenuItem>
                      {item.hasSubmenu ? (
                        <div
                          className={cn(
                            getNavCls({ isActive: hasActiveSubmenu }),
                            "cursor-pointer"
                          )}
                          onClick={() => {
                            if (!collapsed) toggleExpanded(item.title);
                          }}
                        >
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          {!collapsed && (
                            <>
                              <span className="truncate flex-1">
                                {item.title}
                              </span>
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 transition-smooth" />
                              ) : (
                                <ChevronRight className="h-4 w-4 transition-smooth" />
                              )}
                            </>
                          )}
                        </div>
                      ) : (
                        <SidebarMenuButton asChild>
                          <NavLink to={item.url} end className={getNavCls}>
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {!collapsed && (
                              <span className="truncate">{item.title}</span>
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  </div>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;
