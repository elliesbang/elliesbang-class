import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useLogout } from "../hooks/useLogout";

const ICON_SIZE = 22;

const BellIcon = (active = true) => (
  <svg
    width={ICON_SIZE}
    height={ICON_SIZE}
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? "#404040" : "#b7b7b7"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const Header = ({ onLoginClick }: { onLoginClick: () => void }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const logout = useLogout();

  return (
    <>
      <div
        style={{
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderBottom: "1px solid #eee",
          background: "#ffffff",
          color: "#404040",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
        }}
      >
        {/* 왼쪽 로고 텍스트 */}
        <div
          onClick={() => navigate("/")}
          style={{
            fontSize: 18,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          엘리의방 클래스
        </div>

        {/* 오른쪽: 알림 + 로그인/로그아웃 */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>

          {/* 알림 아이콘 */}
          {user && (
            <button
              onClick={() => navigate("/notifications")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {BellIcon(true)}
            </button>
          )}

          {/* 로그인 / 로그아웃 버튼 */}
          {!user ? (
            <button
              onClick={onLoginClick}
              style={{
                background: "#ffd331",
                border: "none",
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              로그인
            </button>
          ) : (
            <button
              onClick={logout}
              style={{
                background: "#ffd331",
                border: "none",
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              로그아웃
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
