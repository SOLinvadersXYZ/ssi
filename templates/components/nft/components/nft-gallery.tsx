'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface NFT {
  id: string;
  name: string;
  image: string;
  description: string;
  mint: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface NFTGalleryProps {
  onSelectNFT?: (nft: NFT) => void;
}

export function NFTGallery({ onSelectNFT }: NFTGalleryProps) {
  const { connected, publicKey } = useWallet();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);

  // Mock NFT data for demonstration
  const mockNFTs: NFT[] = [
    {
      id: '1',
      name: 'Bonk Doge #1',
      image: 'https://arweave.net/placeholder1.png',
      description: 'A rare Bonk Computer NFT with special powers',
      mint: 'BonkMint1111111111111111111111111111111',
      attributes: [
        { trait_type: 'Rarity', value: 'Legendary' },
        { trait_type: 'Power', value: 'Lightning' },
        { trait_type: 'Background', value: 'Cosmic' },
      ],
    },
    {
      id: '2',
      name: 'Bonk Doge #2',
      image: 'https://arweave.net/placeholder2.png',
      description: 'Another amazing Bonk Computer NFT',
      mint: 'BonkMint2222222222222222222222222222222',
      attributes: [
        { trait_type: 'Rarity', value: 'Epic' },
        { trait_type: 'Power', value: 'Fire' },
        { trait_type: 'Background', value: 'Forest' },
      ],
    },
    {
      id: '3',
      name: 'Bonk Doge #3',
      image: 'https://arweave.net/placeholder3.png',
      description: 'A cool Bonk Computer NFT',
      mint: 'BonkMint3333333333333333333333333333333',
      attributes: [
        { trait_type: 'Rarity', value: 'Rare' },
        { trait_type: 'Power', value: 'Ice' },
        { trait_type: 'Background', value: 'Mountain' },
      ],
    },
  ];

  useEffect(() => {
    if (connected && publicKey) {
      loadNFTs();
    } else {
      setNfts([]);
    }
  }, [connected, publicKey]);

  const loadNFTs = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would fetch NFTs from Helius DAS API or Metaplex
      setNfts(mockNFTs);
    } catch (error) {
      console.error('Failed to load NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectNFT = (nft: NFT) => {
    setSelectedNFT(nft);
    onSelectNFT?.(nft);
  };

  if (!connected) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-semibold mb-4 text-white">🖼️ NFT Gallery</h3>
        <p className="text-gray-400 mb-4">Connect your wallet to view your NFT collection</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 opacity-50">
          {mockNFTs.map((nft) => (
            <div key={nft.id} className="bg-gray-700 rounded-lg p-4">
              <div className="aspect-square bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg mb-2 flex items-center justify-center">
                <span className="text-2xl">🖼️</span>
              </div>
              <h4 className="text-sm font-semibold text-white truncate">{nft.name}</h4>
              <p className="text-xs text-gray-400 truncate">{nft.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-semibold mb-4 text-white">🖼️ NFT Gallery</h3>
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400">Loading your NFT collection...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold text-white">🖼️ NFT Gallery</h3>
        <button
          type="button"
          onClick={loadNFTs}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {nfts.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400 mb-4">No NFTs found in your wallet</p>
          <p className="text-sm text-gray-500">
            NFTs will appear here once you mint or receive them
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {nfts.map((nft) => (
            <div
              key={nft.id}
              className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-700 ${
                selectedNFT?.id === nft.id ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => handleSelectNFT(nft)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSelectNFT(nft);
                }
              }}
            >
              <div className="aspect-square bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                {nft.image ? (
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling!.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center text-4xl hidden">
                  🖼️
                </div>
              </div>
              
              <h4 className="text-lg font-semibold text-white mb-2 truncate">{nft.name}</h4>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{nft.description}</p>
              
              {nft.attributes && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-300">Attributes:</p>
                  <div className="flex flex-wrap gap-1">
                    {nft.attributes.slice(0, 3).map((attr, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded"
                      >
                        {attr.trait_type}: {attr.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedNFT && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-xl font-semibold text-white mb-4">Selected NFT Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="aspect-square bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                {selectedNFT.image ? (
                  <img
                    src={selectedNFT.image}
                    alt={selectedNFT.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-6xl">🖼️</span>
                )}
              </div>
            </div>
            <div>
              <h5 className="text-2xl font-bold text-white mb-2">{selectedNFT.name}</h5>
              <p className="text-gray-400 mb-4">{selectedNFT.description}</p>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-300 mb-1">Mint Address:</p>
                <p className="text-xs text-gray-400 font-mono break-all">{selectedNFT.mint}</p>
              </div>

              {selectedNFT.attributes && (
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-2">All Attributes:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedNFT.attributes.map((attr, index) => (
                      <div key={index} className="flex justify-between py-1 px-2 bg-gray-700 rounded">
                        <span className="text-sm text-gray-300">{attr.trait_type}</span>
                        <span className="text-sm text-white font-medium">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
