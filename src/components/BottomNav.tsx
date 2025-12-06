import { Home, PlayCircle, UserSquare, Bell } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useAuth();

  const pathname = location.pathname;

  const menu = [
    {
      label: "홈",
      icon: Home,
      to: "/home",
      active: pathname === "/" || pathname === "/home",
    },
    {
      label: "VOD",
      icon: PlayCircle,
      to: "/vod/list",
      active: pathname.startsWith("/vod"),
    },
    {
      label: "마이",
      icon: UserSquare,
      to:
        role === "admin"
          ? "/admin/my"
          : role === "student"
          ? "/student/my"
          : role === "vod"
          ? "/vod/my"
          : "/home",
      active:
        pathname.startsWith("/student/my") ||
        pathname.startsWith("/admin/my") ||
        pathname.startsWith("/vod/my"),
    },
    {
      label: "알림",
      icon: Bell,
      to: "/notifications",
      active: pathname.startsWith("/notifications"),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full h-[70px] bg-white border-t border-[#e5e5e5] backdrop-blur-md z-50 flex justify-around items-center">
      {menu.map((item, i) => {
        const Icon = item.icon;
        return (
          <button
            key={i}
            onClick={() => navigate(item.to)}
            className={`
              flex flex-col items-center justify-center px-4 py-1 rounded-2xl transition-all duration-200
              ${
                item.active
                  ? "bg-[#FFD331] text-[#404040] scale-105 shadow-sm"
                  : "text-gray-500 hover:scale-105"
              }
            `}
          >
            <Icon size={22} />
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
