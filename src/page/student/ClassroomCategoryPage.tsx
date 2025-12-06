import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

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
    <div className="px-4 py-4 bg-[#fffdf6] min-h-screen">
      <h1 className="text-xl font-bold mb-4 text-[#404040]">
        강의실 카테고리
      </h1>

      {parents.map((parent) => {
        const isOpen = openParentId === parent.id;
        const subItems = children.filter((c) => c.parent_id === parent.id);

        return (
          <div key={parent.id} className="mb-4">
            {/* Parent Card (홈 화면 카드와 동일 스타일) */}
            <button
              onClick={() =>
                setOpenParentId((prev) => (prev === parent.id ? null : parent.id))
              }
              className="
                w-full text-left bg-white rounded-2xl shadow-sm
                p-4 mb-2 border border-[#f1f1f1]
              "
            >
              <div className="text-base font-semibold text-[#404040]">
                {parent.name}
              </div>
            </button>

            {/* Child Cards */}
            {isOpen && (
              <div className="space-y-3 pl-2">
                {subItems.map((child) => (
                  <button
                    key={child.id}
                    onClick={() =>
                      navigate(`/student/classroom/${child.id}`)
                    }
                    className="
                      w-full text-left bg-white rounded-2xl shadow-sm
                      p-4 border border-[#f1f1f1]
                    "
                  >
                    <div className="text-base font-medium text-[#404040]">
                      {child.name}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
