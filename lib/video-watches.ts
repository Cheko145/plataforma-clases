import { pool } from "./db";

export async function markVideoWatched(userId: string, courseId: string): Promise<void> {
  await pool.query(
    `INSERT INTO video_watches (user_id, course_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, course_id) DO NOTHING`,
    [userId, courseId]
  );
}

export async function getWatchedCourseIds(userId: string): Promise<string[]> {
  const result = await pool.query<{ course_id: string }>(
    `SELECT course_id FROM video_watches WHERE user_id = $1`,
    [userId]
  );
  return result.rows.map((r) => r.course_id);
}
