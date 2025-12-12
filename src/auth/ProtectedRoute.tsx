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

  // 🔥 홈("/")은 항상 즉시 렌더 → 빈 화면 방지
  if (location.pathname === "/") {
    return <>{children}</>;
  }

  // role 불러오기
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

  // 초기 로딩 중엔 잠시 렌더링 안함
  if (loading || !roleReady) return null;

  // ------------------------------------------------------------------------
  // 🔥 1) 마이탭 보호 처리 (로그인 필수)
  // ------------------------------------------------------------------------
 // ✅ 수정된 안전한 코드
if (isMyTab) {
  if (!user) {
    try {
      openLoginModal(null, "로그인이 필요한 서비스입니다.");
    } catch (err) {
      console.error("openLoginModal error:", err);
    }

    // ✅ 마이탭을 redirect로 막지 않음
    //    children을 그대로 렌더링하여 페이지는 항상 접근 가능
    return <>{children}</>;
  }

  return <>{children}</>;
}

  // ------------------------------------------------------------------------
  // 🔥 2) 마이탭이 아닌 경우 → 로그인 여부와 관계없이 공개
  // ------------------------------------------------------------------------
  return <>{children}</>;
};

export default ProtectedRoute;
