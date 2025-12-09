import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

type VodProgram = {
  id: number;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
};

type VodTopic = {
  id: number;
  program_id: number;
  title: string;
  order: number | null; // 실제 컬럼명이 다르면 여기와 쿼리 둘 다 바꿔줘야 함
};

export default function VodProgramPage() {
  const { programId } = useParams();
  const navigate = useNavigate();

  const [program, setProgram] = useState<VodProgram | null>(null);
  const [topics, setTopics] = useState<VodTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const idNum = Number(programId);

    if (!programId || Number.isNaN(idNum)) {
      setError("잘못된 프로그램 ID입니다.");
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);

      const [progRes, topicRes] = await Promise.all([
        supabase
          .from("vod_programs")
          .select("id, title, description, thumbnail_url")
          .eq("id", idNum)
          .maybeSingle(),
        supabase
          .from("vod_topics")
          .select("id, program_id, title, order") // ← 실제 컬럼명 확인
          .eq("program_id", idNum)
          .order("order", { ascending: true }),   // 컬럼명이 다르면 여기서도 수정
      ]);

      if (progRes.error) {
        console.error("프로그램 불러오기 오류", progRes.error);
        setError("프로그램 정보를 불러오지 못했습니다.");
        setProgram(null);
        setTopics([]);
        setLoading(false);
        return;
      }

      if (topicRes.error) {
        console.error("토픽 불러오기 오류", topicRes.error);
        // 토픽 로딩 에러는 프로그램만이라도 보여줄 수 있게 함
        setError("토픽 정보를 불러오지 못했습니다.");
        setProgram(progRes.data ?? null);
        setTopics([]);
        setLoading(false);
        return;
      }

      setProgram(progRes.data ?? null);
      setTopics((topicRes.data ?? []) as VodTopic[]);
      setLoading(false);
    }

    load();
  }, [programId]);

  if (loading) {
    return <p className="p-4 text-gray-500">불러오는 중...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-600 text-sm">{error}</p>;
  }

  if (!program) {
    return <p className="p-4">프로그램을 찾을 수 없습니다.</p>;
  }

  return (
    <div className="px-4 py-6 space-y-6 bg-[#fffdf6] min-h-screen">
      {/* 상단 프로그램 정보 */}
      <div className="rounded-xl bg-white shadow p-4">
        <img
          src={program.thumbnail_url || "/fallback-thumbnail.png"}
          className="w-full h-48 object-cover rounded-lg mb-3"
          alt={program.title}
        />
        <h1 className="text-xl font-bold text-[#404040]">{program.title}</h1>
        {program.description && (
          <p className="text-[#7a6f68] mt-1 whitespace-pre-line">
            {program.description}
          </p>
        )}
      </div>

      {/* 토픽 리스트 */}
      <div className="rounded-xl bg-white shadow p-4">
        <h2 className="font-semibold mb-3 text-[#404040]">토픽 목록</h2>

        {topics.length === 0 ? (
          <p className="text-sm text-[#888]">등록된 토픽이 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {topics.map((t, idx) => (
              <li
                key={t.id}
                onClick={() => navigate(`/vod/topic/${t.id}`)}
                className="flex items-center justify-between p-3 border rounded-lg bg-[#faf7f0] cursor-pointer hover:bg-[#f3efe4]"
              >
                <span className="font-medium">
                  {idx + 1}강 · {t.title}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
