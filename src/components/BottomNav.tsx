import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home as HomeIcon,
  BookOpen,
  PlayCircle,
  Megaphone,
  User,
} from "lucide-react";

type Role = "admin" | "student" | "vod" | null;

const BottomNav = () => {
  const [role, setRole] = useState<Role>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // 로그인 후 저장해둔 role 가져오기
  useEffect(() => {
    const stored = localStorage.getItem("role") as Role | null;
    if (stored) {
      setRole(stored);
    }
  }, []);

  // 로그인 안 되어 있으면 하단 내비 안 보여줌
  if (!role) return null;

  // 역할별 경로 매핑
  const paths = getPathsByRole(role);

  const items = [
    { key: "home", label: "홈", icon: HomeIcon, path: paths.home },
    { key: "classroom", label: "강의실", icon: BookOpen, path: paths.classroom },
    { key: "vod", label: "VOD", icon: PlayCircle, path: paths.vod },
    { key: "notices", label: "공지", icon: Megaphone, path: paths.notices },
    { key: "my", label: "마이", icon: User, path: paths.my },
  ];

  const isActive = (path: string) => {
    // 홈 처리: "/" 또는 "/home" 모두 홈으로 인식
    if (path === "/home") {
      if (location.pathname === "/home" || location.pathname === "/") return true;
    }
    return (
      location.pathname === path ||
      location.pathname.startsWith(path + "/")
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-[#fffdf6]">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-2">
        {items.map(({ key, label, icon: Icon, path }) => {
          const active = isActive(path);
          return (
            <button
              key={key}
              type="button"
              onClick={() => navigate(path)}
              className="flex flex-1 flex-col items-center gap-1 text-xs"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  active ? "bg-[#f3e7c7]" : "bg-transparent"
                }`}
              >
                <Icon
                  size={20}
                  className={active ? "text-[#404040]" : "text-[#9b8f85]"}
                />
              </div>
              <span
                className={active ? "text-[11px] text-[#404040]" : "text-[11px] text-[#9b8f85]"}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

function getPathsByRole(role: Role) {
  return {
    // 홈 화면: 전체공지 + VOD 목록 공통
    home: "/home",

    // 강의실 탭
    classroom:
      role === "admin"
        ? "/admin/classroom"
        : role === "student"
        ? "/student/classroom"
        : "/vod/list", // vod 사용자는 강의실 대신 VOD 리스트로

    // VOD 탭
    vod:
      role === "admin"
        ? "/admin/vod"
        : "/vod/list",

    // 공지 탭
    notices:
      role === "admin"
        ? "/admin/notices"
        : "/notices",

    // 마이 탭
    my:
      role === "admin"
        ? "/admin/my"
        : role === "student"
        ? "/student/my"
        : "/vod/my",
  };
}

export default BottomNav;