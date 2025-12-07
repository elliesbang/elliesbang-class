import { ReactNode, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { LogOut, Home, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  children: ReactNode;
};

export default function AdminLayout({ children }: Props) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth/login");
  };

  return (
    <div className="admin-page min-h-screen bg-[#fffdf6] text-[#404040]">
      <div className="flex flex-col md:flex-row min-h-screen relative">
        {/* 좌측 사이드바 */}
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* 오버레이 */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* 우측 메인 영역 */}
        <div className="flex flex-col flex-1 md:ml-64">
          {/* ---------------- 관리자 헤더 ---------------- */}
          <header className="fixed top-0 left-0 right-0 md:left-64 h-14 md:h-16 border-b bg-white flex items-center justify-between px-4 md:px-6 z-30">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                className="md:hidden p-2 rounded-lg hover:bg-[#f3efe4] transition"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="사이드바 열기"
              >
                <Menu size={20} />
              </button>

              {/* Left: title */}
              <h2 className="text-base md:text-lg font-semibold text-[#404040] whitespace-nowrap overflow-hidden text-ellipsis">
                <span className="md:hidden">관리자 페이지</span>
                <span className="hidden md:inline">엘리의방 클래스 관리자</span>
              </h2>
            </div>

            {/* Right: 홈 → 로그아웃 */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* 홈 버튼 */}
              <button
                onClick={() => navigate("/")}
                className="p-2 rounded-full hover:bg-[#f3efe4] transition"
                aria-label="사용자 홈"
              >
                <Home size={20} className="text-[#404040]" />
              </button>

              {/* 로그아웃 */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#f8f5e9] hover:bg-[#f3efe4] text-[#404040] rounded-lg text-sm whitespace-nowrap transition"
              >
                <LogOut size={16} />
                로그아웃
              </button>
            </div>
          </header>
          {/* ------------------------------------------------ */}

          {/* 메인 컨텐츠 */}
          <main className="relative z-0 flex-1 overflow-y-auto w-full max-w-screen-xl mx-auto px-4 md:px-8 lg:px-10 pb-6 pt-16 md:pt-20">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
