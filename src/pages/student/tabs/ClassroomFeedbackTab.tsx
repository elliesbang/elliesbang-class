import { useMemo, useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { useAssignmentFeedback } from "@/hooks/useAssignmentFeedback";
import { AssignmentFeedbackItem } from "@/types/assignment";
import { supabase } from "@/lib/supabaseClient";

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
        <div className="bg-white rounded-xl shadow-sm border p-4 text-center text-sm text-gray-600">
          유효한 강의실이 아닙니다.
        </div>
      );
    }

    if (loading) {
      return (
        <div className="bg-white rounded-xl shadow-sm border p-4 text-center text-sm text-gray-600">
          피드백을 불러오는 중입니다...
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-xl shadow-sm border p-4 text-center text-sm text-red-500">
          {error}
        </div>
      );
    }

    if (sortedFeedbacks.length === 0) {
      return (
        <div className="bg-white rounded-xl border border-dashed text-center py-12 px-4">
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
          <FeedbackCard
            key={`${item.assignmentId}-${item.feedbackCreatedAt}`}
            item={item}
          />
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
  const { user } = useAuth();

  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);

  const formattedDate = new Date(item.feedbackCreatedAt).toLocaleDateString(
    "ko-KR"
  );
  const hasSession = item.sessionNo !== undefined && item.sessionNo !== null;

  useEffect(() => {
    if (!item.feedbackId) return;

    const fetchComments = async () => {
      const { data } = await supabase
        .from("feedback_comments")
        .select("id, content, role, created_at")
        .eq("feedback_id", item.feedbackId)
        .order("created_at", { ascending: true });

      setComments(data || []);
    };

    fetchComments();
  }, [item.feedbackId]);

  const handleSubmit = async () => {
    if (!commentText.trim() || !user) return;

    setSending(true);

    const { error } = await supabase.from("feedback_comments").insert({
      feedback_id: item.feedbackId,
      user_id: user.id,
      role: user.role === "admin" ? "admin" : "student",
      content: commentText,
    });

    setSending(false);

    if (!error) {
      setCommentText("");

      const { data } = await supabase
        .from("feedback_comments")
        .select("id, content, role, created_at")
        .eq("feedback_id", item.feedbackId)
        .order("created_at", { ascending: true });

      setComments(data || []);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4">
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

      <div className="bg-[#fffaf0] rounded-xl p-3 text-sm whitespace-pre-line">
        {item.feedbackText}
      </div>

      <p className="text-xs text-gray-500 mt-2">
        피드백 작성: {item.instructorName}
      </p>

      {/* 댓글 영역 */}
      <div className="mt-4 border-t pt-3 space-y-2">
        {comments.map((c) => (
          <div
            key={c.id}
            className={`rounded-lg px-3 py-2 text-sm ${
              c.role === "admin"
                ? "bg-[#fff7cc] border-l-4 border-[#ffd331]"
                : "bg-gray-100"
            }`}
          >
            {c.content}
            <div className="text-[10px] text-gray-400 mt-1">
              {new Date(c.created_at).toLocaleString("ko-KR")}
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="댓글을 입력하세요"
            rows={2}
            className="flex-1 border rounded-lg p-2 text-sm"
          />
          <button
            onClick={handleSubmit}
            disabled={sending}
            className="px-3 py-2 rounded-lg bg-[#ffd331] text-sm font-medium"
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassroomFeedbackTab;