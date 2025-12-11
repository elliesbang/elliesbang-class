import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  classroomId: number;
  classroomName?: string;
  onSuccess: () => void;
  onClose: () => void;
};

type CandidateTable = {
  table: string;
  codeField: string;
  classroomField: string;
};

const candidateTables: CandidateTable[] = [
  { table: "classroom_codes", codeField: "access_code", classroomField: "classroom_id" },
  { table: "classroom_access_codes", codeField: "access_code", classroomField: "classroom_id" },
  { table: "classroom", codeField: "access_code", classroomField: "id" },
  { table: "classes", codeField: "code", classroomField: "category" },
];

export default function ClassroomAccessCodeModal({
  classroomId,
  classroomName,
  onSuccess,
  onClose,
}: Props) {
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const verifyCode = async () => {
    setLoading(true);
    setError(null);

    for (const candidate of candidateTables) {
      const { data, error: supabaseError } = await supabase
        .from(candidate.table)
        .select("*")
        .eq(candidate.classroomField, classroomId)
        .eq(candidate.codeField, accessCode)
        .limit(1);

      if (supabaseError) {
        console.warn("접근 코드 확인 중 오류", supabaseError.message);
        continue;
      }

      if (data && data.length > 0) {
        onSuccess();
        setLoading(false);
        return;
      }
    }

    setError("코드가 일치하지 않습니다");
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-[#404040]">
          {classroomName ? `${classroomName} 입장 코드` : "강의실 입장 코드"}
        </h2>
        <p className="mt-1 text-sm text-[#7a6f68]">
          발급받은 수강 코드를 입력하세요.
        </p>

        <div className="mt-4">
          <label className="text-sm text-[#404040]">수강 코드</label>
          <input
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#FFD331] focus:outline-none"
            placeholder="예: ABC123"
          />
        </div>

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-[#7a6f68] hover:bg-gray-100"
          >
            취소
          </button>
          <button
            type="button"
            onClick={verifyCode}
            disabled={loading}
            className="rounded-lg bg-[#FFD331] px-4 py-2 text-sm font-semibold text-[#404040] shadow-sm hover:bg-[#ffcd24] disabled:opacity-70"
          >
            {loading ? "확인 중..." : "확인"}
          </button>
        </div>
      </div>
    </div>
  );
}
