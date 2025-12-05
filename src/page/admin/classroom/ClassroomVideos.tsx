import { useState, useEffect } from "react";
import { Plus, Trash2, Edit } from "lucide-react";

export default function ClassroomVideos() {
  const [categories, setCategories] = useState([]); // 강의실 카테고리 목록
  const [selectedCategory, setSelectedCategory] = useState(""); // 선택된 강의실
  const [videos, setVideos] = useState([]); // 선택된 강의실의 영상 리스트
  const [newVideo, setNewVideo] = useState({ title: "", url: "" });
  const [editingVideo, setEditingVideo] = useState(null);

  // 📌 추후 Supabase에서 카테고리 가져오기
  useEffect(() => {
    async function loadCategories() {
      // 예: const { data } = await supabase.from("classroom_category").select("*");
      setCategories([
        { id: 1, name: "캔디마 기초반" },
        { id: 2, name: "AI 일러스트 챌린지" },
        { id: 3, name: "굿즈 디자인 실전반" },
      ]);
    }
    loadCategories();
  }, []);

  // 📌 카테고리 선택 시 영상 목록 가져오기 (목업)
  useEffect(() => {
    if (!selectedCategory) return;

    async function loadVideos() {
      // 예: supabase.from("classroom_videos").select("*").eq("category_id", selectedCategory)
      setVideos([
        { id: 10, title: "1강: 오리엔테이션", url: "https://youtube.com/xxxx" },
        { id: 11, title: "2강: 기본 도구 설명", url: "https://youtube.com/yyyy" },
      ]);
    }

    loadVideos();
  }, [selectedCategory]);

  // 새 영상 추가
  const handleAddVideo = () => {
    if (!newVideo.title || !newVideo.url) return alert("제목과 링크를 입력하세요!");

    const newItem = {
      id: Date.now(),
      title: newVideo.title,
      url: newVideo.url,
    };

    setVideos((prev) => [...prev, newItem]);
    setNewVideo({ title: "", url: "" });
  };

  // 영상 삭제
  const handleDelete = (id: number) => {
    if (!confirm("삭제할까요?")) return;
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  // 영상 수정 저장
  const handleSaveEdit = () => {
    setVideos((prev) =>
      prev.map((v) =>
        v.id === editingVideo.id ? editingVideo : v
      )
    );
    setEditingVideo(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#404040] mb-6">강의실 영상 관리</h1>

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

      {/* ---------------- 영상 추가 폼 ---------------- */}
      {selectedCategory && (
        <div className="border rounded-xl bg-white p-5 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-[#404040] mb-3">
            새 영상 추가
          </h2>

          <input
            type="text"
            placeholder="영상 제목"
            className="w-full border rounded-lg px-3 py-2 mb-3"
            value={newVideo.title}
            onChange={(e) =>
              setNewVideo((prev) => ({ ...prev, title: e.target.value }))
            }
          />

          <input
            type="text"
            placeholder="영상 링크(URL)"
            className="w-full border rounded-lg px-3 py-2 mb-3"
            value={newVideo.url}
            onChange={(e) =>
              setNewVideo((prev) => ({ ...prev, url: e.target.value }))
            }
          />

          <button
            onClick={handleAddVideo}
            className="flex items-center gap-2 bg-[#f3efe4] text-[#404040] px-4 py-2 rounded-lg"
          >
            <Plus size={18} />
            추가하기
          </button>
        </div>
      )}

      {/* ---------------- 영상 리스트 ---------------- */}
      {selectedCategory && (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#404040] mb-4">
            등록된 영상
          </h2>

          {videos.length === 0 && (
            <p className="text-sm text-[#777]">등록된 영상이 없습니다.</p>
          )}

          <ul className="space-y-4">
            {videos.map((video) => (
              <li
                key={video.id}
                className="flex items-center justify-between border-b pb-3"
              >
                <div>
                  <p className="font-medium text-[#404040]">{video.title}</p>
                  <a
                    href={video.url}
                    target="_blank"
                    className="text-sm text-blue-600 underline"
                  >
                    {video.url}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditingVideo(video)}
                    className="text-gray-600 hover:text-black"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
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

      {/* ---------------- 영상 수정 모달 ---------------- */}
      {editingVideo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">영상 수정</h2>

            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 mb-3"
              value={editingVideo.title}
              onChange={(e) =>
                setEditingVideo((prev) => ({ ...prev, title: e.target.value }))
              }
            />

            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 mb-3"
              value={editingVideo.url}
              onChange={(e) =>
                setEditingVideo((prev) => ({ ...prev, url: e.target.value }))
              }
            />

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg"
                onClick={() => setEditingVideo(null)}
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
