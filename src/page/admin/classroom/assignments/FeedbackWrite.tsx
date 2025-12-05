import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function FeedbackWrite() {
  const navigate = useNavigate();
  const location = useLocation();

  // URL에서 assignmentId 추출
  const assignmentId = new URLSearchParams(location.search).get("assignmentId");

  const [assignment, setAssignment] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState("");

  // -------------------------------------
  // 📌 과제 상세 정보 불러오기
  // -------------------------------------
  useEffect(() => {
    if (!assignmentId) return;

    async function loadAssignment() {
      // TODO: Supabase 실제 데이터로 교체
      // 예시 데이터
      setAssignment({
        id: assignmentId,
        studentName: "김수지",
        title: "1주차 과제",
        type: "image",
        imageUrl: "https://via.placeholder.com/600x400.png",
        submittedAt: "2025-02-10 14:23",
        text: "텍스트 제출 내용 예시...",
        contentUrl: "https://example.com/file.pdf",
      });

      // TODO: 기존 피드백 불러오기
      // setFeedback("기존 피드백 내용");
      // setScore("95");
    }

    loadAssignment();
  }, [assignmentId]);

  // -------------------------------------
  // 📌 피드백 저장
  // -------------------------------------
  const handleSave = async () => {
    if (!feedback.trim()) return alert("피드백 내용을 입력해주세요.");

    // TODO: Supabase insert/update
    console.log("저장된 피드백:", {
      assignmentId,
      feedback,
      score,
    });

    alert("피드백이 저장되었습니다.");
    navigate("/admin/assignments");
  };

  if (!assignment) {
    return <p className="text-center mt-10 text-[#777]">과제 정보를 불러오는 중…</p>;
  }

  // -------------------------------------
  // 📌 제출 타입별 콘텐츠 렌더링
  // -------------------------------------
  const renderSubmittedContent = () => {
    if (assignment.type === "image") {
      return (
        <img
          src={assignment.imageUrl}
          alt="submitted"
          className="w-full rounded-lg border mb-4"
        />
      );
    }

    if (assignment.type === "text") {
      return (
        <p className="whitespace-pre-line text-[#404040] bg-gray-50 p-4 rounded-lg border mb-4">
          {assignment.text}
        </p>
      );
    }

    if (assignment.type === "file") {
      return (
        <a
          href={assignment.contentUrl}
          target="_blank"
          className="text-blue-600 underline block mb-4"
        >
          제출 파일 열기
        </a>
      );
    }

    return null;
  };

  return (
    <div>
      {/* 상단 뒤로가기 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-[#404040]"
      >
        <ArrowLeft size={20} />
        뒤로가기
      </button>

      <h1 className="text-2xl font-bold text-[#404040] mb-6">
        피드백 작성
      </h1>

      {/* ---------------- 과제 제출 정보 ---------------- */}
      <div className="border bg-white rounded-xl p-5 shadow-sm mb-6">
        <p className="text-lg font-semibold text-[#404040] mb-1">
          {assignment.studentName} — {assignment.title}
        </p>
        <p className="text-sm text-[#777] mb-4">{assignment.submittedAt}</p>

        {renderSubmittedContent()}
      </div>

      {/* ---------------- 피드백 입력 ---------------- */}
      <div className="border bg-white rounded-xl p-5 shadow-sm">
        <label className="block text-sm font-medium text-[#404040] mb-2">
          피드백 내용
        </label>

        <textarea
          rows={6}
          className="w-full border rounded-lg px-3 py-2 mb-4"
          placeholder="학생에게 전달할 피드백을 작성하세요"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />

        <label className="block text-sm font-medium text-[#404040] mb-2">
          점수(선택)
        </label>

        <input
          type="number"
          className="w-full border rounded-lg px-3 py-2 mb-4"
          placeholder="예: 95"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />

        <button
          onClick={handleSave}
          className="w-full bg-[#f3efe4] text-[#404040] py-3 rounded-lg font-medium"
        >
          피드백 저장
        </button>
      </div>
    </div>
  );
}