import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  GraduationCap,
  Video,
  FolderOpen,
  Bell,
} from "lucide-react";

type StatCardProps = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
};

const StatCard = ({ title, value, icon }: StatCardProps) => {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-white px-6 py-5 shadow-sm">
      <div className="p-3 rounded-xl bg-[#f3efe4] text-[#404040]">
        {icon}
      </div>
      <div>
        <p className="text-sm text-[#7a7a7a]">{title}</p>
        <p className="text-xl font-semibold text-[#404040]">{value}</p>
      </div>
    </div>
  );
};

export default function AdminHome() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalVodUsers: 0,
    totalClasses: 0,
    totalAssignments: 0,
    totalVodVideos: 0,
    totalNotices: 0,
  });

  // ▷ 나중에 Supabase 연동 가능: 통계 불러오기
  useEffect(() => {
    async function loadStats() {
      try {
        // 예: const { data } = await supabase.rpc("get_admin_stats");
        // 지금은 목업 데이터
        setStats({
          totalStudents: 128,
          totalVodUsers: 67,
          totalClasses: 12,
          totalAssignments: 356,
          totalVodVideos: 42,
          totalNotices: 18,
        });
      } catch (e) {
        console.error(e);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="w-full">
      {/* 페이지 제목 */}
      <h1 className="text-2xl font-bold text-[#404040] mb-6">
        관리자 대시보드
      </h1>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
        <StatCard
          title="수강생 수"
          value={stats.totalStudents}
          icon={<Users size={22} />}
        />
        <StatCard
          title="VOD 사용자 수"
          value={stats.totalVodUsers}
          icon={<Video size={22} />}
        />
        <StatCard
          title="강의실 수"
          value={stats.totalClasses}
          icon={<BookOpen size={22} />}
        />
        <StatCard
          title="과제 제출 수"
          value={stats.totalAssignments}
          icon={<GraduationCap size={22} />}
        />
        <StatCard
          title="VOD 영상 수"
          value={stats.totalVodVideos}
          icon={<FolderOpen size={22} />}
        />
        <StatCard
          title="전체 공지 수"
          value={stats.totalNotices}
          icon={<Bell size={22} />}
        />
      </div>

      {/* 최근 공지 / 최근 과제 제출 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 최근 공지 */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#404040] mb-4">
            최근 공지
          </h2>
          <ul className="space-y-3 text-sm text-[#5a5a5a]">
            <li>• 새 강의 영상 업로드 안내</li>
            <li>• 시스템 점검 예정 공지</li>
            <li>• 11월 수업 일정 안내</li>
          </ul>
        </div>

        {/* 최근 과제 제출 */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#404040] mb-4">
            최근 과제 제출
          </h2>
          <ul className="space-y-3 text-sm text-[#5a5a5a]">
            <li>• 김수지 — 캘리그라피 기초반</li>
            <li>• 박민지 — AI 일러스트 과정</li>
            <li>• 홍예린 — 굿즈 디자인 과정</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
