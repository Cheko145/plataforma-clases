import { pool } from "./db";

export interface Group {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
}

export interface GroupWithCounts extends Group {
  member_count: number;
  course_count: number;
}

export interface GroupMember {
  user_id: string;
  name: string | null;
  email: string | null;
  added_at: Date;
}

export interface GroupCourse {
  course_id: string;
  title: string;
  youtube_url: string;
  assigned_at: Date;
}

export interface StudentBasic {
  id: string;
  name: string | null;
  email: string | null;
}

export async function getAllGroups(): Promise<GroupWithCounts[]> {
  const result = await pool.query<GroupWithCounts>(
    `SELECT
       g.*,
       COUNT(DISTINCT gm.user_id)::int  AS member_count,
       COUNT(DISTINCT gc.course_id)::int AS course_count
     FROM groups g
     LEFT JOIN group_members gm ON g.id = gm.group_id
     LEFT JOIN group_courses  gc ON g.id = gc.group_id
     GROUP BY g.id
     ORDER BY g.created_at ASC`
  );
  return result.rows;
}

export async function getGroupById(id: string): Promise<Group | null> {
  const result = await pool.query<Group>(
    "SELECT * FROM groups WHERE id = $1 LIMIT 1",
    [id]
  );
  return result.rows[0] ?? null;
}

export async function createGroup(data: {
  name: string;
  description?: string;
}): Promise<Group> {
  const result = await pool.query<Group>(
    `INSERT INTO groups (name, description)
     VALUES ($1, $2)
     RETURNING *`,
    [data.name, data.description ?? null]
  );
  return result.rows[0];
}

export async function updateGroup(
  id: string,
  data: { name?: string; description?: string }
): Promise<Group | null> {
  const result = await pool.query<Group>(
    `UPDATE groups
     SET name        = COALESCE($1, name),
         description = COALESCE($2, description)
     WHERE id = $3
     RETURNING *`,
    [data.name, data.description, id]
  );
  return result.rows[0] ?? null;
}

export async function deleteGroup(id: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM groups WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const result = await pool.query<GroupMember>(
    `SELECT u.id AS user_id, u.name, u.email, gm.added_at
     FROM group_members gm
     JOIN users u ON gm.user_id = u.id
     WHERE gm.group_id = $1
     ORDER BY u.name ASC`,
    [groupId]
  );
  return result.rows;
}

export async function addMember(groupId: string, userId: string): Promise<void> {
  await pool.query(
    `INSERT INTO group_members (group_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [groupId, userId]
  );
}

export async function removeMember(groupId: string, userId: string): Promise<void> {
  await pool.query(
    "DELETE FROM group_members WHERE group_id = $1 AND user_id = $2",
    [groupId, userId]
  );
}

export async function getGroupCourses(groupId: string): Promise<GroupCourse[]> {
  const result = await pool.query<GroupCourse>(
    `SELECT c.id AS course_id, c.title, c.youtube_url, gc.assigned_at
     FROM group_courses gc
     JOIN courses c ON gc.course_id = c.id
     WHERE gc.group_id = $1
     ORDER BY gc.assigned_at ASC`,
    [groupId]
  );
  return result.rows;
}

export async function addCourseToGroup(
  groupId: string,
  courseId: string
): Promise<void> {
  await pool.query(
    `INSERT INTO group_courses (group_id, course_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [groupId, courseId]
  );
}

export async function removeCourseFromGroup(
  groupId: string,
  courseId: string
): Promise<void> {
  await pool.query(
    "DELETE FROM group_courses WHERE group_id = $1 AND course_id = $2",
    [groupId, courseId]
  );
}

export async function getAllStudents(): Promise<StudentBasic[]> {
  const result = await pool.query<StudentBasic>(
    `SELECT id, name, email
     FROM users
     WHERE role = 'student'
     ORDER BY name ASC`
  );
  return result.rows;
}
