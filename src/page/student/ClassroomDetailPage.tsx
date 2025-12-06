import { useState } from "react";
import { useParams } from "react-router-dom";
import ClassroomVideosTab from "./tabs/ClassroomVideosTab";
import ClassroomMaterialsTab from "./tabs/ClassroomMaterialsTab";

type TabKey = "video" | "material" | "notice" | "assignment" | "feedback";

const ClassroomDetailPage = () => {
  const { categoryId } = useParams();
  const [activeTab, setActiveTab] = useState<TabKey>("video");

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
        <ClassroomVideosTab
          classroomId={categoryId ? Number(categoryId) : undefined}
        />
      )}

      {activeTab === "material" && (
        <ClassroomMaterialsTab
          classroomId={categoryId ? Number(categoryId) : undefined}
        />
      )}

      {activeTab !== "video" && activeTab !== "material" && (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          {activeTab === "notice" && (
            <div>
              <h2 className="mb-2 text-base font-semibold text-[#404040]">
                공지
              </h2>
              <p className="text-sm text-[#7a6f68]">
                TODO: classroom_content (type="notice")에서 이 강의실 공지
                리스트/본문 표시.
              </p>
            </div>
          )}

          {activeTab === "assignment" && (
            <div>
              <h2 className="mb-2 text-base font-semibold text-[#404040]">
                과제
              </h2>
              <p className="mb-2 text-sm text-[#7a6f68]">
                TODO: 회차 드롭다운 + 이미지 업로드 + 링크 입력 + 저장 목록 +
                수정/삭제 UI.
              </p>
              <p className="text-xs text-[#a28f7a]">
                회차 정보는 카테고리별로 Supabase에 저장된 회차 설정값을
                기준으로 드롭다운에 노출.
              </p>
            </div>
          )}

          {activeTab === "feedback" && (
            <div>
              <h2 className="mb-2 text-base font-semibold text-[#404040]">
                피드백
              </h2>
              <p className="text-sm text-[#7a6f68]">
                TODO: 관리자 대시보드 과제/피드백 관리에서 입력한 피드백을
                이 강의실 기준으로 모아서 보여주기.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TODO: 완주 현황/수료증 영역 */}
      <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-base font-semibold text-[#404040]">
          완주 현황
        </h2>
        <p className="text-sm text-[#7a6f68] mb-2">
          TODO: 이 강의실의 전체 회차 대비 제출 완료한 회차 수를 계산해
          막대바(Progress bar)로 시각화.
        </p>

        <div className="mb-3 h-3 w-full rounded-full bg-gray-200">
          {/* 예시: 60% */}
          <div className="h-3 w-[60%] rounded-full bg-[#f3efe4]" />
        </div>

        <p className="text-xs text-[#7a6f68]">
          회차를 모두 제출하면 자동으로 수료증 발급 및 다운로드 버튼이
          활성화됩니다. (TODO)
        </p>

        {/* TODO: 완료 시에만 보이는 버튼 */}
        <button
          disabled
          className="mt-3 rounded-lg bg-gray-200 px-4 py-2 text-xs font-medium text-gray-500"
        >
          수료증 다운로드 (준비 중)
        </button>
      </div>
    </div>
  );
};

export default ClassroomDetailPage;