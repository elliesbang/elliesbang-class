import { useEffect, useState } from "react";
import { Eye, MessageSquare, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AssignmentList() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [assignments, setAssignments] = useState([]);
  const [viewingAssignment, setViewingAssignment] = useState(null);

  // ------------------------------------------
  // 📌 강의실 목록 불러오기
  // ------------------------------------------
  useEffect(() => {
    setCategories([
      { id: 1, name: "캔디마 기초반" },
      { id: 2, name: "AI 일러스트 챌린지" },
      { id: 3, name: "굿즈 디자인 실전반" },
    ]);
  }, []);

  // ------------------------------------------
  // 📌 선택된 강의실의 과제 제출 목록 불러오기
  // ------------------------------------------
  useEffect(() => {
    if (!selectedCategory) return;

    async function loadAssignments() {
      // TODO: Supabase 연동 예정
      setAssignments([
        {
          id: 101,
          studentName: "김수지",
          title: "1주차 과제",
          submittedAt: "2025-02-10 14:23",
          type: "file",
          contentUrl: "https://example.com/file1.pdf",
          status: "pending",
        },
        {
          id: 102,
          studentName: "박민지",
          title: "1주차 과제",
          submittedAt: "2025-02-10 15:55",
          type: "text",
          text: "이번 주에는 캘리그라피 연습을…",
          status: "checked",
        },
      ]);
    }

    loadAssignments();
  }, [selectedCategory]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#404040] mb-6">
        과제 제출 목록
      </h1>

      {/* --------------------- 강의실 선택 --------------------- */}
      <div className="mb-6">
        <label className="text-sm font-medium text-[#404040]">
          강의실 선택
        </label>

        <select
          className="mt-1 w-full border rounded-lg px-3 py-2 bg-white"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">강의실을 선택하세요</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* --------------------- 제출된 과제 목록 --------------------- */}
      {selectedCategory && (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#404040] mb-4">
            제출 목록
          </h2>

          {assignments.length === 0 && (
            <p className="text-sm text-[#777]">제출된 과제가 없습니다.</p>
          )}

          <ul className="space-y-4">
            {assignments.map((a) => (
              <li
                key={a.id}
                className="border-b pb-4 flex justify-between items-center"
              >
                {/* 제출 정보 */}
                <div>
                  <p className="font-semibold text-[#404040] text-lg">
                    {a.studentName} — {a.title}
                  </p>
                  <p className="text-sm text-[#777]">{a.submittedAt}</p>

                  {/* 상태 표시 */}
                  {a.status === "pending" ? (
                    <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                      미확인
                    </span>
                  ) : (
                    <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-200 text-green-700 rounded flex items-center gap-1">
                      <CheckCircle size={12} /> 확인됨
                    </span>
                  )}
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-3">
                  {/* 보기 */}
                  <button
                    onClick={() => setViewingAssignment(a)}
                    className="text-gray-600 hover:text-black"
                  >
                    <Eye size={20} />
                  </button>

                  {/* 피드백 작성 페이지 이동 */}
                  <button
                    onClick={() =>
                      navigate(`/admin/feedback?assignmentId=${a.id}`)
                    }
                    className="text-gray-600 hover:text-black"
                  >
                    <MessageSquare size={20} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* --------------------- 과제 보기 모달 --------------------- */}
      {viewingAssignment && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl">
            <h2 className="text-xl font-semibold mb-4">
              {viewingAssignment.studentName} — {viewingAssignment.title}
            </h2>

            {/* 파일 or 텍스트 */}
            {viewingAssignment.type === "file" ? (
              <a
                href={viewingAssignment.contentUrl}
                target="_blank"
                className="text-blue-600 underline block mb-4"
              >
                파일 보기
              </a>
            ) : (
              <p className="text-[#404040] whitespace-pre-line mb-4">
                {viewingAssignment.text}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setViewingAssignment(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                닫기
              </button>

              <button
                onClick={() =>
                  navigate(`/admin/feedback?assignmentId=${viewingAssignment.id}`)
                }
                className="px-4 py-2 bg-[#f3efe4] text-[#404040] rounded-lg"
              >
                피드백 작성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}