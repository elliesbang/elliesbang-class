import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import VodCategoryIcon from "@/components/VodCategoryIcon";
import type { VodCategory } from "@/types/VodVideo";

type VodCategoryWithParent = VodCategory & { parent_id: number | null };

export default function VodCategoryPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [parentCategory, setParentCategory] = useState<VodCategoryWithParent | null>(null);
  const [subCategories, setSubCategories] = useState<VodCategoryWithParent[]>([]);
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

      const [parentRes, subRes] = await Promise.all([
        supabase
          .from("vod_category")
          .select("id, name, parent_id")
          .eq("id", idNum)
          .maybeSingle(),
        supabase
          .from("vod_category")
          .select("id, name, parent_id")
          .eq("parent_id", idNum)
          .order("id", { ascending: true }),
      ]);

      if (parentRes.error) {
        setError("카테고리를 불러오지 못했습니다.");
        setParentCategory(null);
      } else {
        setParentCategory((parentRes.data ?? null) as VodCategoryWithParent | null);
      }

      if (subRes.error) {
        setError("하위 카테고리를 불러오지 못했습니다.");
        setSubCategories([]);
      } else {
        setSubCategories((subRes.data ?? []) as VodCategoryWithParent[]);
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
    <div className="p-6">
      <h1 className="text-xl font-bold mb-5">
        {parentCategory ? `${parentCategory.name} 하위 카테고리` : "카테고리"}
      </h1>

      {subCategories.length === 0 ? (
        <p className="text-center text-sm text-gray-500">하위 카테고리가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {subCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => navigate(`/vod/category/${cat.id}/topics`)}
            >
              <div className="w-14 h-14 rounded-full bg-[#f0f8ff] flex items-center justify-center shadow text-[#404040]">
                <VodCategoryIcon name={cat.name} />
              </div>
              <p className="text-sm mt-2 text-center">{cat.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
