import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import VodTopicCard from "@/components/vod/VodTopicCard";
import { fetchVodCategories, fetchVodTopics } from "@/services/vod";
import type { VodTopic } from "@/services/vod";
import type { VodCategory } from "@/types/VodVideo";

export default function VodHome() {
  const [categories, setCategories] = useState<VodCategory[]>([]);
  const [topics, setTopics] = useState<VodTopic[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      const [categoryRes, topicRes] = await Promise.all([
        fetchVodCategories(),
        fetchVodTopics(),
      ]);

      if (categoryRes.error) {
        setError("카테고리를 불러오지 못했습니다.");
        setCategories([]);
      } else {
        setCategories(categoryRes.data);
      }

      if (topicRes.error) {
        setError("토픽을 불러오지 못했습니다.");
        setTopics([]);
      } else {
        setTopics(topicRes.data);
      }

      setLoading(false);
    }

    load();
  }, []);

  const filteredTopics = useMemo(() => {
    if (selectedCategory === null) return topics;
    return topics.filter((topic) => topic.category_id === selectedCategory);
  }, [selectedCategory, topics]);

  const renderContent = () => {
    if (loading) {
      return <p className="text-center text-gray-500 p-6">불러오는 중...</p>;
    }

    if (error) {
      return <p className="text-center text-red-600 p-6">{error}</p>;
    }

    if (filteredTopics.length === 0) {
      return <p className="text-center text-sm text-gray-500 p-6">토픽이 없습니다.</p>;
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
        {filteredTopics.map((topic) => (
          <VodTopicCard
            key={topic.id}
            title={topic.title}
            iconUrl={topic.icon_url}
            onClick={() => navigate(`/vod/topic/${topic.id}`)}
          />
        ))}
      </div>
    );
  };

  const filterButtonClass = (active: boolean) =>
    `px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold border transition-colors ${
      active
        ? "bg-[#ffd331] text-[#404040] border-[#ffd331] shadow"
        : "bg-white text-[#404040] border-[#e5e5e5]"
    }`;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-bold">VOD 강의</h1>

      <div className="sticky top-0 z-20 -mx-4 md:-mx-6 bg-white">
        <div className="overflow-x-auto px-4 md:px-6 py-3">
          <div className="flex gap-2 w-max">
            <button
              type="button"
              className={filterButtonClass(selectedCategory === null)}
              onClick={() => setSelectedCategory(null)}
            >
              전체
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={filterButtonClass(selectedCategory === category.id)}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {renderContent()}
    </div>
  );
}
