import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchVodCategories, fetchVodTopics } from "@/services/vod";
import type { VodTopic } from "@/services/vod";
import type { VodCategory } from "@/types/VodVideo";

export default function VodHome() {
  const [categories, setCategories] = useState<VodCategory[]>([]);
  const [topics, setTopics] = useState<VodTopic[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [topicError, setTopicError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCategories() {
      setCategoriesLoading(true);
      setCategoryError(null);

      const categoryRes = await fetchVodCategories();

      if (categoryRes.error) {
        setCategoryError("카테고리를 불러오지 못했습니다.");
        setCategories([]);
        setSelectedCategoryId(null);
      } else {
        setCategories(categoryRes.data);
        setSelectedCategoryId(categoryRes.data[0]?.id ?? null);
      }

      setCategoriesLoading(false);
    }

    void loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId === null) {
      setTopics([]);
      return;
    }

    let cancelled = false;

    async function loadTopics() {
      setTopicsLoading(true);
      setTopicError(null);

      const topicRes = await fetchVodTopics(selectedCategoryId);

      if (cancelled) return;

      if (topicRes.error) {
        setTopicError("토픽을 불러오지 못했습니다.");
        setTopics([]);
      } else {
        setTopics(topicRes.data);
      }

      setTopicsLoading(false);
    }

    void loadTopics();

    return () => {
      cancelled = true;
    };
  }, [selectedCategoryId]);

  const renderContent = () => {
    if (categoriesLoading || topicsLoading) {
      return <p className="text-center text-gray-500 p-6">불러오는 중...</p>;
    }

    if (categoryError || topicError) {
      return (
        <p className="text-center text-red-600 p-6">{categoryError ?? topicError}</p>
      );
    }

    if (topics.length === 0) {
      return (
        <p className="text-center text-sm text-gray-500 p-6">
          이 카테고리에 등록된 강의가 없습니다.
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {topics.map((topic) => (
          <button
            key={topic.id}
            type="button"
            onClick={() => navigate(`/vod/topic/${topic.id}`)}
            className="w-full text-left rounded-xl border border-[#f1f1f1] bg-white p-4 shadow-sm transition hover:border-[#ffd331]"
          >
            <p className="text-base font-semibold text-[#404040]">{topic.title}</p>
            {topic.description && (
              <p className="mt-1 text-sm text-[#7a6f68]">{topic.description}</p>
            )}
          </button>
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
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={filterButtonClass(selectedCategoryId === category.id)}
                onClick={() => setSelectedCategoryId(category.id)}
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
