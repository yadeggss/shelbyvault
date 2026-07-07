import { db } from "@/db";
import { cases } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

// GET /api/cases - fetch all public cases
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag");
    const severity = searchParams.get("severity");

    let allCases = await db
      .select()
      .from(cases)
      .where(eq(cases.visibility, "public"))
      .orderBy(desc(cases.createdAt));

    // Filter by tag if provided
    if (tag) {
      allCases = allCases.filter((c) =>
        JSON.parse(c.tags).includes(tag.toLowerCase())
      );
    }

    // Filter by severity if provided
    if (severity && severity !== "all") {
      allCases = allCases.filter((c) => c.severity === severity.toLowerCase());
    }

    return NextResponse.json(allCases);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch cases" }, { status: 500 });
  }
}

// POST /api/cases - create a new case
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, severity, visibility, ownerWallet, blobUrls, tags } = body;

    if (!title || !severity || !ownerWallet) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newCase = await db
      .insert(cases)
      .values({
        id: nanoid(),
        title,
        description,
        severity,
        visibility: visibility || "public",
        ownerWallet,
        blobUrls: JSON.stringify(blobUrls || []),
        tags: JSON.stringify(tags || []),
      })
      .returning();

    return NextResponse.json(newCase[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create case" }, { status: 500 });
  }
}