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

  // 🔹 마이탭 경로인지 체크
  const isMyTab = location.pathname.startsWith("/my");

  // 🔹 홈("/")은 항상 공개
  if (location.pathname === "/") {
    return <>{children}</>;
  }

  // 🔹 로컬스토리지에서 role 복구
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

  // auth/role 아직 준비 안 됐으면 렌더링 지연
  if (loading || !roleReady) return null;

  // ------------------------------------------------------------------
  // 1) 마이탭 보호: 로그인 필수, 모달만 띄우고 화면은 비움
  // ------------------------------------------------------------------
  if (isMyTab) {
    if (!user) {
      try {
        openLoginModal(null, "로그인이 필요한 서비스입니다.");
      } catch (err) {
        console.error("openLoginModal error:", err);
      }
      // 주소는 /my 그대로 두고, 로그인 후 다시 렌더되게 비워 둠
      return null;
    }
    // 로그인되어 있으면 그대로 children 렌더
    return <>{children}</>;
  }

  // ------------------------------------------------------------------
  // 2) 마이탭이 아닌 보호 라우트: allow 로 role 체크
  // ------------------------------------------------------------------
  if (allow && allow.length > 0) {
    // 로그인 안 된 경우 → 로그인 모달 띄우고 홈으로 보냄
    if (!user) {
      try {
        openLoginModal(null, "로그인이 필요한 서비스입니다.");
      } catch (err) {
        console.error("openLoginModal error:", err);
      }
      return <Navigate to="/" replace />;
    }

    // role 이 allow에 없으면 접근 불가
    if (!effectiveRole || !allow.includes(effectiveRole)) {
      return <Navigate to="/" replace />;
    }
  }

  // ------------------------------------------------------------------
  // 3) 공개 라우트: 그냥 통과
  // ------------------------------------------------------------------
  return <>{children}</>;
};

export default ProtectedRoute;
