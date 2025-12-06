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
      ? (localStorage.getItem("role") as "student" | "vod" | "admin" | null)
      : null;

  const effectiveRole = role ?? storedRole;

  // 1) 세션 로딩 중일 때는 아무것도 렌더링하거나 이동시키면 안 됨
  if (loading || role === undefined) return null;

  // ⭐ 2) allow가 없으면 보호하지 않음 → 그대로 통과
  if (!allow) {
    return <>{children}</>;
  }

  // ⭐ 3) allow가 있는 경우에만 로그인 체크
  if (!user || !effectiveRole) {
    openLoginModal(null, "로그인이 필요한 서비스입니다.");
    return <Navigate to="/" replace />;
  }

  // ⭐ 역할 제한 검사
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
