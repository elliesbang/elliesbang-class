import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Classroom = {
  id: number;
  name: string;
  parent_id?: number | null;
};

type ClassroomNotice = {
  id: number;
  classroom_id: number;
  title: string;
  content: string;
  created_at?: string;
};

export default function ClassroomNotices() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<number | "">("");
  const [notices, setNotices] = useState<ClassroomNotice[]>([]);
  const [form, setForm] = useState({ title: "", content: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    const fetchClassrooms = async () => {
      const { data, error } = await supabase
        .from("class_category")
        .select("id, name, parent_id")
        .order("order_num", { ascending: true });

      if (error) {
        console.error("강의실 목록 불러오기 실패", error);
        return;
      }

      setClassrooms(data || []);
    };

    fetchClassrooms();
  }, []);

  const fetchNotices = useCallback(async () => {
    if (!selectedClassroomId) {
      setNotices([]);
      return;
    }

    setListLoading(true);
    const { data, error } = await supabase
      .from("classroom_notices")
      .select("id, classroom_id, title, content, created_at")
      .eq("classroom_id", selectedClassroomId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("공지 불러오기 실패", error);
      setNotices([]);
    } else {
      setNotices((data as ClassroomNotice[]) || []);
    }
    setListLoading(false);
  }, [selectedClassroomId]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleSubmit = async () => {
    if (!selectedClassroomId) {
      alert("강의실을 먼저 선택해주세요.");
      return;
    }

    if (!form.title.trim() || !form.content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setLoading(true);

    if (editingId) {
      const { error } = await supabase
        .from("classroom_notices")
        .update({
          title: form.title.trim(),
          content: form.content.trim(),
        })
        .eq("id", editingId);

      if (error) {
        console.error("공지 수정 실패", error);
        alert("공지 수정에 실패했습니다. 다시 시도해주세요.");
      }
    } else {
      const { error } = await supabase.from("classroom_notices").insert({
        classroom_id: selectedClassroomId,
        title: form.title.trim(),
        content: form.content.trim(),
      });

      if (error) {
        console.error("공지 추가 실패", error);
        alert("공지 추가에 실패했습니다. 다시 시도해주세요.");
      }
    }

    setForm({ title: "", content: "" });
    setEditingId(null);
    setLoading(false);
    fetchNotices();
  };

  const handleEdit = (notice: ClassroomNotice) => {
    setForm({ title: notice.title, content: notice.content });
    setEditingId(notice.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const { error } = await supabase
      .from("classroom_notices")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("공지 삭제 실패", error);
      alert("공지 삭제에 실패했습니다. 다시 시도해주세요.");
      return;
    }

    setNotices((prev) => prev.filter((notice) => notice.id !== id));
  };

  const childClassrooms = classrooms.filter((cls) => cls.parent_id !== null);

  return (
    <div className="space-y-4">
      <h1 className="text-lg md:text-2xl font-bold text-[#404040] mb-2 whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
        강의실 공지 관리
      </h1>

      <div className="mb-4 md:mb-6 relative flex flex-col md:flex-row md:items-center md:gap-3">
        <label className="text-sm font-medium text-[#404040] whitespace-nowrap">
          강의실 선택
        </label>

        <select
          className="mt-1 md:mt-0 w-full md:max-w-xs border rounded-lg px-3 py-2 bg-white"
          value={selectedClassroomId}
          onChange={(e) => {
            const value = e.target.value ? Number(e.target.value) : "";
            setSelectedClassroomId(value);
          }}
        >
          <option value="">강의실을 선택하세요</option>
          {childClassrooms.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {selectedClassroomId && (
        <div className="border rounded-xl bg-white p-5 shadow-sm mb-6 admin-card">
          <h2 className="text-base md:text-lg font-semibold text-[#404040] mb-3 whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
            {editingId ? "공지 수정" : "새 공지 작성"}
          </h2>

          <input
            type="text"
            placeholder="공지 제목"
            className="w-full border rounded-lg px-3 py-2 mb-3"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />

          <textarea
            placeholder="공지 내용"
            rows={4}
            className="w-full border rounded-lg px-3 py-2 mb-3"
            value={form.content}
            onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-[#f3efe4] text-[#404040] px-4 py-2 rounded-lg w-full sm:w-auto justify-center disabled:opacity-70"
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} {editingId ? "저장하기" : "등록하기"}
            </button>

            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setForm({ title: "", content: "" });
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 w-full sm:w-auto"
              >
                새 공지 등록으로 전환
              </button>
            )}
          </div>
        </div>
      )}

      {selectedClassroomId && (
        <div className="rounded-xl border bg-white p-5 shadow-sm admin-card">
          <h2 className="text-base md:text-lg font-semibold text-[#404040] mb-4 whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
            등록된 공지 목록
          </h2>

          {listLoading && <p className="text-sm text-[#777]">불러오는 중...</p>}

          {!listLoading && notices.length === 0 && (
            <p className="text-sm text-[#777]">등록된 공지가 없습니다.</p>
          )}

          <ul className="space-y-4">
            {notices.map((notice) => (
              <li
                key={notice.id}
                className="border-b pb-4 flex flex-col gap-3 md:flex-row md:justify-between"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-[#404040] text-base md:text-lg whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
                    {notice.title}
                  </p>
                  <p className="text-sm text-[#555] whitespace-pre-line break-keep">
                    {notice.content}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <button
                    onClick={() => handleEdit(notice)}
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
      )}
    </div>
  );
}
