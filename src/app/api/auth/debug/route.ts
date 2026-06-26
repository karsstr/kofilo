import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  
  return NextResponse.json({
    hasSession: !!session,
    session,
    cookies: req.headers.get("cookie") || "no cookies",
  });
}