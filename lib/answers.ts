import { pool } from "./db";

export interface StudentAnswer {
  id: string;
  user_id: string;
  course_id: string;
  video_id: string;
  question: string;
  answer: string;
  is_correct: boolean | null;
  ai_feedback: string | null;
  created_at: Date;
}

export interface StudentAnswerWithUser extends StudentAnswer {
  user_name: string | null;
  user_email: string | null;
}

export async function saveStudentAnswer(data: {
  userId: string;
  courseId: string;
  videoId: string;
  question: string;
  answer: string;
  isCorrect: boolean | null;
  aiFeedback: string | null;
}) {
  await pool.query(
    `INSERT INTO student_answers (user_id, course_id, video_id, question, answer, is_correct, ai_feedback)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [data.userId, data.courseId, data.videoId, data.question, data.answer, data.isCorrect, data.aiFeedback]
  );
}

export async function getAllAnswers(): Promise<StudentAnswerWithUser[]> {
  const result = await pool.query<StudentAnswerWithUser>(
    `SELECT sa.*, u.name AS user_name, u.email AS user_email
     FROM student_answers sa
     JOIN users u ON sa.user_id = u.id
     ORDER BY sa.created_at DESC`
  );
  return result.rows;
}

export interface StudentEngagement {
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  total_answers: number;
  correct_count: number;
  incorrect_count: number;
  pending_count: number;
  pct_correct: number | null;
  last_activity: Date;
}

export async function getEngagementByStudent(): Promise<StudentEngagement[]> {
  const result = await pool.query<StudentEngagement>(
    `SELECT
       u.id AS user_id,
       u.name AS user_name,
       u.email AS user_email,
       COUNT(*)::int AS total_answers,
       SUM(CASE WHEN sa.is_correct = true  THEN 1 ELSE 0 END)::int AS correct_count,
       SUM(CASE WHEN sa.is_correct = false THEN 1 ELSE 0 END)::int AS incorrect_count,
       SUM(CASE WHEN sa.is_correct IS NULL THEN 1 ELSE 0 END)::int AS pending_count,
       ROUND(
         100.0 * SUM(CASE WHEN sa.is_correct = true THEN 1 ELSE 0 END)
                / NULLIF(SUM(CASE WHEN sa.is_correct IS NOT NULL THEN 1 ELSE 0 END), 0),
         1
       ) AS pct_correct,
       MAX(sa.created_at) AS last_activity
     FROM student_answers sa
     JOIN users u ON sa.user_id = u.id
     GROUP BY u.id, u.name, u.email
     ORDER BY total_answers DESC`
  );
  return result.rows;
}