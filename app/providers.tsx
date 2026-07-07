"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AptosWalletAdapterProvider
        autoConnect={false}
        dappConfig={{
          network: Network.TESTNET,
          aptosApiKeys: {
            testnet: process.env.NEXT_PUBLIC_APTOS_API_KEY,
          },
          aptosConnectDappId: "shelbyvault",
        }}
        onError={(error) => console.error("Wallet error:", error)}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </AptosWalletAdapterProvider>
    </QueryClientProvider>
  );
}