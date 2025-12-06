import { useEffect, useRef } from "react";
import { UserNotification } from "@/types/UserNotification";

export default function UserNotificationDropdown({
  list,
  onClose,
  onRead,
}: {
  list: UserNotification[];
  onClose: () => void;
  onRead: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 z-[9999] w-72 bg-white shadow-xl rounded-xl border p-3"
    >
      <h3 className="text-sm font-semibold mb-2">알림</h3>

      {list.length === 0 ? (
        <p className="text-xs text-gray-500">새로운 알림이 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {list.map((n) => (
            <li
              key={n.id}
              className={`cursor-pointer p-2 rounded-md ${
                n.is_read
                  ? "bg-white text-gray-700"
                  : "bg-yellow-50 font-semibold text-gray-900"
              }`}
              onClick={() => onRead(n.id)}
            >
              <p className="text-sm">{n.title}</p>
              {n.message && (
                <p className="text-xs text-gray-500">{n.message}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
