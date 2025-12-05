import { useState, useEffect } from "react";
import { Plus, Trash2, Edit } from "lucide-react";

export default function ClassroomNotices() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [notices, setNotices] = useState([]);

  // 새 공지 작성
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
  });

  // 수정용
  const [editingNotice, setEditingNotice] = useState(null);

  // ----------------------------------------------------
  // 📌 강의실 카테고리 가져오기
  // ----------------------------------------------------
  useEffect(() => {
    setCategories([
      { id: 1, name: "캔디마 기초반" },
      { id: 2, name: "AI 일러스트 챌린지" },
      { id: 3, name: "굿즈 디자인 실전반" },
    ]);
  }, []);

  // ----------------------------------------------------
  // 📌 선택된 강의실의 공지 목록 불러오기
  // ----------------------------------------------------
  useEffect(() => {
    if (!selectedCategory) return;

    async function loadNotices() {
      // TODO: Supabase 조회
      setNotices([
        {
          id: 1,
          title: "📌 오리엔테이션 안내",
          content: "첫 수업은 Zoom 링크로 진행됩니다.",
        },
        {
          id: 2,
          title: "📌 과제 제출 안내",
          content: "과제는 강의실 → 과제 탭에서 제출해주세요.",
        },
      ]);
    }

    loadNotices();
  }, [selectedCategory]);

  // ----------------------------------------------------
  // 📌 새 공지 추가
  // ----------------------------------------------------
  const handleAddNotice = () => {
    if (!newNotice.title || !newNotice.content) {
      return alert("제목과 내용을 모두 입력하세요!");
    }

    const item = {
      id: Date.now(),
      title: newNotice.title,
      content: newNotice.content,
    };

    setNotices((prev) => [...prev, item]);
    setNewNotice({ title: "", content: "" });
  };

  // ----------------------------------------------------
  // 📌 삭제
  // ----------------------------------------------------
  const handleDelete = (id: number) => {
    if (!confirm("삭제하시겠습니까?")) return;
    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  // ----------------------------------------------------
  // 📌 수정 저장
  // ----------------------------------------------------
  const handleSaveEdit = () => {
    setNotices((prev) =>
      prev.map((n) => (n.id === editingNotice.id ? editingNotice : n))
    );
    setEditingNotice(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#404040] mb-6">
        강의실 공지 관리
      </h1>

      {/* ---------------------- 강의실 선택 ---------------------- */}
      <div className="mb-6">
        <label className="text-sm font-medium text-[#404040]">
          강의실 선택
        </label>

        <select
          className="mt-1 w-full border rounded-lg px-3 py-2 bg-white"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">강의실을 선택하세요</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCategory && (
        <>
          {/* ---------------------- 공지 작성 ---------------------- */}
          <div className="border rounded-xl bg-white p-5 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-[#404040] mb-3">
              새 공지 작성
            </h2>

            <input
              type="text"
              placeholder="공지 제목"
              className="w-full border rounded-lg px-3 py-2 mb-3"
              value={newNotice.title}
              onChange={(e) =>
                setNewNotice((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
            />

            <textarea
              placeholder="공지 내용"
              rows={4}
              className="w-full border rounded-lg px-3 py-2 mb-3"
              value={newNotice.content}
              onChange={(e) =>
                setNewNotice((prev) => ({
                  ...prev,
                  content: e.target.value,
                }))
              }
            />

            <button
              onClick={handleAddNotice}
              className="flex items-center gap-2 bg-[#f3efe4] text-[#404040] px-4 py-2 rounded-lg"
            >
              <Plus size={18} />
              등록하기
            </button>
          </div>

          {/* ---------------------- 공지 리스트 ---------------------- */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#404040] mb-4">
              등록된 공지 목록
            </h2>

            {notices.length === 0 && (
              <p className="text-sm text-[#777]">등록된 공지가 없습니다.</p>
            )}

            <ul className="space-y-4">
              {notices.map((notice) => (
                <li
                  key={notice.id}
                  className="border-b pb-4 flex justify-between"
                >
                  <div>
                    <p className="font-semibold text-[#404040] text-lg">
                      {notice.title}
                    </p>
                    <p className="text-sm text-[#555] whitespace-pre-line">
                      {notice.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEditingNotice(notice)}
                      className="text-gray-600 hover:text-black"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(notice.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* ---------------------- 공지 수정 모달 ---------------------- */}
      {editingNotice && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">공지 수정</h2>

            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 mb-3"
              value={editingNotice.title}
              onChange={(e) =>
                setEditingNotice((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
            />

            <textarea
              className="w-full border rounded-lg px-3 py-2 mb-3"
              rows={4}
              value={editingNotice.content}
              onChange={(e) =>
                setEditingNotice((prev) => ({
                  ...prev,
                  content: e.target.value,
                }))
              }
            />

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg"
                onClick={() => setEditingNotice(null)}
              >
                취소
              </button>

              <button
                className="px-4 py-2 bg-[#f3efe4] text-[#404040] rounded-lg"
                onClick={handleSaveEdit}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}