export interface AssignmentFeedbackItem {
  feedbackId: number;
  assignmentId: number;
  sessionNo?: number | null;
  title?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  feedbackText: string;
  feedbackCreatedAt: string;
  instructorName: string;
}
