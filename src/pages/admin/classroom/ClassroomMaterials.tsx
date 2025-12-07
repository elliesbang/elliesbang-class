import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Edit, Loader2, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Classroom = {
  id: number;
  name: string;
  parent_id?: number | null;
};

type ClassroomMaterial = {
  id: number;
  classroom_id: number;
  title: string;
  link_url: string;
  created_at?: string;
};

export default function ClassroomMaterials() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<number | "">("");
  const [materials, setMaterials] = useState<ClassroomMaterial[]>([]);
  const [form, setForm] = useState({ title: "", link_url: "" });
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

  const fetchMaterials = useCallback(async () => {
    if (!selectedClassroomId) {
      setMaterials([]);
      return;
    }

    setListLoading(true);
    const { data, error } = await supabase
      .from("classroom_materials")
      .select("id, classroom_id, title, link_url, created_at")
      .eq("classroom_id", selectedClassroomId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("자료 불러오기 실패", error);
      setMaterials([]);
    } else {
      setMaterials((data as ClassroomMaterial[]) || []);
    }
    setListLoading(false);
  }, [selectedClassroomId]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleSubmit = async () => {
    if (!selectedClassroomId) {
      alert("강의실을 먼저 선택해주세요.");
      return;
    }

    if (!form.title.trim() || !form.link_url.trim()) {
      alert("제목과 링크를 모두 입력해주세요.");
      return;
    }

    setLoading(true);

    if (editingId) {
      const { error } = await supabase
        .from("classroom_materials")
        .update({
          title: form.title.trim(),
          link_url: form.link_url.trim(),
        })
        .eq("id", editingId);

      if (error) {
        console.error("자료 수정 실패", error);
        alert("자료 수정에 실패했습니다. 다시 시도해주세요.");
      }
    } else {
      const { error } = await supabase.from("classroom_materials").insert({
        classroom_id: selectedClassroomId,
        title: form.title.trim(),
        link_url: form.link_url.trim(),
      });

      if (error) {
        console.error("자료 추가 실패", error);
        alert("자료 추가에 실패했습니다. 다시 시도해주세요.");
      }
    }

    setForm({ title: "", link_url: "" });
    setEditingId(null);
    setLoading(false);
    fetchMaterials();
  };

  const handleEdit = (material: ClassroomMaterial) => {
    setForm({ title: material.title, link_url: material.link_url });
    setEditingId(material.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const { error } = await supabase
      .from("classroom_materials")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("자료 삭제 실패", error);
      alert("자료 삭제에 실패했습니다. 다시 시도해주세요.");
      return;
    }

    setMaterials((prev) => prev.filter((material) => material.id !== id));
  };

  const childClassrooms = classrooms.filter((cls) => cls.parent_id !== null);

  return (
    <div className="space-y-6">
      <h1 className="text-lg md:text-2xl font-bold text-[#404040] mb-2 whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
        강의실 자료 관리
      </h1>

      <div className="mb-4 md:mb-6 relative flex flex-col md:flex-row md:items-center md:gap-3">
        <label className="text-sm font-medium text-[#404040] whitespace-nowrap">강의실 선택</label>
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
            {editingId ? "자료 수정" : "링크 자료 추가"}
          </h2>

          <input
            type="text"
            placeholder="자료 제목"
            className="w-full border rounded-lg px-3 py-2 mb-3"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />

          <input
            type="text"
            placeholder="자료 링크(URL)"
            className="w-full border rounded-lg px-3 py-2 mb-3"
            value={form.link_url}
            onChange={(e) => setForm((prev) => ({ ...prev, link_url: e.target.value }))}
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-[#f3efe4] text-[#404040] px-4 py-2 rounded-lg w-full sm:w-auto justify-center disabled:opacity-70"
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} {editingId ? "저장하기" : "추가하기"}
            </button>
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setForm({ title: "", link_url: "" });
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 w-full sm:w-auto"
              >
                새 자료 등록으로 전환
              </button>
            )}
          </div>
        </div>
      )}

      {selectedClassroomId && (
        <div className="rounded-xl border bg-white p-5 shadow-sm admin-card">
          <h2 className="text-base md:text-lg font-semibold text-[#404040] mb-4 whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
            등록된 자료
          </h2>

          {listLoading && <p className="text-sm text-[#777]">불러오는 중...</p>}

          {!listLoading && materials.length === 0 && (
            <p className="text-sm text-[#777]">등록된 자료가 없습니다.</p>
          )}

          <ul className="space-y-4">
            {materials.map((material) => (
              <li
                key={material.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b pb-3"
              >
                <div className="space-y-1">
                  <p className="font-medium text-[#404040] flex items-center gap-2 whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
                    <LinkIcon size={18} />
                    {material.title}
                  </p>

                  <a
                    href={material.link_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 underline break-keep"
                  >
                    {material.link_url}
                  </a>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <button
                    onClick={() => handleEdit(material)}
                    className="text-gray-600 hover:text-black"
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(material.id)}
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
