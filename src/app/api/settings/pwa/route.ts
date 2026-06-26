import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const settings = await prisma.storeSetting.findFirst({
      select: { pwaBanners: true, pwaEnableTakeaway: true }
    });
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { pwaBanners, pwaEnableTakeaway } = await req.json();
    let settings = await prisma.storeSetting.findFirst();
    
    if (!settings) settings = await prisma.storeSetting.create({ data: { id: "kofilo-store-1" } });

    await prisma.storeSetting.update({
      where: { id: settings.id },
      data: { pwaBanners: pwaBanners || [], pwaEnableTakeaway: Boolean(pwaEnableTakeaway) }
    });

    return NextResponse.json({ message: "PWA Settings updated" });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}