import { useEffect, useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function GlobalNotices() {
  const [notices, setNotices] = useState([]);

  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    order: "",
  });

  const [editingNotice, setEditingNotice] = useState(null);

  // ----------------------------------------------------
  // 📌 전체 공지 불러오기
  // ----------------------------------------------------
  useEffect(() => {
    async function loadNotices() {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("공지 불러오기 오류", error);
          setNotices([]);
          return;
        }

        setNotices(data || []);
      } catch (err) {
        console.error("공지 불러오기 실패", err);
        setNotices([]);
      }
    }

    loadNotices();
  }, []);

  // ----------------------------------------------------
  // 📌 공지 추가
  // ----------------------------------------------------
  const handleAddNotice = () => {
    if (!newNotice.title || !newNotice.content) {
      return alert("제목과 내용을 모두 입력해주세요!");
    }

    const newItem = {
      id: Date.now(),
      title: newNotice.title,
      content: newNotice.content,
      order: newNotice.order || 99,
    };

    setNotices((prev) => [...prev, newItem]);
    setNewNotice({ title: "", content: "", order: "" });
  };

  // ----------------------------------------------------
  // 📌 공지 삭제
  // ----------------------------------------------------
  const handleDelete = (id) => {
    if (!confirm("삭제하시겠습니까?")) return;

    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  // ----------------------------------------------------
  // 📌 공지 수정 저장
  // ----------------------------------------------------
  const handleSaveEdit = () => {
    setNotices((prev) =>
      prev.map((item) =>
        item.id === editingNotice.id ? editingNotice : item
      )
    );
    setEditingNotice(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#404040] mb-6">전체 공지 관리</h1>

      {/* ---------------------- 새 공지 작성 ---------------------- */}
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
            setNewNotice((prev) => ({ ...prev, title: e.target.value }))
          }
        />

        <textarea
          placeholder="공지 내용"
          rows={4}
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={newNotice.content}
          onChange={(e) =>
            setNewNotice((prev) => ({ ...prev, content: e.target.value }))
          }
        />

        <input
          type="number"
          placeholder="노출 순서 (선택)"
          className="w-full border rounded-lg px-3 py-2 mb-4"
          value={newNotice.order}
          onChange={(e) =>
            setNewNotice((prev) => ({ ...prev, order: e.target.value }))
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

      {/* ---------------------- 공지 목록 ---------------------- */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#404040] mb-4">
          등록된 전체 공지 목록
        </h2>

        {notices.length === 0 && (
          <p className="text-sm text-[#777]">등록된 공지가 없습니다.</p>
        )}

        <ul className="space-y-4">
          {notices
            .sort((a, b) => a.order - b.order)
            .map((notice) => (
              <li
                key={notice.id}
                className="border-b pb-4 flex justify-between items-start"
              >
                <div>
                  <p className="font-semibold text-[#404040] text-lg">
                    {notice.title}
                  </p>
                  <p className="text-sm text-[#555] whitespace-pre-line">
                    {notice.content}
                  </p>
                  <p className="text-xs text-[#888] mt-1">
                    순서: {notice.order}
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

      {/* ---------------------- 수정 모달 ---------------------- */}
      {editingNotice && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
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

            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 mb-3"
              value={editingNotice.order}
              onChange={(e) =>
                setEditingNotice((prev) => ({
                  ...prev,
                  order: e.target.value,
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
