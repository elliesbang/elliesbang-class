import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const generateAccessCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

type Category = {
  id: number;
  name: string;
  parent_id: number | null;
};

export default function ClassroomCreate() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(null);
  const [accessCode, setAccessCode] = useState<string>(generateAccessCode());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      const { data, error } = await supabase
        .from("class_category")
        .select("id, name, parent_id")
        .order("order_num", { ascending: true });

      if (error) {
        console.error("카테고리 불러오기 실패", error);
        setCategories([]);
      } else {
        setCategories((data ?? []) as Category[]);
      }
    };

    void loadCategories();
  }, []);

  const childCategories = useMemo(
    () => categories.filter((c) => c.parent_id !== null),
    [categories]
  );

  const resetCode = () => setAccessCode(generateAccessCode());

  const persistCode = async () => {
    if (!selectedClassroomId) {
      setMessage("하위 강의실을 선택해주세요.");
      return;
    }

    setSaving(true);
    setMessage(null);

    // 1) classroom_codes 테이블에 저장 시도
    const { error: codesError } = await supabase
      .from("classroom_codes")
      .upsert({ classroom_id: selectedClassroomId, access_code: accessCode });

    // 2) 실패하면 classes 테이블 코드 업데이트 시도
    if (codesError) {
      console.warn("classroom_codes 저장 실패", codesError.message);
      const { error: classesError } = await supabase
        .from("classes")
        .upsert({ category: selectedClassroomId, code: accessCode });

      if (classesError) {
        console.error("access code 저장 실패", classesError.message);
        setMessage("코드 저장에 실패했습니다. 다시 시도해주세요.");
        setSaving(false);
        return;
      }
    }

    setMessage("수강 코드가 생성되었습니다.");
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#404040]">강의실 수강 코드 생성</h1>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <label className="text-sm text-[#404040]">하위 강의실 선택</label>
        <select
          className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#FFD331] focus:outline-none"
          value={selectedClassroomId ?? ""}
          onChange={(e) => setSelectedClassroomId(Number(e.target.value) || null)}
        >
          <option value="">강의실을 선택하세요</option>
          {childCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#7a6f68]">자동 생성된 수강 코드</p>
            <p className="text-xl font-semibold text-[#404040]">{accessCode}</p>
          </div>
          <button
            type="button"
            onClick={resetCode}
            className="rounded-lg bg-[#f3f3f3] px-3 py-2 text-sm text-[#404040] hover:bg-[#e6e6e6]"
          >
            새로 생성
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={persistCode}
          disabled={saving}
          className="rounded-lg bg-[#FFD331] px-4 py-2 text-sm font-semibold text-[#404040] shadow-sm hover:bg-[#ffcd24] disabled:opacity-70"
        >
          {saving ? "저장 중..." : "코드 저장"}
        </button>
      </div>

      {message && <p className="text-sm text-[#7a6f68]">{message}</p>}
    </div>
  );
}
