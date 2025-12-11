import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import type { VodCategory } from "@/types/VodVideo";

type VodTopic = {
  id: number;
  title: string;
  description: string | null;
  order: number | null;
};

type VodCategoryWithParent = VodCategory & { parent_id: number | null };

export default function VodTopicPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState<VodCategoryWithParent | null>(null);
  const [topics, setTopics] = useState<VodTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const idNum = Number(categoryId);
    if (!categoryId || Number.isNaN(idNum)) {
      setError("잘못된 카테고리입니다.");
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);

      const [categoryRes, topicRes] = await Promise.all([
        supabase
          .from("vod_category")
          .select("id, name, parent_id")
          .eq("id", idNum)
          .maybeSingle(),
        supabase
          .from("vod_topics")
          .select("id, title, description, order")
          .eq("category_id", idNum)
          .order("order", { ascending: true }),
      ]);

      if (categoryRes.error) {
        setError("카테고리를 불러오지 못했습니다.");
        setCategory(null);
      } else {
        setCategory((categoryRes.data ?? null) as VodCategoryWithParent | null);
      }

      if (topicRes.error) {
        setError("토픽을 불러오지 못했습니다.");
        setTopics([]);
      } else {
        setTopics((topicRes.data ?? []) as VodTopic[]);
      }

      setLoading(false);
    }

    load();
  }, [categoryId]);

  if (loading) {
    return <p className="p-6 text-center text-gray-500">불러오는 중...</p>;
  }

  if (error) {
    return <p className="p-6 text-center text-red-600">{error}</p>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">
        {category ? `${category.name} 토픽` : "토픽 목록"}
      </h1>

      {topics.length === 0 ? (
        <p className="text-sm text-center text-gray-500">토픽이 준비 중입니다.</p>
      ) : (
        <div className="space-y-3">
          {topics.map((topic, idx) => (
            <div
              key={topic.id}
              className="p-4 bg-white rounded-xl shadow cursor-pointer hover:bg-[#f9f6ef]"
              onClick={() => navigate(`/vod/topics/${topic.id}/videos`)}
            >
              <p className="text-sm text-gray-500">{idx + 1}강</p>
              <p className="text-base font-semibold text-[#404040]">{topic.title}</p>
              {topic.description && (
                <p className="text-sm text-[#7a6f68] mt-1 whitespace-pre-line">
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
