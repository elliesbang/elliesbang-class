import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type ClassroomNotice = {
  id: number;
  classroom_id: number;
  title: string;
  content: string | null;
  created_at: string;
  is_important: boolean;
};

type NoticesTabProps = {
  classroomId: number;
};

const NoticesTab = ({ classroomId }: NoticesTabProps) => {
  const [notices, setNotices] = useState<ClassroomNotice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      if (!classroomId || Number.isNaN(classroomId)) {
        setNotices([]);
        setLoading(false);
        setError("유효한 강의실이 아닙니다.");
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("classroom_notices")
        .select("*")
        .eq("classroom_id", classroomId)
        .order("created_at", { ascending: false });

      if (supabaseError) {
        console.error("강의실 공지 불러오기 실패", supabaseError);
        setError("공지 불러오기에 실패했습니다. 다시 시도해주세요.");
        setNotices([]);
      } else {
        setNotices((data ?? []) as ClassroomNotice[]);
      }

      setLoading(false);
    };

    fetchNotices();
  }, [classroomId]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="rounded-2xl bg-white px-6 py-4 shadow-sm text-sm text-[#7a6f68]">
          공지를 불러오는 중입니다...
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-2xl bg-red-50 px-6 py-4 text-sm font-medium text-red-600">
          {error}
        </div>
      );
    }

    if (notices.length === 0) {
      return (
        <div className="rounded-2xl bg-white px-6 py-12 shadow-sm text-center text-sm text-[#7a6f68]">
          등록된 강의실 공지가 없습니다.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="rounded-2xl bg-white px-6 py-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[#404040]">
                  {notice.title}
                </p>
                {notice.is_important && (
                  <span className="rounded-full bg-[#FFD331]/20 px-3 py-1 text-xs font-semibold text-[#c17c00]">
                    중요
                  </span>
                )}
              </div>
              {notice.created_at && (
                <p className="text-xs text-gray-400">
                  {new Date(notice.created_at).toLocaleDateString("ko-KR")}
                </p>
              )}
            </div>

            {notice.content && (
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#5b5550]">
                {notice.content}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#fffdf6]">
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <h2 className="mb-3 text-lg font-bold text-[#404040]">강의실 공지</h2>
        {renderContent()}
      </div>
    </div>
  );
};

export default NoticesTab;
