import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";

// 인증 페이지
import RoleSelect from "./pages/auth/RoleSelect";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// 역할별 홈
import AdminMy from "./pages/admin/AdminMy";
import StudentMy from "./pages/student/StudentMy";
import VodMy from "./pages/vod/VodMy";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ----------- AUTH ----------- */}

          {/* 역할 선택 */}
          <Route path="/auth/role" element={<RoleSelect />} />

          {/* 로그인 페이지 */}
          {/* 로그인된 상태에서는 접근 불가 → 자동 redirect */}
          <Route
            path="/auth/login"
            element={
              <ProtectedRoute allow={["admin", "student", "vod"]}>
                <Login />
              </ProtectedRoute>
            }
          />

          {/* 회원가입 페이지 (로그인 상태면 접근 불가) */}
          <Route
            path="/auth/signup"
            element={
              <ProtectedRoute allow={["admin", "student", "vod"]}>
                <Signup />
              </ProtectedRoute>
            }
          />

          {/* ----------- ADMIN ----------- */}

          <Route
            path="/admin/my"
            element={
              <ProtectedRoute allow={["admin"]}>
                <AdminMy />
              </ProtectedRoute>
            }
          />

          {/* ----------- STUDENT ----------- */}

          <Route
            path="/student/my"
            element={
              <ProtectedRoute allow={["student"]}>
                <StudentMy />
              </ProtectedRoute>
            }
          />

          {/* ----------- VOD ----------- */}

          <Route
            path="/vod/my"
            element={
              <ProtectedRoute allow={["vod"]}>
                <VodMy />
              </ProtectedRoute>
            }
          />

          {/* 기본 루트 → 역할 선택 */}
          <Route path="/" element={<RoleSelect />} />
        </Routes>
        
{/* ---- 하단 내비: 로그인한 경우에만 표시 ---- */}
          <BottomNav />
        </>
       </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
