# {{PROJECT_NAME}} - NFT Template

A complete NFT marketplace and minting platform built with the Bonk Computer Framework on Solana.

## Features

- **NFT Marketplace** - Browse, buy, and sell NFTs
- **Minting Platform** - Create and mint new NFTs
- **Collection Management** - Organize NFTs into collections
- **Wallet Integration** - Connect multiple Solana wallets
- **Metadata Management** - IPFS and Arweave storage
- **Rarity System** - Trait-based rarity calculations
- **Portfolio Tracking** - Monitor your NFT holdings

## Tech Stack

- **Next.js 14** - React framework with App Router
- **Solana Web3.js** - Blockchain interactions
- **Metaplex SDK** - NFT standards and tooling
- **Tailwind CSS** - Styling and responsive design
- **TypeScript** - Type safety
- **IPFS/Arweave** - Decentralized storage

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   - Set your Solana RPC endpoint
   - Configure storage provider API keys
   - Set collection details

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Solana RPC endpoint | Yes |
| `NEXT_PUBLIC_SOLANA_NETWORK` | Network (mainnet/devnet) | Yes |
| `NEXT_PUBLIC_METAPLEX_API_URL` | Metaplex API endpoint | Yes |
| `NEXT_PUBLIC_PINATA_API_KEY` | IPFS storage via Pinata | No |
| `NEXT_PUBLIC_ARWEAVE_GATEWAY` | Arweave storage gateway | No |
| `NEXT_PUBLIC_COLLECTION_NAME` | Your collection name | No |
| `HELIUS_API_KEY` | Enhanced RPC performance | No |

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## Project Structure

```
{{PROJECT_NAME}}/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Main marketplace interface
│   └── globals.css        # Global styles with NFT components
├── components/            # React components (add as needed)
├── lib/                   # Utility libraries (add as needed)
├── public/               # Static assets
├── .env.example          # Environment variables template
├── next.config.js        # Next.js configuration
└── package.json          # Dependencies and scripts
```

## Adding Components

Use the Bonk Computer Framework CLI to add more components:

```bash
# Add wallet connection
bcf add wallet

# Add NFT gallery component
bcf add nft

# Add swap functionality
bcf add swap

# Add AI features
bcf add ai
```

## NFT Features Implementation

### Marketplace
- Browse and search NFTs
- Filter by collection, price, rarity
- Buy/sell functionality
- Auction system support

### Minting
- Upload and mint new NFTs
- Batch minting capabilities
- Metadata generation
- Royalty configuration

### Collection Management
- Create and manage collections
- Set collection metadata
- Configure minting rules
- Track collection analytics

### Storage Integration
- **IPFS** - Decentralized metadata storage
- **Arweave** - Permanent data storage
- **Shadow Drive** - Fast Solana-native storage
- **Pinata** - Managed IPFS gateway

## Metaplex Integration

This template uses Metaplex standards:
- **Token Metadata Program** - NFT metadata standard
- **Candy Machine** - Automated minting and distribution
- **Auction House** - Decentralized marketplace protocol
- **Certified Collections** - Verified collection system

## Security Considerations

- All transactions require wallet approval
- Metadata verification before minting
- Royalty enforcement on secondary sales
- Private keys never leave your device
- Smart contract interaction auditing

## Customization

### Styling
- Modify `app/globals.css` for custom themes
- NFT card layouts in `.nft-card` class
- Rarity system styling with `.rarity-*` classes

### Features
- Add custom traits and attributes
- Implement staking mechanisms
- Create loyalty programs
- Add gamification elements

## Resources

- [Solana Documentation](https://docs.solana.com/)
- [Metaplex Documentation](https://docs.metaplex.com/)
- [Solana NFT Standards](https://spl.solana.com/token)
- [Bonk Computer Framework](https://github.com/bonkcomputer/framework)

## Support

For support and questions:
- Framework Issues: [GitHub Issues](https://github.com/bonkcomputer/framework/issues)
- Solana Support: [Solana Discord](https://discord.gg/solana)
- Metaplex Support: [Metaplex Discord](https://discord.gg/metaplex)
- NFT Community: [Solana NFT Discord](https://discord.gg/solananft)
