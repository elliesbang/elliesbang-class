// 파일 상단에 추가
import ClassroomCategoryPage from "./pages/student/ClassroomCategoryPage";
import ClassroomDetailPage from "./pages/student/ClassroomDetailPage";

import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";

// 역할별 마이페이지
import AdminMy from "./pages/admin/AdminMy";
import StudentMy from "./pages/student/StudentMy";
import VodMy from "./pages/vod/VodMy";

// 홈 & VOD 페이지
import Home from "./pages/Home";
import VodHome from "./pages/vod/VodHome";
import VodDetail from "./pages/vod/VodDetail";
import VodProgramPage from "./pages/vod/VodProgram";
import VodTopic from "./pages/vod/VodTopic";



// 관리자 대시보드 페이지
import AdminLayout from "./components/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";

import ClassroomVideos from "./pages/admin/classroom/ClassroomVideos";
import ClassroomMaterials from "./pages/admin/classroom/ClassroomMaterials";
import ClassroomNotices from "./pages/admin/classroom/ClassroomNotices";

import AssignmentList from "./pages/admin/AssignmentList";

import GlobalNotices from "./pages/admin/notices/GlobalNotices";
import VodManager from "./pages/admin/vod/VodManager";

import UserManage from "./pages/admin/users/UserManage";

import ClassManager from "./pages/admin/class/ClassManager";

// 공통 컴포넌트
import BottomNav from "./components/BottomNav";
import Header from "./components/Header";
import Notifications from "./pages/notifications/Notifications";
import UserNotifications from "./pages/userNotifications/UserNotifications";
import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModal";
import { AuthModalDetail } from "./lib/authModal";


// ===========================================================
// ⭐ BottomNav 조건부 렌더링 Wrapper
// ===========================================================
const AppContent = () => {
  const [modalMode, setModalMode] = useState<null | "login" | "signup">(null);
  const [selectedRole, setSelectedRole] = useState<
    "student" | "vod" | "admin" | null
  >(null);
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  // 외부에서 로그인/회원가입 모달을 열 수 있도록 이벤트 리스너 등록
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<AuthModalDetail>).detail;
      if (!detail) return;

      setModalMode(detail.mode);
      if (detail.role) setSelectedRole(detail.role);

      if (detail.message) {
        alert(detail.message);
      }
    };

    window.addEventListener("auth-modal", handler);
    return () => window.removeEventListener("auth-modal", handler);
  }, []);

  return (
    <>
      {/* 상단 고정 헤더 (관리자 페이지에서는 숨김) */}
      {!isAdminRoute && (
        <Header onLoginClick={() => setModalMode("login")} />
      )}

      {/* 본문 영역 여백 */}
      <div className="min-h-screen pt-16 pb-20 bg-[#fffdf6]">
        <Routes>

          {/* ---------------- 홈 ---------------- */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />

          {/* ---------------- VOD ---------------- */}

          {/* ✅ VOD 목록은 누구나 접근 가능 (ProtectedRoute 제거) */}
         <Route path="/vod" element={<VodHome />} />
<Route path="/vod/program/:programId" element={<VodProgramPage />} />
<Route path="/vod/topic/:topicId" element={<VodTopic />} />



          {/* ✅ VOD 영상 재생만 로그인 + 권한 필요 */}
         <Route
  path="/vod/video/:videoId"
  element={
    <ProtectedRoute allow={["admin", "vod"]}>
      <VodDetail />
    </ProtectedRoute>
  }
/>


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

          {/* ---------------- 공지 & 알림 ---------------- */}
          <Route path="/notifications" element={<Notifications />} />
          <Route
            path="/user-notifications"
            element={
              <ProtectedRoute allow={["admin", "student", "vod"]}>
                <UserNotifications />
              </ProtectedRoute>
            }
          />

          {/* ===================================================== */}
          {/*                  ⭐ 관리자 대시보드 ⭐                */}
          {/* ===================================================== */}

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
            path="/admin/notices"
            element={
              <ProtectedRoute allow={["admin"]}>
                <AdminLayout>
                  <GlobalNotices />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

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

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allow={["admin"]}>
                <AdminLayout>
                  <UserManage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

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

        </Routes>
      </div>

      {/* auth 라우트는 제거했으므로 항상 BottomNav 표시 (관리자 페이지 제외) */}
      {!isAdminRoute && <BottomNav />}

      {modalMode === "login" && (
        <LoginModal
          role={selectedRole}
          onClose={() => setModalMode(null)}
          onChangeMode={(mode) => setModalMode(mode)}
          onSelectRole={(role) => setSelectedRole(role)}
        />
      )}

      {modalMode === "signup" && (
        <SignupModal
          role={selectedRole}
          onClose={() => setModalMode(null)}
          onChangeMode={(mode) => setModalMode(mode)}
          onSelectRole={(role) => setSelectedRole(role)}
        />
      )}
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
