import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, Home, PlayCircle, UserSquare } from "lucide-react";

type Role = "admin" | "student" | "vod" | null;

const BottomNav = () => {
  const [role, setRole] = useState<Role>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("role") as Role | null;
        setRole(stored);
      } catch (error) {
        console.warn("Failed to access localStorage", error);
      }
    }
  }, []);

  const myPath =
    role === "admin"
      ? "/admin/my"
      : role === "vod"
      ? "/vod/my"
      : "/student/my";

  const tabs = [
    { label: "홈", icon: Home, to: "/home" },
    { label: "VOD", icon: PlayCircle, to: "/vod/list" },
    { label: "마이", icon: UserSquare, to: myPath },
    { label: "알림", icon: Bell, to: "/notifications" },
  ];

  const isActive = (to: string) => {
    const pathname = location.pathname;

    if (to === "/home") return pathname === "/" || pathname === "/home";
    if (to.startsWith("/vod/")) return pathname.startsWith("/vod/");
    if (to === "/notifications") return pathname === "/notifications";
    if (to === "/student/my" || to === "/admin/my" || to === "/vod/my") {
      return (
        pathname === "/student/my" ||
        pathname === "/admin/my" ||
        pathname === "/vod/my"
      );
    }

    return pathname === to;
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 h-[70px] border-t border-[#e5e5e5] bg-white backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-screen-sm items-center justify-between gap-2 px-4">
        {tabs.map(({ label, icon: Icon, to }) => {
          const active = isActive(to);

          return (
            <motion.button
              key={label}
              type="button"
              onClick={() => navigate(to)}
              initial={active ? { scale: 0.9 } : undefined}
              animate={active ? { scale: 1.1 } : { scale: 1 }}
              transition={
                active
                  ? { type: "spring", stiffness: 260, damping: 18 }
                  : { duration: 0.2 }
              }
              whileTap={{ scale: 0.95 }}
              className="flex flex-1 justify-center"
            >
              <div
                className={`flex items-center gap-2 rounded-full px-4 py-2 ${
                  active
                    ? "bg-[#FFD331] text-[#404040] shadow-md"
                    : "text-gray-500 transition-all duration-200 hover:scale-105 hover:bg-yellow-50 hover:text-[#404040]"
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{label}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
