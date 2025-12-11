import { useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { sendUserNotification } from "@/lib/supabase/userNotifications";

const roles = [
  { key: "student", label: "수강생" },
  { key: "vod", label: "VOD" },
  { key: "admin", label: "관리자" },
];

type LoginModalProps = {
  role: "student" | "vod" | "admin" | null;
  onClose: () => void;
  onChangeMode: (mode: "login" | "signup") => void;
  onSelectRole: (role: "student" | "vod" | "admin") => void;
};

const LoginModal = ({ role, onClose, onChangeMode, onSelectRole }: LoginModalProps) => {
  const activeRole = useMemo(() => role ?? "student", [role]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notificationChoices, setNotificationChoices] = useState<
    Record<string, Record<string, boolean>>
  >({
    admin: {
      assignmentSubmission: false,
      memberSignups: false,
    },
    student: {
      feedback: false,
      classroomAssignments: false,
    },
    vod: {},
  });

  const notificationOptions: Record<
    "admin" | "student" | "vod",
    { key: string; label: string; title: string; message: string }[]
  > = {
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

  const toggleNotification = (key: string) => {
    setNotificationChoices((prev) => ({
      ...prev,
      [activeRole]: {
        ...(prev[activeRole] ?? {}),
        [key]: !prev[activeRole]?.[key],
      },
    }));
  };

  const login = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("role", activeRole);
    }

    const userId = data.user?.id;

    if (userId) {
      const selectedOptions = Object.entries(notificationChoices[activeRole] ?? {})
        .filter(([, checked]) => checked)
        .map(([key]) => key);

      if (selectedOptions.length > 0) {
        const options = notificationOptions[activeRole];
        const payloads = options.filter((o) => selectedOptions.includes(o.key));

        await Promise.all(
          payloads.map((option) =>
            sendUserNotification({
              user_id: userId,
              title: option.title,
              message: option.message,
            })
          )
        ).catch((err) => console.error("Failed to save notification preferences", err));
      }
    }

    if (activeRole === "admin") window.location.href = "/admin/my";
    else if (activeRole === "student") window.location.href = "/student/my";
    else window.location.href = "/vod/my";
  };

  const googleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          width: 380,
          padding: 24,
          borderRadius: 14,
          position: "relative",
        }}
      >
        {/* X 버튼 */}
        <div
          onClick={() => onClose()}
          style={{
            position: "absolute",
            right: 16,
            top: 16,
            cursor: "pointer",
            fontSize: 20,
          }}
        >
          ×
        </div>

        {/* 역할 선택 탭 */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 20,
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          {roles.map((r) => (
            <div
              key={r.key}
              onClick={() => onSelectRole(r.key)}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                cursor: "pointer",
                background: activeRole === r.key ? "#ffd331" : "#f1f1f1",
                color: activeRole === r.key ? "#000" : "#777",
              }}
            >
              {r.label}
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: 20, marginBottom: 20, fontWeight: 700 }}>
          {activeRole} 로그인
        </h3>

        {/* 이메일 */}
        <input
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            marginBottom: 10,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ddd",
          }}
        />

        {/* 비밀번호 */}
        <input
          placeholder="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            marginBottom: 16,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ddd",
          }}
        />

        {/* 알림 선택 */}
        <div
          style={{
            marginTop: 8,
            marginBottom: 16,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #eee",
            background: "#fffaf1",
          }}
        >
          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
            로그인 시 받을 알림
          </p>
          {notificationOptions[activeRole].length === 0 ? (
            <p style={{ fontSize: 13, color: "#7a7a7a" }}>
              선택 가능한 알림이 없습니다.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {notificationOptions[activeRole].map((option) => (
                <label
                  key={option.key}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(notificationChoices[activeRole]?.[option.key])}
                    onChange={() => toggleNotification(option.key)}
                  />
                  <span style={{ fontSize: 14 }}>{option.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 로그인 버튼 */}
        <button
          onClick={login}
          style={{
            width: "100%",
            padding: 12,
            background: "#ffd331",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          로그인
        </button>

        {/* 구글 로그인 */}
        <button
          onClick={googleLogin}
          style={{
            width: "100%",
            padding: 12,
            background: "#e6e6e6",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          구글 로그인
        </button>

        {/* 회원가입 */}
        {activeRole !== "admin" && (
          <div
            onClick={() => onChangeMode("signup")}
            style={{
              marginTop: 16,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            회원가입
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
