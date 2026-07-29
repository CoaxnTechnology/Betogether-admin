import { FC, useEffect, useState } from "react";
import { BellRinging, GearSix, UserCircle } from "phosphor-react";
import { Button } from "@/components/ui/button";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
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

const fetchDeleteCount = async () => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/api/admin/pending-delete-count`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    );

    setDeleteCount(res.data.count || 0);
  } catch (err) {
    console.error("Delete count fetch error:", err);
  }
};
  console.log("Delete count:", deleteCount);
  useEffect(() => {
    fetchDeleteCount();

    const interval = setInterval(() => {
      fetchDeleteCount();
    }, 5000);

    
    const refreshHandler = () => {
      fetchDeleteCount();
    };

    window.addEventListener("deleteRequestUpdated", refreshHandler);

    return () => {
      clearInterval(interval);
      window.removeEventListener("deleteRequestUpdated", refreshHandler);
    };
  }, []);

  const handleNotificationClick = () => {
    navigate("/request");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");

    navigate("/");
  };

  return (
    <header className="h-16 border-b border-border bg-blue-600 text-white shadow-sm">
      <div className="flex h-full items-center justify-between px-4 gap-2 sm:gap-4">
        {/* Left */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <SidebarTrigger className="hover:bg-blue-700 text-white shrink-0" />
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Notification */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-blue-700 text-white"
              >
                <BellRinging size={24} weight="bold" />

                {deleteCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 border-0 flex items-center justify-center">
                    {deleteCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-80 bg-white text-black"
            >
              <div className="flex items-center justify-between p-3 border-b">
                <h4 className="font-semibold">Delete Requests</h4>

                <Badge variant="secondary">{deleteCount} New</Badge>
              </div>

              <DropdownMenuItem
                onClick={handleNotificationClick}
                className="cursor-pointer flex flex-col items-start p-3"
              >
                {deleteCount > 0 ? (
                  <>
                    <span className="font-medium">
                      {deleteCount} pending delete request(s)
                    </span>

                    <span className="text-xs text-gray-500">
                      Click to review requests
                    </span>
                  </>
                ) : (
                  <>
                    <span>No pending delete requests</span>
                  </>
                )}
              </DropdownMenuItem>
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

                <div className="hidden md:block text-left">
                  <div className="text-sm font-semibold truncate max-w-[120px]">
                    {adminName}
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
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem>
                <GearSix className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-red-600"
                onClick={handleLogout}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
