import { auth } from "@/auth";
import { updateGroup, deleteGroup } from "@/lib/groups";
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
  const group = await updateGroup(id, body);
  if (!group) return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
  return NextResponse.json(group);
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
  const deleted = await deleteGroup(id);
  if (!deleted) return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
  return NextResponse.json({ success: true });
}
