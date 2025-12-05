import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const StudentMy = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth/role");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>수강생 마이</h1>
      <p>수강생 전용 마이 페이지입니다.</p>

      <button onClick={handleLogout} style={{ marginTop: 20 }}>
        로그아웃
      </button>
    </div>
  );
};

export default StudentMy;
