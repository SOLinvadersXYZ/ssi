'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface SwapInterfaceProps {
  onSwap?: (fromToken: string, toToken: string, amount: number) => void;
}

const POPULAR_TOKENS = [
  { symbol: 'SOL', name: 'Solana', mint: 'So11111111111111111111111111111111111111112' },
  { symbol: 'BONK', name: 'Bonk', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
  { symbol: 'USDC', name: 'USD Coin', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
  { symbol: 'RAY', name: 'Raydium', mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R' },
];

export function SwapInterface({ onSwap }: SwapInterfaceProps) {
  const { connected } = useWallet();
  const [fromToken, setFromToken] = useState(POPULAR_TOKENS[0]);
  const [toToken, setToToken] = useState(POPULAR_TOKENS[1]);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSwap = async () => {
    if (!connected || !amount || !onSwap) return;

    setIsLoading(true);
    try {
      await onSwap(fromToken.mint, toToken.mint, Number.parseFloat(amount));
    } catch (error) {
      console.error('Swap failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  if (!connected) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <h3 className="text-xl font-semibold mb-4 text-white">Token Swap</h3>
        <p className="text-gray-400">Connect your wallet to start swapping tokens</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-lg p-6 max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-6 text-white text-center">🔄 Token Swap</h3>
      
      {/* From Token */}
      <div className="mb-4">
        <label htmlFor="from-amount" className="block text-sm font-medium text-gray-300 mb-2">From</label>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <select
              value={fromToken.symbol}
              onChange={(e) => {
                const token = POPULAR_TOKENS.find(t => t.symbol === e.target.value);
                if (token) setFromToken(token);
              }}
              aria-label="Select from token"
              className="bg-gray-700 text-white rounded px-3 py-1 text-sm"
            >
              {POPULAR_TOKENS.map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol}
                </option>
              ))}
            </select>
            <span className="text-xs text-gray-400">Balance: 0.00</span>
          </div>
          <input
            id="from-amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-transparent text-white text-2xl outline-none"
          />
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center mb-4">
        <button
          type="button"
          onClick={switchTokens}
          className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full transition-colors"
        >
          ↕️
        </button>
      </div>

      {/* To Token */}
      <div className="mb-6">
        <div className="block text-sm font-medium text-gray-300 mb-2">To</div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <select
              value={toToken.symbol}
              onChange={(e) => {
                const token = POPULAR_TOKENS.find(t => t.symbol === e.target.value);
                if (token) setToToken(token);
              }}
              aria-label="Select to token"
              className="bg-gray-700 text-white rounded px-3 py-1 text-sm"
            >
              {POPULAR_TOKENS.map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol}
                </option>
              ))}
            </select>
            <span className="text-xs text-gray-400">Balance: 0.00</span>
          </div>
          <div className="text-2xl text-gray-400">~0.00</div>
        </div>
      </div>

      {/* Swap Details */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6 text-sm">
        <div className="flex justify-between mb-2">
          <span className="text-gray-400">Rate:</span>
          <span className="text-white">1 {fromToken.symbol} = ~1.5 {toToken.symbol}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-400">Price Impact:</span>
          <span className="text-green-400">0.1%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Fee:</span>
          <span className="text-white">0.25%</span>
        </div>
      </div>

      {/* Swap Button */}
      <button
        type="button"
        onClick={handleSwap}
        disabled={!amount || isLoading || fromToken.symbol === toToken.symbol}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 rounded-lg transition-all disabled:cursor-not-allowed"
      >
        {isLoading ? 'Swapping...' : 'Swap Tokens'}
      </button>

      <p className="text-xs text-gray-400 text-center mt-4">
        Powered by Jupiter Protocol • Bonk Computer Framework
      </p>
    </div>
  );
}
