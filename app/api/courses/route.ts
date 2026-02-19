import { auth } from "@/auth";
import { getAllCourses, createCourse, getYouTubeID } from "@/lib/courses-db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const courses = await getAllCourses();
  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, youtube_url, duration } = body;

  if (!title || !youtube_url) {
    return NextResponse.json({ error: "title y youtube_url son requeridos" }, { status: 400 });
  }

  const videoId = getYouTubeID(youtube_url);
  if (!videoId) {
    return NextResponse.json({ error: "URL de YouTube inválida" }, { status: 400 });
  }

  // Generar slug único basado en timestamp
  const id = body.id || `video_${Date.now()}`;
  const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  const course = await createCourse({ id, title, description, thumbnail, youtube_url, duration });
  return NextResponse.json(course, { status: 201 });
}
