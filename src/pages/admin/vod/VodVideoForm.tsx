import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

type VodTopic = {
  id: number;
  title: string;
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

export default function VodVideoForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [topics, setTopics] = useState<VodTopic[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [duration, setDuration] = useState<number | null>(null);
  const [order, setOrder] = useState<number | null>(null);
  const [level, setLevel] = useState("");
  const [topicId, setTopicId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const numericId = useMemo(() => (id ? Number(id) : null), [id]);
  const queryTopicId = searchParams.get("topicId");

  useEffect(() => {
    if (queryTopicId) {
      setTopicId(queryTopicId);
    }
  }, [queryTopicId]);

  useEffect(() => {
    async function loadTopics() {
      const { data, error: fetchError } = await supabase
        .from("vod_topics")
        .select("id, title")
        .order("order", { ascending: true, nullsLast: true })
        .order("id", { ascending: true });

      if (fetchError) {
        console.error("토픽 불러오기 오류", fetchError);
        setTopics([]);
        return;
      }

      setTopics((data ?? []) as VodTopic[]);
    }

    void loadTopics();
  }, []);

  useEffect(() => {
    async function loadVideo() {
      if (!numericId) return;

      const { data, error: fetchError } = await supabase
        .from("vod_videos")
        .select(
          "id, title, description, video_url, thumbnail_url, duration, order, level, topic_id"
        )
        .eq("id", numericId)
        .maybeSingle();

      if (fetchError) {
        console.error("영상 불러오기 오류", fetchError);
        setError("영상을 불러오지 못했습니다.");
        return;
      }

      if (data) {
        const loaded = data as VodVideo;
        setTitle(loaded.title);
        setDescription(loaded.description ?? "");
        setVideoUrl(loaded.video_url ?? "");
        setThumbnailUrl(loaded.thumbnail_url ?? "");
        setDuration(loaded.duration);
        setOrder(loaded.order);
        setLevel(loaded.level ?? "");
        setTopicId(String(loaded.topic_id));
      }
    }

    void loadVideo();
  }, [numericId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericTopicId = Number(topicId);

    if (!topicId || Number.isNaN(numericTopicId)) {
      setError("토픽을 선택해야 영상을 저장할 수 있습니다.");
      return;
    }

    if (!title.trim() || !videoUrl.trim() || !thumbnailUrl.trim()) {
      setError("제목, 영상 URL, 썸네일 URL을 모두 입력해주세요.");
      return;
    }

    setSaving(true);

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      video_url: videoUrl.trim(),
      thumbnail_url: thumbnailUrl.trim(),
      duration,
      order,
      level: level.trim() || null,
      topic_id: numericTopicId,
    };

    if (numericId) {
      const { error: updateError } = await supabase
        .from("vod_videos")
        .update(payload)
        .eq("id", numericId);

      if (updateError) {
        console.error("영상 수정 실패", updateError);
        setError("영상 수정에 실패했습니다.");
        setSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("vod_videos")
        .insert(payload);

      if (insertError) {
        console.error("영상 생성 실패", insertError);
        setError("영상 생성에 실패했습니다.");
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    navigate("/admin/vod/videos");
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-lg md:text-2xl font-bold text-[#404040]">
          {numericId ? "영상 수정" : "영상 생성"}
        </h1>
        <p className="text-sm text-[#7a6f68] mt-1">
          토픽을 기반으로 영상을 등록합니다.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-xl shadow-sm p-5 space-y-4"
      >
        <div className="space-y-1">
          <label className="text-sm font-medium text-[#404040]">토픽 선택</label>
          <select
            className="w-full border rounded-lg px-3 py-2 bg-white"
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            disabled={topics.length === 0}
          >
            <option value="">토픽을 선택하세요</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[#404040]">제목</label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="영상 제목"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[#404040]">영상 URL</label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="동영상 재생 URL"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[#404040]">썸네일 URL</label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="대표 썸네일 이미지 URL"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[#404040]">설명</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="영상 설명"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#404040]">재생 길이(분)</label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2"
              value={duration ?? ""}
              onChange={(e) =>
                setDuration(e.target.value === "" ? null : Number(e.target.value))
              }
              placeholder="분 단위"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#404040]">정렬 순서</label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2"
              value={order ?? ""}
              onChange={(e) => setOrder(e.target.value === "" ? null : Number(e.target.value))}
              placeholder="숫자가 작을수록 상단"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#404040]">레벨(선택)</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="예) 초급/중급"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-[#404040] text-white rounded-lg text-sm hover:bg-[#2f2f2f] disabled:opacity-50"
          >
            {numericId ? "수정하기" : "생성하기"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/vod/videos")}
            className="px-4 py-2 border border-[#e6decd] rounded-lg text-sm text-[#404040] hover:bg-[#f8f5e9]"
          >
            목록으로
          </button>
        </div>
      </form>
    </div>
  );
}
