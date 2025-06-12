'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

export function WalletConnect() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  
  if (!ready) {
    return (
      <button disabled className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg">
        Loading...
      </button>
    );
  }
  
  if (authenticated && connected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-col text-sm">
          <span className="font-medium">
            {user?.wallet?.address?.slice(0, 6)}...
            {user?.wallet?.address?.slice(-4)}
          </span>
          <span className="text-xs text-gray-500">
            Solana: {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
          </span>
        </div>
        
        <button
          onClick={() => {
            logout();
            disconnect();
          }}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={login}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Connect Web3
      </button>
      <button
        onClick={() => setVisible(true)}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
      >
        Solana Wallet
      </button>
    </div>
  );
}
