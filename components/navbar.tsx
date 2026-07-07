"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

export function Navbar() {
  const { connect, disconnect, account, connected, wallets } = useWallet();
  const [open, setOpen] = useState(false);

  function shortAddress(addr: string) {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  function handleConnect(walletName: string) {
    connect(walletName as any);
    setOpen(false);
  }

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
          <Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Profile
          </Link>
          {connected && account ? (
            <Button size="sm" variant="outline" onClick={() => disconnect()}>
              {shortAddress(account.address.toString())}
            </Button>
          ) : (
            <Button size="sm" onClick={() => setOpen(true)}>
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            {wallets && wallets.length > 0 ? (
              wallets.map((wallet) => (
                <Button
                  key={wallet.name}
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => handleConnect(wallet.name)}
                >
                  {wallet.name}
                </Button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No wallets detected. Install Petra or another Aptos wallet.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
}