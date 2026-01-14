// src/pages/Home.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Megaphone, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

type Notice = {
  id: number;
  title: string;
  content: string | null;
  created_at: string;
};

export default function Home() {
  const navigate = useNavigate();

  const [notices, setNotices] = useState<Notice[]>([]);

  // 🔔 전체 공지 불러오기 (notifications 테이블)
useEffect(() => {
  async function loadNotices() {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, content, created_at, is_visible")
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        console.error("공지 불러오기 오류", error);
        setNotices([]);
        return;
      }

      setNotices(data ?? []);
    } catch (err) {
      console.error("공지 불러오기 실패", err);
      setNotices([]);
    }
  }

  loadNotices();
}, []);

  return (
    <div className="min-h-screen bg-[#fff9f2]">
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-5">
        {/* ------------------------------ */}
        {/* 전체 공지 섹션 */}
        {/* ------------------------------ */}
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#404040]">
              <Megaphone size={20} /> 전체 공지
            </h2>

            <button
              onClick={() => navigate("/notifications")}
              className="flex items-center gap-1 text-sm text-[#7a6f68]"
            >
              전체보기 <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {notices.map((n) => (
              <button
                key={n.id}
                type="button"
                className="w-full cursor-pointer rounded-lg border bg-white p-4 text-left shadow-sm transition hover:shadow-md"
                onClick={() => navigate(`/notices/${n.id}`)}
              >
                <p className="font-semibold text-[#404040]">{n.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-[#7a6f68]">
                  {n.content ?? ""}
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  {n.created_at?.slice(0, 10)}
                </p>
              </button>
            ))}

            {notices.length === 0 && (
              <p className="text-sm text-gray-500">등록된 공지가 없습니다.</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
