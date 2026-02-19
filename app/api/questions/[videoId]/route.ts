import { auth } from "@/auth";
import { getQuestionsByVideoId } from "@/lib/questions";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("No autorizado", { status: 401 });
  }

  const { videoId } = await params;
  const rows = await getQuestionsByVideoId(videoId);
  return Response.json(rows.map(r => r.question));
}
