import { NextRequest, NextResponse } from "next/server";
import { ShelbyClient } from "@shelby-protocol/sdk/node";
import { Network, Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const client = new ShelbyClient({
      network: Network.SHELBYNET,
      apiKey: process.env.SHELBY_API_KEY,
    });

    const privateKey = new Ed25519PrivateKey(process.env.SHELBY_UPLOAD_PRIVATE_KEY!);
    const account = Account.fromPrivateKey({ privateKey });

    const blobUrls: string[] = [];

    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const blobData = new Uint8Array(buffer);
      const blobName = `shelbyvault/${Date.now()}-${file.name}`;

      await client.upload({
        blobData,
        signer: account,
        blobName,
       expirationMicros: Date.now() * 1000 + 365 * 24 * 60 * 60 * 1_000_000,
      });

      blobUrls.push(blobName);
    }

    return NextResponse.json({ blobUrls });
  } catch (error) {
    console.error("Shelby upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}