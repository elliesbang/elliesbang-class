import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/auth/AuthProvider";
import ClassroomAccessCodeModal from "@/modals/ClassroomAccessCodeModal";

type ClassroomCategory = {
  id: number;
  name: string;
  parent_id: number | null;
  description?: string | null;
};

type SelectedClassroom = {
  id: number;
  name?: string;
};

export default function ClassroomHome() {
  const navigate = useNavigate();
  const { role } = useAuth();

  const [categories, setCategories] = useState<ClassroomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassroom, setSelectedClassroom] = useState<SelectedClassroom | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      const { data, error } = await supabase
        .from("class_category")
        .select("id, name, parent_id, description")
        .order("order_num", { ascending: true });

      if (error) {
        console.error("강의실 카테고리 불러오기 실패", error);
        setCategories([]);
      } else {
        setCategories((data ?? []) as ClassroomCategory[]);
      }

      setLoading(false);
    };

    void loadCategories();
  }, []);

  const parentCategories = useMemo(
    () => categories.filter((c) => c.parent_id === null),
    [categories]
  );

  const childCategories = useMemo(
    () => categories.filter((c) => c.parent_id !== null),
    [categories]
  );

  const getChildren = (parentId: number) =>
    childCategories.filter((c) => c.parent_id === parentId);

  const handleEnroll = (classroom: SelectedClassroom) => {
    if (role === "admin") {
      navigate(`/classroom/${classroom.id}`);
      return;
    }

    setSelectedClassroom(classroom);
  };

  const closeModal = () => setSelectedClassroom(null);

  const handleAccessSuccess = () => {
    const verifiedRaw = localStorage.getItem("verifiedClassrooms");
    const verified = verifiedRaw ? (JSON.parse(verifiedRaw) as number[]) : [];
    if (!verified.includes(selectedClassroom?.id ?? -1) && selectedClassroom) {
      verified.push(selectedClassroom.id);
      localStorage.setItem("verifiedClassrooms", JSON.stringify(verified));
    }

    if (selectedClassroom) {
      navigate(`/classroom/${selectedClassroom.id}`);
    }
  };

  if (loading) {
    return <p className="p-6 text-center text-gray-500">불러오는 중...</p>;
  }

  return (
    <div className="bg-[#fffdf6] min-h-screen pb-24 pt-4">
      <div className="mx-auto w-full max-w-4xl px-4">
        <h1 className="mb-4 text-xl font-bold text-[#404040]">강의실</h1>

        {parentCategories.map((parent) => {
          const children = getChildren(parent.id);

          return (
            <div key={parent.id} className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-[#404040]">{parent.name}</p>
                  {parent.description && (
                    <p className="text-sm text-[#7a6f68]">{parent.description}</p>
                  )}
                </div>
              </div>

              <div className="mt-3 space-y-3">
                {children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between rounded-xl border border-[#f1f1f1] bg-[#fffaf0] px-4 py-3"
                  >
                    <div>
                      <p className="text-base text-[#404040]">{child.name}</p>
                      {child.description && (
                        <p className="text-sm text-[#7a6f68]">{child.description}</p>
                      )}
                    </div>
                    {role !== "admin" && (
                      <button
                        type="button"
                        onClick={() => handleEnroll({ id: child.id, name: child.name })}
                        className="rounded-lg bg-[#FFD331] px-3 py-1 text-sm font-semibold text-[#404040] shadow-sm hover:bg-[#ffcd24]"
                      >
                        수강하기
                      </button>
                    )}
                    {role === "admin" && (
                      <button
                        type="button"
                        onClick={() => navigate(`/classroom/${child.id}`)}
                        className="rounded-lg bg-[#f2f2f2] px-3 py-1 text-sm text-[#404040] hover:bg-[#e6e6e6]"
                      >
                        바로가기
                      </button>
                    )}
                  </div>
                ))}

                {children.length === 0 && (
                  <p className="px-1 text-sm text-gray-400">등록된 하위 강의실이 없습니다.</p>
                )}
              </div>
            </div>
          );
        })}

        {parentCategories.length === 0 && (
          <p className="text-sm text-gray-500">등록된 강의실이 없습니다.</p>
        )}
      </div>

      {selectedClassroom && (
        <ClassroomAccessCodeModal
          classroomId={selectedClassroom.id}
          classroomName={selectedClassroom.name}
          onSuccess={handleAccessSuccess}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
