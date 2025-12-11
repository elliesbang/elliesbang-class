import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

type CategoryFormState = {
  name: string;
  order: number | null;
  parentId: number | null;
};

type VodCategory = {
  id: number;
  name: string;
  parent_id: number | null;
  order: number | null;
};

type CategoryType = "parent" | "child";

export default function VodCategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState<CategoryFormState>({
    name: "",
    order: null,
    parentId: null,
  });
  const [categoryType, setCategoryType] = useState<CategoryType>("parent");
  const [parentOptions, setParentOptions] = useState<VodCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryId = useMemo(() => (id ? Number(id) : null), [id]);

  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam === "child") {
      setCategoryType("child");
    } else {
      setCategoryType("parent");
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadParentCategories() {
      const { data, error: fetchError } = await supabase
        .from("vod_category")
        .select("id, name, parent_id, order")
        .is("parent_id", null)
        .order("order", { ascending: true, nullsLast: true })
        .order("id", { ascending: true });

      if (fetchError) {
        console.error("상위 카테고리 불러오기 오류", fetchError);
        setParentOptions([]);
        return;
      }

      setParentOptions((data ?? []) as VodCategory[]);
    }

    void loadParentCategories();
  }, []);

  useEffect(() => {
    async function loadCategory() {
      if (!categoryId) return;

      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("vod_category")
        .select("id, name, parent_id, order")
        .eq("id", categoryId)
        .maybeSingle();

      if (fetchError) {
        console.error("카테고리 불러오기 오류", fetchError);
        setError("카테고리를 불러오는 중 문제가 발생했습니다.");
        setLoading(false);
        return;
      }

      if (data) {
        const category = data as VodCategory;
        setForm({
          name: category.name,
          order: category.order,
          parentId: category.parent_id,
        });
        setCategoryType(category.parent_id ? "child" : "parent");
      }

      setLoading(false);
    }

    void loadCategory();
  }, [categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("카테고리 이름을 입력해주세요.");
      return;
    }

    if (categoryType === "child" && !form.parentId) {
      setError("하위 카테고리는 상위 카테고리를 선택해야 합니다.");
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      order: form.order,
      parent_id: categoryType === "parent" ? null : form.parentId,
    };

    if (categoryId) {
      const { error: updateError } = await supabase
        .from("vod_category")
        .update(payload)
        .eq("id", categoryId);

      if (updateError) {
        console.error("카테고리 수정 실패", updateError);
        setError("수정에 실패했습니다. 다시 시도해주세요.");
        setSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("vod_category")
        .insert(payload);

      if (insertError) {
        console.error("카테고리 생성 실패", insertError);
        setError("생성에 실패했습니다. 다시 시도해주세요.");
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    navigate("/admin/vod/categories");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg md:text-2xl font-bold text-[#404040]">
          {categoryId ? "카테고리 수정" : "카테고리 생성"}
        </h1>
        <p className="text-sm text-[#7a6f68] mt-1">
          {categoryType === "child"
            ? "type=child 로 접근한 경우 하위 카테고리를 생성합니다."
            : "type=parent 로 접근한 경우 상위 카테고리를 생성합니다."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-xl shadow-sm p-5 space-y-4"
      >
        <div className="space-y-1">
          <label className="text-sm font-medium text-[#404040]">카테고리 이름</label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={loading}
            placeholder="예) 국어"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[#404040]">정렬 순서</label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2"
            value={form.order ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                order: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            disabled={loading}
            placeholder="숫자가 작을수록 상단에 표시됩니다"
          />
        </div>

        {categoryType === "child" && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#404040]">
              상위 카테고리 선택
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2 bg-white"
              value={form.parentId ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  parentId: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              disabled={loading}
            >
              <option value="">상위 카테고리를 선택하세요</option>
              {parentOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-[#7a6f68]">
              parent_id IS NULL 인 카테고리만 선택할 수 있습니다.
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-[#404040] text-white rounded-lg text-sm hover:bg-[#2f2f2f] disabled:opacity-50"
          >
            {categoryId ? "수정하기" : "생성하기"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/vod/categories")}
            className="px-4 py-2 border border-[#e6decd] rounded-lg text-sm text-[#404040] hover:bg-[#f8f5e9]"
          >
            목록으로
          </button>
        </div>
      </form>
    </div>
  );
}
