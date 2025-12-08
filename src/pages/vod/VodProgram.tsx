import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../auth/AuthProvider";
import { openLoginModal } from "../../lib/authModal";

type VodProgram = {
  id: number;
  title: string;
  description?: string | null;
};

type VodTopic = {
  id: number;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
};

export default function VodProgramPage() {
  const navigate = useNavigate();
  const { programId } = useParams<{ programId: string }>();
  const { user, loading } = useAuth();

  const [program, setProgram] = useState<VodProgram | null>(null);
  const [topics, setTopics] = useState<VodTopic[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const numericProgramId = Number(programId);

  // 로그인 체크 (역할 상관없이 로그인만 되어 있으면 볼 수 있음)
  useEffect(() => {
    if (loading) return;
    if (!user) {
      openLoginModal(null, "로그인이 필요한 서비스입니다.");
      navigate("/", { replace: true });
    }
  }, [loading, user, navigate]);

  // 프로그램 + 토픽 불러오기
  useEffect(() => {
    if (!numericProgramId) return;

    async function loadProgramAndTopics() {
      setPageLoading(true);

      // 프로그램 정보
      const { data: programData, error: programError } = await supabase
        .from("vod_programs")
        .select("id, title, description")
        .eq("id", numericProgramId)
        .maybeSingle();

      if (programError) {
        console.error("프로그램 불러오기 오류:", programError);
        setPageLoading(false);
        return;
      }

      setProgram(programData as VodProgram);

      // 주제(토픽) 목록
      const { data: topicData, error: topicError } = await supabase
        .from("vod_topics")
        .select("id, title, description, thumbnail_url")
        .eq("program_id", numericProgramId)
        .order("order", { ascending: true })
        .order("created_at", { ascending: true });

      if (topicError) {
        console.error("주제 목록 불러오기 오류:", topicError);
        setPageLoading(false);
        return;
      }

      setTopics((topicData as VodTopic[]) || []);
      setPageLoading(false);
    }

    void loadProgramAndTopics();
  }, [numericProgramId]);

  if (pageLoading || !program) {
    return <div className="p-5">불러오는 중...</div>;
  }

  return (
    <div className="pb-20 px-4">
      {/* 상단 프로그램 정보 */}
      <div className="py-5">
        <h1 className="text-xl font-bold text-[#404040]">
          {program.title}
        </h1>
        {program.description ? (
          <p className="mt-2 text-sm text-[#7a6f68] whitespace-pre-line">
            {program.description}
          </p>
        ) : (
          <p className="mt-2 text-sm text-[#7a6f68]">
            이 과정에 포함된 주제를 선택해 영상을 확인해보세요.
          </p>
        )}
      </div>

      {/* 주제 카드 그리드 (PC 3컬럼, 모바일 1컬럼) */}
      {topics.length === 0 ? (
        <p className="text-sm text-gray-500">
          아직 등록된 주제가 없습니다.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => navigate(`/vod/topic/${topic.id}`)}
              className="text-left bg-white rounded-2xl shadow-sm border border-[#f3f3f3] overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* 썸네일 */}
              <div className="w-full h-36 md:h-40 bg-[#f7f7f7]">
                <img
                  src={
                    topic.thumbnail_url && topic.thumbnail_url.length > 0
                      ? topic.thumbnail_url
                      : "/fallback-thumbnail.png"
                  }
                  alt={topic.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 텍스트 영역 */}
              <div className="p-3 md:p-4">
                <h2 className="text-sm md:text-base font-semibold text-[#404040] line-clamp-2">
                  {topic.title}
                </h2>
                {topic.description && (
                  <p className="mt-2 text-xs md:text-sm text-[#7a6f68] line-clamp-3">
                    {topic.description}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
