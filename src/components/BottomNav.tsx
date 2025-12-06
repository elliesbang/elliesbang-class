import { Home, BookOpen, PlayCircle, Megaphone, UserSquare } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useAuth();

  const pathname = location.pathname;

  // 마이페이지 경로 (역할에 따라 분기)
  const myPath =
    role === "admin"
      ? "/admin/my"
      : role === "student"
      ? "/student/my"
      : role === "vod"
      ? "/vod/my"
      : "/home";

  const classroomPath =
    role === "student" || role === "admin" ? "/student/classroom" : "/home";

  const menu = [
    {
      key: "home",
      label: "홈",
      icon: Home,
      to: "/home",
      active: pathname === "/" || pathname === "/home",
    },
    {
      key: "classroom",
      label: "강의실",
      icon: BookOpen,
      to: classroomPath,
      active: pathname.startsWith("/student/classroom"),
    },
    {
      key: "vod",
      label: "VOD",
      icon: PlayCircle,
      to: "/vod/list",
      active: pathname.startsWith("/vod"),
    },
    {
      key: "notice",
      label: "공지",
      icon: Megaphone,
      to: "/notifications",
      active: pathname.startsWith("/notifications"),
    },
    {
      key: "my",
      label: "마이",
      icon: UserSquare,
      to: myPath,
      active:
        pathname.startsWith("/student/my") ||
        pathname.startsWith("/admin/my") ||
        pathname.startsWith("/vod/my"),
    },
  ];

  const baseBtnClass =
    "flex flex-col items-center justify-center px-3 py-1 rounded-2xl text-[11px] transition-all duration-200";
  const activeClass = " bg-[#FFD331] text-[#404040] scale-105 shadow-sm";
  const inactiveClass = " text-gray-500 hover:scale-105";

  return (
    <nav className="fixed bottom-0 left-0 w-full h-[70px] bg-white border-t border-[#e5e5e5] backdrop-blur-md z-50 flex justify-around items-center">
      {menu.map((item) => {
        const Icon = item.icon;
        const cls = baseBtnClass + (item.active ? activeClass : inactiveClass);

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => navigate(item.to)}
            className={cls}
          >
            <Icon size={20} />
            <span className="mt-1 leading-none">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}