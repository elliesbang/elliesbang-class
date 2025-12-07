import { Megaphone } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Notification = {
  id: number;
  title: string;
  content: string | null;
  created_at: string;
};

const Notifications = () => {
  const [list, setList] = useState<Notification[]>([]);

  useEffect(() => {
    async function fetchNotifications() {
      const buildQuery = () =>
        supabase
          .from("notifications")
          .select("id, title, content, created_at, is_deleted")
          .order("created_at", { ascending: false });

      let { data, error } = await buildQuery().eq("is_deleted", false);

      if (error) {
        if (error.code === "42703" || error.message?.includes("is_deleted")) {
          ({ data, error } = await buildQuery());
        }

        if (error) {
          console.error("공지 불러오기 실패", error);
          setList([]);
          return;
        }
      }

      const filtered = (data ?? []).filter((item) => item.is_deleted !== true);
      setList(filtered as Notification[]);
    }

    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-[#fff9f2]">
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-6">
        <div className="mb-3 flex items-center gap-2 text-lg font-bold text-[#404040]">
          <Megaphone size={20} /> 전체 공지
        </div>

        <div className="space-y-3">
          {list.map((n) => (
            <div
              key={n.id}
              className="w-full rounded-lg border bg-white p-4 text-left shadow-sm"
            >
              <p className="font-semibold text-[#404040]">{n.title}</p>
              <p className="mt-1 text-sm text-[#7a6f68]">{n.content ?? ""}</p>
              <p className="mt-2 text-xs text-gray-400">{n.created_at?.slice(0, 10)}</p>
            </div>
          ))}

          {list.length === 0 && (
            <p className="text-sm text-gray-500">등록된 공지가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
