import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, RefreshCcw, Edit3 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type VodCategory = {
  id: number;
  name: string;
  parent_id: number | null;
  order?: number | null;
};

export default function VodCategoryList() {
  const [parentCategories, setParentCategories] = useState<VodCategory[]>([]);
  const [childCategories, setChildCategories] = useState<VodCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parentNameMap = useMemo(() => {
    const map = new Map<number, string>();
    parentCategories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [parentCategories]);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);

    const [parentRes, childRes] = await Promise.all([
      supabase
        .from("vod_category")
        .select("id, name, parent_id, order")
        .is("parent_id", null)
        .order("order", { ascending: true, nullsLast: true })
        .order("id", { ascending: true }),
      supabase
        .from("vod_category")
        .select("id, name, parent_id, order")
        .not("parent_id", "is", null)
        .order("order", { ascending: true, nullsLast: true })
        .order("id", { ascending: true }),
    ]);

    if (parentRes.error || childRes.error) {
      console.error("카테고리 불러오기 오류", parentRes.error || childRes.error);
      setError("카테고리를 불러오는 중 문제가 발생했습니다.");
      setParentCategories([]);
      setChildCategories([]);
      setLoading(false);
      return;
    }

    setParentCategories((parentRes.data ?? []) as VodCategory[]);
    setChildCategories((childRes.data ?? []) as VodCategory[]);
    setLoading(false);
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-[#404040]">VOD 카테고리 관리</h1>
          <p className="text-sm text-[#7a6f68] mt-1">
            상위/하위 카테고리를 분리해 관리합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/vod/categories/new?type=parent"
            className="flex items-center gap-2 px-4 py-2 bg-[#f8f5e9] hover:bg-[#f3efe4] rounded-lg text-sm text-[#404040]"
          >
            <Plus size={16} /> 상위 카테고리 생성
          </Link>
          <Link
            to="/admin/vod/categories/new?type=child"
            className="flex items-center gap-2 px-4 py-2 bg-[#f8f5e9] hover:bg-[#f3efe4] rounded-lg text-sm text-[#404040]"
          >
            <Plus size={16} /> 하위 카테고리 생성
          </Link>
          <button
            type="button"
            onClick={() => void loadCategories()}
            className="flex items-center gap-2 px-3 py-2 border border-[#e6decd] rounded-lg text-sm text-[#404040] hover:bg-[#f8f5e9]"
          >
            <RefreshCcw size={16} /> 새로고침
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-lg font-semibold text-[#404040]">상위 카테고리</h2>
          <span className="text-xs text-[#7a6f68]">parent_id = NULL</span>
        </div>

        <div className="grid gap-3">
          {loading && parentCategories.length === 0 ? (
            <p className="text-sm text-gray-500">불러오는 중...</p>
          ) : parentCategories.length === 0 ? (
            <p className="text-sm text-gray-500">등록된 상위 카테고리가 없습니다.</p>
          ) : (
            parentCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-3 p-4 bg-white border rounded-xl shadow-sm"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-[#404040]">{cat.name}</p>
                  <p className="text-xs text-[#7a6f68]">
                    정렬: {cat.order ?? "-"}
                  </p>
                </div>
                <Link
                  to={`/admin/vod/categories/${cat.id}`}
                  className="flex items-center gap-1 px-3 py-2 text-sm bg-[#f8f5e9] hover:bg-[#f3efe4] rounded-lg text-[#404040]"
                >
                  <Edit3 size={16} /> 수정
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-lg font-semibold text-[#404040]">하위 카테고리</h2>
          <span className="text-xs text-[#7a6f68]">parent_id IS NOT NULL</span>
        </div>

        <div className="grid gap-3">
          {loading && childCategories.length === 0 ? (
            <p className="text-sm text-gray-500">불러오는 중...</p>
          ) : childCategories.length === 0 ? (
            <p className="text-sm text-gray-500">등록된 하위 카테고리가 없습니다.</p>
          ) : (
            childCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-3 p-4 bg-white border rounded-xl shadow-sm"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-[#404040]">{cat.name}</p>
                  <p className="text-xs text-[#7a6f68]">
                    상위 카테고리: {cat.parent_id ? parentNameMap.get(cat.parent_id) : "-"}
                  </p>
                  <p className="text-xs text-[#7a6f68]">정렬: {cat.order ?? "-"}</p>
                </div>
                <Link
                  to={`/admin/vod/categories/${cat.id}`}
                  className="flex items-center gap-1 px-3 py-2 text-sm bg-[#f8f5e9] hover:bg-[#f3efe4] rounded-lg text-[#404040]"
                >
                  <Edit3 size={16} /> 수정
                </Link>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
