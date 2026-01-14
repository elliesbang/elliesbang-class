import { useMemo, useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { useAssignmentFeedback } from "@/hooks/useAssignmentFeedback";
import { AssignmentFeedbackItem } from "@/types/assignment";
import { supabase } from "@/lib/supabaseClient";

const FEEDBACK_COMMENT_BUCKET = "assignments";

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

  const [comments, setComments] = useState<
    {
      id: number;
      content: string | null;
      author_role: string;
      created_at: string;
      image_url: string | null;
    }[]
  >([]);
  const [commentText, setCommentText] = useState("");
  const [commentImageFile, setCommentImageFile] = useState<File | null>(null);
  const [commentImagePreview, setCommentImagePreview] = useState<string | null>(
    null
  );
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
        .select("id, content, author_role, created_at, image_url")
        .eq("feedback_id", item.feedbackId)
        .order("created_at", { ascending: true });

      setComments(data || []);
    };

    fetchComments();
  }, [item.feedbackId]);

  useEffect(() => {
    if (!commentImageFile) {
      setCommentImagePreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(commentImageFile);
    setCommentImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [commentImageFile]);

  const uploadCommentImage = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `feedback-comments/${item.feedbackId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(FEEDBACK_COMMENT_BUCKET)
      .upload(filePath, file, {
        upsert: false,
      });

    if (uploadError) {
      console.error("댓글 이미지 업로드 실패", uploadError);
      throw new Error("댓글 이미지 업로드에 실패했습니다.");
    }

    const { data } = supabase.storage
      .from(FEEDBACK_COMMENT_BUCKET)
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!user || !item.feedbackId) return;

    const trimmedText = commentText.trim();
    const hasContent = Boolean(trimmedText || commentImageFile);

    if (!hasContent) return;

    setSending(true);

    let imageUrl: string | null = null;

    if (commentImageFile) {
      try {
        imageUrl = await uploadCommentImage(commentImageFile);
      } catch (uploadError) {
        console.error("댓글 이미지 업로드 오류", uploadError);
      }
    }

    const { error } = await supabase.from("feedback_comments").insert({
      feedback_id: item.feedbackId,
      author_id: user.id,
      author_role: "student",
      content: trimmedText,
      image_url: imageUrl,
    });

    setSending(false);

    if (!error) {
      setCommentText("");
      setCommentImageFile(null);

      const { data } = await supabase
        .from("feedback_comments")
        .select("id, content, author_role, created_at, image_url")
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
              c.author_role === "admin"
                ? "bg-[#fff7cc] border-l-4 border-[#ffd331]"
                : "bg-gray-100"
            }`}
          >
            {c.content}
            {c.image_url && (
              <img
                src={c.image_url}
                alt="댓글 이미지"
                className="mt-2 max-h-48 w-full rounded-lg object-cover"
              />
            )}
            <div className="text-[10px] text-gray-400 mt-1">
              {new Date(c.created_at).toLocaleString("ko-KR")}
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <div className="flex flex-1 flex-col gap-2">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="댓글을 입력하세요"
              rows={2}
              className="w-full border rounded-lg p-2 text-sm"
            />
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCommentImageFile(e.target.files?.[0] ?? null)}
                className="text-xs"
              />
              {commentImageFile && (
                <button
                  type="button"
                  onClick={() => setCommentImageFile(null)}
                  className="text-xs text-red-500"
                >
                  이미지 제거
                </button>
              )}
            </div>
            {commentImagePreview && (
              <img
                src={commentImagePreview}
                alt="업로드할 댓글 이미지 미리보기"
                className="max-h-40 w-full rounded-lg object-cover"
              />
            )}
          </div>
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
