import { createClient } from "@supabase/supabase-js";

const SESSION_COUNT_BY_CLASSROOM: Record<string, number> = {
  candyma: 10,
  "캔디마": 10,
  earl_challenge: 10,
  "이얼챌": 10,
  michina: 45,
  "미치나": 45,
  "중캘업": 8,
  "캔디업": 8,
  "캔굿즈": 4,
  "캘굿즈": 4,
};

const FALLBACK_SESSION_NO = "1";

const hexToRgb = (hex: string): [number, number, number] => {
  const cleaned = hex.replace("#", "");
  const bigint = parseInt(cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r / 255, g / 255, b / 255];
};

const escapePdfText = (text: string) =>
  text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const formatDate = (value: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createPdfBuffer = (options: {
  title: string;
  body: string;
  period: string;
  issuedAt: string;
  brand: string;
}) => {
  const width = 1080;
  const height = 1080;
  const ivory = hexToRgb("#f5eee9");
  const yellow = hexToRgb("#FFD331");
  const gray = hexToRgb("#404040");

  const streamParts: string[] = [];

  const drawText = (
    text: string,
    x: number,
    y: number,
    options?: { size?: number; color?: [number, number, number] }
  ) => {
    const { size = 24, color = gray } = options || {};
    const escaped = escapePdfText(text);
    streamParts.push("BT");
    streamParts.push(`/F1 ${size} Tf`);
    streamParts.push(`${color[0]} ${color[1]} ${color[2]} rg`);
    streamParts.push(`1 0 0 1 ${x} ${y} Tm`);
    streamParts.push(`(${escaped}) Tj`);
    streamParts.push("ET");
  };

  // 배경
  streamParts.push("q");
  streamParts.push(`${ivory[0]} ${ivory[1]} ${ivory[2]} rg`);
  streamParts.push(`0 0 ${width} ${height} re`);
  streamParts.push("f");
  streamParts.push("Q");

  // 텍스트 렌더링
  drawText(options.title, 430, 860, { size: 64, color: yellow });
  drawText(options.body, 200, 740, { size: 28, color: gray });
  drawText(options.period, 200, 690, { size: 22, color: gray });
  drawText(options.issuedAt, 200, 650, { size: 22, color: gray });
  drawText(options.brand, 480, 180, { size: 28, color: yellow });

  const stream = streamParts.join("\n");
  const encoder = new TextEncoder();
  const streamBytes = encoder.encode(stream);

  const objects: string[] = [];
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  objects.push(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`
  );
  objects.push("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");
  objects.push(
    `5 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${stream}\nendstream\nendobj\n`
  );

  const header = "%PDF-1.4\n";
  const offsets: number[] = [0];
  let currentOffset = encoder.encode(header).length;
  objects.forEach((obj) => {
    offsets.push(currentOffset);
    currentOffset += encoder.encode(obj).length;
  });

  const xrefOffset = currentOffset;
  let xref = `xref\n0 ${objects.length + 1}\n`;
  xref += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    xref += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  });

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const pdfString = header + objects.join("") + xref + trailer;
  return encoder.encode(pdfString);
};

export async function onRequest({ request, env }: { request: Request; env: any }) {
  const url = new URL(request.url);
  const classId = url.searchParams.get("classId");
  const userId = url.searchParams.get("userId");
  const classroomId = url.searchParams.get("classroomId");

  if (!classId || !userId || !classroomId) {
    return new Response("필수 쿼리 파라미터가 누락되었습니다.", { status: 400 });
  }

  const normalizedClassroomId = classroomId.toLowerCase();
  const sessionCount =
    SESSION_COUNT_BY_CLASSROOM[normalizedClassroomId] ??
    SESSION_COUNT_BY_CLASSROOM[classroomId] ??
    1;

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  // 클래스 시작일 조회
  const { data: classData, error: classError } = await supabase
    .from("classes")
    .select("start_date")
    .eq("id", classId)
    .single();

  if (classError || !classData?.start_date) {
    return new Response("강의 정보를 불러오지 못했습니다.", { status: 400 });
  }

  // 제출물 조회
  const { data: assignments, error: assignmentsError } = await supabase
    .from("assignments")
    .select("session_no, created_at")
    .eq("class_id", classId)
    .eq("student_id", userId)
    .order("created_at", { ascending: false });

  if (assignmentsError) {
    return new Response("과제 정보를 불러오지 못했습니다.", { status: 400 });
  }

  if (!assignments || assignments.length === 0) {
    return new Response("수료증을 발급할 수 없습니다.", { status: 400 });
  }

  // 데드라인 조회
  const { data: deadlines, error: deadlinesError } = await supabase
    .from("class_sessions")
    .select("session_no, assignment_deadline")
    .eq("class_id", classId);

  if (deadlinesError) {
    return new Response("데드라인 정보를 불러오지 못했습니다.", { status: 400 });
  }

  const deadlineMap = new Map<string, string>();
  deadlines?.forEach((deadline) => {
    deadlineMap.set(String(deadline.session_no), deadline.assignment_deadline ?? "");
  });

  const completedSessions = new Set<string>();
  assignments.forEach((assignment) => {
    const sessionNo = assignment.session_no ?? FALLBACK_SESSION_NO;
    const deadlineValue = deadlineMap.get(String(sessionNo));
    if (!deadlineValue) return;

    const submittedAt = new Date(assignment.created_at);
    const deadlineDate = new Date(deadlineValue);

    if (!Number.isNaN(deadlineDate.getTime()) && submittedAt <= deadlineDate) {
      completedSessions.add(String(sessionNo));
    }
  });

  if (completedSessions.size < sessionCount) {
    return new Response("모든 회차를 완주해야 수료증을 발급할 수 있습니다.", {
      status: 400,
    });
  }

  const lastSubmission = assignments.reduce((latest, current) => {
    return new Date(current.created_at) > new Date(latest.created_at)
      ? current
      : latest;
  });

  const periodText = `기간: ${formatDate(classData.start_date)} ~ ${formatDate(
    lastSubmission.created_at
  )}`;
  const issuedText = `발급일: ${formatDate(lastSubmission.created_at)}`;

  const pdfBytes = createPdfBuffer({
    title: "수료증",
    body: "모든 과제를 성실히 완료하여 본 수료증을 수여합니다.",
    period: periodText,
    issuedAt: issuedText,
    brand: "엘리의방",
  });

  return new Response(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificate-${classId}.pdf"`,
    },
  });
}
