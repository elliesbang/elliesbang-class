export interface AssignmentFeedbackItem {
  assignmentId: number;
  displayId: number;
  feedbackUuid: string;
  sessionNo?: number | null;
  title?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  feedbackText: string;
  feedbackCreatedAt: string;
  instructorName: string;
}
