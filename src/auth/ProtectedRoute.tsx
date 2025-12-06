import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { openLoginModal } from "../lib/authModal";

type Props = {
  children: React.ReactNode;
  allow?: ("student" | "vod" | "admin")[];
};

const ProtectedRoute = ({ children, allow }: Props) => {
  const { user, role, loading } = useAuth();
  const storedRole =
    typeof window !== "undefined"
      ? (window.localStorage.getItem("role") as "student" | "vod" | "admin" | null)
      : null;
  const effectiveRole = role ?? storedRole;

  // 아직 세션 확인 중이면 화면 깜빡임 방지
  if (loading) {
    return <div>Loading...</div>;
  }

  // 로그인 안 된 경우 → 로그인 화면으로 이동
  if (!user || !effectiveRole) {
    openLoginModal(null, "로그인이 필요한 서비스입니다.");
    return <Navigate to="/" replace />;
  }

  // 특정 역할만 접근 가능한 페이지라면 체크
  if (allow && !allow.includes(effectiveRole as any)) {
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
