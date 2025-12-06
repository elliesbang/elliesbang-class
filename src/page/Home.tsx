import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Megaphone, PlayCircle, ChevronRight } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  const notices: any[] = [];
  const vodRecommended: any[] = [];
  const vodBasic: any[] = [];
  const vodAdvanced: any[] = [];

  // 현재 로그인한 사용자 역할 가져오기
  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (userRole) setRole(userRole);
  }, []);

  // 재생 권한 체크
  function handlePlay(videoId) {
    if (!role) {
      alert("로그인이 필요합니다.");
      return navigate("/auth/login");
    }

    if (role === "admin" || role === "vod") {
      return navigate(`/vod/${videoId}`);
    }

    if (role === "student") {
      return alert("이 영상은 VOD 이용권이 필요합니다.");
    }
  }

  return (
    <div className="p-5 pb-24">

      {/* ------------------------------ */}
      {/* 전체 공지 섹션 */}
      {/* ------------------------------ */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold flex items-center gap-2 text-[#404040]">
            <Megaphone size={20} /> 전체 공지
          </h2>

          <button
            onClick={() => navigate("/notices")}
            className="text-sm text-[#7a6f68] flex items-center gap-1"
          >
            전체보기 <ChevronRight size={14} />
          </button>
        </div>

        <div className="space-y-3">
          {notices.map((n) => (
            <div
              key={n.id}
              className="bg-white border rounded-lg p-4 shadow-sm cursor-pointer"
              onClick={() => navigate(`/notices/${n.id}`)}
            >
              <p className="font-semibold text-[#404040]">{n.title}</p>
              <p className="text-sm text-[#7a6f68] mt-1 line-clamp-2">{n.content}</p>
              <p className="text-xs text-gray-400 mt-2">{n.created_at?.slice(0, 10)}</p>
            </div>
          ))}

          {notices.length === 0 && (
            <p className="text-sm text-gray-500">등록된 공지가 없습니다.</p>
          )}
        </div>
      </section>

      {/* ------------------------------ */}
      {/* VOD 섹션 */}
      {/* ------------------------------ */}

      <VodSection
        title="추천 VOD"
        list={vodRecommended}
        onPlay={handlePlay}
      />

      <VodSection
        title="기초 VOD"
        list={vodBasic}
        onPlay={handlePlay}
      />

      <VodSection
        title="심화 VOD"
        list={vodAdvanced}
        onPlay={handlePlay}
      />
    </div>
  );
}

/* ----------------------------
   VOD 목록 단일 섹션 컴포넌트
-----------------------------*/
function VodSection({ title, list, onPlay }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-[#404040] mb-3">{title}</h2>

      {list && list.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {list.map((v) => (
            <div
              key={v.id}
              className="bg-white border rounded-xl p-2 shadow-sm cursor-pointer"
              onClick={() => onPlay(v.id)}
            >
              <img
                src={v.thumbnail}
                alt={v.title}
                className="w-full h-28 object-cover rounded-lg"
              />

              <p className="mt-2 text-sm font-semibold text-[#404040] line-clamp-1">
                {v.title}
              </p>

              <div className="flex items-center text-[#7a6f68] text-xs mt-1">
                <PlayCircle size={14} className="mr-1" />
                재생하기
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">현재 준비된 영상이 없습니다.</p>
      )}
    </section>
  );
}