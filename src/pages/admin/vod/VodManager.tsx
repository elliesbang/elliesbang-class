import { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function VodManage() {
  const categories = [
    { id: "recommended", name: "추천" },
    { id: "basic", name: "기초" },
    { id: "advanced", name: "심화" },
  ];

  const [selectedCategory, setSelectedCategory] = useState("");
  const [vodList, setVodList] = useState([]);

  const [newVod, setNewVod] = useState({
    title: "",
    url: "",
    description: "",
    order: "",
  });

  const [editingVod, setEditingVod] = useState(null);

  // ---------------------------------------------
  // 📌 선택된 카테고리의 VOD 불러오기 (임시 데이터)
  // ---------------------------------------------
  useEffect(() => {
    if (!selectedCategory) return;

    async function loadVod() {
      // TODO: Supabase에서 가져오기
      setVodList([
        {
          id: 1,
          title: "캔바 기초 배우기",
          url: "https://youtu.be/example",
          description: "캔바 첫 입문 영상입니다.",
          order: 1,
        },
        {
          id: 2,
          title: "AI로 썸네일 만들기",
          url: "https://youtu.be/example2",
          description: "AI로 빠르게 썸네일 제작하기",
          order: 2,
        },
      ]);
    }

    loadVod();
  }, [selectedCategory]);

  // ---------------------------------------------
  // 📌 VOD 추가
  // ---------------------------------------------
  const handleAddVod = () => {
    if (!newVod.title || !newVod.url) {
      return alert("제목과 영상 URL을 입력해주세요!");
    }

    const item = {
      id: Date.now(),
      title: newVod.title,
      url: newVod.url,
      description: newVod.description,
      order: newVod.order || 99,
    };

    setVodList((prev) => [...prev, item]);

    setNewVod({
      title: "",
      url: "",
      description: "",
      order: "",
    });
  };

  // ---------------------------------------------
  // 📌 삭제
  // ---------------------------------------------
  const handleDelete = (id) => {
    if (!confirm("삭제하시겠습니까?")) return;
    setVodList((prev) => prev.filter((v) => v.id !== id));
  };

  // ---------------------------------------------
  // 📌 수정 저장
  // ---------------------------------------------
  const handleSaveEdit = () => {
    setVodList((prev) =>
      prev.map((v) =>
        v.id === editingVod.id ? editingVod : v
      )
    );
    setEditingVod(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#404040] mb-6">VOD 관리</h1>

      {/* ---------------- 카테고리 선택 ---------------- */}
      <div className="mb-6">
        <label className="text-sm font-medium text-[#404040]">카테고리 선택</label>

        <select
          className="mt-1 w-full border rounded-lg px-3 py-2 bg-white"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">카테고리를 선택하세요</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* ---------------- VOD 작성 영역 ---------------- */}
      {selectedCategory && (
        <>
          <div className="border rounded-xl bg-white p-5 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-[#404040] mb-3">새 VOD 등록</h2>

            <input
              type="text"
              placeholder="영상 제목"
              className="w-full border rounded-lg px-3 py-2 mb-3"
              value={newVod.title}
              onChange={(e) =>
                setNewVod((prev) => ({ ...prev, title: e.target.value }))
              }
            />

            <input
              type="text"
              placeholder="영상 URL"
              className="w-full border rounded-lg px-3 py-2 mb-3"
              value={newVod.url}
              onChange={(e) =>
                setNewVod((prev) => ({ ...prev, url: e.target.value }))
              }
            />

            <textarea
              rows={3}
              placeholder="설명 (선택)"
              className="w-full border rounded-lg px-3 py-2 mb-3"
              value={newVod.description}
              onChange={(e) =>
                setNewVod((prev) => ({ ...prev, description: e.target.value }))
              }
            />

            <input
              type="number"
              placeholder="노출 순서 (선택)"
              className="w-full border rounded-lg px-3 py-2 mb-4"
              value={newVod.order}
              onChange={(e) =>
                setNewVod((prev) => ({ ...prev, order: e.target.value }))
              }
            />

            <button
              onClick={handleAddVod}
              className="flex items-center gap-2 bg-[#f3efe4] text-[#404040] px-4 py-2 rounded-lg"
            >
              <Plus size={18} />
              등록하기
            </button>
          </div>

          {/* ---------------- VOD 리스트 ---------------- */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#404040] mb-4">
              등록된 VOD 목록
            </h2>

            {vodList.length === 0 && (
              <p className="text-sm text-[#777]">등록된 VOD가 없습니다.</p>
            )}

            <ul className="space-y-4">
              {vodList
                .sort((a, b) => a.order - b.order)
                .map((v) => (
                  <li
                    key={v.id}
                    className="border-b pb-4 flex justify-between items-start"
                  >
                    <div>
                      <p className="font-semibold text-[#404040] text-lg">
                        {v.title}
                      </p>

                      <a
                        href={v.url}
                        target="_blank"
                        className="text-blue-600 underline text-sm"
                      >
                        영상 링크 열기
                      </a>

                      {v.description && (
                        <p className="text-sm text-[#666] mt-2">
                          {v.description}
                        </p>
                      )}

                      <p className="text-xs text-[#888] mt-1">
                        순서: {v.order}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditingVod(v)}
                        className="text-gray-600 hover:text-black"
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        onClick={() => handleDelete(v.id)}
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

      {/* ---------------- VOD 수정 모달 ---------------- */}
      {editingVod && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">VOD 수정</h2>

            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 mb-3"
              value={editingVod.title}
              onChange={(e) =>
                setEditingVod((prev) => ({ ...prev, title: e.target.value }))
              }
            />

            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 mb-3"
              value={editingVod.url}
              onChange={(e) =>
                setEditingVod((prev) => ({ ...prev, url: e.target.value }))
              }
            />

            <textarea
              rows={3}
              className="w-full border rounded-lg px-3 py-2 mb-3"
              value={editingVod.description}
              onChange={(e) =>
                setEditingVod((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />

            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 mb-3"
              value={editingVod.order}
              onChange={(e) =>
                setEditingVod((prev) => ({ ...prev, order: e.target.value }))
              }
            />

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg"
                onClick={() => setEditingVod(null)}
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
