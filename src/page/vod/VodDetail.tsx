import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { PlayCircle, Lock } from "lucide-react";

export default function VodDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [vod, setVod] = useState(null);
  const [related, setRelated] = useState([]);

  // 사용자 역할 불러오기
  useEffect(() => {
    const r = localStorage.getItem("role");
    setRole(r);
  }, []);

  // VOD 정보 불러오기
  useEffect(() => {
    async function loadVod() {
      const { data, error } = await supabase
        .from("vod")
        .select("*")
        .eq("id", id)
        .single();

      if (error) return console.error(error);

      setVod(data);
    }

    loadVod();
  }, [id]);

  // 같은 카테고리의 다른 VOD 불러오기
  useEffect(() => {
    if (!vod) return;

    async function loadRelated() {
      const { data } = await supabase
        .from("vod")
        .select("*")
        .eq("category", vod.category)
        .neq("id", vod.id)
        .limit(5);

      setRelated(data || []);
    }

    loadRelated();
  }, [vod]);

  // ⛔ 권한 체크
  function hasVodPermission() {
    return role === "admin" || role === "vod";
  }

  if (!vod) {
    return <p className="p-5">불러오는 중...</p>;
  }

  return (
    <div className="pb-20">
      {/* 썸네일 + 영상 */}
      <div className="w-full bg-black">
        {hasVodPermission() ? (
          <iframe
            src={vod.video_url}
            className="w-full h-60"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="w-full h-60 flex flex-col items-center justify-center text-white">
            <Lock size={40} className="mb-3" />
            <p className="text-lg mb-2">이 영상은 VOD 회원 전용입니다</p>
            <p className="text-sm text-gray-300">VOD 이용권을 구매해주세요</p>
          </div>
        )}
      </div>

      {/* 상세 정보 */}
      <div className="p-5">
        <h1 className="text-xl font-bold text-[#404040]">{vod.title}</h1>

        <p className="text-sm text-[#7a6f68] mt-2">
          카테고리: {vod.category}
        </p>

        <p className="text-sm text-gray-500 mt-1">
          업로드일: {vod.created_at?.slice(0, 10)}
        </p>

        <p className="mt-4 text-[#404040] whitespace-pre-line leading-6">
          {vod.description}
        </p>
      </div>

      {/* 같은 카테고리의 다른 강의 */}
      {related.length > 0 && (
        <div className="p-5">
          <h2 className="text-lg font-bold text-[#404040] mb-3">
            같은 카테고리의 다른 영상
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {related.map((item) => (
              <div
                key={item.id}
                className="border rounded-xl bg-white shadow-sm p-2 cursor-pointer"
                onClick={() => navigate(`/vod/${item.id}`)}
              >
                <img
                  src={item.thumbnail}
                  className="w-full h-28 object-cover rounded-lg"
                />

                <p className="text-sm mt-2 font-semibold text-[#404040] line-clamp-1">
                  {item.title}
                </p>

                <div className="flex items-center gap-1 text-xs text-[#7a6f68] mt-1">
                  <PlayCircle size={12} /> 재생
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 재생 권한이 없는 경우 안내 박스 */}
      {!hasVodPermission() && (
        <div className="p-5 text-center text-sm text-gray-600">
          🔒 이 영상은 로그인한 VOD 회원 또는 관리자만 재생할 수 있어요.
        </div>
      )}
    </div>
  );
}