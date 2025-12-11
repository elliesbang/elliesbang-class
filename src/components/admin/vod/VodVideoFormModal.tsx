import { useEffect, useState } from "react";
import { VodAdminVideo } from "@/types/VodAdmin";

interface VodVideoFormModalProps {
  isOpen: boolean;
  initialValues: Pick<
    VodAdminVideo,
    "title" | "video_url" | "thumbnail_url" | "level" | "duration" | "order"
  >;
  isEditing?: boolean;
  onClose: () => void;
  onSubmit: (values: Pick<
    VodAdminVideo,
    "title" | "video_url" | "thumbnail_url" | "level" | "duration" | "order"
  >) => Promise<void>;
}

export default function VodVideoFormModal({
  isOpen,
  initialValues,
  isEditing = false,
  onClose,
  onSubmit,
}: VodVideoFormModalProps) {
  const [title, setTitle] = useState(initialValues.title);
  const [videoUrl, setVideoUrl] = useState(initialValues.video_url ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    initialValues.thumbnail_url ?? ""
  );
  const [level, setLevel] = useState(initialValues.level ?? "");
  const [duration, setDuration] = useState<number | "">(
    initialValues.duration ?? ""
  );
  const [order, setOrder] = useState<number | "">(initialValues.order ?? "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTitle(initialValues.title);
    setVideoUrl(initialValues.video_url ?? "");
    setThumbnailUrl(initialValues.thumbnail_url ?? "");
    setLevel(initialValues.level ?? "");
    setDuration(initialValues.duration ?? "");
    setOrder(initialValues.order ?? "");
  }, [initialValues]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title.trim() || !videoUrl.trim()) {
      alert("제목과 영상 URL을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    await onSubmit({
      title: title.trim(),
      video_url: videoUrl.trim(),
      thumbnail_url: thumbnailUrl.trim() || null,
      level: level.trim() || null,
      duration: typeof duration === "number" ? duration : null,
      order: typeof order === "number" ? order : null,
    });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#404040]">
            {isEditing ? "영상 수정" : "영상 추가"}
          </h2>
          <button type="button" onClick={onClose} className="text-sm text-gray-500">
            닫기
          </button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#404040]">제목</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="영상 제목"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#404040]">영상 URL</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="영상 링크"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#404040]">썸네일 URL</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="썸네일 이미지 링크"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#404040]">레벨</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="예: 초급, 중급, 고급"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#404040]">영상 길이</label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2"
              value={duration}
              onChange={(e) => {
                const value = Number(e.target.value);
                setDuration(Number.isNaN(value) ? "" : value);
              }}
              placeholder="분 단위 길이"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#404040]">정렬 순서</label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2"
              value={order}
              onChange={(e) => {
                const value = Number(e.target.value);
                setOrder(Number.isNaN(value) ? "" : value);
              }}
              placeholder="정렬 순서"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600"
            disabled={submitting}
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#f3efe4] text-[#404040] rounded-lg text-sm"
            disabled={submitting}
          >
            {submitting ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
