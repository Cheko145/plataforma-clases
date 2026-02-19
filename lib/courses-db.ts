import { pool } from "./db";

export interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  youtube_url: string;
  duration: string | null;
  created_at: Date;
}

export function getYouTubeID(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export async function getAllCourses(): Promise<Course[]> {
  const result = await pool.query<Course>(
    "SELECT * FROM courses ORDER BY created_at ASC"
  );
  return result.rows;
}

export async function getCourseById(id: string): Promise<Course | null> {
  const result = await pool.query<Course>(
    "SELECT * FROM courses WHERE id = $1 LIMIT 1",
    [id]
  );
  return result.rows[0] ?? null;
}

export async function getCoursesByUserId(userId: string): Promise<Course[]> {
  const result = await pool.query<Course>(
    `SELECT DISTINCT c.*
     FROM courses c
     JOIN group_courses gc ON c.id = gc.course_id
     JOIN group_members gm ON gc.group_id = gm.group_id
     WHERE gm.user_id = $1
     ORDER BY c.created_at ASC`,
    [userId]
  );
  return result.rows;
}

export async function createCourse(data: {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  youtube_url: string;
  duration?: string;
}): Promise<Course> {
  const result = await pool.query<Course>(
    `INSERT INTO courses (id, title, description, thumbnail, youtube_url, duration)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [data.id, data.title, data.description ?? null, data.thumbnail ?? null, data.youtube_url, data.duration ?? null]
  );
  return result.rows[0];
}

export async function updateCourse(
  id: string,
  data: Partial<Omit<Course, "id" | "created_at">>
): Promise<Course | null> {
  const result = await pool.query<Course>(
    `UPDATE courses
     SET title       = COALESCE($1, title),
         description = COALESCE($2, description),
         thumbnail   = COALESCE($3, thumbnail),
         youtube_url = COALESCE($4, youtube_url),
         duration    = COALESCE($5, duration)
     WHERE id = $6
     RETURNING *`,
    [data.title, data.description, data.thumbnail, data.youtube_url, data.duration, id]
  );
  return result.rows[0] ?? null;
}

export async function deleteCourse(id: string): Promise<boolean> {
  const result = await pool.query(
    "DELETE FROM courses WHERE id = $1",
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}
