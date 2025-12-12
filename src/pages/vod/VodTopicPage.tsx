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
  level: string | null;
  thumbnail_url: string | null;
  duration: number | null;
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

      const [topicRes, videoRes] = await Promise.all([
        supabase
          .from("vod_topics")
          .select("id, title, description")
          .eq("id", idNum)
          .maybeSingle(),
        supabase
          .from("vod_videos")
          .select("id, title, level, thumbnail_url, duration")
          .eq("topic_id", idNum)
          .order("order", { ascending: true }),
      ]);

      if (topicRes.error || !topicRes.data) {
        setError("토픽 정보를 불러오지 못했습니다.");
        setTopic(null);
      } else {
        setTopic(topicRes.data as VodTopic);
      }

      if (videoRes.error) {
        setError("영상을 불러오지 못했습니다.");
        setVideos([]);
      } else {
        setVideos((videoRes.data ?? []) as VodVideo[]);
      }

      setLoading(false);
    }

    load();
  }, [topicId]);

  if (loading) {
    return <p className="p-6 text-center text-gray-500">불러오는 중...</p>;
  }

  if (error) {
    return <p className="p-6 text-center text-red-600">{error}</p>;
  }

  return (
    <div className="px-4 py-6 space-y-4">
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

      {videos.length === 0 ? (
        <p className="text-center text-sm text-gray-500">준비 중인 영상입니다.</p>
      ) : (
        <div className="space-y-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex gap-3 bg-white p-3 rounded-xl shadow cursor-pointer hover:bg-[#f9f6ef]"
              onClick={() => navigate(`/vod/video/${video.id}`)}
            >
              <img
                src={video.thumbnail_url || "/fallback-thumbnail.png"}
                className="w-32 h-20 object-cover rounded-lg border"
                alt={video.title}
              />

              <div className="flex flex-col justify-between flex-1">
                <div>
                  <p className="font-semibold text-[#404040]">{video.title}</p>
                  {video.level && (
                    <p className="text-xs text-[#7a6f68] mt-1">{video.level}</p>
                  )}
                </div>
                {video.duration !== null && (
                  <p className="text-xs text-[#888]">{video.duration}분</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
