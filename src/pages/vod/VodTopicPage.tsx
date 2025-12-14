import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

type VodTopic = {
  id: number;
  title: string;
  description: string | null;
};

type VodVideo = {
  id: number;
  title: string;
  // thumbnail_url: string | null; // DB에 컬럼 추가 전까지 주석 처리
  // level: string | null; // DB에 컬럼 추가 전까지 주석 처리
  // duration: number | null; // DB에 컬럼 추가 전까지 주석 처리
};

export default function VodTopicPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<VodTopic | null>(null);
  const [videos, setVideos] = useState<VodVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const idNum = Number(topicId);
    if (!topicId || Number.isNaN(idNum)) {
      setError("잘못된 토픽입니다.");
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);

      // 1. 토픽 정보 (vod_topics 테이블)
      // 첫 번째 캡처가 vod_topics라면 썸네일이 있을 수 있지만, 
      // 일단 에러 방지를 위해 기본 정보만 가져옵니다.
      const topicRes = await supabase
        .from("vod_topics")
        .select("id, title, description")
        .eq("id", idNum)
        .maybeSingle();

      if (topicRes.error) {
        console.error("Topic Error:", topicRes.error);
        setError("토픽 정보를 불러오지 못했습니다.");
      } else if (topicRes.data) {
        setTopic(topicRes.data as VodTopic);
      }

      // 2. 비디오 리스트 (vod_videos 테이블)
      // [중요] 캡처된 vod_videos 테이블에 있는 컬럼만 요청해야 에러가 안 납니다.
      const videoRes = await supabase
        .from("vod_videos") 
        .select("id, title") // thumbnail_url 등이 없어서 뺐습니다.
        .eq("topic_id", idNum) 
        .order("id", { ascending: true });

      if (videoRes.error) {
        console.error("Video Error:", videoRes.error);
        setError("영상을 불러오지 못했습니다.");
        setVideos([]);
      } else {
        setVideos((videoRes.data ?? []) as VodVideo[]);
      }

      setLoading(false);
    }

    load();
  }, [topicId]);

  if (loading) return <p className="p-6 text-center text-gray-500">불러오는 중...</p>;
  if (error) return <p className="p-6 text-center text-red-600">{error}</p>;

  return (
    <div className="px-4 py-6 space-y-4">
      {/* 토픽 정보 섹션 */}
      {topic && (
        <div className="rounded-xl bg-white shadow p-4">
          <h1 className="text-lg font-bold text-[#404040]">{topic.title}</h1>
          {topic.description && (
            <p className="text-sm text-[#7a6f68] mt-1 whitespace-pre-line">
              {topic.description}
            </p>
          )}
        </div>
      )}

      {/* 비디오 리스트 섹션 */}
      {videos.length === 0 ? (
        <p className="text-center text-sm text-gray-500">
          준비 중인 영상입니다. (데이터를 넣어주세요)
        </p>
      ) : (
        <div className="space-y-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex gap-3 bg-white p-3 rounded-xl shadow cursor-pointer hover:bg-[#f9f6ef]"
              onClick={() => navigate(`/vod/video/${video.id}`)}
            >
              {/* 썸네일 컬럼이 아직 없으므로 기본 이미지 사용 */}
              <img
                src={"/fallback-thumbnail.png"}
                className="w-32 h-20 object-cover rounded-lg border bg-gray-100"
                alt={video.title}
              />

              <div className="flex flex-col justify-center flex-1">
                <p className="font-semibold text-[#404040]">{video.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
