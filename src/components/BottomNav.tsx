import { useEffect, useState } from "react";
import { Home, BookOpen, PlayCircle, Megaphone, UserSquare } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [storedRole, setStoredRole] = useState<"student" | "vod" | "admin" | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem("role");
      if (raw === "student" || raw === "vod" || raw === "admin") {
        setStoredRole(raw);
      } else {
        setStoredRole(null);
      }
    } catch (err) {
      console.error("BottomNav storage error:", err);
      setStoredRole(null);
    }
  }, []);

  const currentRole = role ?? storedRole;
  const pathname = location.pathname;

  if (pathname.startsWith("/admin")) {
    return null;
  }

  // ⭐ VOD active 정확하게 체크
  const isVodActive = pathname === "/vod" || pathname.startsWith("/vod/");

  // ⭐ 역할별 마이페이지 분기
  const myPath =
    currentRole === "admin"
      ? "/admin/my"
      : currentRole === "student"
      ? "/student/my"
      : currentRole === "vod"
      ? "/vod/my"
      : "/home";

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
      to: "/student/classroom",
      active: pathname.startsWith("/student/classroom"),
    },
    {
      key: "vod",
      label: "VOD",
      icon: PlayCircle,
      to: "/vod",
      active: isVodActive,
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
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => navigate(item.to)}
            className={baseBtnClass + (item.active ? activeClass : inactiveClass)}
          >
            <Icon size={20} />
            <span className="mt-1 leading-none">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
