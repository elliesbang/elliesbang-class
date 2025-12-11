import { useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

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

  const login = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      alert("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: trimmedPassword,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("role", activeRole);
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
