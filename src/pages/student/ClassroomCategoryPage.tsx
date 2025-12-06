import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ClassroomCategoryPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [openParentId, setOpenParentId] = useState<number | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("class_category")
        .select("*")
        .order("order_num", { ascending: true });

      if (error) {
        console.error("카테고리 불러오기 오류:", error);
        return;
      }

      setCategories(data || []);
    };

    fetchCategories();
  }, []);

  const parents = categories.filter((c) => c.parent_id === null);
  const children = categories.filter((c) => c.parent_id !== null);

  return (
    <div className="bg-[#fffdf6] min-h-screen pt-4 pb-10">
      
      {/* ⭐ 공지카드와 동일한 가로폭 제한 + 중앙 정렬 */}
      <div className="mx-auto w-full max-w-4xl px-4">

        <h1 className="text-xl font-bold mb-4 text-[#404040]">
          강의실 카테고리
        </h1>

        {parents.map((parent) => {
          const isOpen = openParentId === parent.id;
          const subItems = children.filter((c) => c.parent_id === parent.id);

          return (
            <div key={parent.id} className="mb-4">

              {/* ───────── 상위 카테고리 Card ───────── */}
              <button
                onClick={() =>
                  setOpenParentId((prev) => (prev === parent.id ? null : parent.id))
                }
                className="
                  w-full flex justify-between items-center
                  bg-white rounded-2xl shadow-sm p-4 
                  border border-[#ececec]
                "
              >
                <span className="text-base font-semibold text-[#404040]">
                  {parent.name}
                </span>

                {isOpen ? (
                  <ChevronUp size={20} className="text-gray-500" />
                ) : (
                  <ChevronDown size={20} className="text-gray-500" />
                )}
              </button>

              {/* ───────── 하위 카테고리 목록 ───────── */}
              {isOpen && (
                <div className="space-y-3 mt-2">
                  {subItems.map((child) => (
                    <div
                      key={child.id}
                      className="
                        w-full bg-[#fffaf0] rounded-xl shadow-sm 
                        border border-[#f1f1f1]
                        px-4 py-3 
                        flex justify-between items-center
                      "
                    >
                      <span className="text-base text-[#404040]">{child.name}</span>

                      <button
                        onClick={() => navigate(`/student/classroom/${child.id}`)}
                        className="
                          bg-[#FFD331] text-[#404040] px-3 py-1 rounded-lg
                          text-sm font-medium shadow-sm hover:bg-[#ffcd24]
                        "
                      >
                        수강하기
                      </button>
                    </div>
                  ))}

                  {subItems.length === 0 && (
                    <p className="text-sm text-gray-400 pl-2">
                      하위 카테고리가 없습니다.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
}
