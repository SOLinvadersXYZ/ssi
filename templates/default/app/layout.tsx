'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { ConvexProvider, ConvexReactClient } from '@convex-dev/react';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';
import './globals.css';

// Import wallet adapter CSS
require('@solana/wallet-adapter-react-ui/styles.css');

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Configure Solana network
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() =>
    process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl(network),
    [network]
  );
  
  // Configure wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <html lang="en">
      <body>
        <ConvexProvider client={convex}>
          <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
            config={{
              appearance: {
                theme: 'light',
                accentColor: '#676FFF',
              },
              embeddedWallets: {
                createOnLogin: 'users-without-wallets',
              },
            }}
          >
            <ConnectionProvider endpoint={endpoint}>
              <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                  <div className="min-h-screen bg-background">
                    <header className="border-b">
                      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold">🐶💻 {{PROJECT_NAME}}</h1>
                        <div className="flex items-center gap-4">
                          {/* Add wallet connection component here */}
                        </div>
                      </div>
                    </header>
                    <main className="container mx-auto px-4 py-8">
                      {children}
                    </main>
                  </div>
                </WalletModalProvider>
              </WalletProvider>
            </ConnectionProvider>
          </PrivyProvider>
        </ConvexProvider>
      </body>
    </html>
  );
}
