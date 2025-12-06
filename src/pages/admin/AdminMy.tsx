import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { useLogout } from "../../hooks/useLogout";

const AdminMy = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const logout = useLogout();

  const displayName = useMemo(
    () => user?.user_metadata?.name || user?.email || "관리자",
    [user]
  );

  const displayEmail = useMemo(
    () => user?.email || user?.user_metadata?.email || "이메일 정보 없음",
    [user]
  );

  const menuItems = [
    { label: "강의실 관리", path: "/admin/classroom/videos" },
    { label: "유저 관리", path: "/admin/users/students" },
    { label: "VOD 관리", path: "/admin/vod" },
    { label: "전체 공지 관리", path: "/admin/notices" },
  ];

  return (
    <div className="pt-20 max-w-xl mx-auto px-4">
      <div className="rounded-2xl bg-white shadow-sm border border-[#f1f1f1] p-5 flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-[#fff3e6] flex items-center justify-center text-lg font-bold text-[#f97316]">
          {displayName?.[0] ?? "A"}
        </div>
        <div>
          <p className="text-lg font-semibold text-[#404040]">{displayName}</p>
          <p className="text-sm text-[#9ca3af]">{displayEmail}</p>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-full rounded-2xl bg-white shadow-sm border border-[#f1f1f1] px-4 py-4 text-base text-[#404040] mb-3 flex justify-between items-center"
          >
            <span>{item.label}</span>
            <span className="text-[#9ca3af]">&gt;</span>
          </button>
        ))}
      </div>

      <button
        onClick={logout}
        className="w-full text-center text-red-500 font-semibold mt-10"
      >
        로그아웃
      </button>
    </div>
  );
};

export default AdminMy;
