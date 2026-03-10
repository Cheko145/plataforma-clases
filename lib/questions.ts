import { pool } from "./db";

export interface VideoQuestion {
  id: string;
  video_id: string;
  question: string;
  order_index: number;
  trigger_time: number; // segundos desde el inicio del video
  created_at: Date;
}

export async function getQuestionsByVideoId(videoId: string): Promise<VideoQuestion[]> {
  const result = await pool.query<VideoQuestion>(
    `SELECT * FROM video_questions WHERE video_id = $1 ORDER BY trigger_time ASC`,
    [videoId]
  );
  return result.rows;
}

export interface QuestionWithTime {
  question: string;
  trigger_time: number; // segundos
}

/** Reemplaza todas las preguntas de un video con las nuevas generadas por IA */
export async function saveVideoQuestions(videoId: string, questions: QuestionWithTime[]): Promise<void> {
  await pool.query(`DELETE FROM video_questions WHERE video_id = $1`, [videoId]);

  for (let i = 0; i < questions.length; i++) {
    await pool.query(
      `INSERT INTO video_questions (video_id, question, order_index, trigger_time) VALUES ($1, $2, $3, $4)`,
      [videoId, questions[i].question, i, questions[i].trigger_time]
    );
  }
}
