import { db } from "@/db";
import { cases } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Calendar, Eye, Lock } from "lucide-react";
import { notFound } from "next/navigation";

const SEVERITY_COLORS: Record<string, string> = {
  rug: "bg-red-500/10 text-red-500 border-red-500/20",
  drain: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  theft: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  suspicious: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

export default async function CasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const caseData = await db
    .select()
    .from(cases)
    .where(eq(cases.id, id))
    .then((r) => r[0]);

  if (!caseData) notFound();

  const tags = JSON.parse(caseData.tags) as string[];
  const blobUrls = JSON.parse(caseData.blobUrls) as string[];
  const date = new Date(caseData.createdAt * 1000).toLocaleDateString();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={SEVERITY_COLORS[caseData.severity]}>
            {caseData.severity.toUpperCase()}
          </Badge>
          <Badge variant="outline" className="gap-1">
            {caseData.visibility === "public" ? (
              <>
                <Eye className="w-3 h-3" /> Public
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" /> Private
              </>
            )}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold">{caseData.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {date}
          </span>
          <span className="font-mono text-xs">
            {caseData.ownerWallet.slice(0, 8)}...{caseData.ownerWallet.slice(-6)}
          </span>
        </div>
      </div>

      {caseData.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {caseData.description}
            </p>
          </CardContent>
        </Card>
      )}

      {tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evidence Files</CardTitle>
        </CardHeader>
        <CardContent>
          {blobUrls.length === 0 ? (
            <p className="text-sm text-muted-foreground">No files attached.</p>
          ) : (
            <div className="space-y-4">
              {blobUrls.map((blobName, i) => {
                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(blobName);
                const url = `/api/blob?name=${encodeURIComponent(blobName)}`;
                return (
                  <div key={i} className="space-y-2">
                    {isImage && (
                      <img
                        src={url}
                        alt={`Evidence ${i + 1}`}
                        className="rounded-lg max-w-full border border-border"
                      />
                    )}

                    <a href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-primary hover:underline font-mono truncate"
                    >
                      {blobName}
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 p-3 rounded-lg bg-accent text-sm">
        <Shield className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-muted-foreground">Permanent link:</span>
        <span className="font-mono text-xs truncate">/case/{id}</span>
      </div>
    </div>
  );
}
