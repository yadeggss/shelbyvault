"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Shield className="w-5 h-5 text-primary" />
          ShelbyVault
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Feed
          </Link>
          <Link href="/upload" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Upload
          </Link>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Button size="sm">Connect Wallet</Button>
        </div>
      </div>
    </nav>
  );
}