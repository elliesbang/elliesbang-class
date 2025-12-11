import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Edit3, Plus, RefreshCcw } from "lucide-react";

type VodCategory = {
  id: number;
  name: string;
  parent_id: number | null;
};

type VodTopic = {
  id: number;
  title: string;
  description: string | null;
  order: number | null;
  category_id: number;
};

export default function VodTopicList() {
  const [categories, setCategories] = useState<VodCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [topics, setTopics] = useState<VodTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const childCategoryMap = useMemo(() => {
    const map = new Map<number, VodCategory>();
    categories.forEach((cat) => map.set(cat.id, cat));
    return map;
  }, [categories]);

  const loadChildCategories = async () => {
    const { data, error: fetchError } = await supabase
      .from("vod_category")
      .select("id, name, parent_id")
      .not("parent_id", "is", null)
      .order("order", { ascending: true, nullsLast: true })
      .order("id", { ascending: true });

    if (fetchError) {
      console.error("카테고리 불러오기 오류", fetchError);
      setCategories([]);
      return;
    }

    setCategories((data ?? []) as VodCategory[]);
  };

  const loadTopics = async (categoryId: number) => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("vod_topics")
      .select("id, title, description, order, category_id")
      .eq("category_id", categoryId)
      .order("order", { ascending: true, nullsLast: true })
      .order("id", { ascending: true });

    if (fetchError) {
      console.error("토픽 불러오기 오류", fetchError);
      setError("토픽을 불러오지 못했습니다.");
      setTopics([]);
      setLoading(false);
      return;
    }

    setTopics((data ?? []) as VodTopic[]);
    setLoading(false);
  };

  useEffect(() => {
    void loadChildCategories();
  }, []);

  useEffect(() => {
    const numericId = Number(selectedCategoryId);
    if (!selectedCategoryId || Number.isNaN(numericId)) {
      setTopics([]);
      return;
    }

    void loadTopics(numericId);
  }, [selectedCategoryId]);

  const selectedCategoryName = useMemo(() => {
    const idNum = Number(selectedCategoryId);
    if (!idNum || Number.isNaN(idNum)) return "";
    return childCategoryMap.get(idNum)?.name ?? "";
  }, [selectedCategoryId, childCategoryMap]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-[#404040]">VOD 토픽 관리</h1>
          <p className="text-sm text-[#7a6f68] mt-1">
            하위 카테고리를 선택해 해당 토픽을 관리합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              void loadChildCategories();
              const numericId = Number(selectedCategoryId);
              if (selectedCategoryId && !Number.isNaN(numericId)) {
                void loadTopics(numericId);
              }
            }}
            className="flex items-center gap-2 px-3 py-2 border border-[#e6decd] rounded-lg text-sm text-[#404040] hover:bg-[#f8f5e9]"
          >
            <RefreshCcw size={16} /> 새로고침
          </button>
          <Link
            to={
              selectedCategoryId
                ? `/admin/vod/topics/new?categoryId=${selectedCategoryId}`
                : "#"
            }
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
              selectedCategoryId
                ? "bg-[#f8f5e9] hover:bg-[#f3efe4] text-[#404040]"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
            aria-disabled={!selectedCategoryId}
          >
            <Plus size={16} /> 토픽 생성
          </Link>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[#404040]">하위 카테고리 선택</label>
        <select
          className="w-full md:max-w-sm border rounded-lg px-3 py-2 bg-white"
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
        >
          <option value="">하위 카테고리를 선택하세요</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!selectedCategoryId ? (
        <p className="text-sm text-gray-500">하위 카테고리를 먼저 선택하세요.</p>
      ) : loading ? (
        <p className="text-sm text-gray-500">토픽을 불러오는 중...</p>
      ) : topics.length === 0 ? (
        <p className="text-sm text-gray-500">등록된 토픽이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="flex items-start justify-between gap-3 p-4 bg-white border rounded-xl shadow-sm"
            >
              <div className="space-y-1">
                <p className="text-xs text-[#7a6f68]">카테고리: {selectedCategoryName}</p>
                <p className="font-semibold text-[#404040]">{topic.title}</p>
                {topic.description && (
                  <p className="text-sm text-[#7a6f68] whitespace-pre-line">
                    {topic.description}
                  </p>
                )}
                <p className="text-xs text-[#7a6f68]">정렬: {topic.order ?? "-"}</p>
              </div>
              <Link
                to={`/admin/vod/topics/${topic.id}`}
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
