"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Calendar, Eye, Lock, Upload } from "lucide-react";
import Link from "next/link";

type Case = {
  id: string;
  title: string;
  description: string;
  severity: string;
  visibility: string;
  tags: string;
  createdAt: number;
};

const SEVERITY_COLORS: Record<string, string> = {
  rug: "bg-red-500/10 text-red-500 border-red-500/20",
  drain: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  theft: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  suspicious: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

export default function ProfilePage() {
  const { account, connected } = useWallet();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!connected || !account) {
      setLoading(false);
      return;
    }

    fetch(`/api/cases/user?wallet=${account.address.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setCases(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [connected, account]);

  if (!connected) {
    return (
      <div className="text-center py-20 space-y-3">
        <Shield className="w-12 h-12 mx-auto opacity-20" />
        <p className="font-medium">Connect your wallet to view your profile</p>
        <p className="text-sm text-muted-foreground">
          Click <strong>Connect Wallet</strong> in the navbar
        </p>
      </div>
    );
  }

  const publicCases = cases.filter((c) => c.visibility === "public");
  const privateCases = cases.filter((c) => c.visibility === "private");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          {account?.address.toString()}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{cases.length}</div>
            <div className="text-sm text-muted-foreground">Total Cases</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{publicCases.length}</div>
            <div className="text-sm text-muted-foreground">Public</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{privateCases.length}</div>
            <div className="text-sm text-muted-foreground">Private</div>
          </CardContent>
        </Card>
      </div>

      {/* Cases */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="public">Public</TabsTrigger>
          <TabsTrigger value="private">Private</TabsTrigger>
        </TabsList>

        {["all", "public", "private"].map((tab) => {
          const filtered =
            tab === "all"
              ? cases
              : cases.filter((c) => c.visibility === tab);

          return (
            <TabsContent key={tab} value={tab} className="mt-4">
              {loading ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Loading...
                </p>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground space-y-2">
                  <Shield className="w-10 h-10 mx-auto opacity-20" />
                  <p className="font-medium">No cases yet</p>
                  <Link
                    href="/upload"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" /> Submit your first case
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filtered.map((c) => {
                    const tags = JSON.parse(c.tags) as string[];
                    const date = new Date(
                      c.createdAt * 1000
                    ).toLocaleDateString();
                    return (
                      <Link key={c.id} href={`/case/${c.id}`}>
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-base">
                                {c.title}
                              </CardTitle>
                              <div className="flex gap-2">
                                <Badge
                                  className={SEVERITY_COLORS[c.severity]}
                                >
                                  {c.severity.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className="gap-1">
                                  {c.visibility === "public" ? (
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
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {c.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {c.description}
                              </p>
                            )}
                            {tags.length > 0 && (
                              <div className="flex gap-1 flex-wrap">
                                {tags.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {date}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}