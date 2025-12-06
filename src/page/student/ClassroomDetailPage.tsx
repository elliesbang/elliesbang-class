import { useState } from "react";
import { useParams } from "react-router-dom";
import NoticesTab from "@/components/classroom/tabs/NoticesTab";
import ClassroomVideosTab from "./tabs/ClassroomVideosTab";
import ClassroomMaterialsTab from "./tabs/ClassroomMaterialsTab";
import ClassroomAssignmentsTab from "./tabs/ClassroomAssignmentsTab";

type TabKey = "video" | "material" | "notice" | "assignment" | "feedback";

const ClassroomDetailPage = () => {
  const { categoryId } = useParams();
  const [activeTab, setActiveTab] = useState<TabKey>("video");
  const classroomId = categoryId ?? "";
  const parsedClassroomId = Number.isNaN(Number(categoryId))
    ? undefined
    : Number(categoryId);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "video", label: "영상" },
    { key: "material", label: "자료" },
    { key: "notice", label: "공지" },
    { key: "assignment", label: "과제" },
    { key: "feedback", label: "피드백" },
  ];

  return (
    <div className="min-h-screen bg-[#fffdf6] px-4 pb-24 pt-4">
      <h1 className="mb-4 text-xl font-bold text-[#404040]">
        강의실 #{categoryId}
      </h1>

      {/* 탭 버튼 */}
      <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm border ${
              activeTab === t.key
                ? "bg-[#f3efe4] text-[#404040]"
                : "bg-white text-[#7a6f68]"
            }`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 탭 내용 */}
      {activeTab === "video" && (
        <ClassroomVideosTab classroomId={parsedClassroomId} />
      )}

      {activeTab === "material" && (
        <ClassroomMaterialsTab classroomId={parsedClassroomId} />
      )}

      {activeTab === "notice" && (
        <NoticesTab classroomId={parsedClassroomId ?? 0} />
      )}

      {activeTab === "assignment" && (
        <ClassroomAssignmentsTab classroomId={classroomId} classId={parsedClassroomId ?? 0} />
      )}

      {activeTab === "feedback" && (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div>
            <h2 className="mb-2 text-base font-semibold text-[#404040]">
              피드백
            </h2>
            <p className="text-sm text-[#7a6f68]">
              TODO: 관리자 대시보드 과제/피드백 관리에서 입력한 피드백을 이
              강의실 기준으로 모아서 보여주기.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomDetailPage;
