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
  const [vodByCategory, setVodByCategory] = useState<Record<string, VodVideo[]>>({});

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
          setVodByCategory({});
          return;
        }

        const list = (data ?? []) as VodVideo[];

        const grouped = list.reduce<Record<string, VodVideo[]>>((acc, video) => {
          const key = video.category || "기타";
          if (!acc[key]) acc[key] = [];
          acc[key].push(video);
          return acc;
        }, {});

        setVodByCategory(grouped);
      } catch (err) {
        console.error("VOD 불러오기 실패", err);
        setVodByCategory({});
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

        {/* ------------------------------ */}
        {/* VOD 섹션들 */}
        {/* ------------------------------ */}
        <VodCollectionSection
          groups={["추천", "기초", "심화"].map((category) => ({
            category,
            videos: (vodByCategory[category] ?? []).slice(0, 2),
          }))}
          onPlay={handlePlay}
          onSeeAll={() => navigate("/vod/list")}
        />
      </div>
    </div>
  );
}

type VodGroup = {
  category: string;
  videos: VodVideo[];
};

/* ----------------------------
   VOD 단일 카드 섹션 컴포넌트
------------------------------*/
function VodCollectionSection({
  groups,
  onPlay,
  onSeeAll,
}: {
  groups: VodGroup[];
  onPlay: (id: number) => void;
  onSeeAll: () => void;
}) {
  const hasAnyVod = groups.some((g) => g.videos.length > 0);

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#404040]">VOD</h2>
        <button
          onClick={onSeeAll}
          className="flex items-center gap-1 text-sm text-[#7a6f68]"
        >
          전체보기 <ChevronRight size={14} />
        </button>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        {hasAnyVod ? (
          <div className="space-y-5">
            {groups.map((group) => (
              <div key={group.category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-[#404040]">
                    {group.category} VOD
                  </h3>
                  <span className="text-xs text-[#9d8f88]">최신 영상</span>
                </div>

                {group.videos.length > 0 ? (
                  <div className="space-y-3">
                    {group.videos.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        className="flex w-full gap-3 rounded-xl border bg-[#fffbf3] p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        onClick={() => onPlay(v.id)}
                      >
                        <img
                          src={v.thumbnail_url || "/fallback-thumbnail.png"}
                          alt={v.title}
                          className="h-20 w-28 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/fallback-thumbnail.png";
                          }}
                        />

                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <p className="line-clamp-2 text-sm font-semibold text-[#404040]">
                              {v.title}
                            </p>
                            <p className="mt-1 text-xs text-[#7a6f68]">
                              {v.category} VOD
                            </p>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-[#7a6f68]">
                            <PlayCircle size={14} />
                            재생하기
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg bg-[#fffbf3] px-3 py-4 text-sm text-gray-500">
                    {group.category} 영상이 아직 준비되지 않았어요.
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">현재 준비된 영상이 없습니다.</p>
        )}
      </div>
    </section>
  );
}
