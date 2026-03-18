import { auth } from "@/auth";
import { getGroupCourses, addCourseToGroup, removeCourseFromGroup, getGroupMembers, getGroupById } from "@/lib/groups";
import { getAllCourses, getCourseById } from "@/lib/courses-db";
import { createNotificationsForGroup } from "@/lib/notifications";
import { sendVideoAssignmentEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const [groupCourses, allCourses] = await Promise.all([
    getGroupCourses(id),
    getAllCourses(),
  ]);
  return NextResponse.json({ groupCourses, allCourses });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const { courseId, deadline, adminMessage } = await req.json();
  if (!courseId) return NextResponse.json({ error: "courseId requerido" }, { status: 400 });

  await addCourseToGroup(id, courseId, { deadline, adminMessage });

  // Notificar y enviar correo a todos los alumnos del grupo
  const [course, group, members] = await Promise.all([
    getCourseById(courseId),
    getGroupById(id),
    getGroupMembers(id),
  ]);

  if (course) {
    const deadlineText = deadline
      ? ` Fecha límite: ${new Date(deadline).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })}.`
      : "";
    const baseMessage = adminMessage
      ? adminMessage
      : `Se te ha asignado un nuevo video: "${course.title}".${deadlineText}`;

    await createNotificationsForGroup({
      groupId: id,
      title: "Nuevo video asignado",
      message: baseMessage,
      type: "course_assigned",
      relatedCourseId: courseId,
    });

    if (group) {
      const deadlineDate = deadline ? new Date(deadline) : null;
      for (const member of members) {
        if (member.email) {
          sendVideoAssignmentEmail(
            member.email,
            member.name ?? member.email,
            course.title,
            group.name,
            courseId,
            course.youtube_url,
            deadlineDate,
            adminMessage ?? null
          ).catch(console.error);
        }
      }
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const { courseId } = await req.json();
  if (!courseId) return NextResponse.json({ error: "courseId requerido" }, { status: 400 });

  await removeCourseFromGroup(id, courseId);
  return NextResponse.json({ success: true });
}
