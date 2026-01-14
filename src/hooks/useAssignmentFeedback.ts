import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AssignmentFeedbackItem } from "@/types/assignment";

type UseAssignmentFeedbackParams = {
  classroomId?: string | number;
  classId?: number;
  studentId?: string | null;
};

type AssignmentRecord = {
  id: number;
  session_no?: number | null;
  title?: string | null;
  image_url?: string | null;
  link_url?: string | null;
  classroom_id?: string | number | null;
  class_id?: number | null;
  student_id?: string | null;
  created_at?: string;
  profiles?: StudentProfile | null;
};

type AssignmentFeedbackRecord = {
  id: number;
  assignment_id: number;
  instructor_id: string;
  feedback_text: string;
  created_at: string;
};

type ProfileRecord = {
  id: string;
  name?: string | null;
};

type StudentProfile = {
  id?: string;
  full_name?: string | null;
  nickname?: string | null;
  username?: string | null;
};

export const useAssignmentFeedback = ({
  classroomId,
  classId,
  studentId,
}: UseAssignmentFeedbackParams) => {
  const [feedbackItems, setFeedbackItems] = useState<AssignmentFeedbackItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!studentId || !classroomId) {
        setFeedbackItems([]);
        setError("유효한 강의실 정보 또는 로그인 정보를 확인해주세요.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const assignmentQuery = supabase
        .from("assignments")
        .select(
          `id, session_no, title, image_url, link_url, classroom_id, class_id, student_id, created_at, profiles:student_id(id, full_name)`
        )
        .eq("classroom_id", classroomId)
        .eq("student_id", studentId)
        .order("session_no", { ascending: true })
        .order("created_at", { ascending: true });

      if (classId) {
        assignmentQuery.eq("class_id", classId);
      }

      const { data: assignments, error: assignmentsError } = await assignmentQuery;

      if (assignmentsError) {
        console.error("Failed to fetch assignments", assignmentsError);
        setError("과제 정보를 불러오는 중 오류가 발생했습니다.");
        setFeedbackItems([]);
        setLoading(false);
        return;
      }

      const assignmentList = (assignments as AssignmentRecord[]) || [];
      const assignmentIds = assignmentList.map((assignment) => assignment.id);

      if (assignmentIds.length === 0) {
        setFeedbackItems([]);
        setLoading(false);
        return;
      }

      const { data: feedbackData, error: feedbackError } = await supabase
        .from("assignments_feedback")
        .select("id, assignment_id, instructor_id, feedback_text, created_at")
        .in("assignment_id", assignmentIds)
        .order("created_at", { ascending: false });

      if (feedbackError) {
        console.error("Failed to fetch assignment feedback", feedbackError);
        setError("피드백을 불러오는 중 오류가 발생했습니다.");
        setFeedbackItems([]);
        setLoading(false);
        return;
      }

      const feedbackList = (feedbackData as AssignmentFeedbackRecord[]) || [];

      if (feedbackList.length === 0) {
        setFeedbackItems([]);
        setLoading(false);
        return;
      }

      const instructorIds = Array.from(
        new Set(feedbackList.map((feedback) => feedback.instructor_id).filter(Boolean))
      );

      let instructorMap = new Map<string, string>();

      if (instructorIds.length > 0) {
        const { data: instructors, error: instructorsError } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", instructorIds);

        if (instructorsError) {
          console.error("Failed to fetch instructor profiles", instructorsError);
        } else if (instructors) {
          (instructors as ProfileRecord[]).forEach((profile) => {
            const displayName = profile.name || "알 수 없는 강사";
            instructorMap.set(profile.id, displayName);
          });
        }
      }

      const assignmentMap = new Map<number, AssignmentRecord>();
      assignmentList.forEach((assignment) => {
        assignmentMap.set(assignment.id, assignment);
      });

      const items: AssignmentFeedbackItem[] = feedbackList
        .map((feedback) => {
          const assignment = assignmentMap.get(feedback.assignment_id);
          if (!assignment) return null;

          return {
            assignmentId: assignment.id,
            feedbackId: feedback.id,
            sessionNo: assignment.session_no ?? null,
            title: assignment.title ?? "제목 없는 과제",
            imageUrl: assignment.image_url ?? null,
            linkUrl: assignment.link_url ?? null,
            feedbackText: feedback.feedback_text,
            feedbackCreatedAt: feedback.created_at,
            instructorName:
              instructorMap.get(feedback.instructor_id) ??
              "알 수 없는 강사",
          } as AssignmentFeedbackItem;
        })
        .filter(Boolean) as AssignmentFeedbackItem[];

      items.sort(
        (a, b) =>
          new Date(b.feedbackCreatedAt).getTime() -
          new Date(a.feedbackCreatedAt).getTime()
      );

      setFeedbackItems(items);
      setLoading(false);
    };

    fetchFeedback();
  }, [classroomId, classId, studentId]);

  return { feedbackItems, loading, error };
};
