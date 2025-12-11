import ClassroomHome from "./pages/classroom/ClassroomHome";
import ClassroomDetail from "./pages/classroom/ClassroomDetail";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";
import AdminMy from "./pages/admin/AdminMy";
import StudentMy from "./pages/student/StudentMy";
import VodMy from "./pages/vod/VodMy";
import Home from "./pages/Home";
import VodHome from "./pages/vod/VodHome";
import VodDetail from "./pages/vod/VodDetail";
import VodCategoryPage from "./pages/vod/VodCategoryPage";
import VodTopicPage from "./pages/vod/VodTopicPage";
import VodVideoListPage from "./pages/vod/VodVideoListPage";
import AdminLayout from "./components/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import ClassroomVideos from "./pages/admin/classroom/ClassroomVideos";
import ClassroomMaterials from "./pages/admin/classroom/ClassroomMaterials";
import ClassroomNotices from "./pages/admin/classroom/ClassroomNotices";
import AssignmentList from "./pages/admin/AssignmentList";
import GlobalNotices from "./pages/admin/notices/GlobalNotices";
import VodManager from "./pages/admin/vod/VodManager";
import UserManage from "./pages/admin/users/UserManage";
import StudentUsers from "./pages/admin/users/StudentUsers";
import VodUsers from "./pages/admin/users/VodUsers";
import ClassManager from "./pages/admin/class/ClassManager";
import ClassroomCreate from "./pages/admin/classroom/ClassroomCreate";
import BottomNav from "./components/BottomNav";
import Header from "./components/Header";
import Notifications from "./pages/notifications/Notifications";
import Notices from "./pages/notices/Notices";
import UserNotifications from "./pages/userNotifications/UserNotifications";
import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModal";
import { AuthModalDetail, openLoginModal } from "./lib/authModal";

const LoginPage = () => {
  useEffect(() => {
    openLoginModal(null, "로그인이 필요한 서비스입니다.");
  }, []);

  return <Home />;
};

const MyPage = () => {
  const { role, loading } = useAuth(); // loading 여부 반드시 가져오기

  // 1) role이 아직 로딩 중이면 아무것도 렌더하지 않기
  if (loading) return null;

  // 2) role 결정 후 처리
  if (role === "admin") return <AdminMy />;
  if (role === "student") return <StudentMy />;
  if (role === "vod") return <VodMy />;

  return <Navigate to="/" replace />;
};

const AppContent = () => {
  const [modalMode, setModalMode] = useState<null | "login" | "signup">(null);
  const [selectedRole, setSelectedRole] = useState<"student" | "vod" | "admin" | null>(null);
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

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
      {!isAdminRoute && <Header onLoginClick={() => setModalMode("login")} />}

      <div className="min-h-screen pt-16 pb-20 bg-[#fffdf6]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/vod" element={<VodHome />} />
          <Route path="/vod/category/:categoryId" element={<VodCategoryPage />} />
          <Route path="/vod/category/:categoryId/topics" element={<VodTopicPage />} />
          <Route path="/vod/topics/:topicId/videos" element={<VodVideoListPage />} />
          <Route path="/vod/video/:videoId" element={<VodDetail />} />

          <Route path="/classroom" element={<ClassroomHome />} />
          <Route path="/classroom/:classroomId" element={<ClassroomDetail />} />

          <Route path="/notices" element={<Notices />} />

          <Route
            path="/my"
            element={
              <ProtectedRoute allow={["admin", "student", "vod"]}>
                <MyPage />
              </ProtectedRoute>
            }
          />

          <Route path="/notifications" element={<Notifications />} />
          <Route
            path="/user-notifications"
            element={
              <ProtectedRoute allow={["admin", "student", "vod"]}>
                <UserNotifications />
              </ProtectedRoute>
            }
          />

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
            path="/admin/my"
            element={
              <ProtectedRoute allow={["admin"]}>
                <AdminLayout>
                  <AdminMy />
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
            path="/admin/classroom/create"
            element={
              <ProtectedRoute allow={["admin"]}>
                <AdminLayout>
                  <ClassroomCreate />
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
