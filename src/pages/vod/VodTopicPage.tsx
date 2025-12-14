import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

type VodTopic = {
  id: number;
  title: string;
  description: string | null;
};

export default function VodTopicPage() {
  const { topicId } = useParams(); // 실제로는 categoryId 역할
  const navigate = useNavigate();

  const [topics, setTopics] = useState<VodTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const categoryId = Number(topicId);

    if (!topicId || Number.isNaN(categoryId)) {
      setError("잘못된 카테고리입니다.");
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("vod_topics")
        .select("id, title, description")
        .eq("category_id", categoryId)
        .order("order", { ascending: true });

      if (error) {
        console.error("Vod Topics Error:", error);
        setError("토픽을 불러오지 못했습니다.");
        setTopics([]);
      } else {
        setTopics((data ?? []) as VodTopic[]);
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
      <h1 className="text-lg font-bold text-[#404040]">VOD 강의 목록</h1>

      {topics.length === 0 ? (
        <p className="text-center text-sm text-gray-500">
          아직 등록된 토픽이 없습니다.
        </p>
      ) : (
        <div className="space-y-3">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="bg-white p-4 rounded-xl shadow cursor-pointer hover:bg-[#f9f6ef]"
              onClick={() => navigate(`/vod/topic/${topic.id}`)}
            >
              <p className="font-semibold text-[#404040]">{topic.title}</p>
              {topic.description && (
                <p className="text-sm text-[#7a6f68] mt-1">
                  {topic.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
