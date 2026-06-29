import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  // 🔒 Proteksi: Hanya bisa diakses di development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { message: "Not found" },
      { status: 404 }
    );
  }

  // 🔒 Proteksi tambahan: Hanya SUPER_ADMIN yang bisa akses
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    hasSession: true,
    session: {
      id: session.id,
      name: session.name,
      username: session.username,
      role: session.role,
    },
  });
}
