import { auth } from "@/auth";
import { markVideoWatched } from "@/lib/video-watches";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { courseId } = await req.json();
  if (!courseId) {
    return NextResponse.json({ error: "courseId requerido" }, { status: 400 });
  }

  await markVideoWatched(session.user.id, courseId);
  return NextResponse.json({ success: true });
}
