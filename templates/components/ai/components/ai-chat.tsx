'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  onGenerateCode?: (prompt: string) => Promise<string>;
  onAnalyzeTransaction?: (signature: string) => Promise<string>;
}

export function AIChat({ onGenerateCode, onAnalyzeTransaction }: AIChatProps) {
  const { connected } = useWallet();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your Bonk Computer AI assistant. I can help you generate Solana code, analyze transactions, and answer questions about Web3 development. How can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let response = '';
      
      // Simple AI response logic (in real app, integrate with Vercel AI SDK)
      if (input.toLowerCase().includes('generate') && input.toLowerCase().includes('code')) {
        response = onGenerateCode 
          ? await onGenerateCode(input)
          : `Here's a sample Solana program structure for your request:\n\n\`\`\`rust
use anchor_lang::prelude::*;

#[program]
pub mod bonk_program {
    use super::*;
    
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from Bonk Computer!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
\`\`\`

This is a basic Anchor program template. Would you like me to customize it for your specific use case?`;
      } else if (input.toLowerCase().includes('transaction')) {
        response = onAnalyzeTransaction 
          ? await onAnalyzeTransaction(input)
          : 'I can analyze Solana transactions! Please provide a transaction signature, and I\'ll break down the details including instructions, accounts involved, and program interactions.';
      } else if (input.toLowerCase().includes('bonk') || input.toLowerCase().includes('token')) {
        response = '🐶 BONK is an amazing community token on Solana! Here are some things I can help you with:\n\n• Generate token transfer code\n• Explain token metadata\n• Show how to interact with SPL tokens\n• Create token swap interfaces\n\nWhat would you like to learn about?';
      } else if (input.toLowerCase().includes('wallet')) {
        response = 'Wallet integration is key for Solana dApps! Here\'s what I can help you with:\n\n• Setting up wallet adapters\n• Connecting to different wallet providers\n• Handling wallet state\n• Transaction signing\n\nThe Bonk Computer Framework includes wallet components ready to use!';
      } else if (input.toLowerCase().includes('nft')) {
        response = 'NFTs on Solana are powerful! I can help you:\n\n• Mint NFTs using Metaplex\n• Query NFT metadata\n• Build NFT marketplaces\n• Implement royalties\n• Create collections\n\nWould you like me to generate some NFT code examples?';
      } else {
        response = `That's an interesting question! As your Bonk Computer AI assistant, I can help with:

🔧 **Code Generation**: Solana programs, dApp components, smart contracts
📊 **Transaction Analysis**: Breaking down Solana transactions
🎮 **Game Development**: Real-time multiplayer with Convex
🖼️ **NFT Projects**: Minting, marketplaces, metadata
💱 **DeFi Integration**: Swaps, staking, yield farming
🐶 **BONK Token**: Integration and utilities

Try asking me to "generate code for token transfer" or "explain how to mint an NFT"!`;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI response failed:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again!',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <h3 className="text-2xl font-semibold text-white">🤖 Bonk AI Assistant</h3>
        <div className="ml-auto flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto mb-4 space-y-4 bg-gray-900 rounded-lg p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <div className="flex items-start space-x-2">
                <span className="text-sm">
                  {message.role === 'user' ? '👤' : '🤖'}
                </span>
                <div>
                  <pre className="whitespace-pre-wrap text-sm font-sans">
                    {message.content}
                  </pre>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-100 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-sm">🤖</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={connected 
              ? "Ask me anything about Solana development..." 
              : "Connect your wallet to unlock AI features..."}
            disabled={!connected || isLoading}
            rows={3}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg resize-none outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          />
        </div>
        <button
          type="button"
          onClick={handleSendMessage}
          disabled={!input.trim() || !connected || isLoading}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {isLoading ? '⏳' : '🚀'}
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        Powered by Vercel AI SDK • Bonk Computer Framework
      </p>
    </div>
  );
}
