import { pool } from "./db";

export interface VideoQuestion {
  id: string;
  video_id: string;
  question: string;
  order_index: number;
  created_at: Date;
}

export async function getQuestionsByVideoId(videoId: string): Promise<VideoQuestion[]> {
  const result = await pool.query<VideoQuestion>(
    `SELECT * FROM video_questions WHERE video_id = $1 ORDER BY order_index ASC`,
    [videoId]
  );
  return result.rows;
}

/** Reemplaza todas las preguntas de un video con las nuevas generadas por IA */
export async function saveVideoQuestions(videoId: string, questions: string[]): Promise<void> {
  await pool.query(`DELETE FROM video_questions WHERE video_id = $1`, [videoId]);

  for (let i = 0; i < questions.length; i++) {
    await pool.query(
      `INSERT INTO video_questions (video_id, question, order_index) VALUES ($1, $2, $3)`,
      [videoId, questions[i], i]
    );
  }
}
