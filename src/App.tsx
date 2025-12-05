import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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

// 관리자 대시보드 레이아웃 및 페이지
import AdminLayout from "./components/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";

import ClassroomVideos from "./pages/admin/classroom/ClassroomVideos";
import ClassroomMaterials from "./pages/admin/classroom/ClassroomMaterials";
import ClassroomNotices from "./pages/admin/classroom/ClassroomNotices";

import AssignmentList from "./pages/admin/assignments/AssignmentList";
import FeedbackPage from "./pages/admin/assignments/FeedbackPage";

import GlobalNotices from "./pages/admin/notices/GlobalNotices";
import VodManager from "./pages/admin/vod/VodManager";

import StudentUsers from "./pages/admin/users/StudentUsers";
import VodUsers from "./pages/admin/users/VodUsers";

import ClassManager from "./pages/admin/classes/ClassManager";

// 공통 컴포넌트
import BottomNav from "./components/BottomNav";
import Header from "./components/Header";
import Notifications from "./pages/Notifications";


// -----------------------------------------------
// ⭐ BottomNav 조건부 렌더링을 위한 Wrapper 생성
// -----------------------------------------------
const AppContent = () => {
  const location = useLocation();
  const path = location.pathname;

  // 관리자 페이지 전체는 네비 숨김
  // 단, 관리자 홈(/admin/my)에서는 네비 보여야 함
  const hideBottomNav =
    path.startsWith("/admin") && path !== "/admin/my";

  return (
    <>
      {/* 상단 고정 헤더 */}
      <Header />

      {/* 본문 영역 여백 */}
      <div style={{ paddingTop: 60 }}>
        <Routes>

          {/* ---------------- AUTH ---------------- */}
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

          {/* ---------------- ADMIN (개인 홈) ---------------- */}
          <Route
            path="/admin/my"
            element={
              <ProtectedRoute allow={["admin"]}>
                <AdminMy />
              </ProtectedRoute>
            }
          />

          {/* ---------------- STUDENT ---------------- */}
          <Route
            path="/student/my"
            element={
              <ProtectedRoute allow={["student"]}>
                <StudentMy />
              </ProtectedRoute>
            }
          />

          {/* ---------------- VOD ---------------- */}
          <Route
            path="/vod/my"
            element={
              <ProtectedRoute allow={["vod"]}>
                <VodMy />
              </ProtectedRoute>
            }
          />

          {/* ---------------- 공용 알림 ---------------- */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allow={["admin", "student", "vod"]}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* ===================================================== */}
          {/*          ⭐⭐ 관리자 대시보드 라우팅 시작 ⭐⭐          */}
          {/* ===================================================== */}

          {/* 관리자 대시보드 메인 */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allow={["admin"]}>
                <AdminLayout>
                  <AdminHome />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* --- 강의실 관리 --- */}
          <Route
            path="/admin/classroom/videos"
            element={
              <ProtectedRoute allow={["admin"]}>
                <AdminLayout>
                  <ClassroomVideos />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/classroom/materials"
            element={
              <ProtectedRoute allow={["admin"]}>
                <AdminLayout>
                  <ClassroomMaterials />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/classroom/notices"
            element={
              <ProtectedRoute allow={["admin"]}>
                <AdminLayout>
                  <ClassroomNotices />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* --- 과제 & 피드백 --- */}
          <Route
            path="/admin/assignments"
            element={
              <ProtectedRoute allow={["admin"]}>
                <AdminLayout>
                  <AssignmentList />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/feedback"
            element={
              <ProtectedRoute allow={["admin"]}>
                <AdminLayout>
                  <FeedbackPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* --- 전체 공지 --- */}
          <Route
            path="/admin/notices"
            element={
              <ProtectedRoute allow={["admin"]}>
                <AdminLayout>
                  <GlobalNotices />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* --- VOD 관리 --- */}
          <Route
            path="/admin/vod"
            element={
              <ProtectedRoute allow={["admin"]}>
                <AdminLayout>
                  <VodManager />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* --- 사용자 관리 --- */}
          <Route
            path="/admin/users/students"
            element={
              <ProtectedRoute allow={["admin"]}>
                <AdminLayout>
                  <StudentUsers />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users/vod"
            element={
              <ProtectedRoute allow={["admin"]}>
                <AdminLayout>
                  <VodUsers />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* --- 수업 관리 --- */}
          <Route
            path="/admin/classes"
            element={
              <ProtectedRoute allow={["admin"]}>
                <AdminLayout>
                  <ClassManager />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* ---------------- ROOT ---------------- */}
          <Route path="/" element={<RoleSelect />} />

        </Routes>
      </div>

      {/* 관리자 대시보드에서는 숨기고 /admin/my에서는 보여줌 */}
      {!hideBottomNav && <BottomNav />}
    </>
  );
};


// -----------------------------------------------
// ⭐ BrowserRouter + AuthProvider 래핑한 최종 App
// -----------------------------------------------
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
