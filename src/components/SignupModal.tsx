import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Role = "student" | "vod";

const SignupModal = ({ open, onClose }) => {
  const [step, setStep] = useState<"role" | "form">("role");
  const [role, setRole] = useState<Role | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!open) return null;

  const selectRole = (r: Role) => {
    setRole(r);
    setStep("form");
  };

  const doSignup = async () => {
    if (!role) return;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, name },
      },
    });

    if (error) return alert(error.message);

    if (data.user) {
      localStorage.setItem("role", role);
      onClose();
    }
  };

  return (
    <div style={backdrop}>
      <div style={box}>
        <button style={closeBtn} onClick={onClose}>✕</button>

        {step === "role" && (
          <>
            <h3>가입 유형 선택</h3>
            <button onClick={() => selectRole("student")}>수강생</button>
            <button onClick={() => selectRole("vod")}>VOD</button>
          </>
        )}

        {step === "form" && (
          <>
            <h3>{role} 회원가입</h3>

            <input placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />

            <button onClick={doSignup}>회원가입</button>
            <button onClick={() => setStep("role")}>← 뒤로</button>
          </>
        )}
      </div>
    </div>
  );
};

export default SignupModal;

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const box = {
  width: 360,
  background: "#fff",
  borderRadius: 12,
  padding: "24px 20px",
  position: "relative",
};

const closeBtn = {
  position: "absolute",
  right: 12,
  top: 12,
  background: "none",
  border: "none",
  fontSize: 20,
  cursor: "pointer",
};
