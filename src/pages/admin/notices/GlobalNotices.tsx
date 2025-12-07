import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// ----------------------------------------------------
// 📌 테이블 구조와 일치시키기
// notifications 테이블의 실제 컬럼:
// id, title, content, is_visible, created_at
// ----------------------------------------------------
type Notice = {
  id: number;
  title: string;
  content: string | null;
  is_visible?: boolean | null;
  created_at?: string | null;
};

type NoticeForm = {
  title: string;
  content: string;
};

export default function GlobalNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);

  const [newNotice, setNewNotice] = useState<NoticeForm>({
    title: "",
    content: "",
  });

  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(false);

  // ----------------------------------------------------
  // 📌 공지 불러오기
  // ----------------------------------------------------
  const refreshNotices = useCallback(async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, content, is_visible, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("공지 불러오기 오류:", error);
        setNotices([]);
        return;
      }

      // 보이는(is_visible = true) 공지만 표시
      const filtered = (data ?? []).filter(
        (item) => item.is_visible !== false
      );

      setNotices(filtered as Notice[]);
    } catch (err) {
      console.error("공지 불러오기 실패:", err);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshNotices();
  }, [refreshNotices]);

  // ----------------------------------------------------
  // 📌 공지 추가
  // ----------------------------------------------------
  const handleAddNotice = async () => {
    if (!newNotice.title || !newNotice.content) {
      return alert("제목과 내용을 모두 입력해주세요!");
    }

    const payload = {
      title: newNotice.title,
      content: newNotice.content,
      is_visible: true,
    };

    const { error } = await supabase.from("notifications").insert(payload);

    if (error) {
      console.error("공지 등록 실패:", error);
      alert("공지 등록 실패! 다시 시도해주세요.");
      return;
    }

    setNewNotice({ title: "", content: "" });
    await refreshNotices();
  };

  // ----------------------------------------------------
  // 📌 공지 삭제 (soft delete → is_visible = false)
  // ----------------------------------------------------
  const handleDelete = async (id: number) => {
    if (!confirm("삭제하시겠습니까?")) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_visible: false })
      .eq("id", id);

    if (error) {
      console.error("공지 삭제 실패:", error);
      alert("공지 삭제 실패! 다시 시도해주세요.");
      return;
    }

    await refreshNotices();
  };

  // ----------------------------------------------------
  // 📌 공지 수정 (title, content만 수정)
  // ----------------------------------------------------
  const handleSaveEdit = async () => {
    if (!editingNotice) return;

    const { id, title, content } = editingNotice;

    const { error } = await supabase
      .from("notifications")
      .update({ title, content })
      .eq("id", id);

    if (error) {
      console.error("공지 수정 실패:", error);
      alert("공지 수정 실패! 다시 시도해주세요.");
      return;
    }

    setEditingNotice(null);
    await refreshNotices();
  };

  // ----------------------------------------------------
  // 📌 UI 시작
  // ----------------------------------------------------
  return (
    <div className="space-y-6">
      <h1 className="text-lg md:text-2xl font-bold text-[#404040] mb-2">
        전체 공지 관리
      </h1>

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

        {loading && <p className="text-sm text-[#777]">불러오는 중...</p>}

        {!loading && notices.length === 0 && (
          <p className="text-sm text-[#777]">등록된 공지가 없습니다.</p>
        )}

        <ul className="space-y-4">
          {notices.map((notice) => (
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
                  등록일: {notice.created_at?.slice(0, 10)}
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
                setEditingNotice((prev) =>
                  prev ? { ...prev, title: e.target.value } : prev
                )
              }
            />

            <textarea
              className="w-full border rounded-lg px-3 py-2 mb-3"
              rows={4}
              value={editingNotice.content ?? ""}
              onChange={(e) =>
                setEditingNotice((prev) =>
                  prev ? { ...prev, content: e.target.value } : prev
                )
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