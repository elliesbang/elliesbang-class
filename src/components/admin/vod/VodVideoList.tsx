import { VodAdminVideo } from "@/types/VodAdmin";
import { Plus, Edit, Trash2 } from "lucide-react";

interface VodVideoListProps {
  videos: VodAdminVideo[];
  loading?: boolean;
  onCreate: () => void;
  onEdit: (video: VodAdminVideo) => void;
  onDelete: (videoId: number) => void;
}

export default function VodVideoList({
  videos,
  loading = false,
  onCreate,
  onEdit,
  onDelete,
}: VodVideoListProps) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm admin-card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base md:text-lg font-semibold text-[#404040]">
          영상 목록
        </h2>
        <button
          type="button"
          onClick={onCreate}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[#f8f5e9] hover:bg-[#f3efe4] text-[#404040]"
        >
          <Plus size={16} /> 영상 추가
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">영상을 불러오는 중...</p>
      ) : videos.length === 0 ? (
        <p className="text-sm text-gray-500">영상을 추가해주세요.</p>
      ) : (
        <ul className="space-y-3">
          {videos.map((video) => (
            <li
              key={video.id}
              className="flex items-start justify-between gap-3 p-4 border rounded-lg bg-white"
            >
              <div className="space-y-1">
                <p className="font-semibold text-[#404040]">{video.title}</p>
                <div className="text-xs text-[#7a6f68] space-x-3">
                  <span>레벨: {video.level ?? "-"}</span>
                  <span>길이: {video.duration ?? "-"}</span>
                  <span>정렬: {video.order ?? "-"}</span>
                </div>
                <p className="text-xs text-[#7a6f68] break-all">
                  링크: {video.video_url ?? "-"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(video)}
                  className="p-2 text-gray-600 hover:text-black"
                >
                  <Edit size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(video.id)}
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
