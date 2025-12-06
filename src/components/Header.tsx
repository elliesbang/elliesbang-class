import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useLogout } from "../hooks/useLogout";
import { getUserNotifications } from "@/lib/supabase/userNotifications";
import { UserNotification } from "@/types/UserNotification";
import UserNotificationDropdown from "@/components/UserNotificationDropdown";  // ⭐ 추가

const Header = ({ onLoginClick }: { onLoginClick: () => void }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const logout = useLogout();
  const [list, setList] = useState<UserNotification[]>([]);
  const [openDropdown, setOpenDropdown] = useState(false); // ⭐ 추가

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

      <div className="flex items-center gap-4 relative"> {/* ⭐ Dropdown이 이 기준으로 위치함 */}
        {user && (
          <div className="relative">
            <button
              className="relative"
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown((prev) => !prev); // ⭐ 페이지 이동 제거 → 드롭다운 열기
              }}
              aria-label="사용자 알림"
              type="button"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              )}
            </button>

            {/* ⭐ 드롭다운 표시 */}
            {openDropdown && (
              <UserNotificationDropdown
                list={list}
                onClose={() => setOpenDropdown(false)}
                onRead={(id) => console.log("read", id)}
              />
            )}
          </div>
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
