import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminHome() {
  const [recentAssignments, setRecentAssignments] = useState<any[]>([]);
  const [latestNotice, setLatestNotice] = useState<any>(null);
  const [classProgress, setClassProgress] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      /* -----------------------------
         최신 공지
      ----------------------------- */
      const { data: notice } = await supabase
        .from("classroom_notices")
        .select("title, content, created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (notice) {
        setLatestNotice({
          title: notice.title,
          content: notice.content,
          date: new Date(notice.created_at).toLocaleDateString("ko-KR"),
        });
      }

      /* -----------------------------
         최근 제출된 과제
      ----------------------------- */
      const { data: assignments } = await supabase
        .from("assignments")
        .select(`
          id,
          title,
          created_at,
          assignments_feedback(id)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (assignments) {
        setRecentAssignments(
          assignments.map((a: any) => ({
            id: a.id,
            student: "수강생",
            title: a.title,
            date: new Date(a.created_at).toLocaleDateString("ko-KR"),
            status:
              a.assignments_feedback.length > 0 ? "checked" : "unchecked",
          }))
        );
      }

      /* -----------------------------
         수업별 진행 현황
      ----------------------------- */
      const { data: classes } = await supabase
        .from("classes")
        .select("id, title");

      if (!classes) return;

      const progress = [];

      for (const cls of classes) {
        const { count: total } = await supabase
          .from("assignments")
          .select("*", { count: "exact", head: true })
          .eq("class_id", cls.id);

        const { count: done } = await supabase
          .from("assignments_feedback")
          .select("*", { count: "exact", head: true })
          .eq("class_id", cls.id);

        progress.push({
          className: cls.title,
          total: total || 0,
          done: done || 0,
        });
      }

      setClassProgress(progress);
    }

    loadDashboard();
  }, []);

  return (
    <div className="pb-10 space-y-6">
      <h1 className="text-lg md:text-2xl font-bold text-[#404040]">
        관리자 대시보드
      </h1>

      {/* 최신 공지 */}
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold mb-2">최신 공지</h2>
        {latestNotice ? (
          <>
            <p className="font-medium">{latestNotice.title}</p>
            <p className="text-sm mt-1 whitespace-pre-line">
              {latestNotice.content}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {latestNotice.date}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-500">공지 데이터가 없습니다.</p>
        )}
      </div>

      {/* 최근 제출 과제 */}
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold mb-3">최근 제출된 과제</h2>
        {recentAssignments.length > 0 ? (
          <ul className="space-y-3">
            {recentAssignments.map((a) => (
              <li key={a.id} className="flex justify-between border-b pb-2">
                <div>
                  <p className="font-semibold">{a.student}</p>
                  <p className="text-sm">{a.title}</p>
                  <p className="text-xs text-gray-400">{a.date}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-gray-200">
                  {a.status === "checked" ? "확인됨" : "미확인"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">제출된 과제가 없습니다.</p>
        )}
      </div>

      {/* 수업별 진행 현황 */}
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold mb-3">수업별 진행 현황</h2>
        {classProgress.length > 0 ? (
          <div className="space-y-4">
            {classProgress.map((cls, idx) => {
              const percent =
                cls.total > 0
                  ? Math.round((cls.done / cls.total) * 100)
                  : 0;

              return (
                <div key={idx}>
                  <p className="text-sm mb-1">{cls.className}</p>
                  <div className="w-full h-3 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-[#f3efe4] rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {percent}% 진행
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            수업 진행 데이터가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}