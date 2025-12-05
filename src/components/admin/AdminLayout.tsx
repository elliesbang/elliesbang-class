import { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  children: ReactNode;
};

export default function AdminLayout({ children }: Props) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#fffdf6]">
      {/* ------- 좌측 사이드바 ------- */}
      <AdminSidebar />

      {/* ------- 우측 영역 ------- */}
      <div className="flex flex-col flex-1">
        {/* ------- 상단 헤더 ------- */}
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-40">
          {/* Left: Title */}
          <h2 className="text-lg font-semibold text-[#404040]">
            엘리의방 클래스 관리자
          </h2>

          {/* Right: 알림 + 로그아웃 */}
          <div className="flex items-center gap-4">
            {/* 알림 아이콘 */}
            <button
              onClick={() => navigate("/notifications")}
              className="relative p-2 rounded-full hover:bg-[#f3efe4] transition"
            >
              <Bell size={20} className="text-[#404040]" />
              {/* 읽지 않은 알림 표시 (추후 API 연동) */}
              {/* <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">3</span> */}
            </button>

            {/* 로그아웃 */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#f8f5e9] hover:bg-[#f3efe4] text-[#404040] rounded-lg text-sm transition"
            >
              <LogOut size={16} />
              로그아웃
            </button>
          </div>
        </header>

        {/* ------- 메인 컨텐츠 영역 ------- */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
