import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../auth/AuthProvider";
import { UserNotification } from "@/types/UserNotification";

const UserNotifications = () => {
  const { user } = useAuth();
  const [list, setList] = useState<UserNotification[]>([]);

  useEffect(() => {
    if (!user) {
      setList([]);
      return;
    }

    void fetchNotifications(user.id);
  }, [user]);

  const fetchNotifications = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("사용자 알림 불러오기 실패", error);
      setList([]);
      return;
    }

    setList((data ?? []) as UserNotification[]);
  };

  const markAsRead = async (id: string) => {
    const target = list.find((n) => n.id === id);
    if (!target || target.is_read) return;

    const { error } = await supabase
      .from("user_notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      console.error("알림 읽음 처리 실패", error);
      return;
    }

    setList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  return (
    <div className="min-h-screen bg-[#fffdf6]">
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-6">
        <h2 className="mb-4 text-lg font-bold text-[#404040]">알림</h2>

        {list.length === 0 && (
          <p className="text-sm text-gray-500">알림이 없습니다.</p>
        )}

        <div className="space-y-3">
          {list.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => markAsRead(n.id)}
              className={`w-full rounded-lg border p-4 text-left shadow-sm transition ${
                n.is_read
                  ? "bg-[#F5F5F5] border-[#DDD]"
                  : "bg-[#FFF8D3] border-[#FFCE00]"
              }`}
            >
              <p className={`text-base ${n.is_read ? "font-medium" : "font-semibold"}`}>
                {n.title}
              </p>
              <p className="mt-1 text-sm text-[#7a6f68]">{n.message ?? ""}</p>
              <p className="mt-2 text-xs text-gray-400">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserNotifications;
