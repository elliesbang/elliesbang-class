import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

type VodCategory = {
  id: number;
  name: string;
  order: number;
};

type VodProgram = {
  id: number;
  title: string;
  category_id: number;
};

export default function VodHome() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<VodCategory[]>([]);
  const [programs, setPrograms] = useState<VodProgram[]>([]);
  const [openCategory, setOpenCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // ----------------------------
  //  카테고리 + 프로그램 불러오기
  // ----------------------------
  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const { data: categoryData, error: categoryError } = await supabase
        .from("vod_category")
        .select("*")
        .order("order", { ascending: true });

      if (categoryError) {
        console.error("카테고리 불러오기 오류:", categoryError);
        return;
      }

      const { data: programData, error: programError } = await supabase
        .from("vod_programs")
        .select("*")
        .order("order", { ascending: true });

      if (programError) {
        console.error("프로그램 불러오기 오류:", programError);
        return;
      }

      setCategories(categoryData || []);
      setPrograms(programData || []);
      setLoading(false);
    }

    loadData();
  }, []);

  // 카테고리 토글
  const toggleCategory = (id: number) => {
    setOpenCategory(prev => (prev === id ? null : id));
  };

  if (loading) {
    return <div className="p-5">불러오는 중...</div>;
  }

  return (
    <div className="pb-20">
      <h1 className="text-xl font-bold p-5 text-[#404040]">VOD</h1>

      {/* ----------------------------
          카테고리 아코디언 시작
      ----------------------------- */}
      <div className="px-4">
        {categories.map((cat) => {
          const catPrograms = programs.filter(
            (p) => p.category_id === cat.id
          );

          const isOpen = openCategory === cat.id;

          return (
            <div
              key={cat.id}
              className="border-b border-gray-200 py-3"
            >
              {/* 카테고리 헤더 */}
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleCategory(cat.id)}
              >
                <span className="text-lg font-semibold text-[#404040]">
                  {cat.name}
                </span>

                {isOpen ? (
                  <ChevronDown size={20} className="text-gray-500" />
                ) : (
                  <ChevronRight size={20} className="text-gray-500" />
                )}
              </div>

              {/* 프로그램 리스트 */}
              {isOpen && (
                <div className="mt-3 space-y-2 pl-3">
                  {catPrograms.length === 0 && (
                    <p className="text-sm text-gray-500">
                      등록된 과정이 없습니다.
                    </p>
                  )}

                  {catPrograms.map((program) => (
                    <div
                      key={program.id}
                      onClick={() => navigate(`/vod/program/${program.id}`)}
                      className="py-2 px-3 bg-[#fafafa] rounded-lg text-[#404040] cursor-pointer hover:bg-[#f2f2f2]"
                    >
                      {program.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
