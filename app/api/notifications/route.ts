import { auth } from "@/auth";
import {
  getNotificationsForUser,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/notifications";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const notifications = await getNotificationsForUser(session.user.id);
  return NextResponse.json(notifications);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id, markAll } = await req.json();

  if (markAll) {
    await markAllNotificationsRead(session.user.id);
  } else if (id) {
    await markNotificationRead(id, session.user.id);
  }

  return NextResponse.json({ success: true });
}
