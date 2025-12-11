import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { openLoginModal } from "../lib/authModal";

type Props = {
  children: React.ReactNode;
  allow?: ("student" | "vod" | "admin")[];
};

const ProtectedRoute = ({ children, allow }: Props) => {
  const { user, role, loading } = useAuth();
  const [storedRole, setStoredRole] = useState<"student" | "vod" | "admin" | null>(null);
  const [roleReady, setRoleReady] = useState(false);

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

  // 1) 세션 로딩 중이면 아무것도 렌더링하지 않음 (스켈레톤을 쓰고 싶으면 여기서 교체)
  if (loading || !roleReady) return null;

  // 2) allow가 없으면 보호하지 않음 → 그냥 통과
  if (!allow) {
    return <>{children}</>;
  }

  // 3) 로그인 필요 + 역할 필요
  if (!user || !effectiveRole) {
    // ❗ 렌더 중에 모달 여는 것도 약간 위험하긴 하지만, 지금 구조에 맞춰 유지
    try {
      openLoginModal(null, "로그인이 필요한 서비스입니다.");
    } catch (err) {
      console.error("openLoginModal error:", err);
    }
    return <Navigate to="/" replace />;
  }

  // 4) 허용된 역할이 아닌 경우
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
