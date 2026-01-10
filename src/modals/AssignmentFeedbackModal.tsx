import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export type AssignmentFeedbackRecord = {
  id: number;
  assignment_id: number;
  feedback_text: string;
  created_at?: string;
  updated_at?: string | null;
};

export type AssignmentForFeedback = {
  id: number;
  classroomName: string;
  studentName: string;
  sessionNo: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  createdAt: string;
  title: string | null;
  feedback?: AssignmentFeedbackRecord;
};

type AssignmentFeedbackModalProps = {
  open: boolean;
  assignment: AssignmentForFeedback | null;
  instructorId?: string | null;
  onClose: () => void;
  onSaved: (feedback: AssignmentFeedbackRecord) => void;
};

const AssignmentFeedbackModal = ({
  open,
  assignment,
  instructorId,
  onClose,
  onSaved,
}: AssignmentFeedbackModalProps) => {
  const [feedbackText, setFeedbackText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<
    { id: number; content: string; role: string; created_at: string }[]
  >([]);

  useEffect(() => {
    if (open && assignment) {
      setFeedbackText(assignment.feedback?.feedback_text ?? "");
      setError(null);
    }
  }, [assignment, open]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!assignment?.feedback?.id) {
        setComments([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("feedback_comments")
        .select("id, content, role, created_at")
        .eq("feedback_id", assignment.feedback.id)
        .order("created_at", { ascending: true });

      if (fetchError) {
        console.error("댓글을 불러오는 중 오류가 발생했습니다.", fetchError);
        return;
      }

      setComments(data || []);
    };

    if (open) {
      fetchComments();
    }
  }, [assignment?.feedback?.id, open]);

  if (!open || !assignment) return null;

  const handleSave = async () => {
    if (!feedbackText.trim()) {
      setError("피드백 내용을 입력해주세요.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      feedback_text: feedbackText.trim(),
      instructor_id: instructorId,
      updated_at: new Date().toISOString(),
    } as const;

    const query = assignment.feedback
      ? supabase
          .from("assignments_feedback")
          .update(payload)
          .eq("assignment_id", assignment.id)
          .select()
          .single()
      : supabase
          .from("assignments_feedback")
          .insert({
            ...payload,
            assignment_id: assignment.id,
          })
          .select()
          .single();

    const { data, error: supabaseError } = await query;

    if (supabaseError || !data) {
      console.error("피드백 저장 실패", supabaseError);
      setError("피드백 저장 중 오류가 발생했습니다. 다시 시도해주세요.");
      setSaving(false);
      return;
    }

    onSaved(data as AssignmentFeedbackRecord);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-xs text-gray-500">{assignment.classroomName}</p>
            <h2 className="text-lg font-semibold text-[#404040]">
              {assignment.studentName}님의 제출물
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            aria-label="모달 닫기"
            disabled={saving}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto px-4 py-4">
          <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                <span className="rounded-full bg-[#f9f7f2] px-3 py-1 text-xs font-medium text-[#7a6f68]">
                  회차 {assignment.sessionNo ?? "미정"}
                </span>
                <span className="rounded-full bg-[#f9f7f2] px-3 py-1 text-xs font-medium text-[#7a6f68]">
                  제출일 {new Date(assignment.createdAt).toLocaleString("ko-KR")}
                </span>
              </div>

              <div className="rounded-xl border bg-[#fffaf3] p-3">
                <p className="text-xs font-semibold text-[#404040] mb-2">제출물 미리보기</p>
                {assignment.imageUrl ? (
                  <img
                    src={assignment.imageUrl}
                    alt={assignment.title ?? "과제 이미지"}
                    className="h-64 w-full rounded-lg object-cover border"
                  />
                ) : assignment.linkUrl ? (
                  <a
                    href={assignment.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-[#2563EB] underline"
                  >
                    제출 링크 열기
                  </a>
                ) : (
                  <p className="text-xs text-gray-500">제출물 미리보기가 없습니다.</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-[#404040]">
                피드백 작성
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="min-h-[220px] w-full rounded-lg border px-3 py-2 text-sm focus:border-[#FFD331] focus:outline-none"
                placeholder="학생에게 전달할 피드백을 입력해주세요."
                disabled={saving}
              />

              <div className="space-y-2">
                <p className="text-sm font-semibold text-[#404040]">댓글</p>
                {comments.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-3 text-xs text-gray-500">
                    등록된 댓글이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`rounded-lg px-3 py-2 text-xs ${
                          comment.role === "admin"
                            ? "bg-[#fff7cc] border-l-4 border-[#ffd331]"
                            : "bg-gray-100"
                        }`}
                      >
                        {comment.content}
                        <div className="mt-1 text-[10px] text-gray-400">
                          {new Date(comment.created_at).toLocaleString("ko-KR")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-600">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                  disabled={saving}
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#FFD331] px-4 py-2 text-sm font-semibold text-[#404040] shadow-sm hover:bg-[#ffcd24] disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  저장하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentFeedbackModal;
