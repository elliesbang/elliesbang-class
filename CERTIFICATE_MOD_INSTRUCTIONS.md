# 수료증 기능 수정/생성 지침

## 신규 서버 함수 생성 (환경 자동 감지)
- 프로젝트 환경에 따라 아래 중 **해당하는 경로에 신규 파일을 생성**하여 `certificate` 함수를 추가한다.
  - Cloudflare Pages Functions: `/functions/certificate.ts`
  - Cloudflare Functions(폴더형): `/functions/certificate/index.ts`
  - Supabase Edge Functions: `/supabase/functions/certificate/index.ts`
- 각 환경을 자동으로 감지하여 올바른 경로를 선택하고, 다른 경로는 생성하지 않는다.

### certificate 함수 공통 로직 지침
1. **필수 쿼리 파라미터 검증**
   - `classId`, `userId`, `classroomId` 3개가 모두 존재하는지 확인한다.
   - 하나라도 없으면 `400` 상태 코드와 오류 메시지를 반환한다.

2. **강의 시작일 조회**
   - `classes` 테이블에서 `id = classId` 조건으로 `start_date`만 조회한다.
   - 조회 실패 또는 데이터 없음 시 오류를 반환한다.

3. **마지막 과제 제출일 조회(수료일)**
   - `assignments` 테이블에서 `class_id = classId`, `student_id = userId` 조건을 만족하는 데이터 중 `created_at` 내림차순으로 1개 조회한다.
   - 조회 결과가 없으면 “수료증을 발급할 수 없습니다.”류의 오류를 반환한다.

4. **완주 여부 검사**
   - `sessionCount = SESSION_COUNT_BY_CLASSROOM[classroomId]` 값을 기준으로 한다.
   - 학생 제출물 중 `class_sessions.assignment_deadline`을 넘기지 않은 제출만 완주로 인정한다.
   - 완주한 회차 수가 `sessionCount`와 같을 때만 수료증을 발급하고, 그렇지 않으면 반드시 오류(`모든 회차를 완주해야 수료증을 발급할 수 있습니다.`)를 반환한다.

5. **PDF 생성 규칙**
   - **문구**
     - 타이틀: `수료증`
     - 본문: `모든 과제를 성실히 완료하여 본 수료증을 수여합니다.`
     - 기간: `기간: {강의 시작일} ~ {마지막 제출일}`
     - 발급일: `발급일: {마지막 제출일}`
     - 브랜드: `엘리의방`
   - **디자인**
     - 크기: `1080×1080px`
     - 배경색: 아이보리(`#f5eee9`)
     - 타이틀 색: 엘리의방 노랑(`#FFD331` 또는 `#fef568`)
     - 본문 색: 어두운 그레이(`#404040` 근접 계열)
     - 하단 브랜드명: 중앙 정렬, 노랑 컬러, 적절한 여백/라인 높이 적용
     - 텍스트는 `drawText` 등 실제 렌더 함수로 그려서 **PDF에 빈 내용이 생기지 않도록** 한다.
   - **빈 PDF 방지**
     - PDF 생성 후 **버퍼/바이너리 형태로 그대로 반환**하고, JSON 래핑이나 base64 인코딩을 하지 않는다.
     - 컨텐츠 렌더 완료 전에 저장/종료하지 않도록 주의한다.

6. **응답 헤더**
   - `Content-Type: application/pdf`
   - `Content-Disposition: attachment; filename="certificate-{classId}.pdf"`

7. **프론트엔드 연동 (src/pages/student/tabs/ClassroomAssignmentsTab.tsx)**
   - 수료증 다운로드 URL 생성 시 `classId`, `userId`, `classroomId` 3개 쿼리 파라미터를 빠짐없이 포함한다.
   - 기존 `<a>` 태그 다운로드 방식을 유지하되, 파라미터 누락 방지 로직을 추가한다.
   - 수료증 생성 요청 동안 로딩 상태를 UI에 표기하고, 오류 발생 시 안내 메시지를 노출한다.

## 자체 검증 체크리스트
- [ ] PDF를 열면 타이틀/본문/기간/발급일/브랜드명이 실제로 렌더링된다.
- [ ] 강의 시작일과 마지막 제출일이 올바르게 표시된다.
- [ ] 완주하지 않은 경우 PDF가 생성되지 않고 오류가 반환된다.
- [ ] 응답 헤더로 인해 브라우저에서 정상 다운로드가 트리거된다.
- [ ] ClassroomAssignmentsTab의 다운로드 버튼과 정상 연동된다.
