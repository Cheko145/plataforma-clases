import { pool } from "./db";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  related_course_id: string | null;
  is_read: boolean;
  created_at: Date;
}

export async function createNotificationsForGroup(data: {
  groupId: string;
  title: string;
  message: string;
  type: string;
  relatedCourseId?: string;
}): Promise<void> {
  await pool.query(
    `INSERT INTO notifications (user_id, title, message, type, related_course_id)
     SELECT gm.user_id, $1, $2, $3, $4
     FROM group_members gm
     WHERE gm.group_id = $5`,
    [data.title, data.message, data.type, data.relatedCourseId ?? null, data.groupId]
  );
}

export async function createNotificationForUser(data: {
  userId: string;
  title: string;
  message: string;
  type: string;
  relatedCourseId?: string;
}): Promise<void> {
  await pool.query(
    `INSERT INTO notifications (user_id, title, message, type, related_course_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [data.userId, data.title, data.message, data.type, data.relatedCourseId ?? null]
  );
}

export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
  const result = await pool.query<Notification>(
    `SELECT * FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [userId]
  );
  return result.rows;
}

export async function markNotificationRead(id: string, userId: string): Promise<void> {
  await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE user_id = $1`,
    [userId]
  );
}

export async function getUnreadCount(userId: string): Promise<number> {
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );
  return parseInt(result.rows[0]?.count ?? "0", 10);
}
