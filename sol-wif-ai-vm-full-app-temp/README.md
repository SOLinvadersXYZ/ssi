# sol-wif-ai-vm-full-app-temp

This project was created with [Bonk Computer Framework](https://github.com/bonkcomputer/framework) - a production-grade Solana Web3 development framework.

## 🚀 Getting Started

First, install dependencies:

```bash
pnpm install
```

Set up your environment variables:

```bash
cp .env.example .env.local
# Add your API keys to .env.local
```

Initialize Convex for real-time features:

```bash
npx convex dev
```

Run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
sol-wif-ai-vm-full-app-temp/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── convex/                # Convex real-time backend
├── components/            # React components (add with bcf add)
├── lib/                   # Utility functions
└── public/               # Static assets
```

## 🔧 Available Commands

### Framework Commands

- `bcf add wallet` - Add wallet connection components
- `bcf add swap` - Add Jupiter token swap interface
- `bcf add nft` - Add NFT minting and gallery
- `bcf add game` - Add real-time multiplayer game
- `bcf add ai` - Add AI-powered features
- `bcf add vm` - Add E2B code sandbox

### Development Commands

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run lint` - Run linting

### Convex Commands

- `npx convex dev` - Start Convex development
- `npx convex deploy` - Deploy Convex to production

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` and configure:

### Required
- `NEXT_PUBLIC_PRIVY_APP_ID` - Privy authentication
- `NEXT_PUBLIC_CONVEX_URL` - Convex real-time backend

### Optional (for enhanced features)
- `NEXT_PUBLIC_E2B_API_KEY` - E2B code sandboxes
- `NEXT_PUBLIC_HELIUS_API_KEY` - Enhanced Solana RPC
- `OPENAI_API_KEY` - AI features
- `ANTHROPIC_API_KEY` - Claude AI integration

## 🌟 Features

- ✅ **Solana Web3** - Native blockchain integration
- ✅ **Real-time Backend** - Convex for multiplayer apps
- ✅ **AI-Powered** - Anthropic Claude & OpenAI
- ✅ **Code Sandboxes** - E2B Firecracker VMs
- ✅ **Web3 Auth** - Privy.io wallet connection
- ✅ **DEX Integration** - Jupiter aggregator
- ✅ **Production Ready** - Built on Next.js 14+

## 📚 Learn More

- [Bonk Computer Framework Docs](https://github.com/bonkcomputer/framework)
- [Next.js Documentation](https://nextjs.org/docs)
- [Solana Documentation](https://docs.solana.com)
- [Convex Documentation](https://docs.convex.dev)

## 🚀 Deploy

Deploy to Vercel:

```bash
npx vercel
```

Deploy Convex:

```bash
npx convex deploy
```

## 🤝 Community

- [Discord](https://discord.gg/bonk)
- [Twitter](https://twitter.com/BonkComputer)
- [GitHub](https://github.com/bonkcomputer/framework)

Built with ❤️ by the Bonk Computer team.
