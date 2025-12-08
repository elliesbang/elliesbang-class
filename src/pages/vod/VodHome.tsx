import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

type VodCategory = {
  id: number;
  name: string;
};

type VodProgram = {
  id: number;
  category_id: number;
  title: string;
  thumbnail_url: string | null;
  description: string | null;
};

export default function VodHome() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<VodCategory[]>([]);
  const [programs, setPrograms] = useState<VodProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);

      const [{ data: catData }, { data: progData }] = await Promise.all([
        supabase.from("vod_category").select("*").order("id"),
        supabase.from("vod_programs").select("*").order("id"),
      ]);

      setCategories(catData ?? []);
      setPrograms(progData ?? []);
      setLoading(false);
    }

    loadAll();
  }, []);

  if (loading) return <p className="p-4 text-center">불러오는 중...</p>;

  return (
    <div className="px-4 py-6 space-y-8">
      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <h2 className="text-lg font-bold text-[#404040]">
            {cat.name}
          </h2>

          {/* 프로그램 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {programs
              .filter((p) => p.category_id === cat.id)
              .map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl shadow cursor-pointer overflow-hidden border"
                  onClick={() => navigate(`/vod/program/${p.id}`)}
                >
                  <img
                    src={p.thumbnail_url || "/fallback-thumbnail.png"}
                    className="w-full h-40 object-cover"
                  />

                  <div className="p-3">
                    <p className="font-semibold text-[#404040]">{p.title}</p>
                    {p.description && (
                      <p className="text-sm text-[#7a6f68] line-clamp-2 mt-1">
                        {p.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
