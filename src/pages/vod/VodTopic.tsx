import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

type VodTopic = {
  id: number;
  title: string;
  description: string | null;
};

type VodVideo = {
  id: number;
  title: string;
  level: string | null; // 기초 / 중급 / 심화
  thumbnail_url: string | null;
  video_url: string;
};

export default function VodTopicPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState<VodTopic | null>(null);
  const [videos, setVideos] = useState<VodVideo[]>([]);

  useEffect(() => {
    async function load() {
      const [{ data: topicData }, { data: videoData }] = await Promise.all([
        supabase.from("vod_topics").select("*").eq("id", topicId).maybeSingle(),
        supabase.from("vod_videos").select("*").eq("topic_id", topicId).order("order"),
      ]);

      setTopic(topicData ?? null);
      setVideos(videoData ?? []);
    }

    load();
  }, [topicId]);

  if (!topic) return <p className="p-4">토픽을 찾을 수 없습니다.</p>;

  return (
    <div className="px-4 py-6 space-y-6">
      {/* 토픽 정보 */}
      <div className="rounded-xl bg-white shadow p-4">
        <h1 className="text-xl font-bold text-[#404040]">{topic.title}</h1>
        {topic.description && (
          <p className="text-[#7a6f68] mt-1">{topic.description}</p>
        )}
      </div>

      {/* 영상 리스트 */}
      <div className="space-y-4">
        {videos.map((v) => (
          <div
            key={v.id}
            className="flex gap-3 bg-white p-3 rounded-xl shadow cursor-pointer"
           onClick={() => navigate(`/vod/video/${v.id}`)}

          >
            <img
              src={v.thumbnail_url || "/fallback-thumbnail.png"}
              className="w-32 h-20 object-cover rounded-lg border"
            />

            <div className="flex flex-col justify-between">
              <div>
                <p className="font-semibold text-[#404040]">{v.title}</p>
                {v.level && (
                  <p className="text-xs text-[#7a6f68] mt-1">{v.level}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
