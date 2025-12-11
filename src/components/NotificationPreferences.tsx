import { useMemo, useState, useEffect } from "react";
import { sendUserNotification } from "@/lib/supabase/userNotifications";
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

const NotificationPreferences = ({ role, userId }: Props) => {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false); // 🔥 저장 여부 state 추가
  const [loading, setLoading] = useState(true); // 🔥 초기 로딩

  const options = useMemo(() => notificationOptions[role], [role]);

  // ------------------------------------------------------------------------
  // 🔥 1) 저장된 알림 불러오기: notification_settings 테이블 조회
  // ------------------------------------------------------------------------
  useEffect(() => {
    if (!userId) return;

    async function load() {
      setLoading(true);

      const { data, error } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (data && !error) {
        const initial: Record<string, boolean> = {};

        options.forEach((opt) => {
          initial[opt.key] = Boolean(data[opt.key]);
        });

        setSelected(initial);
        setSaved(true); // 기존 설정이 있으면 저장됨 상태
      }

      setLoading(false);
    }

    load();
  }, [userId, options]);

  // ------------------------------------------------------------------------
  // 🔥 2) 체크박스 선택 시 저장 상태 초기화
  // ------------------------------------------------------------------------
  const toggle = (key: string) => {
    setSelected((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      setSaved(false); // 변경이 있으면 "저장됨" → "저장 필요"
      return updated;
    });
  };

  // ------------------------------------------------------------------------
  // 🔥 3) 알림 설정 저장
  // ------------------------------------------------------------------------
  const submit = async () => {
    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      setSubmitting(true);

      const payload: Record<string, boolean | string> = {
        user_id: userId,
      };
      options.forEach((opt) => {
        payload[opt.key] = Boolean(selected[opt.key]);
      });

      // upsert로 저장
      await supabase.from("notification_settings").upsert(payload);

      setSaved(true);
      alert("알림 설정이 저장되었습니다.");
    } catch (error) {
      console.error("알림 설정 저장 실패", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------------------------------------------------------------
  // 🔥 4) UI 렌더링
  // ------------------------------------------------------------------------
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-[#f1f1f1] p-5 space-y-4">
      <div>
        <p className="text-lg font-semibold text-[#404040]">알림 설정</p>
        <p className="text-sm text-[#9ca3af] mt-1">
          로그인 후 받을 알림을 선택하면 종 알림에 추가돼요.
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

      {/* 🔥 저장됨 상태 표시 */}
      {saved ? (
        <div className="text-center text-green-600 font-medium">
          ✓ 저장되었습니다
        </div>
      ) : (
        <button
          type="button"
          onClick={submit}
          disabled={options.length === 0 || submitting}
          className="w-full bg-[#ffd331] text-[#404040] font-semibold py-3 rounded-xl disabled:opacity-60"
        >
          {submitting ? "등록 중..." : "알림 등록"}
        </button>
      )}
    </div>
  );
};

export default NotificationPreferences;