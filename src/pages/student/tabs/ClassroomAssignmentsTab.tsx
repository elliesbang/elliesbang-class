import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { supabase } from "@/lib/supabaseClient";

const ASSIGNMENT_BUCKET = "assignments";
const FALLBACK_SESSION_NO = "1";

const SESSION_COUNT_BY_CLASSROOM: Record<string, number> = {
  candyma: 10,
  캔디마: 10,
  earl_challenge: 10,
  "이얼챌": 10,
  michina: 45,
  미치나: 45,
  "중캘업": 8,
  "캔디업": 8,
  "캔굿즈": 4,
  "캘굿즈": 4,
};

type AssignmentProfile = {
  id?: string;
  full_name?: string | null;
  nickname?: string | null;
  username?: string | null;
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
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deadlines, setDeadlines] = useState<SessionDeadline[]>([]);
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);

  // classroomId 가 숫자로 들어와도 문자열로 통일해서 사용
  const classroomKey = useMemo(
    () => String(classroomId ?? ""),
    [classroomId]
  );
  const normalizedClassroomId = useMemo(
    () => classroomKey.toLowerCase(),
    [classroomKey]
  );

  const sessionCount = useMemo(() => {
    if (!normalizedClassroomId) return undefined;
    return (
      SESSION_COUNT_BY_CLASSROOM[normalizedClassroomId] ??
      SESSION_COUNT_BY_CLASSROOM[classroomKey] ??
      undefined
    );
  }, [classroomKey, normalizedClassroomId]);

  const hasSessionSelection = Boolean(sessionCount);
  const totalSessions = sessionCount ?? 1;

  // 회차 드롭다운 초기값
  useEffect(() => {
    if (hasSessionSelection && sessionCount) {
      setSelectedSessionNo("1");
    } else {
      setSelectedSessionNo(null);
    }
  }, [hasSessionSelection, sessionCount, classroomKey]);

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

    let query = supabase
      .from("assignments")
      .select(
        "id, classroom_id, class_id, student_id, session_no, image_url, link_url, created_at, title, profiles(id, full_name, nickname, username)"
      )
      .eq("classroom_id", classroomKey)
      .order("created_at", { ascending: false });

    if (selectedSessionNo) {
      query = query.eq("session_no", selectedSessionNo);
    }

    const { data, error: supabaseError } = await query;

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
  }, [classroomKey, selectedSessionNo]);

  // 이미지 업로드
  const uploadImage = async (file: File, sessionNo: string) => {
    const fileExt = file.name.split(".").pop();
    const filePath = `${classroomKey}/${user?.id ?? "guest"}/${sessionNo}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(ASSIGNMENT_BUCKET)
      .upload(filePath, file);

    if (uploadError) {
      console.error("이미지 업로드 실패", uploadError);
      throw new Error("이미지 업로드에 실패했습니다.");
    }

    const { data } = supabase.storage
      .from(ASSIGNMENT_BUCKET)
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const resetForm = () => {
    setTitle("");
    setLinkUrl("");
    setImageFile(null);
    setEditingId(null);
  };

  // 과제 제출/수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    const sessionNo = hasSessionSelection
      ? selectedSessionNo
      : FALLBACK_SESSION_NO;

    if (!sessionNo) {
      alert("회차를 선택해주세요.");
      return;
    }

    if (!linkUrl && !imageFile) {
      alert("이미지나 링크 중 하나 이상을 입력해주세요.");
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = "";

      if (imageFile) {
        imageUrl = await uploadImage(imageFile, sessionNo);
      }

      const payload = {
        classroom_id: classroomKey,
        class_id: classId,
        student_id: user.id,
        session_no: sessionNo,
        image_url: imageUrl || null,
        link_url: linkUrl || null,
        title: title || null,
      };

      if (editingId) {
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
    setImageFile(null);
    if (hasSessionSelection && assignment.session_no) {
      setSelectedSessionNo(assignment.session_no);
    }
  };

  // 현재 로그인 사용자의 과제만 추출
  const userAssignments = useMemo(
    () => assignments.filter((a) => String(a.student_id) === String(user?.id)),
    [assignments, user]
  );

  // 완주 회차 계산
  const completedSessions = useMemo(() => {
    const completed = new Set<string>();
    userAssignments.forEach((assignment) => {
      const sessionNo = assignment.session_no ?? FALLBACK_SESSION_NO;
      const deadline = deadlines.find((d) => d.session_no === sessionNo);

      if (deadline?.assignment_deadline) {
        const submittedAt = new Date(assignment.created_at);
        const deadlineDate = new Date(deadline.assignment_deadline);
        if (submittedAt <= deadlineDate) {
          completed.add(sessionNo);
        }
      } else if (!deadlines.length || totalSessions === 1) {
        completed.add(sessionNo);
      }
    });
    return completed;
  }, [deadlines, totalSessions, userAssignments]);

  const progressPercent = Math.min(
    100,
    Math.round((completedSessions.size / totalSessions) * 100)
  );

  const remainingSessions = Math.max(
    totalSessions - completedSessions.size,
    0
  );
  const canDownloadCertificate =
    remainingSessions === 0 && totalSessions > 0;

  // 수료증 다운로드
  const handleCertificateDownload = async () => {
    if (!user || !classId) return;
    setDownloadingCertificate(true);
    try {
      const params = new URLSearchParams({
        classId: String(classId),
        userId: String(user.id),
      });

      const url = `/functions/certificate?${params.toString()}`;
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `certificate-${classroomKey}.pdf`;
      anchor.rel = "noreferrer";
      anchor.target = "_blank";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } finally {
      setDownloadingCertificate(false);
    }
  };

  const renderAssignments = () => {
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

    if (assignments.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          아직 제출된 과제가 없어요.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {assignments.map((assignment) => {
          const authorName =
            assignment.profiles?.nickname ||
            assignment.profiles?.full_name ||
            assignment.profiles?.username ||
            assignment.student_id;

          return (
            <div
              key={assignment.id}
              className="rounded-xl bg_WHITE p-4 shadow-sm border border-[#f1f1f1]"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-[#404040]">
                    {assignment.title || "제목 없음"}
                  </p>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    {hasSessionSelection && (
                      <span className="rounded-full bg-[#FFF7D6] px-2 py-0.5 text-[11px] font-medium text-[#947200]">
                        {assignment.session_no
                          ? `${assignment.session_no}회차`
                          : "회차"}
                      </span>
                    )}
                    <span>작성자: {authorName}</span>
                    <span>
                      제출일:{" "}
                      {new Date(assignment.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {String(assignment.student_id) === String(user?.id) && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(assignment)}
                      className="rounded-full border px-3 py-1 text-xs font-medium text-[#404040] hover:bg-gray-50"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(assignment.id)}
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

  const sessionOptions = sessionCount
    ? Array.from({ length: sessionCount }, (_, idx) => String(idx + 1))
    : [];

  const disableSubmit =
    submitting ||
    (!linkUrl && !imageFile) ||
    (hasSessionSelection && !selectedSessionNo);

  return (
    <div className="bg-[#fffdf6]">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 space-y-4">
        {/* 완주 현황 */}
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
              완주 현황: {completedSessions.size} / {totalSessions} (
              {progressPercent}%)
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
                  {remainingSessions}회차 남았어요. 모든 회차를 제출하면
                  다운로드할 수 있어요.
                </span>
              )}
            </div>
          </div>
        </div>

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
                  onChange={(e) =>
                    setImageFile(e.target.files?.[0] ?? null)
                  }
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
          {renderAssignments()}
        </div>
      </div>
    </div>
  );
};

export default ClassroomAssignmentsTab;
