import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import type { VodCategory } from "@/types/VodVideo";

export default function VodHome() {
  const [categories, setCategories] = useState<VodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("vod_category")
      .select("id, name")
      .order("id", { ascending: true });

    if (!error) setCategories(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500 p-6">불러오는 중...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-5">VOD 강의</h1>

      <div className="grid grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex flex-col items-center cursor-pointer"
            onClick={() => navigate(`/vod/category/${cat.id}`)}
          >
            <div className="w-14 h-14 rounded-full bg-[#fdf7d8] flex items-center justify-center shadow">
              <span className="text-2xl">🎬</span>
            </div>
            <p className="text-sm mt-2 text-center">{cat.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
