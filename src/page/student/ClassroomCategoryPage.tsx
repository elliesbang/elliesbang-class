import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { supabase } from "@/lib/supabaseClient"; // 나중에 수파베이스 붙일 때 사용
import { ChevronDown, ChevronRight } from "lucide-react";

type Category = {
  id: number;
  name: string;
  parent_id: number | null;
};

type GroupedCategory = Category & {
  children: Category[];
};

const ClassroomCategoryPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [openParentId, setOpenParentId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Category | null>(null);
  const [classCode, setClassCode] = useState("");
  const [error, setError] = useState("");

  // ---------------- 역할 가져오기 ----------------
  useEffect(() => {
    const r = localStorage.getItem("role");
    setRole(r);
  }, []);

  // ---------------- 카테고리 불러오기 ----------------
  useEffect(() => {
    async function loadCategories() {
      // TODO: supabase.from("classroom_category").select("*")
      // 지금은 더미 데이터로 테스트
      const dummy: Category[] = [
        { id: 1, name: "캔디마", parent_id: null },
        { id: 2, name: "AI&캔바", parent_id: null },
        { id: 10, name: "캔디마 1기", parent_id: 1 },
        { id: 11, name: "캔디마 2기", parent_id: 1 },
        { id: 20, name: "AI 그림책", parent_id: 2 },
      ];
      setCategories(dummy);
    }

    loadCategories();
  }, []);

  // ---------------- 상/하위 카테고리 그룹 ----------------
  const groupedCategories: GroupedCategory[] = useMemo(() => {
    const parents = categories.filter((c) => c.parent_id === null);
    const children = categories.filter((c) => c.parent_id !== null);

    return parents.map((p) => ({
      ...p,
      children: children.filter((child) => child.parent_id === p.id),
    }));
  }, [categories]);

  const toggleParent = (id: number) => {
    setOpenParentId((current) => (current === id ? null : id));
  };

  // ---------------- 수강하기 버튼 클릭 ----------------
  const handleClickEnroll = (child: Category) => {
    if (role === "admin") {
      // 관리자: 코드 없이 바로 입장
      return navigate(`/student/classroom/${child.id}`);
    }

    // 수강생 / (추후 vod 등) → 코드 입력 모달
    setSelectedChild(child);
    setClassCode("");
    setError("");
    setIsModalOpen(true);
  };

  // ---------------- 코드 검증 & 입장 ----------------
  const handleSubmitCode = async () => {
    if (!selectedChild) return;

    if (!classCode.trim()) {
      setError("코드를 입력해주세요.");
      return;
    }

    // TODO: Supabase에서 classes 테이블에 접근해서 코드 검증
    // - table: classes (또는 class_info)
    // - where: categoryId = selectedChild.id AND code = classCode
    // const { data, error: dbError } = await supabase
    //   .from("classes")
    //   .select("*")
    //   .eq("categoryId", selectedChild.id)
    //   .eq("code", classCode)
    //   .maybeSingle();

    // 임시: 코드가 "ABC123" 인 경우만 통과
    if (classCode !== "ABC123") {
      setError("유효하지 않은 코드입니다.");
      return;
    }

    // TODO: 수강 등록 로직 (enrollments 테이블에 insert 등)
    // await supabase.from("enrollments").insert(...)

    setIsModalOpen(false);
    navigate(`/student/classroom/${selectedChild.id}`);
  };

  return (
    <div className="min-h-screen bg-[#fffdf6] px-4 pb-24 pt-4">
      <h1 className="mb-4 text-2xl font-bold text-[#404040]">
        강의실 선택
      </h1>
      <p className="mb-6 text-sm text-[#7a6f68]">
        수강을 원하는 강의실 하위 카테고리에서{" "}
        <span className="font-semibold">수강하기</span> 버튼을 눌러
        입장 코드를 입력해주세요.
      </p>

      <div className="space-y-3">
        {groupedCategories.map((parent) => (
          <div
            key={parent.id}
            className="overflow-hidden rounded-2xl border bg-white shadow-sm"
          >
            <button
              className="flex w-full items-center justify-between px-4 py-3"
              onClick={() => toggleParent(parent.id)}
            >
              <span className="text-base font-semibold text-[#404040]">
                {parent.name}
              </span>
              {openParentId === parent.id ? (
                <ChevronDown size={18} className="text-[#7a6f68]" />
              ) : (
                <ChevronRight size={18} className="text-[#7a6f68]" />
              )}
            </button>

            {openParentId === parent.id && (
              <div className="border-t bg-[#fffaf0]">
                {parent.children.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-[#7a6f68]">
                    아직 등록된 하위 강의실이 없습니다.
                  </p>
                ) : (
                  parent.children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between border-t px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#404040]">
                          {child.name}
                        </p>
                      </div>

                      <button
                        className="rounded-full bg-[#f3efe4] px-4 py-1 text-xs font-medium text-[#404040]"
                        onClick={() => handleClickEnroll(child)}
                      >
                        수강하기
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ---------------- 코드 입력 모달 ---------------- */}
      {isModalOpen && selectedChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-bold text-[#404040]">
              수강 코드 입력
            </h2>
            <p className="mt-1 text-sm text-[#7a6f68]">
              강의실: <span className="font-semibold">{selectedChild.name}</span>
            </p>

            <input
              type="text"
              value={classCode}
              onChange={(e) => {
                setClassCode(e.target.value);
                setError("");
              }}
              placeholder="예: A1B2C3"
              className="mt-4 w-full rounded-lg border px-3 py-2 text-sm"
            />

            {error && (
              <p className="mt-2 text-xs text-red-500">{error}</p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm"
              >
                취소
              </button>
              <button
                onClick={handleSubmitCode}
                className="rounded-lg bg-[#f3efe4] px-4 py-2 text-sm font-medium text-[#404040]"
              >
                입장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomCategoryPage;