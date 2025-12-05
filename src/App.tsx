import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";

// Auth Pages
import RoleSelect from "./pages/auth/RoleSelect";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// My Pages (역할별)
import AdminMy from "./pages/admin/AdminMy";
import StudentMy from "./pages/student/StudentMy";
import VodMy from "./pages/vod/VodMy";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* 역할 선택 / 로그인 / 회원가입 */}
          <Route path="/auth/role" element={<RoleSelect />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />

          {/* 관리자 마이 */}
          <Route
            path="/admin/my"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminMy />
              </ProtectedRoute>
            }
          />

          {/* 수강생 마이 */}
          <Route
            path="/student/my"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentMy />
              </ProtectedRoute>
            }
          />

          {/* VOD 마이 */}
          <Route
            path="/vod/my"
            element={
              <ProtectedRoute allowedRoles={["vod"]}>
                <VodMy />
              </ProtectedRoute>
            }
          />

          {/* 기본 경로 → 역할 선택으로 보내기 */}
          <Route path="*" element={<RoleSelect />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
