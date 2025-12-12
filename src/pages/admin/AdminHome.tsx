import { useEffect, useState } from "react";

export default function AdminHome() {
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [latestNotice, setLatestNotice] = useState(null);
  const [classProgress, setClassProgress] = useState([]);

  useEffect(() => {
    async function loadDashboard() {
      // TODO: Supabase에서 실제 데이터 가져오기
      // setRecentAssignments(...)
      // setLatestNotice(...)
      // setClassProgress(...)
    }

    loadDashboard();
  }, []);

  return (
    <div className="pb-10 space-y-6">
      <h1 className="text-lg md:text-2xl font-bold text-[#404040] mb-2 whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
        관리자 대시보드
      </h1>

      {/* ----------------------------------------------------
          📌 최신 전체 공지
          ---------------------------------------------------- */}
      <div className="bg-white border rounded-xl p-5 shadow-sm mb-6 admin-card">
        <h2 className="text-base md:text-lg font-semibold text-[#404040] mb-2 whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
          최신 공지
        </h2>
        {latestNotice ? (
          <div>
            <p className="text-gray-700 font-medium">{latestNotice.title}</p>
            <p className="text-sm text-[#555] whitespace-pre-line mt-1">{latestNotice.content}</p>
            <p className="text-xs text-gray-400 mt-2">{latestNotice.date}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">공지 데이터를 준비 중입니다.</p>
        )}
      </div>

      {/* ----------------------------------------------------
          📌 최근 제출된 과제 목록
          ---------------------------------------------------- */}
      <div className="bg-white border rounded-xl p-5 shadow-sm mb-6 admin-card">
        <h2 className="text-base md:text-lg font-semibold text-[#404040] mb-4 whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
          최근 제출된 과제
        </h2>

        {recentAssignments.length > 0 ? (
          <ul className="space-y-3">
            {recentAssignments.map((a) => (
              <li key={a.id} className="flex justify-between border-b pb-2">
                <div>
                  <p className="font-semibold">{a.student}</p>
                  <p className="text-sm text-gray-600">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{a.date}</p>
                </div>

                <span className="px-2 py-1 text-xs rounded self-start bg-gray-200 text-gray-600">
                  {a.status === "checked" ? "확인됨" : "미확인"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">제출된 과제가 없습니다.</p>
        )}
      </div>

      {/* ----------------------------------------------------
          📌 수업별 진행 현황 (막대바 UI)
          ---------------------------------------------------- */}
      <div className="bg-white border rounded-xl p-5 shadow-sm admin-card">
        <h2 className="text-base md:text-lg font-semibold text-[#404040] mb-4 whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
          수업별 진행 현황
        </h2>

        {classProgress.length > 0 ? (
          <div className="space-y-5">
            {classProgress.map((cls, idx) => {
              const percent = Math.round((cls.done / cls.total) * 100);

              return (
                <div key={idx}>
                  <p className="text-sm font-medium mb-1">{cls.className}</p>

                  <div className="w-full h-3 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-[#f3efe4] rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <p className="text-xs text-gray-500 mt-1">{percent}% 진행</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">수업 진행 현황 데이터가 없습니다.</p>
        )}
      </div>
    </div>
  );
}