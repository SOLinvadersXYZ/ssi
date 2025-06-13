'use client'

import { useState } from 'react'

export default function MinimalSolanaApp() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [balance] = useState('5.25 SOL')

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            {{PROJECT_NAME}}
          </h1>
          <p className="text-lg text-white/80">
            Minimal Solana Integration
          </p>
        </div>

        {/* Main Card */}
        <div className="minimal-card">
          {!walletConnected ? (
            /* Wallet Connection */
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-slate-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Connect Wallet</h2>
              <p className="text-white/70 mb-6">
                Connect your Solana wallet to get started
              </p>
              <button 
                type="button"
                onClick={() => setWalletConnected(true)}
                className="minimal-button w-full"
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            /* Connected State */
            <div>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-1">Wallet Connected</h2>
                <p className="text-white/70 text-sm">
                  Ready to interact with Solana
                </p>
              </div>

              {/* Balance Display */}
              <div className="balance-display mb-6">
                <p className="text-white/80 text-sm mb-1">Balance</p>
                <p className="text-2xl font-bold text-white">{balance}</p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button type="button" className="minimal-button w-full">
                  Send SOL
                </button>
                <button type="button" className="minimal-button w-full">
                  Receive SOL
                </button>
                <button 
                  type="button"
                  onClick={() => setWalletConnected(false)}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-colors w-full"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/60 text-sm">
            Built with Bonk Computer Framework
          </p>
        </div>
      </div>
    </div>
  )
}
