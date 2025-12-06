import { useMemo } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { useAssignmentFeedback } from "@/hooks/useAssignmentFeedback";
import { AssignmentFeedbackItem } from "@/types/assignment";

interface ClassroomFeedbackTabProps {
  classroomId?: number;
  classId?: number;
}

const ClassroomFeedbackTab = ({
  classroomId,
  classId,
}: ClassroomFeedbackTabProps) => {
  const { user } = useAuth();
  const studentId = user?.id as string | undefined;

  const { feedbackItems, loading, error } = useAssignmentFeedback({
    classroomId,
    classId,
    studentId,
  });

  const sortedFeedbacks = useMemo(
    () =>
      [...feedbackItems].sort(
        (a, b) =>
          new Date(b.feedbackCreatedAt).getTime() -
          new Date(a.feedbackCreatedAt).getTime()
      ),
    [feedbackItems]
  );

  const renderContent = () => {
    if (!classroomId) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-[#f1f1f1] p-4 text-center text-sm text-gray-600">
          유효한 강의실이 아닙니다.
        </div>
      );
    }

    if (loading) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-[#f1f1f1] p-4 text-center text-sm text-gray-600">
          피드백을 불러오는 중입니다...
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-[#f1f1f1] p-4 text-center text-sm text-red-500">
          {error}
        </div>
      );
    }

    if (sortedFeedbacks.length === 0) {
      return (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 text-center py-12 px-4">
          <p className="text-sm text-gray-600 font-medium">
            아직 받은 피드백이 없어요.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            과제를 제출하면 선생님 피드백이 이곳에 모여요.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {sortedFeedbacks.map((item) => (
          <FeedbackCard key={`${item.assignmentId}-${item.feedbackCreatedAt}`} item={item} />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 px-4">
      <h2 className="text-lg font-bold text-[#404040] mb-2">피드백</h2>
      <p className="text-sm text-gray-500 mb-4">
        선생님이 남긴 과제 피드백을 한 곳에서 볼 수 있어요.
      </p>

      {renderContent()}
    </div>
  );
};

const FeedbackCard = ({ item }: { item: AssignmentFeedbackItem }) => {
  const formattedDate = new Date(item.feedbackCreatedAt).toLocaleDateString(
    "ko-KR"
  );
  const hasSession = item.sessionNo !== undefined && item.sessionNo !== null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#f1f1f1] p-4">
      <div className="flex flex-col gap-1 mb-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[#7a6f68]">
            {hasSession ? `${item.sessionNo}회차` : "과제"}
          </p>
          <p className="text-xs text-gray-400">{formattedDate}</p>
        </div>
        <p className="text-base font-bold text-[#404040] truncate">
          {item.title || "제목 없는 과제"}
        </p>
      </div>

      <div className="bg-[#fffaf0] rounded-xl p-3 text-sm text-[#404040] whitespace-pre-line">
        {item.feedbackText}
      </div>

      <div className="flex flex-col gap-2 mt-3">
        <p className="text-xs text-gray-500">피드백 작성: {item.instructorName}</p>

        {(item.imageUrl || item.linkUrl) && (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {item.imageUrl && (
              <button
                type="button"
                onClick={() => window.open(item.imageUrl as string, "_blank")}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 bg-white hover:bg-[#fff7e3] transition"
                aria-label={`${hasSession ? `${item.sessionNo}회차` : "과제"} 이미지 새 창 열기`}
              >
                <img
                  src={item.imageUrl}
                  alt={`${hasSession ? `${item.sessionNo}회차` : "과제"} 이미지`}
                  className="w-12 h-12 rounded object-cover border"
                />
                <span className="text-xs text-[#404040]">이미지 크게 보기</span>
              </button>
            )}

            {item.linkUrl && (
              <a
                href={item.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 bg-white hover:bg-[#fff7e3] transition text-[#404040]"
                aria-label="과제 링크 새 창 열기"
              >
                🔗 과제 링크 열기
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomFeedbackTab;
