import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { openLoginModal } from "../lib/authModal";

type Props = {
  children: React.ReactNode;
  allow?: ("student" | "vod" | "admin")[];
};

const ProtectedRoute = ({ children, allow }: Props) => {
  const { user, role, loading } = useAuth();

  // localStorage fallback
  const storedRole =
    typeof window !== "undefined"
      ? (localStorage.getItem("role") as "student" | "vod" | "admin" | null)
      : null;

  const effectiveRole = role ?? storedRole;

  // 🔥 1) 로딩 중에는 아무것도 렌더링하거나 이동시키면 안 됨
  if (loading || role === undefined) {
    return null; // 👈 깜빡임 없애는 핵심
  }

  // 🔥 2) 로그인 안 된 경우 → 모달만 띄우고 이동은 한 번만 발생
  if (!user || !effectiveRole) {
    openLoginModal(null, "로그인이 필요한 서비스입니다.");
    return <Navigate to="/" replace />;
  }

  // 🔥 3) 역할 제한이 있는 페이지
  if (allow && !allow.includes(effectiveRole)) {
    // 안내 메시지 옵션
    if (effectiveRole === "student") {
      alert("해당 메뉴는 VOD 전용 서비스입니다.");
    }

    // 역할별 허용된 마이페이지로 이동
    if (effectiveRole === "admin") return <Navigate to="/admin/my" replace />;
    if (effectiveRole === "student") return <Navigate to="/student/my" replace />;
    if (effectiveRole === "vod") return <Navigate to="/vod/my" replace />;

    return <Navigate to="/" replace />;
  }

  // 🔥 4) 모든 조건 충족 → 정상 렌더링
  return <>{children}</>;
};

export default ProtectedRoute;
