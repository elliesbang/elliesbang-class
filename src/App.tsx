// 파일 상단에 추가
import ClassroomCategoryPage from "./page/student/ClassroomCategoryPage";
import ClassroomDetailPage from "./page/student/ClassroomDetailPage";

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";

// 인증 페이지
import RoleSelect from "./page/auth/RoleSelect";
import Login from "./page/auth/Login";
import Signup from "./page/auth/Signup";

// 역할별 마이
import AdminMy from "./page/admin/AdminMy";
import StudentMy from "./page/student/StudentMy";
import VodMy from "./page/vod/VodMy";

// 홈 & VOD 페이지
import Home from "./page/Home";
import VodList from "./page/vod/VodList";
import VodDetail from "./page/vod/VodDetail";

// 관리자 대시보드 레이아웃 및 페이지
import AdminLayout from "./components/admin/AdminLayout";
import AdminHome from "./page/admin/AdminHome";

import ClassroomVideos from "./page/admin/classroom/ClassroomVideos";
import ClassroomMaterials from "./page/admin/classroom/ClassroomMaterials";
import ClassroomNotices from "./page/admin/classroom/ClassroomNotices";

import AssignmentList from "./page/admin/AssignmentList";
import FeedbackPage from "./page/admin/FeedbackPage";

import GlobalNotices from "./page/admin/notices/GlobalNotices";
import VodManager from "./page/admin/vod/VodManager";

// ⭐ 기존 UserManage 삭제, 학생/VOD 파일 사용
import StudentUsers from "./page/admin/users/StudentUsers";
import VodUsers from "./page/admin/users/VodUsers";

import ClassManager from "./page/admin/class/ClassManager";

// 공통 컴포넌트
import BottomNav from "./components/BottomNav";
import Header from "./components/Header";
import Notifications from "./page/notifications/Notifications";


// ===========================================================
// ⭐ BottomNav 조건부 렌더링을 위한 Wrapper
// ===========================================================
const AppContent = () => {
  const location = useLocation();
  const path = location.pathname;

  // auth 페이지에서는 BottomNav 숨김
  const hideBottomNav = path.startsWith("/auth");

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

          {/* ---------------- 홈 ---------------- */}
          <Route path="/home" element={<Home />} />

          {/* ---------------- VOD ---------------- */}
          <Route path="/vod/list" element={<VodList />} />
          <Route path="/vod/:id" element={<VodDetail />} />

          {/* ---------------- 관리자 마이 ---------------- */}
          <Route
            path="/admin/my"
            element={
              <ProtectedRoute allow={["admin"]}>
                <AdminMy />
              </ProtectedRoute>
            }
          />

          {/* ---------------- 학생 마이 + 강의실 ---------------- */}
          <Route
            path="/student/my"
            element={
              <ProtectedRoute allow={["student"]}>
                <StudentMy />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/classroom"
            element={
              <ProtectedRoute allow={["student", "admin"]}>
                <ClassroomCategoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/classroom/:categoryId"
            element={
              <ProtectedRoute allow={["student", "admin"]}>
                <ClassroomDetailPage />
              </ProtectedRoute>
            }
          />

          {/* ---------------- VOD USER 마이 ---------------- */}
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
          {/*                  ⭐ 관리자 대시보드 ⭐                */}
          {/* ===================================================== */}

          {/* 관리자 홈 */}
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

          {/* --- 전체 공지 관리 --- */}
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

          {/* --- 사용자 관리(학생) --- */}
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

          {/* --- 사용자 관리(VOD) --- */}
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

      {/* auth에서는 숨기고 그 외에는 항상 노출 */}
      {!hideBottomNav && <BottomNav />}
    </>
  );
};


// ===========================================================
// ⭐ BrowserRouter + AuthProvider 래핑한 최종 App
// ===========================================================
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
