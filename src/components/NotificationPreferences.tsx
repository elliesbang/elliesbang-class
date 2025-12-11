import { useMemo, useState } from "react";
import { sendUserNotification } from "@/lib/supabase/userNotifications";

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

const NotificationPreferences = ({ role, userId }: Props) => {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const options = useMemo(() => notificationOptions[role], [role]);

  const toggle = (key: string) => {
    setSelected((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const submit = async () => {
    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    const choices = options.filter((option) => selected[option.key]);

    if (choices.length === 0) {
      alert("받고 싶은 알림을 선택해주세요.");
      return;
    }

    try {
      setSubmitting(true);
      await Promise.all(
        choices.map((option) =>
          sendUserNotification({
            user_id: userId,
            title: option.title,
            message: option.message,
          })
        )
      );
      alert("선택한 알림을 등록했어요.");
      setSelected({});
    } catch (error) {
      console.error("알림 등록 실패", error);
      alert("알림 등록 중 문제가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-[#f1f1f1] p-5 space-y-4">
      <div>
        <p className="text-lg font-semibold text-[#404040]">알림 설정</p>
        <p className="text-sm text-[#9ca3af] mt-1">
          로그인 후 받을 알림을 선택하면 종 알림에 추가돼요.
        </p>
      </div>

      {options.length === 0 ? (
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

      <button
        type="button"
        onClick={submit}
        disabled={options.length === 0 || submitting}
        className="w-full bg-[#ffd331] text-[#404040] font-semibold py-3 rounded-xl disabled:opacity-60"
      >
        {submitting ? "등록 중..." : "알림 등록"}
      </button>
    </div>
  );
};

export default NotificationPreferences;
