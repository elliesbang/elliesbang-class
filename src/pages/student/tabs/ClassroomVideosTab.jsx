import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import VideoCard from "../../../components/classroom/VideoCard";

const ClassroomVideosTab = ({ classroomId }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!classroomId) {
        setVideos([]);
        setLoading(false);
        setError("유효한 강의실이 아닙니다.");
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("classroom_videos")
        .select("id, title, url, description, created_at, order_num")
        .eq("classroom_id", classroomId)
        .order("order_num", { ascending: true })
        .order("created_at", { ascending: false });

      if (supabaseError) {
        console.error(supabaseError);
        setError("영상을 불러오는 중 오류가 발생했습니다.");
        setVideos([]);
      } else {
        setVideos(data || []);
      }

      setLoading(false);
    };

    fetchVideos();
  }, [classroomId]);

  return (
    <div className="max-w-3xl mx-auto mt-6 px-4">
      {loading && (
        <div className="text-center text-gray-500">불러오는 중...</div>
      )}

      {!loading && error && (
        <div className="text-center text-sm text-red-500">{error}</div>
      )}

      {!loading && !error && videos.length === 0 && (
        <div className="text-center py-12 text-gray-400 border rounded-xl bg-white">
          등록된 콘텐츠가 없습니다.
        </div>
      )}

      {!loading && !error &&
        videos.map((video) => (
          <VideoCard
            key={video.id}
            title={video.title}
            description={video.description ?? ""}
            url={video.url}   {/* ← 올바른 필드 사용 */}
          />
        ))}
    </div>
  );
};

export default ClassroomVideosTab;
