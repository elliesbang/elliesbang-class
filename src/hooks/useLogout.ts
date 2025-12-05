import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/auth/role", { replace: true });
  };

  return logout;
};
