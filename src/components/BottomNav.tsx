import { Home, BookOpen, Megaphone, UserSquare } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const pathname = location.pathname;

  const handleNavigate = (target: string, key: string) => {
    if (key === "my" && role === "admin") {
      navigate("/admin");
      return;
    }

    if (key === "my" && !user) {
      navigate("/login");
      return;
    }

    navigate(target);
  };

  // ⭐ 역할별 마이페이지 분기
  const myPath = "/my";

  const menu = [
    {
      key: "home",
      label: "홈",
      icon: Home,
      to: "/",
      active: pathname === "/" || pathname === "/home",
    },
    {
      key: "classroom",
      label: "강의실",
      icon: BookOpen,
      to: "/classroom",
      active: pathname.startsWith("/classroom"),
    },
    {
      key: "notice",
      label: "공지",
      icon: Megaphone,
      to: "/notices",
      active: pathname.startsWith("/notices"),
    },
    {
      key: "my",
      label: "마이",
      icon: UserSquare,
      to: myPath,
      active: pathname === "/my" || pathname.startsWith("/my/"),
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
            onClick={() => handleNavigate(item.to, item.key)}
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
