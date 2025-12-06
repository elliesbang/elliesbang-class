// src/page/Home.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Megaphone, PlayCircle, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

type Notice = {
  id: number;
  title: string;
  content: string | null;
  created_at: string;
};

type VodVideo = {
  id: number;
  title: string;
  category: string;       // "추천" | "기초" | "심화"
  thumbnail_url: string;  // 썸네일 주소
};

export default function Home() {
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);

  const [notices, setNotices] = useState<Notice[]>([]);
  const [vodRecommended, setVodRecommended] = useState<VodVideo[]>([]);
  const [vodBasic, setVodBasic] = useState<VodVideo[]>([]);
  const [vodAdvanced, setVodAdvanced] = useState<VodVideo[]>([]);

  // 현재 로그인한 사용자 역할(localStorage) 가져오기
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const userRole = window.localStorage.getItem("role");
        if (userRole) setRole(userRole);
      }
    } catch (e) {
      console.warn("localStorage 사용 불가(Home):", e);
      setRole(null);
    }
  }, []);

  // 🔔 전체 공지 불러오기 (notifications 테이블)
  useEffect(() => {
    async function loadNotices() {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("id, title, content, created_at")
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) {
          console.error("공지 불러오기 오류", error);
          setNotices([]);
          return;
        }

        setNotices((data ?? []) as Notice[]);
      } catch (err) {
        console.error("공지 불러오기 실패", err);
        setNotices([]);
      }
    }

    loadNotices();
  }, []);

  // 🎬 VOD 목록 불러오기 (vod_videos 테이블)
  useEffect(() => {
    async function loadVod() {
      try {
        const { data, error } = await supabase
          .from("vod_videos")
          .select("id, title, category, thumbnail_url, created_at")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("VOD 불러오기 오류", error);
          setVodRecommended([]);
          setVodBasic([]);
          setVodAdvanced([]);
          return;
        }

        const list = (data ?? []) as VodVideo[];

        setVodRecommended(list.filter((v) => v.category === "추천"));
        setVodBasic(list.filter((v) => v.category === "기초"));
        setVodAdvanced(list.filter((v) => v.category === "심화"));
      } catch (err) {
        console.error("VOD 불러오기 실패", err);
        setVodRecommended([]);
        setVodBasic([]);
        setVodAdvanced([]);
      }
    }

    loadVod();
  }, []);

  // 재생 권한 체크
  function handlePlay(videoId: number) {
    if (!role) {
      alert("로그인이 필요합니다.");
      return navigate("/auth/login");
    }

    if (role === "admin" || role === "vod") {
      return navigate(`/vod/${videoId}`);
    }

    if (role === "student") {
      alert("이 영상은 VOD 이용권이 필요합니다.");
    }
  }

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
              onClick={() => navigate("/notices")}
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

        {/* ------------------------------ */}
        {/* VOD 섹션들 */}
        {/* ------------------------------ */}
        <VodSection title="추천 VOD" list={vodRecommended} onPlay={handlePlay} />
        <VodSection title="기초 VOD" list={vodBasic} onPlay={handlePlay} />
        <VodSection title="심화 VOD" list={vodAdvanced} onPlay={handlePlay} />
      </div>
    </div>
  );
}

/* ----------------------------
   VOD 목록 단일 섹션 컴포넌트
-----------------------------*/
function VodSection({
  title,
  list,
  onPlay,
}: {
  title: string;
  list: VodVideo[];
  onPlay: (id: number) => void;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-bold text-[#404040]">{title}</h2>

      {list && list.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {list.map((v) => (
            <div
              key={v.id}
              className="cursor-pointer rounded-xl border bg-white p-2 shadow-sm"
              onClick={() => onPlay(v.id)}
            >
              <img
                src={v.thumbnail_url || "/fallback-thumbnail.png"}
                alt={v.title}
                className="h-28 w-full rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/fallback-thumbnail.png";
                }}
              />

              <p className="mt-2 line-clamp-1 text-sm font-semibold text-[#404040]">
                {v.title}
              </p>

              <div className="mt-1 flex items-center text-xs text-[#7a6f68]">
                <PlayCircle size={14} className="mr-1" />
                재생하기
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">현재 준비된 영상이 없습니다.</p>
      )}
    </section>
  );
}
