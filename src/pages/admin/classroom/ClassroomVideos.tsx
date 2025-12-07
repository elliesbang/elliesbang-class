import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Classroom = {
  id: number;
  name: string;
  parent_id?: number | null;
};

type ClassroomVideo = {
  id: number;
  classroom_id: number;
  title: string;
  video_url: string;
  created_at?: string;
};

export default function ClassroomVideos() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<number | "">("");
  const [videos, setVideos] = useState<ClassroomVideo[]>([]);
  const [form, setForm] = useState({ title: "", video_url: "" });
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

  const fetchVideos = useCallback(async () => {
    if (!selectedClassroomId) {
      setVideos([]);
      return;
    }

    setListLoading(true);
    const { data, error } = await supabase
      .from("classroom_videos")
      .select("id, classroom_id, title, video_url, created_at")
      .eq("classroom_id", selectedClassroomId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("강의실 영상 불러오기 실패", error);
      setVideos([]);
    } else {
      setVideos((data as ClassroomVideo[]) || []);
    }
    setListLoading(false);
  }, [selectedClassroomId]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleSubmit = async () => {
    if (!selectedClassroomId) {
      alert("강의실을 먼저 선택해주세요.");
      return;
    }

    if (!form.title.trim() || !form.video_url.trim()) {
      alert("제목과 영상 URL을 모두 입력해주세요.");
      return;
    }

    setLoading(true);

    if (editingId) {
      const { error } = await supabase
        .from("classroom_videos")
        .update({
          title: form.title.trim(),
          video_url: form.video_url.trim(),
        })
        .eq("id", editingId);

      if (error) {
        console.error("영상 수정 실패", error);
        alert("영상 수정에 실패했습니다. 다시 시도해주세요.");
      }
    } else {
      const { error } = await supabase.from("classroom_videos").insert({
        classroom_id: selectedClassroomId,
        title: form.title.trim(),
        video_url: form.video_url.trim(),
      });

      if (error) {
        console.error("영상 추가 실패", error);
        alert("영상 추가에 실패했습니다. 다시 시도해주세요.");
      }
    }

    setForm({ title: "", video_url: "" });
    setEditingId(null);
    setLoading(false);
    fetchVideos();
  };

  const handleEdit = (video: ClassroomVideo) => {
    setForm({ title: video.title, video_url: video.video_url });
    setEditingId(video.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const { error } = await supabase
      .from("classroom_videos")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("영상 삭제 실패", error);
      alert("영상 삭제에 실패했습니다. 다시 시도해주세요.");
      return;
    }

    setVideos((prev) => prev.filter((video) => video.id !== id));
  };

  const childClassrooms = classrooms.filter((cls) => cls.parent_id !== null);

  return (
    <div className="space-y-6">
      <h1 className="text-lg md:text-2xl font-bold text-[#404040] mb-2 whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
        강의실 영상 관리
      </h1>

      <div className="mb-2 md:mb-4 flex flex-col md:flex-row md:items-center md:gap-3 relative w-full">
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
        <div className="border rounded-xl bg-white p-5 shadow-sm mb-2 admin-card">
          <h2 className="text-base md:text-lg font-semibold text-[#404040] mb-3 whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
            {editingId ? "영상 수정" : "새 영상 추가"}
          </h2>

          <input
            type="text"
            placeholder="영상 제목"
            className="w-full border rounded-lg px-3 py-2 mb-3"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />

          <input
            type="text"
            placeholder="영상 링크(URL)"
            className="w-full border rounded-lg px-3 py-2 mb-3"
            value={form.video_url}
            onChange={(e) => setForm((prev) => ({ ...prev, video_url: e.target.value }))}
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
                  setForm({ title: "", video_url: "" });
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 w-full sm:w-auto"
              >
                새 영상 등록으로 전환
              </button>
            )}
          </div>
        </div>
      )}

      {selectedClassroomId && (
        <div className="rounded-xl border bg-white p-5 shadow-sm admin-card">
          <h2 className="text-base md:text-lg font-semibold text-[#404040] mb-4 whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
            등록된 영상
          </h2>

          {listLoading && <p className="text-sm text-[#777]">불러오는 중...</p>}

          {!listLoading && videos.length === 0 && (
            <p className="text-sm text-[#777]">등록된 영상이 없습니다.</p>
          )}

          <ul className="space-y-4">
            {videos.map((video) => (
              <li
                key={video.id}
                className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b pb-3"
              >
                <div>
                  <p className="font-medium text-[#404040] whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
                    {video.title}
                  </p>
                  <a
                    href={video.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 underline"
                  >
                    {video.video_url}
                  </a>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <button
                    onClick={() => handleEdit(video)}
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
    </div>
  );
}
