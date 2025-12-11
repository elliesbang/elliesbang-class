import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Video,
  FileText,
  Bell,
  Users,
  BookOpen,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  FolderOpen,
} from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AdminSidebar({ isOpen, onClose }: Props) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const menuStyle =
    "flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#404040] hover:bg-[#f8f5e9] rounded-lg transition";
  const subMenuStyle =
    "flex items-center gap-2 pl-10 pr-4 py-2 text-sm text-[#5a554e] hover:bg-[#f3efe4] rounded-md transition";

  return (
    <aside
      className={`fixed inset-y-0 left-0 w-64 bg-[#fffdf6] px-4 py-6 border-r shadow-sm z-30 transform transition-transform duration-300 ease-in-out overflow-y-auto md:static md:translate-x-0 md:shadow-none ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* 상단 로고/타이틀 */}
      <div className="mb-6 px-2 flex items-center justify-between gap-2">
        <h1 className="text-lg font-bold text-[#404040] whitespace-nowrap">
          엘리의방 관리자
        </h1>
        <button
          type="button"
          className="md:hidden p-2 rounded-lg hover:bg-[#f3efe4]"
          onClick={onClose}
          aria-label="사이드바 닫기"
        >
          ✕
        </button>
      </div>

      {/* 메뉴 리스트 */}
      <nav className="flex flex-col gap-1">

        {/* 대시보드 홈 */}
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `${menuStyle} ${isActive ? "bg-[#f3efe4]" : ""}`
          }
        >
          <LayoutDashboard size={18} />
          대시보드 홈
        </NavLink>

        {/* ----------------------- */}
        {/* 강의실 관리 */}
        {/* ----------------------- */}
        <button
          className={`${menuStyle} justify-between`}
          onClick={() => toggleMenu("classroom")}
        >
          <span className="flex items-center gap-2">
            <FolderOpen size={18} />
            강의실 관리
          </span>
          {openMenu === "classroom" ? (
            <ChevronDown size={18} />
          ) : (
            <ChevronRight size={18} />
          )}
        </button>

        {openMenu === "classroom" && (
          <div className="flex flex-col">
            <NavLink
              to="/admin/classroom/videos"
              className={({ isActive }) =>
                `${subMenuStyle} ${isActive ? "bg-[#f3efe4]" : ""}`
              }
            >
              <Video size={16} />
              강의실 영상
            </NavLink>

            <NavLink
              to="/admin/classroom/materials"
              className={({ isActive }) =>
                `${subMenuStyle} ${isActive ? "bg-[#f3efe4]" : ""}`
              }
            >
              <FileText size={16} />
              강의실 자료
            </NavLink>

            <NavLink
              to="/admin/classroom/notices"
              className={({ isActive }) =>
                `${subMenuStyle} ${isActive ? "bg-[#f3efe4]" : ""}`
              }
            >
              <Bell size={16} />
              강의실 공지
            </NavLink>
          </div>
        )}

        {/* ----------------------- */}
        {/* 과제 · 피드백 관리 */}
        {/* ----------------------- */}
        <button
          className={`${menuStyle} justify-between`}
          onClick={() => toggleMenu("assignments")}
        >
          <span className="flex items-center gap-2">
            <GraduationCap size={18} />
            과제 · 피드백 관리
          </span>
          {openMenu === "assignments" ? (
            <ChevronDown size={18} />
          ) : (
            <ChevronRight size={18} />
          )}
        </button>

        {openMenu === "assignments" && (
          <div className="flex flex-col">
            <NavLink
              to="/admin/assignments"
              className={({ isActive }) =>
                `${subMenuStyle} ${isActive ? "bg-[#f3efe4]" : ""}`
              }
            >
              <FileText size={16} />
              과제 제출 목록
            </NavLink>
          </div>
        )}

        {/* ----------------------- */}
        {/* 전체 공지 */}
        {/* ----------------------- */}
        <NavLink
          to="/admin/notices"
          className={({ isActive }) =>
            `${menuStyle} ${isActive ? "bg-[#f3efe4]" : ""}`
          }
        >
          <Bell size={18} />
          전체 공지 관리
        </NavLink>

        <NavLink
          to="/admin/vod"
          className={({ isActive }) =>
            `${menuStyle} ${isActive ? "bg-[#f3efe4]" : ""}`
          }
        >
          <Video size={18} />
          VOD 관리
        </NavLink>

        {/* ----------------------- */}
        {/* 사용자 관리 */}
        {/* ----------------------- */}
        <button
          className={`${menuStyle} justify-between`}
          onClick={() => toggleMenu("users")}
        >
          <span className="flex items-center gap-2">
            <Users size={18} />
            사용자 관리
          </span>
          {openMenu === "users" ? (
            <ChevronDown size={18} />
          ) : (
            <ChevronRight size={18} />
          )}
        </button>

        {openMenu === "users" && (
          <div className="flex flex-col">
            <NavLink
              to="/admin/users/students"
              className={({ isActive }) =>
                `${subMenuStyle} ${isActive ? "bg-[#f3efe4]" : ""}`
              }
            >
              <Users size={16} />
              수강생 관리
            </NavLink>

            <NavLink
              to="/admin/users/vod"
              className={({ isActive }) =>
                `${subMenuStyle} ${isActive ? "bg-[#f3efe4]" : ""}`
              }
            >
              <Users size={16} />
              VOD 사용자 관리
            </NavLink>
          </div>
        )}

        {/* ----------------------- */}
        {/* 수업 관리 */}
        {/* ----------------------- */}
        <NavLink
          to="/admin/classes"
          className={({ isActive }) =>
            `${menuStyle} ${isActive ? "bg-[#f3efe4]" : ""}`
          }
        >
          <BookOpen size={18} />
          수업 관리
        </NavLink>
      </nav>
    </aside>
  );
}
