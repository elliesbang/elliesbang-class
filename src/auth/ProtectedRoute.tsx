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

  if (loading || !roleReady) return null;

  // 🔥🔥 1) 마이탭은 모든 역할이 접근 가능 (권한 제한 없음)
  if (isMyTab) {
    // 로그인 안 됨 → 로그인 필요
    if (!user) {
      try {
        openLoginModal(null, "로그인이 필요한 서비스입니다.");
      } catch (err) {
        console.error("openLoginModal error:", err);
      }
      return <Navigate to="/" replace />;
    }

    // 로그인 OK → 그냥 children 렌더링
    return <>{children}</>;
  }

  // 🔥🔥 2) allow 없으면 그냥 통과
  if (!allow) {
    return <>{children}</>;
  }

  // 🔥🔥 3) 로그인 필요
  if (!user || !effectiveRole) {
    try {
      openLoginModal(null, "로그인이 필요한 서비스입니다.");
    } catch (err) {
      console.error("openLoginModal error:", err);
    }
    return <Navigate to="/" replace />;
  }

  // 🔥🔥 4) 역할 불일치
  if (!allow.includes(effectiveRole)) {
    if (effectiveRole === "student") {
      alert("해당 메뉴는 VOD 전용 서비스입니다.");
    }

    if (effectiveRole === "admin") return <Navigate to="/admin/my" replace />;
    if (effectiveRole === "student") return <Navigate to="/student/my" replace />;
    if (effectiveRole === "vod") return <Navigate to="/vod/my" replace />;

    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;