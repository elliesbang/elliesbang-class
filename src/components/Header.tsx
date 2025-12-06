import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useLogout } from "../hooks/useLogout";
import { getUserNotifications } from "@/lib/supabase/userNotifications";
import { UserNotification } from "@/types/UserNotification";

const Header = ({ onLoginClick }: { onLoginClick: () => void }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const logout = useLogout();
  const [list, setList] = useState<UserNotification[]>([]);

  useEffect(() => {
    if (!user) {
      setList([]);
      return;
    }

    void loadNotifications(user.id);
  }, [user]);

  async function loadNotifications(userId: string) {
    try {
      const data = await getUserNotifications(userId);
      setList(data);
    } catch (error) {
      console.error("Failed to load user notifications", error);
    }
  }

  const unreadCount = list.filter((n) => !n.is_read).length;

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-white z-20 flex items-center justify-between px-4 border-b">
      <h1
        className="text-lg font-semibold cursor-pointer"
        onClick={() => navigate("/")}
      >
        엘리의방 클래스
      </h1>

      <div className="flex items-center gap-4 relative">
        {user && (
          <button
            className="relative"
            onClick={(e) => {
              e.stopPropagation();
              navigate("/user-notifications");
            }}
            aria-label="사용자 알림"
            type="button"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            )}
          </button>
        )}

        {!user ? (
          <button
            onClick={onLoginClick}
            className="text-sm font-medium bg-[#ffd331] px-3 py-2 rounded-lg"
            type="button"
          >
            로그인
          </button>
        ) : (
          <button
            onClick={logout}
            className="text-sm font-medium bg-[#ffd331] px-3 py-2 rounded-lg"
            type="button"
          >
            로그아웃
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
