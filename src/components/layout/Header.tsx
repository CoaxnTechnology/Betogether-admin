import { FC, useEffect, useState } from "react";
import {
  BellRinging,
  GearSix,
  UserCircle,
} from "phosphor-react";
import { Button } from "@/components/ui/button";
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
import axios from "axios";

export const Header: FC = () => {
  const navigate = useNavigate();

  const admin = localStorage.getItem("admin");
  const adminName = admin ? JSON.parse(admin).name : "Admin";

  const [deleteCount, setDeleteCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await axios.get("http://be-together-node.vercel.app/api/admin/pending-delete-count");
        setDeleteCount(res.data.count);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCount();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/");
  };

  return (
    <header className="h-16 border-b border-border bg-blue-600 text-white shadow-sm">
      <div className="flex h-full items-center justify-between px-4">

        {/* Left */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="hover:bg-blue-700 text-white" />
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">

          {/* 🔔 Delete Request Counter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-blue-700 text-white"
              >
                <BellRinging size={24} weight="bold" />
                {deleteCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 flex items-center justify-center">
                    {deleteCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-72 bg-white text-black">
              <div className="p-3 border-b font-semibold">
                Delete Requests
              </div>

              {deleteCount > 0 ? (
                <DropdownMenuItem className="text-sm">
                  {deleteCount} service delete request pending
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="text-sm text-muted-foreground">
                  No pending delete requests
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenuSeparator className="h-6 w-px bg-white/40 mx-2 hidden sm:block" />

          {/* 👤 Admin Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-blue-700 text-white"
              >
                <UserCircle size={24} weight="fill" />
                <span className="hidden md:block">{adminName}</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48 bg-white text-black">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
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
