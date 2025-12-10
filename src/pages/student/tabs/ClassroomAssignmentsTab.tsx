import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { supabase } from "@/lib/supabaseClient";

const ASSIGNMENT_BUCKET = "assignments";
const FALLBACK_SESSION_NO = "1";

const SESSION_COUNT_BY_CLASSROOM: Record<string, number | undefined> = {
  "4": 10,
  "5": 8,
  "6": 12,
  "7": 8,
  "8": 4,
  "9": 4,
  "14": 45,
};

type AssignmentProfile = {
  id?: string;
  full_name?: string | null;
  name?: string | null;
};

type Assignment = {
  id: number;
  classroom_id: string;
  class_id: number | null;
  student_id: string | number;
  session_no: string | null;
  image_url: string | null;
  link_url: string | null;
  created_at: string;
  title: string | null;
  profiles?: AssignmentProfile | null;
};

type SessionDeadline = {
  class_id: number;
  session_no: string;
  assignment_deadline: string | null;
};

type ClassroomAssignmentsTabProps = {
  classroomId: string | number;
  classId: number;
};

const ClassroomAssignmentsTab = ({
  classroomId,
  classId,
}: ClassroomAssignmentsTabProps) => {
  const { user } = useAuth();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedSessionNo, setSelectedSessionNo] = useState<string | null>(
    null
  );
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [deadlines, setDeadlines] = useState<SessionDeadline[]>([]);
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);
  const [certificateError, setCertificateError] = useState<string | null>(null);

  const getProfileDisplayName = (profile?: AssignmentProfile | null) =>
    profile?.full_name || profile?.name || "이름 없음";

  // classroomId 를 문자열로 통일해서 사용
  const classroomKey = useMemo(
    () => String(classroomId ?? ""),
    [classroomId]
  );

  const sessionCount = useMemo(
    () => SESSION_COUNT_BY_CLASSROOM[classroomKey],
    [classroomKey]
  );

  const hasSessionSelection = useMemo(
    () => typeof sessionCount === "number" && sessionCount > 0,
    [sessionCount]
  );

  const totalSessions = hasSessionSelection ? sessionCount ?? 0 : 0;

  // 회차 드롭다운 초기값
  useEffect(() => {
    if (editingId !== null) return;
    setSelectedSessionNo(hasSessionSelection ? FALLBACK_SESSION_NO : null);
  }, [classroomKey, editingId, hasSessionSelection]);

  // 데드라인 불러오기
  useEffect(() => {
    const fetchDeadlines = async () => {
      if (!classId) {
        setDeadlines([]);
        return;
      }

      const { data, error: deadlineError } = await supabase
        .from("class_sessions")
        .select("class_id, session_no, assignment_deadline")
        .eq("class_id", classId);

      if (deadlineError) {
        console.error("데드라인 불러오기 실패", deadlineError);
        setDeadlines([]);
        return;
      }

      setDeadlines((data ?? []) as SessionDeadline[]);
    };

    fetchDeadlines();
  }, [classId]);

  // 과제 목록 불러오기
  const fetchAssignments = async () => {
    if (!classroomKey) return;

    setLoading(true);
    setError(null);

    const { data, error: supabaseError } = await supabase
      .from("assignments")
      .select(
        `id, classroom_id, class_id, student_id, session_no, image_url, link_url, created_at, title,
         profiles:student_id (id, full_name, name)`
      )
      .eq("classroom_id", classroomKey)
      .order("created_at", { ascending: false });

    if (supabaseError) {
      console.error("과제 불러오기 실패", supabaseError);
      setError("과제를 불러오는 중 오류가 발생했습니다.");
      setAssignments([]);
    } else {
      setAssignments((data ?? []) as Assignment[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomKey]);

  // 이미지 업로드
 const uploadImage = async (file: File) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;

  // 폴더 구조 단순화
  const filePath = `${classroomKey}/${user?.id}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(ASSIGNMENT_BUCKET)
    .upload(filePath, file, {
      upsert: false,
    });

  if (uploadError) {
    console.error("이미지 업로드 실패", uploadError);
    throw new Error("이미지 업로드에 실패했습니다.");
  }

  // Public URL 생성
  const { data } = supabase.storage
    .from(ASSIGNMENT_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
};

  const hasSubmissionContent = Boolean(linkUrl || imageFile || existingImageUrl);

  const resetForm = () => {
    setTitle("");
    setLinkUrl("");
    setImageFile(null);
    setExistingImageUrl(null);
    setEditingId(null);
    setSelectedSessionNo(hasSessionSelection ? FALLBACK_SESSION_NO : null);
  };

  // 과제 제출/수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

   // 🔥 session_no를 항상 문자열로 저장
const sessionNo = hasSessionSelection
  ? String(selectedSessionNo ?? FALLBACK_SESSION_NO)
  : selectedSessionNo ? String(selectedSessionNo) : null;


    if (!hasSubmissionContent) {
      alert("이미지나 링크 중 하나 이상을 입력해주세요.");
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = existingImageUrl ?? "";

      if (imageFile) {
        imageUrl = await uploadImage(imageFile, sessionNo);
      }

      const payload = {
        classroom_id: classroomKey,
        class_id: classId,
        student_id: user.id,
        session_no: sessionNo ? String(sessionNo) : null,
        image_url: imageUrl || null,
        link_url: linkUrl || null,
        title: title || null,
      };

      if (editingId !== null) {
        const { error: updateError } = await supabase
          .from("assignments")
          .update(payload)
          .eq("id", editingId)
          .eq("student_id", user.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        const { error: insertError } = await supabase
          .from("assignments")
          .insert([payload]);

        if (insertError) {
          throw insertError;
        }
      }

      await fetchAssignments();
      resetForm();
    } catch (err) {
      console.error("과제 제출 실패", err);
      alert("과제 제출에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  // 과제 삭제
  const handleDelete = async (assignmentId: number) => {
    if (!user) return;
    const confirmed = confirm("이 과제를 삭제하시겠습니까?");
    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("assignments")
      .delete()
      .eq("id", assignmentId)
      .eq("student_id", user.id);

    if (deleteError) {
      console.error("과제 삭제 실패", deleteError);
      alert("삭제에 실패했습니다. 다시 시도해주세요.");
      return;
    }

    fetchAssignments();
  };

  // 과제 수정 클릭
  const handleEdit = (assignment: Assignment) => {
    setEditingId(assignment.id);
    setTitle(assignment.title ?? "");
    setLinkUrl(assignment.link_url ?? "");
    setExistingImageUrl(assignment.image_url ?? null);
    setImageFile(null);
    setSelectedSessionNo(
      assignment.session_no ?? (hasSessionSelection ? FALLBACK_SESSION_NO : null)
    );
  };

  // 현재 로그인 사용자의 과제만 추출
  const userAssignments = useMemo(
    () => assignments.filter((a) => String(a.student_id) === String(user?.id)),
    [assignments, user]
  );

  const otherAssignments = useMemo(
    () => assignments.filter((a) => String(a.student_id) !== String(user?.id)),
    [assignments, user]
  );

  const deadlinesMap = useMemo(() => {
  const map = new Map<string, string>();
  deadlines.forEach((deadline) => {
    const key = String(deadline.session_no ?? "");
    map.set(key, deadline.assignment_deadline ?? "");
  });
  return map;
}, [deadlines]);

  // 완주 회차 계산
 const completedSessions = useMemo(() => {
  if (!hasSessionSelection) return new Set<string>();

  const completed = new Set<string>();

  userAssignments.forEach((assignment) => {
    const sessionNo = String(assignment.session_no ?? FALLBACK_SESSION_NO);

    const deadlineText = deadlinesMap.get(sessionNo);
    const submittedAt = new Date(assignment.created_at);

    // 🔥 데드라인 없음 → 제출한 순간 완주 인정
    if (!deadlineText) {
      completed.add(sessionNo);
      return;
    }

    const deadlineDate = new Date(deadlineText);

    // 🔥 데드라인 기준 완주 판정
    if (!Number.isNaN(deadlineDate.getTime()) && submittedAt <= deadlineDate) {
      completed.add(sessionNo);
    }
  });

  return completed;
}, [deadlinesMap, hasSessionSelection, userAssignments]);

  const progressPercent = useMemo(() => {
    if (!hasSessionSelection || totalSessions === 0) return 0;
    return Math.min(
      100,
      Math.round((completedSessions.size / totalSessions) * 100)
    );
  }, [completedSessions.size, hasSessionSelection, totalSessions]);

  const remainingSessions = useMemo(() => {
    if (!hasSessionSelection) return 0;
    return Math.max(totalSessions - completedSessions.size, 0);
  }, [completedSessions.size, hasSessionSelection, totalSessions]);

  const canDownloadCertificate =
    hasSessionSelection && remainingSessions === 0 && totalSessions > 0;

  // 수료증 다운로드
  const handleCertificateDownload = async () => {
    if (!user || !classId) return;
    setCertificateError(null);
    setDownloadingCertificate(true);
    try {
      const params = new URLSearchParams({
        classId: String(classId),
        userId: String(user.id),
        classroomId: classroomKey,
      });

      const url = `/functions/certificate?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        const message = await response.text();
        setCertificateError(message || "수료증 생성에 실패했습니다.");
        return;
      }

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `certificate-${classroomKey}.pdf`;
      anchor.rel = "noreferrer";
      anchor.target = "_blank";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } catch (err) {
      console.error("수료증 다운로드 실패", err);
      setCertificateError("수료증 생성 중 오류가 발생했습니다.");
    } finally {
      setDownloadingCertificate(false);
    }
  };

  const renderAssignments = (
    assignmentList: Assignment[],
    emptyMessage: string
  ) => {
    if (loading) {
      return (
        <div className="rounded-xl bg-white p-4 text-center text-sm text-gray-600 shadow-sm">
          과제를 불러오는 중입니다...
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-xl bg-red-50 p-4 text-center text-sm font-medium text-red-600">
          {error}
        </div>
      );
    }

    if (assignmentList.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {assignmentList.map((assignment) => {
          const authorName = getProfileDisplayName(assignment.profiles);
          const sessionLabel = assignment.session_no ?? FALLBACK_SESSION_NO;
          const submittedLabel = new Date(
            assignment.created_at
          ).toLocaleDateString();

          return (
            <div
              key={assignment.id}
              className="rounded-xl bg_WHITE p-4 shadow-sm border border-[#f1f1f1]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="rounded-full bg-[#FFF7D6] px-2 py-0.5 text-[11px] font-semibold text-[#947200]">
                      {sessionLabel}회차
                    </span>
                    <span className="text-[#7a6f68]">제출일 {submittedLabel}</span>
                  </div>
                  <p className="text-sm font-semibold text-[#404040]">
                    {assignment.title || "제목 없음"}
                  </p>
                  <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                    <span>작성자: {authorName}</span>
                    <span className="text-[#7a6f68]">
                      제출 시각{" "}
                      {new Date(assignment.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {String(assignment.student_id) === String(user?.id) && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleEdit(assignment);
                      }}
                      className="rounded-full border px-3 py-1 text-xs font-medium text-[#404040] hover:bg-gray-50"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(assignment.id);
                      }}
                      className="rounded-full border px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-col gap-2">
                {assignment.image_url && (
                  <img
                    src={assignment.image_url}
                    alt={assignment.title || "과제 이미지"}
                    className="max-h-60 w-full rounded-lg object-cover cursor-pointer"
                    onClick={() =>
                      window.open(assignment.image_url ?? "", "_blank")
                    }
                  />
                )}

                {assignment.link_url && (
                  <a
                    href={assignment.link_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-[#c17c00] hover:underline"
                  >
                    링크 열기
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const sessionOptions = useMemo(
    () =>
      hasSessionSelection
        ? Array.from({ length: totalSessions }, (_, idx) => String(idx + 1))
        : [],
    [hasSessionSelection, totalSessions]
  );

  const disableSubmit =
    submitting ||
    !hasSubmissionContent ||
    (hasSessionSelection && !selectedSessionNo);

  return (
    <div className="bg-[#fffdf6]">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 space-y-4">
        {hasSessionSelection && (
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold text-[#404040]">
                완주 현황
              </h2>
              <p className="text-xs text-[#7a6f68]">
                회차별 마감 시간 안에 제출된 과제로 완주 현황을 확인하세요.
              </p>
              <div className="w-full rounded-full bg-gray-200 h-3">
                <div
                  className="h-3 rounded-full bg-[#f3efe4] transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-[#404040]">
                완주 회차 {completedSessions.size} / 총 회차 {totalSessions} (
                {progressPercent}
                %)
              </p>
              <p className="text-xs text-[#7a6f68]">
                남은 회차 {remainingSessions}개
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!canDownloadCertificate || downloadingCertificate}
                  onClick={handleCertificateDownload}
                  className={`rounded-lg px-4 py-2 text-xs font-medium shadow-sm ${
                    canDownloadCertificate
                      ? "bg-[#FFD331] text-[#404040] hover:bg-[#ffcd24]"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {downloadingCertificate
                    ? "다운로드 준비 중..."
                    : "수료증 다운로드"}
                </button>
                {!canDownloadCertificate && (
                  <span className="text-xs text-[#7a6f68]">
                    {remainingSessions}회차가 더 필요해요. 회차별 마감 전에
                    모든 과제를 제출하면 수료증을 받을 수 있어요.
                  </span>
                )}
                {certificateError && (
                  <span className="text-xs text-red-500">
                    {certificateError}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 과제 제출 폼 */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3">
            {hasSessionSelection && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#404040]">
                  회차 선택
                </label>
                <select
                  value={selectedSessionNo ?? ""}
                  onChange={(e) => setSelectedSessionNo(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  {sessionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}회차
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#404040]">
                  제목 (선택)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="과제 제목을 입력하세요"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#404040]">
                  이미지 업로드
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#404040]">
                  링크 URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="노션, 블로그, 유튜브 등의 링크를 입력하세요"
                />
              </div>

              <p className="text-xs text-[#7a6f68]">
                이미지와 링크 중 하나만 등록해도 제출할 수 있어요.
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={disableSubmit}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    disableSubmit
                      ? "bg-gray-200 text-gray-500"
                      : "bg-[#FFD331] text-[#404040] hover:bg-[#ffcd24]"
                  }`}
                >
                  {submitting
                    ? "저장 중..."
                    : editingId
                    ? "수정하기"
                    : "제출하기"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border px-4 py-2 text-sm font-medium text-[#404040]"
                  >
                    취소
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* 제출된 과제 목록 */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-[#404040]">
            제출된 과제
          </h3>
          {renderAssignments(userAssignments, "아직 제출된 과제가 없어요.")}
        </div>

        <div className="space-y-2 mt-6">
          <h3 className="text-base font-semibold text-[#404040]">
            같은 강의실 친구들의 과제
          </h3>
          {renderAssignments(
            otherAssignments,
            "아직 제출한 친구가 없어요."
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassroomAssignmentsTab;
