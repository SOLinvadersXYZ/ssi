'use client';

import './globals.css';
import { ConvexProvider, ConvexReactClient } from '@convex-dev/react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';

require('@solana/wallet-adapter-react-ui/styles.css');

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || '');

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const endpoint = useMemo(() => 
    process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl('mainnet-beta'),
    []
  );
  
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
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
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
                  <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                    <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
                      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-white">
                          🎮 Bonk Game
                        </h1>
                        <GameWalletConnect />
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

function GameWalletConnect() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { connected, publicKey, disconnect } = useWallet();
  
  if (!ready) {
    return <div className="text-white">Loading...</div>;
  }
  
  if (authenticated && connected) {
    return (
      <div className="flex items-center gap-4 text-white">
        <div className="text-sm">
          <span className="font-medium">
            {publicKey?.toString().slice(0, 6)}...{publicKey?.toString().slice(-4)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            disconnect();
          }}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={login}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
      >
        Connect Wallet
      </button>
    </div>
  );
}
