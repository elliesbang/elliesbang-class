import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const ICON_SIZE = 22;

// SVG 아이콘 세트
const icons = {
  home: (active: boolean) => (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#ffd331" : "#b7b7b7"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9.5L12 3l9 6.5v11a1 1 0 0 1-1 1h-6v-6H10v6H4a1 1 0 0 1-1-1v-11z" />
    </svg>
  ),
  class: (active: boolean) => (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#ffd331" : "#b7b7b7"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
    </svg>
  ),
  notice: (active: boolean) => (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#ffd331" : "#b7b7b7"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22v-6m0 0c-4.418 0-8-3.582-8-8V5l8-3 8 3v3c0 4.418-3.582 8-8 8z" />
    </svg>
  ),
  vod: (active: boolean) => (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#ffd331" : "#b7b7b7"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  my: (active: boolean) => (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#ffd331" : "#b7b7b7"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
    </svg>
  ),
};

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();

  const path = location.pathname;

  if (!role) return null;

  // 역할별 메뉴 구성
  const menus =
    role === "admin"
      ? [
          { label: "홈", path: "/", icon: icons.home },
          { label: "관리", path: "/admin/my", icon: icons.class },
          { label: "My", path: "/admin/my", icon: icons.my },
        ]
      : role === "student"
      ? [
          { label: "홈", path: "/", icon: icons.home },
          { label: "강의실", path: "/student/my", icon: icons.class },
          { label: "공지", path: "/student/notices", icon: icons.notice },
          { label: "My", path: "/student/my", icon: icons.my },
        ]
      : [
          { label: "홈", path: "/", icon: icons.home },
          { label: "VOD", path: "/vod/my", icon: icons.vod },
          { label: "My", path: "/vod/my", icon: icons.my },
        ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 68,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        background: "#ffffff",
        borderTop: "1px solid #eee",
        paddingBottom: "env(safe-area-inset-bottom)",
        zIndex: 9999,
      }}
    >
      {menus.map((m) => {
        const active = path === m.path;

        return (
          <div
            key={m.path}
            onClick={() => navigate(m.path)}
            style={{
              textAlign: "center",
              cursor: "pointer",
              color: active ? "#ffd331" : "#777",
            }}
          >
            <div>{m.icon(active)}</div>
            <div
              style={{
                fontSize: 12,
                marginTop: 4,
                fontWeight: active ? 700 : 400,
              }}
            >
              {m.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BottomNav;
