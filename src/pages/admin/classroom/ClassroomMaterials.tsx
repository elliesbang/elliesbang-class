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
  file_url: string;
  file_name?: string;
  file_type?: string;
  created_at?: string;
};

export default function ClassroomMaterials() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<number | "">("");
  const [materials, setMaterials] = useState<ClassroomMaterial[]>([]);
  const [form, setForm] = useState({ title: "", file_url: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  // ------------------------------
  // 강의실 불러오기
  // ------------------------------
  useEffect(() => {
    const fetchClassrooms = async () => {
      const { data } = await supabase
        .from("class_category")
        .select("id, name, parent_id")
        .order("order_num", { ascending: true });

      setClassrooms(data || []);
    };
    fetchClassrooms();
  }, []);

  // ------------------------------
  // 강의실 자료 불러오기
  // ------------------------------
  const fetchMaterials = useCallback(async () => {
    if (!selectedClassroomId) {
      setMaterials([]);
      return;
    }

    setListLoading(true);
    const { data, error } = await supabase
      .from("classroom_materials")
      .select("id, classroom_id, title, file_url, file_name, file_type, created_at")
      .eq("classroom_id", selectedClassroomId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("자료 불러오기 실패", error);
      setMaterials([]);
    } else {
      setMaterials(data || []);
    }
    setListLoading(false);
  }, [selectedClassroomId]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  // ------------------------------
  // file_name 자동 추출 함수 ★
  // ------------------------------
  const extractFileName = (url: string) => {
    try {
      return decodeURIComponent(url.split("/").pop() || "unknown");
    } catch {
      return "unknown";
    }
  };

  // ------------------------------
  // file_type 자동 추출 함수 ★
  // ------------------------------
  const guessFileType = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();

    if (ext === "pdf") return "application/pdf";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || ""))
      return `image/${ext}`;
    return "application/octet-stream";
  };

  // ------------------------------
  // 자료 추가/수정
  // ------------------------------
  const handleSubmit = async () => {
    if (!selectedClassroomId) {
      alert("강의실을 먼저 선택해주세요.");
      return;
    }

    if (!form.title.trim() || !form.file_url.trim()) {
      alert("제목과 자료 링크(URL)를 모두 입력해주세요.");
      return;
    }

    setLoading(true);

    // ★ file_name, file_type 자동 생성
    const fileName = extractFileName(form.file_url.trim());
    const fileType = guessFileType(fileName);

    if (editingId) {
      // 수정 (file_name/file_type은 변경 X)
      await supabase
        .from("classroom_materials")
        .update({
          title: form.title.trim(),
          file_url: form.file_url.trim(),
        })
        .eq("id", editingId);
    } else {
      // 추가 ★ file_name / file_type 포함
      await supabase.from("classroom_materials").insert({
        classroom_id: selectedClassroomId,
        title: form.title.trim(),
        file_url: form.file_url.trim(),
        file_name: fileName, //
        file_type: fileType, //
      });
    }

    setForm({ title: "", file_url: "" });
    setEditingId(null);
    setLoading(false);
    fetchMaterials();
  };

  // ------------------------------
  // 수정 버튼
  // ------------------------------
  const handleEdit = (material: ClassroomMaterial) => {
    setForm({ title: material.title, file_url: material.file_url });
    setEditingId(material.id);
  };

  // ------------------------------
  // 삭제
  // ------------------------------
  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    await supabase.from("classroom_materials").delete().eq("id", id);
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const childClassrooms = classrooms.filter((cls) => cls.parent_id !== null);

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <div className="space-y-6">
      <h1 className="text-lg md:text-2xl font-bold text-[#404040]">강의실 자료 관리</h1>

      {/* 강의실 선택 */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:gap-3">
        <label className="text-sm font-medium text-[#404040]">강의실 선택</label>
        <select
          className="w-full md:max-w-xs border rounded-lg px-3 py-2 bg-white"
          value={selectedClassroomId}
          onChange={(e) =>
            setSelectedClassroomId(e.target.value ? Number(e.target.value) : "")
          }
        >
          <option value="">강의실을 선택하세요</option>
          {childClassrooms.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* 추가/수정 폼 */}
      {selectedClassroomId && (
        <div className="border rounded-xl bg-white p-5 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-[#404040] mb-3">
            {editingId ? "자료 수정" : "자료 추가"}
          </h2>

          <input
            type="text"
            placeholder="자료 제목"
            className="w-full border rounded-lg px-3 py-2 mb-3"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <input
            type="text"
            placeholder="자료 링크(URL)"
            className="w-full border rounded-lg px-3 py-2 mb-3"
            value={form.file_url}
            onChange={(e) => setForm({ ...form, file_url: e.target.value })}
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-[#f3efe4] px-4 py-2 rounded-lg"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            {editingId ? "저장하기" : "추가하기"}
          </button>
        </div>
      )}

      {/* 자료 목록 */}
      {selectedClassroomId && (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#404040] mb-4">등록된 자료</h2>

          {materials.map((m) => (
            <div
              key={m.id}
              className="flex justify-between items-center border-b pb-3 mb-3"
            >
              <div>
                <p className="font-medium flex items-center gap-2">
                  <LinkIcon size={16} /> {m.title}
                </p>
                <a
                  href={m.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-600 underline"
                >
                  {m.file_url}
                </a>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(m)}
                  className="text-gray-600 hover:text-black"
                >
                  <Edit size={18} />
                </button>

                <button
                  onClick={() => handleDelete(m.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
