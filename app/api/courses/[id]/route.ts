import { auth } from "@/auth";
import { updateCourse, deleteCourse, getYouTubeID } from "@/lib/courses-db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  // Si actualizan youtube_url, regenerar thumbnail automáticamente
  if (body.youtube_url) {
    const videoId = getYouTubeID(body.youtube_url);
    if (!videoId) {
      return NextResponse.json({ error: "URL de YouTube inválida" }, { status: 400 });
    }
    body.thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }

  const course = await updateCourse(id, body);
  if (!course) return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
  return NextResponse.json(course);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const deleted = await deleteCourse(id);
  if (!deleted) return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
  return NextResponse.json({ success: true });
}
