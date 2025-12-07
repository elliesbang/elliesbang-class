import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle, Loader2, MessageSquare, XCircle } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import AssignmentFeedbackModal, {
  AssignmentFeedbackRecord,
  AssignmentForFeedback,
} from "@/modals/AssignmentFeedbackModal";

type Classroom = {
  id: number;
  name: string;
  parent_id?: number | null;
};

type AssignmentRow = {
  id: number;
  classroom_id: string;
  student_id: string;
  session_no: string | null;
  image_url: string | null;
  link_url: string | null;
  created_at: string;
  title: string | null;
  profiles?: {
    name?: string | null;
  } | null;
};

type AssignmentWithMeta = {
  id: number;
  classroomId: string;
  classroomName: string;
  studentName: string;
  sessionNo: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  createdAt: string;
  title: string | null;
  feedback?: AssignmentFeedbackRecord;
};

const formatDate = (date: string) =>
  new Date(date).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function AssignmentList() {
  const { user } = useAuth();
  const instructorId = (user?.id as string | undefined) ?? null;

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [assignments, setAssignments] = useState<AssignmentWithMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [selectedSession, setSelectedSession] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<AssignmentWithMeta | null>(null);

  const classroomMap = useMemo(() => {
    const map = new Map<string, string>();
    const parentMap = new Map<number, string>();

    classrooms
      .filter((room) => !room.parent_id)
      .forEach((parent) => parentMap.set(parent.id, parent.name));

    classrooms
      .filter((room) => room.parent_id)
      .forEach((room) => {
        const parentName = room.parent_id
          ? parentMap.get(room.parent_id)
          : undefined;
        const fullName = parentName ? `${parentName} / ${room.name}` : room.name;
        map.set(String(room.id), fullName);
      });

    classrooms
      .filter((room) => !room.parent_id)
      .forEach((room) => {
        if (!map.has(String(room.id))) {
          map.set(String(room.id), room.name);
        }
      });

    return map;
  }, [classrooms]);

  const sessionOptions = useMemo(() => {
    const unique = new Set<string>();
    assignments.forEach((assignment) => {
      if (assignment.sessionNo) {
        unique.add(String(assignment.sessionNo));
      }
    });
    return Array.from(unique).sort((a, b) => Number(a) - Number(b));
  }, [assignments]);

  const filteredAssignments = useMemo(() => {
    if (!selectedSession) return assignments;
    return assignments.filter(
      (assignment) => String(assignment.sessionNo ?? "") === selectedSession
    );
  }, [assignments, selectedSession]);

  useEffect(() => {
    const fetchClassrooms = async () => {
      const { data, error: supabaseError } = await supabase
        .from("class_category")
        .select("id, name, parent_id")
        .order("order_num", { ascending: true });

      if (supabaseError) {
        console.error("강의실 목록 불러오기 실패", supabaseError);
        return;
      }

      setClassrooms((data as Classroom[]) || []);
    };

    fetchClassrooms();
  }, []);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);

    const query = supabase
      .from("assignments")
      .select(
        "id, classroom_id, student_id, session_no, image_url, link_url, created_at, title, profiles(name)"
      )
      .order("created_at", { ascending: false });

    if (selectedClassroom) {
      query.eq("classroom_id", selectedClassroom);
    }

    const { data, error: supabaseError } = await query;

    if (supabaseError) {
      console.error("과제 제출 불러오기 실패", supabaseError);
      setAssignments([]);
      setError("과제 제출 목록을 불러오는 중 오류가 발생했습니다.");
      setLoading(false);
      return;
    }

    const assignmentRows = (data as AssignmentRow[]) || [];
    const assignmentIds = assignmentRows.map((row) => row.id);

    let feedbackMap = new Map<number, AssignmentFeedbackRecord>();

    if (assignmentIds.length > 0) {
      const { data: feedbackData, error: feedbackError } = await supabase
        .from("assignments_feedback")
        .select("id, assignment_id, feedback_text, created_at, updated_at")
        .in("assignment_id", assignmentIds);

      if (feedbackError) {
        console.error("피드백 불러오기 실패", feedbackError);
      } else {
        (feedbackData as AssignmentFeedbackRecord[] | null)?.forEach(
          (feedback) => {
            feedbackMap.set(feedback.assignment_id, feedback);
          }
        );
      }
    }

    const mapped = assignmentRows.map<AssignmentWithMeta>((row) => ({
      id: row.id,
      classroomId: row.classroom_id,
      classroomName:
        classroomMap.get(String(row.classroom_id)) ?? `강의실 ${row.classroom_id}`,
      studentName: row.profiles?.name ?? String(row.student_id),
      sessionNo: row.session_no,
      imageUrl: row.image_url,
      linkUrl: row.link_url,
      createdAt: row.created_at,
      title: row.title,
      feedback: feedbackMap.get(row.id),
    }));

    setAssignments(mapped);
    setLoading(false);
  }, [classroomMap, selectedClassroom]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const openFeedbackModal = (assignment: AssignmentWithMeta) => {
    setSelectedAssignment(assignment);
    setModalOpen(true);
  };

  const handleFeedbackSaved = (feedback: AssignmentFeedbackRecord) => {
    setAssignments((prev) =>
      prev.map((item) =>
        item.id === feedback.assignment_id ? { ...item, feedback } : item
      )
    );
    setModalOpen(false);
  };

  const renderThumbnail = (assignment: AssignmentWithMeta) => {
    if (assignment.imageUrl) {
      return (
        <img
          src={assignment.imageUrl}
          alt={assignment.title ?? "과제 이미지"}
          className="h-16 w-16 rounded-lg object-cover border"
        />
      );
    }

    if (assignment.linkUrl) {
      return (
        <a
          href={assignment.linkUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-[#2563EB] underline"
        >
          제출 링크 열기
        </a>
      );
    }

    return <span className="text-xs text-gray-400">제출 미리보기 없음</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg md:text-2xl font-bold text-[#404040]">
          과제 제출 목록
        </h1>
        <p className="text-sm text-gray-500">
          제출된 과제를 확인하고 바로 피드백을 작성하세요.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">강의실 선택</label>
          <select
            className="w-full md:w-64 rounded-lg border px-3 py-2 bg-white"
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
          >
            <option value="">전체 강의실</option>
            {classrooms
              .filter((room) => room.parent_id)
              .map((room) => (
                <option key={room.id} value={room.id}>
                  {classroomMap.get(String(room.id)) ?? room.name}
                </option>
              ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">회차 선택</label>
          <select
            className="w-full md:w-48 rounded-lg border px-3 py-2 bg-white"
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
          >
            <option value="">전체 회차</option>
            {sessionOptions.map((session) => (
              <option key={session} value={session}>
                {session}회차
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          불러오는 중입니다...
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          표시할 과제 제출이 없습니다.
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-[#f9f7f2] text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">학생</th>
                    <th className="px-4 py-3">강의실</th>
                    <th className="px-4 py-3">회차</th>
                    <th className="px-4 py-3">제출물</th>
                    <th className="px-4 py-3">제출일</th>
                    <th className="px-4 py-3">피드백</th>
                    <th className="px-4 py-3 text-right">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredAssignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-[#fffaf3]">
                      <td className="px-4 py-3 text-[#404040]">
                        <div className="font-semibold">{assignment.studentName}</div>
                        <div className="text-xs text-gray-500">#{assignment.id}</div>
                      </td>
                      <td className="px-4 py-3 text-[#404040]">
                        {assignment.classroomName}
                      </td>
                      <td className="px-4 py-3 text-[#404040]">
                        {assignment.sessionNo ? `${assignment.sessionNo}회차` : "-"}
                      </td>
                      <td className="px-4 py-3">{renderThumbnail(assignment)}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(assignment.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {assignment.feedback ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                            <CheckCircle className="h-4 w-4" /> 작성됨
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                            <XCircle className="h-4 w-4" /> 미작성
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openFeedbackModal(assignment)}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#FFD331] px-3 py-2 text-xs font-semibold text-[#404040] shadow-sm hover:bg-[#ffcd24]"
                        >
                          <MessageSquare className="h-4 w-4" /> 피드백
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-3 md:hidden">
            {filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="rounded-xl border bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#404040]">
                      {assignment.studentName}
                    </p>
                    <p className="text-xs text-gray-500">ID #{assignment.id}</p>
                  </div>
                  {assignment.feedback ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[11px] font-medium text-green-700">
                      <CheckCircle className="h-3 w-3" /> 작성됨
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700">
                      <XCircle className="h-3 w-3" /> 미작성
                    </span>
                  )}
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  <p>{assignment.classroomName}</p>
                  <p>
                    {assignment.sessionNo ? `${assignment.sessionNo}회차` : "회차 미정"}
                  </p>
                  <p>{formatDate(assignment.createdAt)}</p>
                </div>

                <div className="mt-3">{renderThumbnail(assignment)}</div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => openFeedbackModal(assignment)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#FFD331] px-3 py-2 text-xs font-semibold text-[#404040] shadow-sm hover:bg-[#ffcd24]"
                  >
                    <MessageSquare className="h-4 w-4" /> 피드백 작성
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <AssignmentFeedbackModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        assignment={selectedAssignment as AssignmentForFeedback | null}
        instructorId={instructorId}
        onSaved={handleFeedbackSaved}
      />
    </div>
  );
}
