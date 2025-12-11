import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

type VodTopic = {
  id: number;
  title: string;
  description: string | null;
  order: number | null;
  category_id: number;
};

type VodCategory = {
  id: number;
  name: string;
};

export default function VodTopicForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<VodCategory[]>([]);
  const [topic, setTopic] = useState<VodTopic | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const numericId = useMemo(() => (id ? Number(id) : null), [id]);
  const queryCategoryId = searchParams.get("categoryId");

  useEffect(() => {
    if (queryCategoryId) {
      setCategoryId(queryCategoryId);
    }
  }, [queryCategoryId]);

  useEffect(() => {
    async function loadCategories() {
      const { data, error: fetchError } = await supabase
        .from("vod_category")
        .select("id, name")
        .not("parent_id", "is", null)
        .order("order", { ascending: true, nullsLast: true })
        .order("id", { ascending: true });

      if (fetchError) {
        console.error("카테고리 불러오기 오류", fetchError);
        setCategories([]);
        return;
      }

      setCategories((data ?? []) as VodCategory[]);
    }

    void loadCategories();
  }, []);

  useEffect(() => {
    async function loadTopic() {
      if (!numericId) return;

      const { data, error: fetchError } = await supabase
        .from("vod_topics")
        .select("id, title, description, order, category_id")
        .eq("id", numericId)
        .maybeSingle();

      if (fetchError) {
        console.error("토픽 불러오기 오류", fetchError);
        setError("토픽을 불러오지 못했습니다.");
        return;
      }

      if (data) {
        const loaded = data as VodTopic;
        setTopic(loaded);
        setTitle(loaded.title);
        setDescription(loaded.description ?? "");
        setOrder(loaded.order);
        setCategoryId(String(loaded.category_id));
      }
    }

    void loadTopic();
  }, [numericId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericCategoryId = Number(categoryId);

    if (!categoryId || Number.isNaN(numericCategoryId)) {
      setError("카테고리를 선택해야 토픽을 저장할 수 있습니다.");
      return;
    }

    if (!title.trim()) {
      setError("토픽 제목을 입력해주세요.");
      return;
    }

    setSaving(true);

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      order,
      category_id: numericCategoryId,
    };

    if (numericId) {
      const { error: updateError } = await supabase
        .from("vod_topics")
        .update(payload)
        .eq("id", numericId);

      if (updateError) {
        console.error("토픽 수정 실패", updateError);
        setError("토픽 수정에 실패했습니다.");
        setSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("vod_topics")
        .insert(payload);

      if (insertError) {
        console.error("토픽 생성 실패", insertError);
        setError("토픽 생성에 실패했습니다.");
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    navigate("/admin/vod/topics");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg md:text-2xl font-bold text-[#404040]">
          {numericId ? "토픽 수정" : "토픽 생성"}
        </h1>
        <p className="text-sm text-[#7a6f68] mt-1">
          parent_id IS NOT NULL 카테고리에서만 토픽을 생성할 수 있습니다.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-xl shadow-sm p-5 space-y-4"
      >
        <div className="space-y-1">
          <label className="text-sm font-medium text-[#404040]">카테고리 선택</label>
          <select
            className="w-full border rounded-lg px-3 py-2 bg-white"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={!!topic && categories.length === 0}
          >
            <option value="">카테고리를 선택하세요</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[#404040]">토픽 제목</label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예) 문법 기초"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[#404040]">설명</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="토픽에 대한 설명을 입력하세요"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[#404040]">정렬 순서</label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2"
            value={order ?? ""}
            onChange={(e) =>
              setOrder(e.target.value === "" ? null : Number(e.target.value))
            }
            placeholder="숫자가 작을수록 상단에 노출됩니다"
          />
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
            onClick={() => navigate("/admin/vod/topics")}
            className="px-4 py-2 border border-[#e6decd] rounded-lg text-sm text-[#404040] hover:bg-[#f8f5e9]"
          >
            목록으로
          </button>
        </div>
      </form>
    </div>
  );
}
