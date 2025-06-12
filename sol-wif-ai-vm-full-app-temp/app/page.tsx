'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { usePrivy } from '@privy-io/react-auth';

export default function HomePage() {
  const { connected, publicKey } = useWallet();
  const { authenticated, user, login } = usePrivy();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to sol-wif-ai-vm-full-app-temp
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Built with Bonk Computer Framework - Production-grade Solana Web3 development
        </p>
        
        {!authenticated && !connected && (
          <button
            onClick={login}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Connect Wallet to Get Started
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">🚀 Features</h2>
          <ul className="space-y-2">
            <li>✅ Solana Web3 Integration</li>
            <li>✅ Real-time Backend with Convex</li>
            <li>✅ AI-Powered Development</li>
            <li>✅ E2B Code Sandboxes</li>
            <li>✅ Web3 Authentication</li>
            <li>✅ Jupiter DEX Integration</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">📊 Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Wallet:</span>
              <span className={connected ? "text-green-600" : "text-red-600"}>
                {connected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Auth:</span>
              <span className={authenticated ? "text-green-600" : "text-red-600"}>
                {authenticated ? "Authenticated" : "Not authenticated"}
              </span>
            </div>
            {publicKey && (
              <div className="text-sm">
                <span className="text-gray-600">Address:</span>
                <br />
                <code className="bg-gray-100 p-1 rounded">
                  {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
                </code>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">🛠️ Next Steps</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold">Add Components</h3>
            <p className="text-sm text-gray-600 mt-2">
              Use <code>bcf add wallet</code> to add wallet components
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold">Configure APIs</h3>
            <p className="text-sm text-gray-600 mt-2">
              Add your API keys in <code>.env.local</code>
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold">Deploy</h3>
            <p className="text-sm text-gray-600 mt-2">
              Deploy to Vercel with one command
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
