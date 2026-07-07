import { db } from "@/db";
import { cases } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
      return NextResponse.json({ error: "Wallet required" }, { status: 400 });
    }

    const userCases = await db
      .select()
      .from(cases)
      .where(eq(cases.ownerWallet, wallet))
      .orderBy(desc(cases.createdAt));

    return NextResponse.json(userCases);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    );
  }
}