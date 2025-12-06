import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, FileText, Link as LinkIcon } from "lucide-react";

export default function ClassroomMaterials() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [materials, setMaterials] = useState([]);

  // 새 자료 (링크 자료)
  const [newMaterial, setNewMaterial] = useState({ title: "", url: "" });

  // 수정 모달용
  const [editingMaterial, setEditingMaterial] = useState(null);

  // 파일 업로드용
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // 📌 강의실 목록 가져오기
  useEffect(() => {
    async function loadCategories() {
      setCategories([
        { id: 1, name: "캔디마 기초반" },
        { id: 2, name: "AI 일러스트 챌린지" },
        { id: 3, name: "굿즈 디자인 실전반" },
      ]);
    }
    loadCategories();
  }, []);

  // 📌 선택된 강의실의 자료 가져오기
  useEffect(() => {
    if (!selectedCategory) return;

    async function loadMaterials() {
      setMaterials([
        { id: 100, type: "file", title: "교안 자료.pdf", url: "https://example.com/file.pdf" },
        { id: 101, type: "link", title: "참고 노션 페이지", url: "https://notion.so/xxx" },
      ]);
    }

    loadMaterials();
  }, [selectedCategory]);

  // -------------------------------
  // 📌 링크 자료 추가
  // -------------------------------
  const handleAddMaterial = () => {
    if (!newMaterial.title || !newMaterial.url) {
      return alert("제목과 링크를 입력하세요!");
    }

    const newItem = {
      id: Date.now(),
      type: "link",
      title: newMaterial.title,
      url: newMaterial.url,
    };

    setMaterials((prev) => [...prev, newItem]);
    setNewMaterial({ title: "", url: "" });
  };

  // -------------------------------
  // 📌 파일 업로드 (UI만 구현)
  // 실제 업로드는 Supabase Storage 연결해야 함
  // -------------------------------
  const handleFileUpload = () => {
    if (!uploadFile) return alert("파일을 선택하세요!");

    // 파일명으로 자료 생성
    const newItem = {
      id: Date.now(),
      type: "file",
      title: uploadFile.name,
      url: "uploaded-file-url", // TODO: Supabase 업로드 위치
    };

    setMaterials((prev) => [...prev, newItem]);
    setUploadFile(null);
  };

  // -------------------------------
  // 📌 삭제
  // -------------------------------
  const handleDelete = (id: number) => {
    if (!confirm("삭제하시겠습니까?")) return;
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  // -------------------------------
  // 📌 수정 저장
  // -------------------------------
  const handleSaveEdit = () => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === editingMaterial.id ? editingMaterial : m))
    );
    setEditingMaterial(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#404040] mb-6">강의실 자료 관리</h1>

      {/* ---------------- 카테고리 선택 ---------------- */}
      <div className="mb-6">
        <label className="text-sm font-medium text-[#404040]">강의실 선택</label>
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
          {/* ---------------- 파일 업로드 ---------------- */}
          <div className="border rounded-xl bg-white p-5 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-[#404040] mb-3">
              파일 업로드
            </h2>

            <input
              type="file"
              className="mb-3"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            />

            <button
              onClick={handleFileUpload}
              className="flex items-center gap-2 bg-[#f3efe4] text-[#404040] px-4 py-2 rounded-lg"
            >
              <FileText size={18} />
              업로드하기
            </button>
          </div>

          {/* ---------------- 링크 자료 추가 ---------------- */}
          <div className="border rounded-xl bg-white p-5 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-[#404040] mb-3">
              링크 자료 추가
            </h2>

            <input
              type="text"
              placeholder="자료 제목"
              className="w-full border rounded-lg px-3 py-2 mb-3"
              value={newMaterial.title}
              onChange={(e) =>
                setNewMaterial((prev) => ({ ...prev, title: e.target.value }))
              }
            />

            <input
              type="text"
              placeholder="자료 링크(URL)"
              className="w-full border rounded-lg px-3 py-2 mb-3"
              value={newMaterial.url}
              onChange={(e) =>
                setNewMaterial((prev) => ({ ...prev, url: e.target.value }))
              }
            />

            <button
              onClick={handleAddMaterial}
              className="flex items-center gap-2 bg-[#f3efe4] text-[#404040] px-4 py-2 rounded-lg"
            >
              <Plus size={18} />
              추가하기
            </button>
          </div>

          {/* ---------------- 자료 리스트 ---------------- */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#404040] mb-4">
              등록된 자료
            </h2>

            {materials.length === 0 && (
              <p className="text-sm text-[#777]">등록된 자료가 없습니다.</p>
            )}

            <ul className="space-y-4">
              {materials.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div>
                    <p className="font-medium text-[#404040] flex items-center gap-2">
                      {m.type === "file" ? (
                        <FileText size={18} />
                      ) : (
                        <LinkIcon size={18} />
                      )}
                      {m.title}
                    </p>

                    <a
                      href={m.url}
                      target="_blank"
                      className="text-sm text-blue-600 underline"
                    >
                      {m.url}
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    {m.type === "link" && (
                      <button
                        onClick={() => setEditingMaterial(m)}
                        className="text-gray-600 hover:text-black"
                      >
                        <Edit size={18} />
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(m.id)}
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

      {/* ---------------- 링크 수정 모달 ---------------- */}
      {editingMaterial && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">자료 수정</h2>

            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 mb-3"
              value={editingMaterial.title}
              onChange={(e) =>
                setEditingMaterial((prev) => ({ ...prev, title: e.target.value }))
              }
            />

            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 mb-3"
              value={editingMaterial.url}
              onChange={(e) =>
                setEditingMaterial((prev) => ({ ...prev, url: e.target.value }))
              }
            />

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg"
                onClick={() => setEditingMaterial(null)}
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
