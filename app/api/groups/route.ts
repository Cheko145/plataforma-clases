import { auth } from "@/auth";
import { getAllGroups, createGroup } from "@/lib/groups";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const groups = await getAllGroups();
  return NextResponse.json(groups);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const { name, description } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "El nombre del grupo es requerido" }, { status: 400 });
  }

  const group = await createGroup({ name: name.trim(), description });
  return NextResponse.json(group, { status: 201 });
}
