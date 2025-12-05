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

// 공통 컴포넌트
import BottomNav from "./components/BottomNav";
import Header from "./components/Header";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <>
          {/* ------------------------------ */}
          {/* ⭐⭐ 여기! Routes보다 위에 두는 것 ⭐⭐ */}
          <Header />
          {/* ------------------------------ */}

          {/* 본문이 헤더에 가리지 않도록 패딩 추가 */}
          <div style={{ paddingTop: 60 }}>
            <Routes>

              {/* ----------- AUTH ----------- */}

              <Route path="/auth/role" element={<RoleSelect />} />

              <Route
                path="/auth/login"
                element={
                  <ProtectedRoute allow={["admin", "student", "vod"]}>
                    <Login />
                  </ProtectedRoute>
                }
              />

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

              {/* 기본 루트 */}
              <Route path="/" element={<RoleSelect />} />

            </Routes>
          </div>

          {/* 하단 네비게이션 */}
          <BottomNav />

        </>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
