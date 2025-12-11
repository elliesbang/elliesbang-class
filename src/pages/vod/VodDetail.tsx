import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PlayCircle, Lock } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../auth/AuthProvider";
import { openLoginModal } from "../../lib/authModal";

type UserRole = "student" | "vod" | "admin" | null;

type VodVideo = {
  id: number;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  video_url?: string | null;
  level?: string | null;
  created_at?: string | null;
  topic_id: number;
};

type VodTopic = {
  id: number;
  title: string;
  program_id: number;
};

export default function VodDetail() {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { user, role: authRole, loading } = useAuth();

  const [role, setRole] = useState<UserRole>(null);
  const [video, setVideo] = useState<VodVideo | null>(null);
  const [topic, setTopic] = useState<VodTopic | null>(null);
  const [related, setRelated] = useState<VodVideo[]>([]);
  const [hasPurchase, setHasPurchase] = useState(false);

  const numericVideoId = Number(videoId);

  // ------------------------------
  // 로그인 / 역할 체크
  // ------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const localRole = window.localStorage.getItem("role") as UserRole;
      if (localRole) setRole(localRole);
    } catch (err) {
      console.error("VodDetail storage error:", err);
    }
  }, []);

  useEffect(() => {
    if (authRole) setRole(authRole as UserRole);
  }, [authRole]);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      openLoginModal(null, "로그인이 필요한 서비스입니다.");
      navigate("/", { replace: true });
      return;
    }

    if (role === "student") {
      alert("해당 메뉴는 VOD 전용 서비스입니다.");
      navigate("/", { replace: true });
    }
  }, [loading, role, user, navigate]);

  // ------------------------------
  // 영상 상세 + 토픽 + 관련 영상 로드
  // ------------------------------
  useEffect(() => {
    if (!numericVideoId) return;

    async function loadVideoDetail() {
      // 1) 영상 정보
      const { data: videoData, error: videoError } = await supabase
        .from("vod_videos")
        .select("*")
        .eq("id", numericVideoId)
        .maybeSingle();

      if (videoError) {
        console.error("영상 상세 불러오기 오류:", videoError);
        return;
      }

      if (!videoData) return;

      setVideo(videoData as VodVideo);

      // 2) 토픽 정보
      const { data: topicData, error: topicError } = await supabase
        .from("vod_topics")
        .select("id, title, program_id")
        .eq("id", videoData.topic_id)
        .maybeSingle();

      if (topicError) {
        console.error("토픽 정보 불러오기 오류:", topicError);
      }

      setTopic(topicData as VodTopic);

      // 3) 같은 토픽의 관련 영상
      const { data: relatedData, error: relatedError } = await supabase
        .from("vod_videos")
        .select("id, title, thumbnail_url, level")
        .eq("topic_id", videoData.topic_id)
        .neq("id", numericVideoId)
        .order("order", { ascending: true })
        .limit(10);

      if (relatedError) {
        console.error("관련 영상 불러오기 오류:", relatedError);
      }

      setRelated(relatedData as VodVideo[]);
    }

    void loadVideoDetail();
  }, [numericVideoId]);

  // ------------------------------
  // 구매권한 / 재생권한 체크
  // ------------------------------
  useEffect(() => {
    async function loadPurchaseStatus() {
      if (!user || !numericVideoId) return;

      if (role === "admin") {
        setHasPurchase(true);
        return;
      }

      const { data, error } = await supabase
        .from("vod_purchases")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("구매 여부 확인 실패", error);
        return;
      }

      setHasPurchase(!!data);
    }

    if (role === "vod" || role === "admin") {
      void loadPurchaseStatus();
    }
  }, [role, user, numericVideoId]);

  const canPlay =
    role === "admin" || (role === "vod" && hasPurchase && video?.video_url);

  // ------------------------------
  // 재생 버튼 클릭
  // ------------------------------
  const handlePlayPermission = () => {
    if (!hasPurchase && role !== "admin") {
      alert("VOD 이용권이 필요합니다.");
      return;
    }
  };

  if (!video) return <div className="p-5">불러오는 중...</div>;

  return (
    <div className="pb-20">
      {/* ------------------------------
          영상 플레이어 영역
      ------------------------------ */}
      <div className="w-full bg-black">
        {canPlay ? (
          <iframe
            src={video.video_url ?? ""}
            className="w-full h-60"
            allowFullScreen
            title={video.title}
          ></iframe>
        ) : (
          <div className="w-full h-60 flex flex-col items-center justify-center text-white">
            <Lock size={40} className="mb-3" />
            <p className="text-lg mb-1">VOD 회원 전용 영상입니다</p>
            <button
              onClick={handlePlayPermission}
              className="mt-3 px-4 py-2 bg-white text-black rounded-lg"
            >
              재생 권한 확인
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------
          상세 정보
      ------------------------------ */}
      <div className="p-5">
        <h1 className="text-xl font-bold text-[#404040]">{video.title}</h1>

        {topic && (
          <p className="text-sm mt-1 text-[#7a6f68]">
            주제: {topic.title}
          </p>
        )}

        {video.level && (
          <p className="text-xs inline-block mt-2 px-2 py-1 bg-yellow-200 rounded-full text-[#404040]">
            {video.level}
          </p>
        )}

        <p className="mt-4 text-[#404040] whitespace-pre-line leading-6">
          {video.description}
        </p>

        <p className="text-xs text-gray-500 mt-3">
          업로드일: {video.created_at?.slice(0, 10)}
        </p>
      </div>

      {/* ------------------------------
          관련 영상
      ------------------------------ */}
      {related.length > 0 && (
        <div className="p-5">
          <h2 className="text-lg font-bold text-[#404040] mb-3">
            같은 주제의 다른 영상
          </h2>

          <div className="flex flex-col gap-3">
            {related.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 bg-white p-2 rounded-lg border border-[#f0f0f0] cursor-pointer hover:bg-[#fafafa]"
                onClick={() => navigate(`/vod/video/${item.id}`)}
              >
                <div className="w-28 h-20 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={
                      item.thumbnail_url && item.thumbnail_url.length > 0
                        ? item.thumbnail_url
                        : "/fallback-thumbnail.png"
                    }
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col justify-center flex-1">
                  {item.level && (
                    <span className="text-xs px-2 py-1 bg-yellow-200 rounded-full text-[#404040] w-fit">
                      {item.level}
                    </span>
                  )}
                  <p className="text-sm font-medium line-clamp-2">
                    {item.title}
                  </p>

                  <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                    <PlayCircle size={12} /> 재생
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
