import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Edit3, Plus, RefreshCcw } from "lucide-react";

type VodTopic = {
  id: number;
  title: string;
  category_id: number;
};

type VodCategory = {
  id: number;
  name: string;
};

type VodVideo = {
  id: number;
  title: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  duration: number | null;
  order: number | null;
  level: string | null;
  topic_id: number;
};

export default function VodVideoList() {
  const [topics, setTopics] = useState<VodTopic[]>([]);
  const [categories, setCategories] = useState<VodCategory[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [videos, setVideos] = useState<VodVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryNameMap = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  const loadTopicOptions = async () => {
    const [topicRes, categoryRes] = await Promise.all([
      supabase
        .from("vod_topics")
        .select("id, title, category_id")
        .order("order", { ascending: true, nullsLast: true })
        .order("id", { ascending: true }),
      supabase.from("vod_category").select("id, name"),
    ]);

    if (topicRes.error || categoryRes.error) {
      console.error("토픽/카테고리 불러오기 오류", topicRes.error || categoryRes.error);
      setTopics([]);
      setCategories([]);
      return;
    }

    setTopics((topicRes.data ?? []) as VodTopic[]);
    setCategories((categoryRes.data ?? []) as VodCategory[]);
  };

  const loadVideos = async (topicId: number) => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("vod_videos")
      .select(
        "id, title, description, video_url, thumbnail_url, duration, order, level, topic_id"
      )
      .eq("topic_id", topicId)
      .order("order", { ascending: true, nullsLast: true })
      .order("id", { ascending: true });

    if (fetchError) {
      console.error("영상 불러오기 오류", fetchError);
      setError("영상을 불러오지 못했습니다.");
      setVideos([]);
      setLoading(false);
      return;
    }

    setVideos((data ?? []) as VodVideo[]);
    setLoading(false);
  };

  useEffect(() => {
    void loadTopicOptions();
  }, []);

  useEffect(() => {
    const numericId = Number(selectedTopicId);
    if (!selectedTopicId || Number.isNaN(numericId)) {
      setVideos([]);
      return;
    }

    void loadVideos(numericId);
  }, [selectedTopicId]);

  const selectedTopic = useMemo(() => {
    const idNum = Number(selectedTopicId);
    if (!idNum || Number.isNaN(idNum)) return null;
    return topics.find((topic) => topic.id === idNum) ?? null;
  }, [selectedTopicId, topics]);

  const topicLabel = (topic: VodTopic) => {
    const categoryName = categoryNameMap.get(topic.category_id);
    return categoryName ? `${categoryName} / ${topic.title}` : topic.title;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-[#404040]">VOD 영상 관리</h1>
          <p className="text-sm text-[#7a6f68] mt-1">토픽을 선택해 영상을 관리합니다.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              void loadTopicOptions();
              const numericId = Number(selectedTopicId);
              if (selectedTopicId && !Number.isNaN(numericId)) {
                void loadVideos(numericId);
              }
            }}
            className="flex items-center gap-2 px-3 py-2 border border-[#e6decd] rounded-lg text-sm text-[#404040] hover:bg-[#f8f5e9]"
          >
            <RefreshCcw size={16} /> 새로고침
          </button>
          <Link
            to={selectedTopicId ? `/admin/vod/videos/new?topicId=${selectedTopicId}` : "#"}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
              selectedTopicId
                ? "bg-[#f8f5e9] hover:bg-[#f3efe4] text-[#404040]"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
            aria-disabled={!selectedTopicId}
          >
            <Plus size={16} /> 영상 생성
          </Link>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[#404040]">토픽 선택</label>
        <select
          className="w-full md:max-w-xl border rounded-lg px-3 py-2 bg-white"
          value={selectedTopicId}
          onChange={(e) => setSelectedTopicId(e.target.value)}
        >
          <option value="">토픽을 선택하세요</option>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topicLabel(topic)}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!selectedTopicId ? (
        <p className="text-sm text-gray-500">토픽을 선택하면 해당 영상을 확인할 수 있습니다.</p>
      ) : loading ? (
        <p className="text-sm text-gray-500">영상을 불러오는 중...</p>
      ) : videos.length === 0 ? (
        <p className="text-sm text-gray-500">등록된 영상이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex items-start justify-between gap-3 p-4 bg-white border rounded-xl shadow-sm"
            >
              <div className="space-y-1">
                <p className="text-xs text-[#7a6f68]">
                  카테고리/토픽: {selectedTopic ? topicLabel(selectedTopic) : "-"}
                </p>
                <p className="font-semibold text-[#404040]">{video.title}</p>
                {video.description && (
                  <p className="text-sm text-[#7a6f68] whitespace-pre-line">
                    {video.description}
                  </p>
                )}
                <div className="text-xs text-[#7a6f68] space-x-2">
                  <span>길이: {video.duration ?? "-"}분</span>
                  <span>레벨: {video.level ?? "-"}</span>
                  <span>정렬: {video.order ?? "-"}</span>
                </div>
              </div>
              <Link
                to={`/admin/vod/videos/${video.id}`}
                className="flex items-center gap-1 px-3 py-2 text-sm bg-[#f8f5e9] hover:bg-[#f3efe4] rounded-lg text-[#404040]"
              >
                <Edit3 size={16} /> 수정
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
