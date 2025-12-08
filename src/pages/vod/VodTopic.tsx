import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../auth/AuthProvider";
import { openLoginModal } from "../../lib/authModal";
import { PlayCircle } from "lucide-react";

type VodTopic = {
  id: number;
  title: string;
  description?: string | null;
};

type VodVideo = {
  id: number;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  level?: string | null;
  duration?: string | null;
};

export default function VodTopicPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [topic, setTopic] = useState<VodTopic | null>(null);
  const [videos, setVideos] = useState<VodVideo[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const numericTopicId = Number(topicId);

  // 로그인만 되어 있으면 접근 OK
  useEffect(() => {
    if (loading) return;
    if (!user) {
      openLoginModal(null, "로그인이 필요한 서비스입니다.");
      navigate("/", { replace: true });
    }
  }, [loading, user, navigate]);

  // 주제 + 영상 목록 불러오기
  useEffect(() => {
    if (!numericTopicId) return;

    async function loadTopicAndVideos() {
      setPageLoading(true);

      // -----------------------------
      // 1) 주제 정보 가져오기
      // -----------------------------
      const { data: topicData, error: topicError } = await supabase
        .from("vod_topics")
        .select("id, title, description")
        .eq("id", numericTopicId)
        .maybeSingle();

      if (topicError) {
        console.error("토픽 불러오기 오류:", topicError);
        setPageLoading(false);
        return;
      }

      setTopic(topicData as VodTopic);

      // -----------------------------
      // 2) 해당 주제의 영상 목록 가져오기
      // -----------------------------
      const { data: videoData, error: videoError } = await supabase
        .from("vod_videos")
        .select("id, title, description, thumbnail_url, level, duration")
        .eq("topic_id", numericTopicId)
        .order("order", { ascending: true })
        .order("created_at", { ascending: true });

      if (videoError) {
        console.error("영상 목록 불러오기 오류:", videoError);
        setPageLoading(false);
        return;
      }

      setVideos(videoData as VodVideo[]);
      setPageLoading(false);
    }

    void loadTopicAndVideos();
  }, [numericTopicId]);

  if (pageLoading || !topic) {
    return <div className="p-5">불러오는 중...</div>;
  }

  return (
    <div className="pb-20 px-4">
      {/* -------------------------------
          상단 주제 정보
      -------------------------------- */}
      <div className="py-5">
        <h1 className="text-xl font-bold text-[#404040]">{topic.title}</h1>

        {topic.description && (
          <p className="mt-2 text-sm text-[#7a6f68] whitespace-pre-line">
            {topic.description}
          </p>
        )}
      </div>

      {/* -------------------------------
          영상 리스트 (유튜브 사이드바 스타일)
      -------------------------------- */}
      {videos.length === 0 ? (
        <p className="text-sm text-gray-500">등록된 영상이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex gap-3 bg-white border border-[#f3f3f3] rounded-xl p-2 cursor-pointer hover:bg-[#fafafa]"
              onClick={() => navigate(`/vod/video/${video.id}`)}
            >
              {/* 썸네일 */}
              <div className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={
                    video.thumbnail_url && video.thumbnail_url.length > 0
                      ? video.thumbnail_url
                      : "/fallback-thumbnail.png"
                  }
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 텍스트 */}
              <div className="flex flex-col justify-center flex-1">
                <div className="flex items-center gap-2">
                  {video.level && (
                    <span className="text-xs px-2 py-1 bg-yellow-200 text-[#404040] rounded-full">
                      {video.level}
                    </span>
                  )}
                </div>

                <h2 className="text-sm font-semibold text-[#404040] line-clamp-2">
                  {video.title}
                </h2>

                <div className="flex items-center text-xs text-[#7a6f68] mt-1">
                  <PlayCircle size={14} className="mr-1" />
                  재생하기
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
