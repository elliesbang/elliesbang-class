import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();

  // 현재 경로로 활성 탭 표시
  const current = location.pathname;

  // 역할별 메뉴 구성
  const menus =
    role === "admin"
      ? [
          { label: "홈", path: "/" },
          { label: "관리", path: "/admin/my" },
          { label: "My", path: "/admin/my" },
        ]
      : role === "student"
      ? [
          { label: "홈", path: "/" },
          { label: "강의실", path: "/student/my" },
          { label: "공지", path: "/student/notices" },
          { label: "My", path: "/student/my" },
        ]
      : role === "vod"
      ? [
          { label: "홈", path: "/" },
          { label: "VOD", path: "/vod/my" },
          { label: "My", path: "/vod/my" },
        ]
      : [];

  // 로그인 안 되었으면 하단 네비 숨김
  if (!role) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        borderTop: "1px solid #ddd",
        background: "#fff",
        zIndex: 999,
      }}
    >
      {menus.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          style={{
            background: "none",
            border: "none",
            fontSize: 14,
            color: current === item.path ? "#000" : "#777",
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default BottomNav;
