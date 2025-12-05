import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

type Props = {
  children: React.ReactNode;
  allow?: ("student" | "vod" | "admin")[];
};

const ProtectedRoute = ({ children, allow }: Props) => {
  const { user, role, loading } = useAuth();

  // 아직 세션 확인 중이면 화면 깜빡임 방지
  if (loading) {
    return <div>Loading...</div>;
  }

  // 로그인 안 된 경우 → 로그인 화면으로 이동
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // 특정 역할만 접근 가능한 페이지라면 체크
  if (allow && !allow.includes(role as any)) {
    // 역할이 맞지 않으면 해당 역할의 홈으로 보내기
    if (role === "admin") return <Navigate to="/admin/my" replace />;
    if (role === "student") return <Navigate to="/student/my" replace />;
    if (role === "vod") return <Navigate to="/vod/my" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
