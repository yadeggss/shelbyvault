import { NextRequest, NextResponse } from "next/server";
import { ShelbyClient } from "@shelby-protocol/sdk/node";
import { Network } from "@aptos-labs/ts-sdk";

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  pdf: "application/pdf",
  txt: "text/plain",
  mp4: "video/mp4",
  mov: "video/quicktime",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const blobName = searchParams.get("name");

    if (!blobName) {
      return NextResponse.json({ error: "Blob name required" }, { status: 400 });
    }

    const ext = blobName.split(".").pop()?.toLowerCase() ?? "";
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

    const client = new ShelbyClient({
      network: Network.SHELBYNET,
      apiKey: process.env.SHELBY_API_KEY,
    });

    const blob = await client.download({
      account: process.env.SHELBY_UPLOAD_ADDRESS!,
      blobName,
    });

    return new NextResponse(blob.readable as any, {
  headers: {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000",
  },
});
  } catch (error) {
    console.error("Blob download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}