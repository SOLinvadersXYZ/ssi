'use client'

import { useState } from 'react'

export default function DeFiApp() {
  const [selectedToken, setSelectedToken] = useState('SOL')
  const [amount, setAmount] = useState('')
  const [balance] = useState('10.5 SOL')

  const tokens = [
    { symbol: 'SOL', name: 'Solana', price: '$102.45', change: '+2.34%', changePositive: true },
    { symbol: 'USDC', name: 'USD Coin', price: '$1.00', change: '+0.01%', changePositive: true },
    { symbol: 'BONK', name: 'Bonk', price: '$0.000023', change: '+15.67%', changePositive: true },
    { symbol: 'RAY', name: 'Raydium', price: '$2.89', change: '-1.23%', changePositive: false },
  ]

  const liquidityPools = [
    { pair: 'SOL/USDC', tvl: '$2.4M', apr: '8.5%', volume24h: '$890K' },
    { pair: 'BONK/SOL', tvl: '$1.2M', apr: '12.3%', volume24h: '$450K' },
    { pair: 'RAY/USDC', tvl: '$980K', apr: '6.7%', volume24h: '$320K' },
  ]

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            {{PROJECT_NAME}} DeFi
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Decentralized Finance on Solana
          </p>
          <div className="flex justify-center gap-4">
            <button className="defi-button">Connect Wallet</button>
            <button className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              Portfolio
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trading Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Swap Interface */}
            <div className="defi-card">
              <h2 className="text-2xl font-bold text-white mb-6">Swap Tokens</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 mb-2">From</label>
                  <div className="flex gap-3">
                    <select 
                      value={selectedToken} 
                      onChange={(e) => setSelectedToken(e.target.value)}
                      className="defi-input flex-shrink-0 w-24"
                    >
                      {tokens.map(token => (
                        <option key={token.symbol} value={token.symbol}>{token.symbol}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="defi-input flex-1"
                    />
                  </div>
                  <p className="text-white/60 text-sm mt-1">Balance: {balance}</p>
                </div>

                <div className="flex justify-center">
                  <button className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                </div>

                <div>
                  <label className="block text-white/80 mb-2">To</label>
                  <div className="flex gap-3">
                    <select className="defi-input flex-shrink-0 w-24">
                      <option>USDC</option>
                      <option>BONK</option>
                      <option>RAY</option>
                    </select>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="defi-input flex-1"
                      readOnly
                    />
                  </div>
                </div>

                <button className="defi-button w-full text-lg py-4">
                  Swap Tokens
                </button>
              </div>
            </div>

            {/* Market Data */}
            <div className="defi-card">
              <h2 className="text-2xl font-bold text-white mb-6">Markets</h2>
              <div className="space-y-3">
                {tokens.map((token) => (
                  <div key={token.symbol} className="trading-pair">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{token.symbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">{token.symbol}</p>
                        <p className="text-white/60 text-sm">{token.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{token.price}</p>
                      <p className={`text-sm font-medium ${token.changePositive ? 'price-up' : 'price-down'}`}>
                        {token.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Portfolio Balance */}
            <div className="balance-card">
              <h3 className="text-lg font-semibold text-white mb-2">Portfolio Value</h3>
              <p className="text-3xl font-bold text-white">$1,247.83</p>
              <p className="text-green-400 text-sm">+$23.45 (1.92%)</p>
            </div>

            {/* Liquidity Pools */}
            <div className="defi-card">
              <h3 className="text-xl font-bold text-white mb-4">Liquidity Pools</h3>
              <div className="space-y-4">
                {liquidityPools.map((pool) => (
                  <div key={pool.pair} className="liquidity-pool">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-white font-semibold">{pool.pair}</span>
                      <span className="text-green-400 font-semibold">{pool.apr} APR</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-white/60">TVL</p>
                        <p className="text-white">{pool.tvl}</p>
                      </div>
                      <div>
                        <p className="text-white/60">24h Volume</p>
                        <p className="text-white">{pool.volume24h}</p>
                      </div>
                    </div>
                    <button className="w-full mt-3 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-colors">
                      Add Liquidity
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Staking */}
            <div className="defi-card">
              <h3 className="text-xl font-bold text-white mb-4">Staking</h3>
              <div className="text-center">
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-xl p-4 mb-4">
                  <p className="text-white/80 text-sm">SOL Staked</p>
                  <p className="text-2xl font-bold text-white">5.25 SOL</p>
                  <p className="text-green-400 text-sm">Earning 6.8% APY</p>
                </div>
                <button className="defi-button w-full">
                  Stake More SOL
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-white/10">
          <p className="text-white/60">
            Built with Bonk Computer Framework • Powered by Solana
          </p>
        </div>
      </div>
    </div>
  )
}
