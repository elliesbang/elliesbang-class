import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { useLogout } from "../../hooks/useLogout";
import { supabase } from "../../lib/supabaseClient";

type MenuItem = {
  label: string;
  path: string;
  meta?: string;
};

const VodMy = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const logout = useLogout();
  const [purchaseCount, setPurchaseCount] = useState(0);

  const displayName = useMemo(
    () => user?.user_metadata?.name || user?.email || "VOD 회원",
    [user]
  );

  const displayEmail = useMemo(
    () => user?.email || user?.user_metadata?.email || "이메일 정보 없음",
    [user]
  );

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("vod_purchases")
        .select("id")
        .eq("user_id", user.id);

      if (error) {
        console.error("VOD 구매내역 불러오기 실패", error);
        return;
      }

      setPurchaseCount((data ?? []).length);
    };

    fetchPurchases();
  }, [user]);

  const menuItems: MenuItem[] = [
    {
      label: "구매한 VOD 리스트 보기",
      path: "/vod/list",
      meta: purchaseCount ? `${purchaseCount}개` : "내역 없음",
    },
    { label: "내 알림 보기", path: "/user-notifications" },
  ];

  return (
    <div className="pt-20 max-w-xl mx-auto px-4">
      <div className="rounded-2xl bg-white shadow-sm border border-[#f1f1f1] p-5 flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-[#fff3e6] flex items-center justify-center text-lg font-bold text-[#f97316]">
          {displayName?.[0] ?? "V"}
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
            <span className="text-sm text-[#9ca3af]">{item.meta ?? ">"}</span>
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

export default VodMy;
