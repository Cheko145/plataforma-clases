import { auth } from "@/auth";
import { getGroupMembers, addMember, removeMember, getAllStudents, getGroupById, getGroupCourses } from "@/lib/groups";
import { createNotificationForUser } from "@/lib/notifications";
import { getUserById } from "@/lib/users";
import { sendGroupAssignmentEmail } from "@/lib/email";
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
  const [members, allStudents] = await Promise.all([
    getGroupMembers(id),
    getAllStudents(),
  ]);
  return NextResponse.json({ members, allStudents });
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
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId requerido" }, { status: 400 });

  await addMember(id, userId);

  // Notificar al alumno que fue agregado al grupo
  const [group, courses] = await Promise.all([
    getGroupById(id),
    getGroupCourses(id),
  ]);

  if (group) {
    await createNotificationForUser({
      userId,
      title: "Te asignaron a un grupo",
      message: `Fuiste agregado al grupo "${group.name}".${courses.length > 0 ? ` Tienes ${courses.length} video(s) disponible(s).` : ""}`,
      type: "group_assigned",
    });

    const user = await getUserById(userId);
    if (user?.email) {
      sendGroupAssignmentEmail(
        user.email,
        user.name ?? user.email,
        group.name,
        courses.map((c) => ({ title: c.title, deadline: c.deadline, course_id: c.course_id, youtube_url: c.youtube_url }))
      ).catch(console.error);
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
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId requerido" }, { status: 400 });

  await removeMember(id, userId);
  return NextResponse.json({ success: true });
}
