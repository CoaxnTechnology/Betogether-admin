import { FC } from "react";
import {
  BellRinging,
  ChatTeardropText,
  GearSix,
  MagnifyingGlass,
  UserCircle,
} from "phosphor-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

interface Notification {
  title: string;
  desc: string;
  time: string;
}

interface Message {
  name: string;
  msg: string;
  time: string;
}

export const Header: FC = () => {
  const navigate = useNavigate();
  // Get admin name from localStorage
  const admin = localStorage.getItem("admin");
  const adminName = admin ? JSON.parse(admin).name : "Admin";

  const notifications: Notification[] = [
    {
      title: "New leave request",
      desc: "John Doe submitted annual leave",
      time: "2m ago",
    },
    {
      title: "Payroll processed",
      desc: "January 2024 payroll completed",
      time: "1h ago",
    },
    {
      title: "System update",
      desc: "HR system will be updated tonight",
      time: "3h ago",
    },
  ];

  const messages: Message[] = [
    {
      name: "Sarah Johnson",
      msg: "Could you review my timesheet?",
      time: "5m ago",
    },
    {
      name: "Mike Chen",
      msg: "Meeting scheduled for tomorrow",
      time: "15m ago",
    },
    { name: "Lisa Wong", msg: "Updated employee handbook", time: "1h ago" },
    { name: "Tom Brown", msg: "Question about benefits", time: "2h ago" },
  ];
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin"); // clear token
    navigate("/"); // redirect to login page
  };

  return (
    <header className="h-16 border-b border-border bg-blue-600 text-white shadow-sm">
      <div className="flex h-full items-center justify-between px-4 gap-2 sm:gap-4">
        {/* Left - Sidebar & Search */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <SidebarTrigger className="hover:bg-blue-700 text-white shrink-0" />

          {/* Search */}
        </div>

        {/* Right - Icons & User */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-blue-700 text-white"
              >
                <BellRinging
                  className="text-white"
                  style={{ width: "24px", height: "24px" }}
                  weight="bold"
                />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 border-0 flex items-center justify-center">
                  {notifications.length}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 bg-white text-black"
            >
              <div className="flex items-center justify-between p-3 border-b">
                <h4 className="font-semibold">Notifications</h4>
                <Badge variant="secondary">{notifications.length} new</Badge>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification, index) => (
                  <DropdownMenuItem
                    key={index}
                    className="flex flex-col items-start p-3 space-y-1 hover:bg-muted/30"
                  >
                    <div className="font-medium text-sm">
                      {notification.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {notification.desc}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {notification.time}
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Messages */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-blue-700 text-white"
              >
                <ChatTeardropText
                  className="text-white"
                  style={{ width: "24px", height: "24px" }}
                  weight="bold"
                />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-green-500 border-0 flex items-center justify-center">
                  {messages.length}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 bg-white text-black"
            >
              <div className="flex items-center justify-between p-3 border-b">
                <h4 className="font-semibold">Messages</h4>
                <Badge variant="secondary">{messages.length} new</Badge>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {messages.map((message, index) => (
                  <DropdownMenuItem
                    key={index}
                    className="flex flex-col items-start p-3 space-y-1 hover:bg-muted/30"
                  >
                    <div className="font-medium text-sm">{message.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {message.msg}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {message.time}
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenuSeparator className="h-6 w-px bg-white/40 mx-2 hidden sm:block" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 py-2 h-10 hover:bg-blue-700 text-white"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center">
                  <UserCircle size={24} weight="fill" />
                </div>
                {/* Hide name on small screens */}
                <div className="hidden md:block text-left">
                  <div className="text-sm font-semibold truncate max-w-[100px]">
                    <div className="text-sm font-semibold truncate max-w-[100px]">
                      {adminName}
                    </div>
                  </div>
                  <div className="text-xs text-white/80">Administrator</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-white text-black"
            >
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <UserCircle className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <GearSix className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
