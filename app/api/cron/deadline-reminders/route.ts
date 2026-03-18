import { getUsersWithDeadlineTomorrow } from "@/lib/groups";
import { sendDeadlineReminderEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const upcoming = await getUsersWithDeadlineTomorrow();

  const results = await Promise.allSettled(
    upcoming.map((item) =>
      sendDeadlineReminderEmail(
        item.email,
        item.name ?? item.email,
        item.course_title,
        item.deadline,
        item.course_id,
        item.youtube_url
      )
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ sent, failed, total: upcoming.length });
}
