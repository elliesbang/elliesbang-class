import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import ClassroomAccessCodeModal from "@/modals/ClassroomAccessCodeModal";
import NoticesTab from "@/pages/student/tabs/NoticesTab";
import ClassroomVideosTab from "@/pages/student/tabs/ClassroomVideosTab";
import ClassroomMaterialsTab from "@/pages/student/tabs/ClassroomMaterialsTab";
import ClassroomFeedbackTab from "@/pages/student/tabs/ClassroomFeedbackTab";
import ClassroomAssignmentsTab from "@/pages/student/tabs/ClassroomAssignmentsTab";

const TABS = [
  { key: "video", label: "영상" },
  { key: "material", label: "자료" },
  { key: "notice", label: "공지" },
  { key: "assignment", label: "과제" },
  { key: "feedback", label: "피드백" },
] as const;

export default function ClassroomDetail() {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const { role, user } = useAuth(); // ✅ user 추가 (수정)

  const parsedId = useMemo(() => Number(classroomId ?? "0"), [classroomId]);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["key"]>("video");
  const [verified, setVerified] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ loading 추가 (수정)

  useEffect(() => {
    const checkSeasonAccess = async () => {
      if (!parsedId || !user) {
        setLoading(false); // ✅ 무한 로딩 방지 (수정)
        return;
      }

      // 관리자는 바로 통과
      if (role === "admin") {
        setVerified(true);
        setLoading(false);
        return;
      }

      // 1. 강의실 시즌 정보 조회
      const { data: classroom, error } = await supabase
        .from("classrooms")
        .select("start_date, end_date")
        .eq("id", parsedId)
        .single();

      if (error || !classroom) {
        setLoading(false);
        return;
      }

      const today = new Date();
      const startDate = new Date(classroom.start_date);
      const endDate = new Date(classroom.end_date);

      // 시즌 외 → 접근 불가
      if (today < startDate || today > endDate) {
        setVerified(false);
        setShowModal(false);
        setLoading(false);
        return;
      }

      // 2. 시즌 인증 여부 확인
      const { data: access } = await supabase
        .from("class_season_access")
        .select("id")
        .eq("user_id", user.id)
        .eq("class_id", parsedId)
        .eq("season_start_date", classroom.start_date)
        .eq("season_end_date", classroom.end_date)
        .maybeSingle();

      if (access) {
        setVerified(true);
        setShowModal(false);
      } else {
        setVerified(false);
        setShowModal(true);
      }

      setLoading(false);
    };

    checkSeasonAccess();
  }, [parsedId, role, user]);

  const handleCodeSuccess = async () => {
    if (!user || !parsedId) return;

    const { data: classroom } = await supabase
      .from("classrooms")
      .select("start_date, end_date")
      .eq("id", parsedId)
      .single();

    if (!classroom) return;

    await supabase.from("class_season_access").insert({
      user_id: user.id,
      class_id: parsedId,
      season_start_date: classroom.start_date,
      season_end_date: classroom.end_date,
    });

    setVerified(true);
    setShowModal(false);
  };

  if (loading) {
  return (
    <div className="p-6 text-center text-sm text-gray-400">
      강의실을 불러오는 중입니다…
    </div>
  );
}

  if (!classroomId || Number.isNaN(parsedId)) {
    return (
      <div className="p-6 text-center text-sm text-gray-500">
        유효하지 않은 강의실입니다.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffdf6] px-4 pb-24 pt-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#404040]">강의실 #{classroomId}</h1>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-lg px-3 py-1 text-sm text-[#7a6f68] hover:bg-gray-100"
        >
          뒤로
        </button>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm border ${
              activeTab === tab.key
                ? "bg-[#f3efe4] text-[#404040]"
                : "bg-white text-[#7a6f68]"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {verified && activeTab === "video" && <ClassroomVideosTab classroomId={parsedId} />}
      {verified && activeTab === "material" && (
        <ClassroomMaterialsTab classroomId={parsedId} />
      )}
      {verified && activeTab === "notice" && <NoticesTab classroomId={parsedId} />}
      {verified && activeTab === "assignment" && (
        <ClassroomAssignmentsTab classroomId={parsedId} classId={parsedId} />
      )}
      {verified && activeTab === "feedback" && (
        <ClassroomFeedbackTab classroomId={parsedId} classId={parsedId} />
      )}

      {!verified && role !== "admin" && showModal && (
        <ClassroomAccessCodeModal
          classroomId={parsedId}
          onClose={() => setShowModal(false)}
          onSuccess={handleCodeSuccess}
        />
      )}
    </div>
  );
}