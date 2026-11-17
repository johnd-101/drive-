import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const questions = await prisma.question.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(questions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await prisma.question.create({ data: body });
  return NextResponse.json(created);
}

export async function PUT(req: NextRequest) {
  const { id, ...data } = await req.json();
  const updated = await prisma.question.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if(!id) return NextResponse.json({error:"id required"}, {status:400});
  await prisma.question.delete({ where: { id } });
  return NextResponse.json({ok:true});
}
