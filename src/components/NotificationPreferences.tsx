import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Role = "admin" | "student" | "vod";

type NotificationOption = {
  key: string;
  label: string;
  title: string;
  message: string;
};

const notificationOptions: Record<Role, NotificationOption[]> = {
  admin: [
    {
      key: "assignmentSubmission",
      label: "학생 과제 제출 알림",
      title: "학생 과제 제출 알림",
      message: "학생들이 과제를 제출하면 알려드릴게요.",
    },
    {
      key: "memberSignups",
      label: "회원가입/로그인 알림",
      title: "회원가입 및 로그인 알림",
      message: "새로운 회원가입과 로그인 소식을 알려드려요.",
    },
  ],
  student: [
    {
      key: "feedback",
      label: "피드백 알림",
      title: "피드백 알림",
      message: "내 과제에 새로운 피드백이 등록되면 알려드릴게요.",
    },
    {
      key: "classroomAssignments",
      label: "같은 강의실 학생들 과제 알림",
      title: "강의실 과제 알림",
      message: "같은 강의실 학생들의 과제 소식을 전달해드릴게요.",
    },
  ],
  vod: [],
};

type Props = {
  role: Role;
  userId?: string;
};

/**
 * DB 컬럼 ↔ UI key 매핑
 * 테이블: user_notification_settings
 */
const keyToColumn: Record<string, string> = {
  assignmentSubmission: "assignment_submission",
  memberSignups: "member_signups",
  feedback: "feedback",
  classroomAssignments: "classroom_assignments",
};

const NotificationPreferences = ({ role, userId }: Props) => {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const options = useMemo(() => notificationOptions[role], [role]);

  // 🔥 1) 유저 노티피케이션 설정 불러오기
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("user_notification_settings")
        .select(
          "assignment_submission, member_signups, feedback, classroom_assignments"
        )
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("load user_notification_settings error:", error);
        setLoading(false);
        return;
      }

      if (data) {
        const initial: Record<string, boolean> = {};
        Object.entries(keyToColumn).forEach(([key, column]) => {
          initial[key] = Boolean((data as any)[column]);
        });
        setSelected(initial);
        setSaved(true);
      }

      setLoading(false);
    };

    load();
  }, [userId]);

  // 체크박스 토글 시 "저장 필요" 상태로
  const toggle = (key: string) => {
    setSelected((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      setSaved(false);
      return updated;
    });
  };

  // 🔥 2) 설정 저장 (유저노티피케이션 세팅 upsert)
  const submit = async () => {
    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      setSubmitting(true);

      const payload: Record<string, any> = {
        user_id: userId,
      };

      // 모든 key → 컬럼으로 변환해서 payload에 넣기
      Object.entries(keyToColumn).forEach(([key, column]) => {
        payload[column] = Boolean(selected[key]);
      });

      const { error } = await supabase
        .from("user_notification_settings")
        .upsert(payload, { onConflict: "user_id" });

      if (error) {
        console.error("save user_notification_settings error:", error);
        alert("알림 설정 저장 중 문제가 발생했습니다.");
        return;
      }

      setSaved(true);
      alert("알림 설정이 저장되었습니다.");
    } catch (err) {
      console.error("알림 설정 저장 실패:", err);
      alert("알림 설정 저장 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-[#f1f1f1] p-5 space-y-4">
      <div>
        <p className="text-lg font-semibold text-[#404040]">알림 설정</p>
        <p className="text-sm text-[#9ca3af] mt-1">
          로그인 후 받을 유저 노티피케이션을 선택하면 종 알림에 추가돼요.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-[#9ca3af]">불러오는 중...</p>
      ) : options.length === 0 ? (
        <p className="text-sm text-[#9ca3af]">선택 가능한 알림이 없어요.</p>
      ) : (
        <div className="space-y-3">
          {options.map((option) => (
            <label
              key={option.key}
              className="flex items-center gap-3 text-sm text-[#404040]"
            >
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={Boolean(selected[option.key])}
                onChange={() => toggle(option.key)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      )}

      {options.length > 0 && !loading && (
        <>
          {saved ? (
            <div className="text-center text-green-600 font-medium">
              ✓ 유저 노티피케이션 설정이 저장되었습니다
            </div>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="w-full bg-[#ffd331] text-[#404040] font-semibold py-3 rounded-xl disabled:opacity-60"
            >
              {submitting ? "등록 중..." : "알림 등록"}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationPreferences;