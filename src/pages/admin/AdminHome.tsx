import { useEffect, useState } from "react";
import { Users, Video, BookOpen, ClipboardList } from "lucide-react";

export default function AdminHome() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalVod: 0,
    totalClasses: 0,
    totalAssignmentsThisMonth: 0,
  });

  const [recentAssignments, setRecentAssignments] = useState([]);
  const [latestNotice, setLatestNotice] = useState(null);
  const [classProgress, setClassProgress] = useState([]);

  // -----------------------------------------------------------
  // 📌 대시보드 데이터 로딩 (임시 더미 데이터)
  // -----------------------------------------------------------
  useEffect(() => {
    async function loadDashboard() {
      // TODO: Supabase에서 실제 데이터 가져오기

      setStats({
        totalStudents: 128,
        totalVod: 57,
        totalClasses: 12,
        totalAssignmentsThisMonth: 43,
      });

      setRecentAssignments([
        {
          id: 1,
          student: "김수지",
          title: "1주차 과제",
          date: "2025-02-10",
          status: "checked",
        },
        {
          id: 2,
          student: "박민지",
          title: "배너 디자인 제출",
          date: "2025-02-10",
          status: "pending",
        },
        {
          id: 3,
          student: "강효린",
          title: "2주차 스케치",
          date: "2025-02-09",
          status: "checked",
        },
      ]);

      setLatestNotice({
        title: "📢 2월 전체 공지",
        content: "설 연휴 기간에는 모든 강의가 휴강입니다.",
        date: "2025-02-01",
      });

      setClassProgress([
        { className: "캔디마 기초반", done: 30, total: 50 },
        { className: "AI 일러스트 챌린지", done: 12, total: 20 },
        { className: "굿즈 디자인 실전반", done: 40, total: 60 },
      ]);
    }

    loadDashboard();
  }, []);

  return (
    <div className="pb-10 space-y-6">
      <h1 className="text-lg md:text-2xl font-bold text-[#404040] mb-2 whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
        관리자 대시보드
      </h1>

      {/* ----------------------------------------------------
          📌 상단 요약 카드 4개
          ---------------------------------------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 md:mb-8">
        {/* 전체 수강생 */}
        <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-2 admin-card">
          <Users className="text-[#404040]" size={26} />
          <p className="text-sm text-gray-500">전체 수강생</p>
          <p className="text-2xl font-bold">{stats.totalStudents}</p>
        </div>

        {/* VOD 사용자 */}
        <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-2 admin-card">
          <Video className="text-[#404040]" size={26} />
          <p className="text-sm text-gray-500">VOD 사용자</p>
          <p className="text-2xl font-bold">{stats.totalVod}</p>
        </div>

        {/* 전체 수업 */}
        <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-2 admin-card">
          <BookOpen className="text-[#404040]" size={26} />
          <p className="text-sm text-gray-500">전체 수업 수</p>
          <p className="text-2xl font-bold">{stats.totalClasses}</p>
        </div>

        {/* 이번달 과제 제출 */}
        <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-2 admin-card">
          <ClipboardList className="text-[#404040]" size={26} />
          <p className="text-sm text-gray-500">이번달 과제 제출</p>
          <p className="text-2xl font-bold">{stats.totalAssignmentsThisMonth}</p>
        </div>
      </div>

      {/* ----------------------------------------------------
          📌 최신 전체 공지
          ---------------------------------------------------- */}
      {latestNotice && (
        <div className="bg-white border rounded-xl p-5 shadow-sm mb-6 admin-card">
          <h2 className="text-base md:text-lg font-semibold text-[#404040] mb-2 whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
            최신 공지
          </h2>
          <p className="text-gray-700 font-medium">{latestNotice.title}</p>
          <p className="text-sm text-[#555] whitespace-pre-line mt-1">
            {latestNotice.content}
          </p>
          <p className="text-xs text-gray-400 mt-2">{latestNotice.date}</p>
        </div>
      )}

      {/* ----------------------------------------------------
          📌 최근 제출된 과제 목록
          ---------------------------------------------------- */}
      <div className="bg-white border rounded-xl p-5 shadow-sm mb-6 admin-card">
        <h2 className="text-base md:text-lg font-semibold text-[#404040] mb-4 whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
          최근 제출된 과제
        </h2>

        <ul className="space-y-3">
          {recentAssignments.map((a) => (
            <li
              key={a.id}
              className="flex justify-between border-b pb-2"
            >
              <div>
                <p className="font-semibold">{a.student}</p>
                <p className="text-sm text-gray-600">{a.title}</p>
                <p className="text-xs text-gray-400 mt-1">{a.date}</p>
              </div>

              <span
                className={`px-2 py-1 text-xs rounded self-start ${
                  a.status === "checked"
                    ? "bg-green-200 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {a.status === "checked" ? "확인됨" : "미확인"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ----------------------------------------------------
          📌 수업별 진행 현황 (막대바 UI)
          ---------------------------------------------------- */}
      <div className="bg-white border rounded-xl p-5 shadow-sm admin-card">
        <h2 className="text-base md:text-lg font-semibold text-[#404040] mb-4 whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
          수업별 진행 현황
        </h2>

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
      </div>
    </div>
  );
}