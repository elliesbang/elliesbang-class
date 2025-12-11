import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { openLoginModal } from "../lib/authModal";

type Props = {
  children: React.ReactNode;
  allow?: ("student" | "vod" | "admin")[];
};

const ProtectedRoute = ({ children, allow }: Props) => {
  const { user, role, loading } = useAuth();
  const [storedRole, setStoredRole] =
    useState<"student" | "vod" | "admin" | null>(null);
  const [roleReady, setRoleReady] = useState(false);

  const location = useLocation();

  // 🔥 마이탭 경로인지 체크
  const isMyTab =
    location.pathname.startsWith("/my") ||
    location.pathname.startsWith("/student/my") ||
    location.pathname.startsWith("/vod/my") ||
    location.pathname.startsWith("/admin/my");

  // 1) 로컬스토리지에서 role 불러오기
  useEffect(() => {
    if (typeof window === "undefined") {
      setRoleReady(true);
      return;
    }

    try {
      const raw = window.localStorage.getItem("role");
      if (raw === "student" || raw === "vod" || raw === "admin") {
        setStoredRole(raw);
      }
    } catch (err) {
      console.error("ProtectedRoute storage error:", err);
      setStoredRole(null);
    } finally {
      setRoleReady(true);
    }
  }, []);

  const effectiveRole = role ?? storedRole;

  // 로딩 중에는 렌더링 x
  if (loading || !roleReady) return null;

  // ------------------------------------------------------------------------
  // 🔥 1) 마이탭 보호 처리 (로그인 필수)
  // ------------------------------------------------------------------------
  if (isMyTab) {
    if (!user) {
      try {
        openLoginModal(null, "로그인이 필요한 서비스입니다.");
      } catch (err) {
        console.error("openLoginModal error:", err);
      }
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  }

  // ------------------------------------------------------------------------
  // 🔥 2) 마이탭이 아닌 경우 → 완전한 공개 페이지로 처리
  //     allow, role, user 모두 무시하고 그대로 children 렌더링
  // ------------------------------------------------------------------------
  return <>{children}</>;
};

export default ProtectedRoute;