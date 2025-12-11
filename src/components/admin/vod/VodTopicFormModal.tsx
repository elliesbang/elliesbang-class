import { useEffect, useState } from "react";
import { VodAdminTopic } from "@/types/VodAdmin";

interface VodTopicFormModalProps {
  isOpen: boolean;
  initialValues: Pick<VodAdminTopic, "title" | "description" | "order">;
  isEditing?: boolean;
  onClose: () => void;
  onSubmit: (values: Pick<VodAdminTopic, "title" | "description" | "order">) => Promise<void>;
}

export default function VodTopicFormModal({
  isOpen,
  initialValues,
  isEditing = false,
  onClose,
  onSubmit,
}: VodTopicFormModalProps) {
  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description ?? "");
  const [order, setOrder] = useState<number | "">(initialValues.order ?? "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTitle(initialValues.title);
    setDescription(initialValues.description ?? "");
    setOrder(initialValues.order ?? "");
  }, [initialValues]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    await onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      order: typeof order === "number" ? order : null,
    });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#404040]">
            {isEditing ? "토픽 수정" : "토픽 추가"}
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
              placeholder="토픽 제목"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#404040]">설명 (선택)</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="토픽 설명"
              disabled={isEditing}
            />
            {isEditing && (
              <p className="text-xs text-[#7a6f68]">설명은 생성 시에만 입력 가능합니다.</p>
            )}
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
            {isEditing && (
              <p className="text-xs text-[#7a6f68]">
                수정 시 제목과 정렬 순서만 변경됩니다.
              </p>
            )}
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
