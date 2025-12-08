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
  order: number | null;
};

export default function VodProgramPage() {
  const { programId } = useParams();
  const navigate = useNavigate();

  const [program, setProgram] = useState<VodProgram | null>(null);
  const [topics, setTopics] = useState<VodTopic[]>([]);

  useEffect(() => {
    async function load() {
      const [{ data: progData }, { data: topicData }] = await Promise.all([
        supabase.from("vod_programs").select("*").eq("id", programId).maybeSingle(),
        supabase
          .from("vod_topics")
          .select("*")
          .eq("program_id", programId)
          .order("order", { ascending: true }),
      ]);

      setProgram(progData ?? null);
      setTopics(topicData ?? []);
    }

    load();
  }, [programId]);

  if (!program) return <p className="p-4">프로그램을 찾을 수 없습니다.</p>;

  return (
    <div className="px-4 py-6 space-y-6">
      {/* 상단 프로그램 정보 */}
      <div className="rounded-xl bg-white shadow p-4">
        <img
          src={program.thumbnail_url || "/fallback-thumbnail.png"}
          className="w-full h-48 object-cover rounded-lg mb-3"
        />
        <h1 className="text-xl font-bold text-[#404040]">{program.title}</h1>
        {program.description && (
          <p className="text-[#7a6f68] mt-1">{program.description}</p>
        )}
      </div>

      {/* 토픽 리스트 */}
      <div className="rounded-xl bg-white shadow p-4">
        <h2 className="font-semibold mb-3 text-[#404040]">토픽 목록</h2>

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
      </div>
    </div>
  );
}
