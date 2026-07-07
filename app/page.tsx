import { db } from "@/db";
import { cases } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Shield, Search, Upload, Eye, Calendar } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const SEVERITY_COLORS: Record<string, string> = {
  rug: "bg-red-500/10 text-red-500 border-red-500/20",
  drain: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  theft: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  suspicious: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

export default async function HomePage() {
  const publicCases = await db
    .select()
    .from(cases)
    .where(eq(cases.visibility, "public"))
    .orderBy(desc(cases.createdAt));

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 py-12">
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">ShelbyVault</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Decentralized crypto intelligence vault. Upload evidence of rugs, wallet drains, and onchain theft.
        </p>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <Upload className="w-4 h-4" />
          Submit Evidence
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by tag, token, wallet address..." className="pl-10" />
      </div>

      <div className="flex gap-2 flex-wrap">
        {["All", "Rug", "Drain", "Theft", "Suspicious"].map((filter) => (
          <Badge key={filter} variant="outline" className="cursor-pointer hover:bg-accent transition-colors">
            {filter}
          </Badge>
        ))}
      </div>

      {publicCases.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground space-y-2">
          <Shield className="w-12 h-12 mx-auto opacity-20" />
          <p className="font-medium">No evidence submitted yet</p>
          <p className="text-sm">Be the first to submit a case to ShelbyVault</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {publicCases.map((c) => {
            const tags = JSON.parse(c.tags) as string[];
            const date = new Date(c.createdAt * 1000).toLocaleDateString();
            return (
              <Link key={c.id} href={`/case/${c.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{c.title}</CardTitle>
                      <Badge className={SEVERITY_COLORS[c.severity]}>
                        {c.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {c.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {c.description}
                      </p>
                    )}
                    {tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Public
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
