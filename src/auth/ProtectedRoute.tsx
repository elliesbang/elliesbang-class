import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

type Props = {
  children: React.ReactNode;
  allowedRoles?: ("student" | "vod" | "admin")[];
};

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { user, role, loading } = useAuth();

  // 인증/역할 로딩 중일 때 화면 깜빡임 방지
  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  // 로그인 안됨 → 역할 선택 페이지로 이동
  if (!user || !role) {
    return <Navigate to="/auth/role" replace />;
  }

  // 역할 제한이 있는 페이지라면 역할 검사
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/auth/role" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
(코드 끝)
