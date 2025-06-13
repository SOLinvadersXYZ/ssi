'use client'

import { useState } from 'react'

export default function NFTMarketplace() {
  const [activeTab, setActiveTab] = useState('explore')
  const [mintQuantity, setMintQuantity] = useState(1)

  const featuredNFTs = [
    {
      id: 1,
      name: 'Cosmic Bonk #1234',
      image: '/api/placeholder/300/300',
      price: '2.5 SOL',
      rarity: 'rare',
      collection: 'Cosmic Bonks',
      traits: ['Blue Eyes', 'Rare Hat', 'Golden Chain']
    },
    {
      id: 2,
      name: 'Pixel Warrior #567',
      image: '/api/placeholder/300/300',
      price: '1.8 SOL',
      rarity: 'uncommon',
      collection: 'Pixel Warriors',
      traits: ['Red Armor', 'Lightning Sword']
    },
    {
      id: 3,
      name: 'Space Cat #890',
      image: '/api/placeholder/300/300',
      price: '3.2 SOL',
      rarity: 'epic',
      collection: 'Space Cats',
      traits: ['Astronaut Helmet', 'Laser Eyes', 'Jetpack']
    },
    {
      id: 4,
      name: 'Cyber Punk #321',
      image: '/api/placeholder/300/300',
      price: '5.0 SOL',
      rarity: 'legendary',
      collection: 'Cyber Punks',
      traits: ['Neon Hair', 'Neural Implant', 'Holo Jacket']
    }
  ]

  const collections = [
    {
      name: 'Cosmic Bonks',
      items: 10000,
      floorPrice: '1.2 SOL',
      volume: '2,450 SOL',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Pixel Warriors',
      items: 5000,
      floorPrice: '0.8 SOL',
      volume: '1,200 SOL',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Space Cats',
      items: 7500,
      floorPrice: '2.1 SOL',
      volume: '3,100 SOL',
      image: '/api/placeholder/150/150'
    }
  ]

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            {{PROJECT_NAME}} NFT
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Discover, collect, and trade unique digital assets on Solana
          </p>
          <div className="flex justify-center gap-4">
            <button className="nft-button">Connect Wallet</button>
            <button className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              Create Collection
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-1">
            {['explore', 'mint', 'collections'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'explore' && (
          <div className="space-y-8">
            {/* Featured NFTs */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-6">Featured NFTs</h2>
              <div className="grid-nft">
                {featuredNFTs.map((nft) => (
                  <div key={nft.id} className="nft-card">
                    <div className="relative">
                      <div className="nft-card-image bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                        <span className="text-white/80 text-sm">NFT Image</span>
                      </div>
                      <div className={`absolute top-2 right-2 trait-badge rarity-${nft.rarity}`}>
                        {nft.rarity}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold text-lg mb-1">{nft.name}</h3>
                      <p className="text-white/60 text-sm mb-2">{nft.collection}</p>
                      <div className="flex justify-between items-center mb-3">
                        <span className="price-badge">{nft.price}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {nft.traits.slice(0, 2).map((trait, index) => (
                          <span key={index} className="trait-badge text-xs">
                            {trait}
                          </span>
                        ))}
                        {nft.traits.length > 2 && (
                          <span className="trait-badge text-xs">
                            +{nft.traits.length - 2}
                          </span>
                        )}
                      </div>
                      <button type="button" className="nft-button w-full">
                        Buy Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Stats */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="collection-card text-center">
                <h3 className="text-2xl font-bold text-white">12,450</h3>
                <p className="text-white/80">Total NFTs</p>
              </div>
              <div className="collection-card text-center">
                <h3 className="text-2xl font-bold text-white">2,340 SOL</h3>
                <p className="text-white/80">Volume Traded</p>
              </div>
              <div className="collection-card text-center">
                <h3 className="text-2xl font-bold text-white">1,890</h3>
                <p className="text-white/80">Active Traders</p>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'mint' && (
          <div className="max-w-2xl mx-auto">
            <div className="mint-card text-center">
              <h2 className="text-3xl font-bold text-white mb-6">Mint New NFT</h2>
              <div className="bg-gradient-to-br from-pink-400 to-purple-400 aspect-square rounded-xl mb-6 flex items-center justify-center max-w-sm mx-auto">
                <span className="text-white/80 text-lg">Preview Image</span>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="nft-name" className="block text-white/80 mb-2 text-left">NFT Name</label>
                  <input
                    id="nft-name"
                    type="text"
                    placeholder="Enter NFT name"
                    className="nft-input w-full"
                  />
                </div>
                <div>
                  <label htmlFor="nft-description" className="block text-white/80 mb-2 text-left">Description</label>
                  <textarea
                    id="nft-description"
                    placeholder="Describe your NFT"
                    rows={3}
                    className="nft-input w-full resize-none"
                  />
                </div>
                <div>
                  <label htmlFor="mint-quantity" className="block text-white/80 mb-2 text-left">Quantity</label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setMintQuantity(Math.max(1, mintQuantity - 1))}
                      className="bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-lg"
                    >
                      -
                    </button>
                    <span className="text-white font-semibold text-xl w-12 text-center">
                      {mintQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMintQuantity(mintQuantity + 1)}
                      className="bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Mint Price:</span>
                  <span className="text-white font-semibold">0.5 SOL each</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-white/80">Total Cost:</span>
                  <span className="text-white font-bold text-lg">{(0.5 * mintQuantity).toFixed(1)} SOL</span>
                </div>
              </div>

              <button type="button" className="nft-button w-full text-lg py-4">
                Mint NFT ({mintQuantity})
              </button>
            </div>
          </div>
        )}

        {activeTab === 'collections' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white text-center">Top Collections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection, index) => (
                <div key={index} className="collection-card">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl flex items-center justify-center">
                      <span className="text-white text-xs">IMG</span>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl">{collection.name}</h3>
                      <p className="text-white/60">{collection.items.toLocaleString()} items</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-white/60 text-sm">Floor Price</p>
                      <p className="text-white font-semibold">{collection.floorPrice}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Volume</p>
                      <p className="text-white font-semibold">{collection.volume}</p>
                    </div>
                  </div>
                  <button type="button" className="nft-button w-full">
                    View Collection
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-white/10">
          <p className="text-white/60">
            Built with Bonk Computer Framework • Powered by Solana & Metaplex
          </p>
        </div>
      </div>
    </div>
  )
}
