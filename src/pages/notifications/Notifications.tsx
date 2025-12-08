import { Megaphone } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Notification = {
  id: number;
  title: string;
  content: string | null;
  created_at: string;
  is_visible?: boolean;
};

const Notifications = () => {
  const [list, setList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true);

      try {
        // DB 컬럼에 완벽히 맞춰 작성
        const { data, error } = await supabase
          .from("notifications")
          .select("id, title, content, created_at, is_visible")
          .eq("is_visible", true)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("공지 불러오기 실패:", error);
          setList([]);
          return;
        }

        // is_visible=true 이미 필터됨 → 그대로 사용
        setList(data ?? []);
      } catch (err) {
        console.error("공지 불러오기 오류:", err);
        setList([]);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-[#fff9f2]">
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-6">
        <div className="mb-3 flex items-center gap-2 text-lg font-bold text-[#404040]">
          <Megaphone size={20} /> 전체 공지
        </div>

        {loading && (
          <p className="text-sm text-gray-500">불러오는 중...</p>
        )}

        <div className="space-y-3">
          {!loading &&
            list.map((n) => (
              <div
                key={n.id}
                className="w-full rounded-lg border bg-white p-4 text-left shadow-sm"
              >
                <p className="font-semibold text-[#404040]">{n.title}</p>
                <p className="mt-1 text-sm text-[#7a6f68]">
                  {n.content ?? ""}
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  {n.created_at?.slice(0, 10)}
                </p>
              </div>
            ))}

          {!loading && list.length === 0 && (
            <p className="text-sm text-gray-500">
              등록된 공지가 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
