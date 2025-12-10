import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { Plus, Edit, Trash2, RefreshCcw } from "lucide-react";

export default function ClassManage() {
  const [categories, setCategories] = useState([]);

   // ⬇️⬇️⬇️ 여기 아래에 바로 넣어 ⬇️⬇️⬇️
  const [classList, setClassList] = useState([]);

  const [newClass, setNewClass] = useState({
    name: "",
    categoryId: "",
    code: "",
    startDate: "",
    endDate: "",
    assignmentDeadline: "all_day",
    days: [],
  });

  const [editingClass, setEditingClass] = useState(null);

  const dayOptions = ["월", "화", "수", "목", "금", "토", "일"];


  // 📌 카테고리 불러오기
useEffect(() => {
  async function loadCategories() {
    const { data, error } = await supabase
      .from("class_category")
      .select("id, name, depth, parent_id, order_index")
      .eq("depth", 2) // depth=2만 가져오기
      .order("order_index", { ascending: true });

    if (error) {
      console.error("카테고리 불러오기 오류", error);
      return;
    }

    setCategories(data || []);
  }

  loadCategories();
}, []);



  // ------------------------------------------
  // 📌 기존 수업 목록 불러오기
  // ------------------------------------------
 // ------------------------------------------
// 📌 실제 Supabase 수업 목록 불러오기
// ------------------------------------------
useEffect(() => {
  async function loadClasses() {
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("수업 불러오기 오류", error);
      return;
    }

    // Supabase → React state 형식으로 변환
    const mapped = data.map((item) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      category: item.category, // categoryId 대신 category 텍스트
      startDate: item.start_date,
      endDate: item.end_date,
      days: item.assignment_days ?? [],
      assignmentDeadline: item.assignment_rule_type,
    }));

    setClassList(mapped);
  }

  loadClasses();
}, []);

  // ------------------------------------------
  // 📌 랜덤 코드 생성
  // ------------------------------------------
  const generateRandomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setNewClass((prev) => ({ ...prev, code }));
  };

  const generateEditRandomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setEditingClass((prev) => ({ ...prev, code }));
  };

  // ------------------------------------------
  // 📌 수업 생성
  // ------------------------------------------
  // 📌 수업 생성 (Supabase INSERT)
const handleCreate = async () => {
  if (!newClass.name || !newClass.categoryId || !newClass.startDate) {
    return alert("필수 항목을 입력해주세요!");
  }

  const payload = {
    name: newClass.name,
    category: newClass.categoryId, // categoryId → category 컬럼에 저장
    code: newClass.code,
    start_date: newClass.startDate,
    end_date: newClass.endDate,
    assignment_rule_type: newClass.assignmentDeadline,
    assignment_days: newClass.days,
  };

  const { data, error } = await supabase
    .from("classes")
    .insert([payload])
    .select();

  if (error) {
    console.error("수업 생성 실패", error);
    return alert("수업 생성 중 오류가 발생했습니다.");
  }

  // 화면 반영
  setClassList((prev) => [
    { ...data[0] },
    ...prev,
  ]);

  // 입력 폼 초기화
  setNewClass({
    name: "",
    categoryId: "",
    code: "",
    startDate: "",
    endDate: "",
    assignmentDeadline: "all_day",
    days: [],
  });

  alert("수업이 생성되었습니다!");
};


  // ------------------------------------------
  // 📌 삭제
  // ------------------------------------------
 // 📌 수업 삭제
const handleDelete = async (id) => {
  if (!confirm("이 수업을 삭제하시겠습니까?")) return;

  const { error } = await supabase
    .from("classes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("수업 삭제 실패", error);
    return alert("삭제 중 오류가 발생했습니다.");
  }

  // 화면 반영
  setClassList((prev) => prev.filter((cls) => cls.id !== id));
};


  // ------------------------------------------
  // 📌 수정 수정
  // ------------------------------------------
  // 📌 수업 수정
const handleSaveEdit = async () => {
  const payload = {
    name: editingClass.name,
    code: editingClass.code,
    start_date: editingClass.startDate,
    end_date: editingClass.endDate,
    assignment_days: editingClass.days,
  };

  const { error } = await supabase
    .from("classes")
    .update(payload)
    .eq("id", editingClass.id);

  if (error) {
    console.error("수업 수정 실패", error);
    return alert("수업 수정 중 오류가 발생했습니다.");
  }

  // UI 반영
  setClassList((prev) =>
    prev.map((c) =>
      c.id === editingClass.id ? editingClass : c
    )
  );

  setEditingClass(null);
  alert("수업이 수정되었습니다!");
};


  // 요일 토글
  const toggleDay = (day, stateSetter, currentObj) => {
    const exists = currentObj.days.includes(day);

    const updatedDays = exists
      ? currentObj.days.filter((d) => d !== day)
      : [...currentObj.days, day];

    stateSetter((prev) => ({ ...prev, days: updatedDays }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-lg md:text-2xl font-bold text-[#404040] mb-2 whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
        수업 관리
      </h1>

      {/* ---------------- 새 수업 생성 ---------------- */}
      <div className="border rounded-xl bg-white p-5 shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">새 수업 추가</h2>

        <input
          type="text"
          placeholder="수업명"
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={newClass.name}
          onChange={(e) =>
            setNewClass((prev) => ({ ...prev, name: e.target.value }))
          }
        />

        {/* 카테고리 선택 */}
        <select
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={newClass.categoryId}
          onChange={(e) =>
            setNewClass((prev) => ({ ...prev, categoryId: e.target.value }))
          }
        >
          <option value="">카테고리 선택</option>
          {categories.map((cat) => (
            <option value={cat.id} key={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* 랜덤 코드 */}
        <div className="flex items-center gap-3 mb-3">
          <input
            type="text"
            placeholder="랜덤 코드"
            className="w-full border rounded-lg px-3 py-2"
            value={newClass.code}
            onChange={(e) =>
              setNewClass((prev) => ({ ...prev, code: e.target.value }))
            }
          />
          <button
            onClick={generateRandomCode}
            className="p-2 bg-gray-100 rounded-lg"
          >
            <RefreshCcw size={18} />
          </button>
        </div>

        {/* 날짜 */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <span className="text-sm">시작일</span>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2"
              value={newClass.startDate}
              onChange={(e) =>
                setNewClass((prev) => ({ ...prev, startDate: e.target.value }))
              }
            />
          </div>
          <div>
            <span className="text-sm">종료일</span>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2"
              value={newClass.endDate}
              onChange={(e) =>
                setNewClass((prev) => ({ ...prev, endDate: e.target.value }))
              }
            />
          </div>
        </div>

        {/* 과제 마감 옵션 */}
        <div className="mb-3">
          <span className="text-sm">과제 마감 시간</span>
          <select
            className="w-full border rounded-lg px-3 py-2 mt-1"
            value={newClass.assignmentDeadline}
            onChange={(e) =>
              setNewClass((prev) => ({
                ...prev,
                assignmentDeadline: e.target.value,
              }))
            }
          >
            <option value="all_day">언제나</option>
            <option value="same_day">자정~23:59</option>
          </select>
        </div>

        {/* 요일 체크박스 */}
        <div className="mb-4">
          <span className="text-sm">수업 요일</span>
          <div className="flex gap-3 flex-wrap mt-2">
            {dayOptions.map((day) => (
              <button
                key={day}
                onClick={() =>
                  toggleDay(day, setNewClass, newClass)
                }
                className={`px-3 py-1 rounded-full border ${
                  newClass.days.includes(day)
                    ? "bg-[#f3efe4] text-[#404040]"
                    : "bg-white"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleCreate}
          className="w-full bg-[#f3efe4] text-[#404040] py-3 rounded-lg font-medium"
        >
          저장하기
        </button>
      </div>

      {/* ---------------- 수업 목록 ---------------- */}
      <div className="border rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">등록된 수업 목록</h2>

        <ul className="space-y-4">
          {classList.map((cls) => (
            <li
              key={cls.id}
              className="border-b pb-4 flex justify-between items-start"
            >
              <div>
                <p className="text-lg font-semibold">{cls.name}</p>
                <p className="text-sm text-[#777]">
                  코드: {cls.code}
                </p>
                <p className="text-sm">
                  기간: {cls.startDate} ~ {cls.endDate}
                </p>
                <p className="text-sm">
                  요일: {cls.days.join(", ")}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  className="text-gray-600 hover:text-black"
                  onClick={() => setEditingClass(cls)}
                >
                  <Edit size={18} />
                </button>

                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(cls.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ---------------- 수정 모달 ---------------- */}
      {editingClass && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl">
            <h2 className="text-lg font-semibold mb-4">수업 수정</h2>

            {/* 수업명 */}
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 mb-3"
              value={editingClass.name}
              onChange={(e) =>
                setEditingClass((prev) => ({ ...prev, name: e.target.value }))
              }
            />

            {/* 코드 */}
            <div className="flex items-center gap-3 mb-3">
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                value={editingClass.code}
                onChange={(e) =>
                  setEditingClass((prev) => ({ ...prev, code: e.target.value }))
                }
              />
              <button
                onClick={generateEditRandomCode}
                className="p-2 bg-gray-100 rounded-lg"
              >
                <RefreshCcw size={18} />
              </button>
            </div>

            {/* 날짜 */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2"
                value={editingClass.startDate}
                onChange={(e) =>
                  setEditingClass((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />

              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2"
                value={editingClass.endDate}
                onChange={(e) =>
                  setEditingClass((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
              />
            </div>

            {/* 요일 */}
            <div className="mb-4">
              <span className="text-sm">수업 요일</span>
              <div className="flex gap-3 flex-wrap mt-2">
                {dayOptions.map((day) => (
                  <button
                    key={day}
                    onClick={() =>
                      toggleDay(day, setEditingClass, editingClass)
                    }
                    className={`px-3 py-1 rounded-full border ${
                      editingClass.days.includes(day)
                        ? "bg-[#f3efe4] text-[#404040]"
                        : "bg-white"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* 저장 */}
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg"
                onClick={() => setEditingClass(null)}
              >
                취소
              </button>

              <button
                className="px-4 py-2 bg-[#f3efe4] text-[#404040] rounded-lg"
                onClick={handleSaveEdit}
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
