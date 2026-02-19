import { auth } from "@/auth";
import { getGroupCourses, addCourseToGroup, removeCourseFromGroup } from "@/lib/groups";
import { getAllCourses } from "@/lib/courses-db";
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
  const { courseId } = await req.json();
  if (!courseId) return NextResponse.json({ error: "courseId requerido" }, { status: 400 });

  await addCourseToGroup(id, courseId);
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
