import { VodAdminTopic } from "@/types/VodAdmin";
import { Plus, Edit, Trash2 } from "lucide-react";

interface VodTopicListProps {
  topics: VodAdminTopic[];
  selectedTopicId: number | null;
  loading?: boolean;
  onSelect: (topicId: number) => void;
  onCreate: () => void;
  onEdit: (topic: VodAdminTopic) => void;
  onDelete: (topicId: number) => void;
}

export default function VodTopicList({
  topics,
  selectedTopicId,
  loading = false,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
}: VodTopicListProps) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm admin-card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base md:text-lg font-semibold text-[#404040]">
          토픽 목록
        </h2>
        <button
          type="button"
          onClick={onCreate}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[#f8f5e9] hover:bg-[#f3efe4] text-[#404040]"
        >
          <Plus size={16} /> 토픽 추가
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">토픽을 불러오는 중...</p>
      ) : topics.length === 0 ? (
        <p className="text-sm text-gray-500">토픽이 없습니다. 추가해주세요.</p>
      ) : (
        <ul className="space-y-3">
          {topics.map((topic) => (
            <li
              key={topic.id}
              className={`flex items-center justify-between gap-3 p-4 border rounded-lg ${
                selectedTopicId === topic.id ? "bg-[#fdf7ed]" : "bg-white"
              }`}
            >
              <button
                type="button"
                className="text-left flex-1"
                onClick={() => onSelect(topic.id)}
              >
                <p className="font-semibold text-[#404040]">{topic.title}</p>
                <p className="text-xs text-[#7a6f68]">
                  정렬: {topic.order ?? "-"}
                </p>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(topic)}
                  className="p-2 text-gray-600 hover:text-black"
                >
                  <Edit size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(topic.id)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
