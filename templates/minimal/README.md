# {{PROJECT_NAME}} - Minimal Template

A minimal Solana application built with the Bonk Computer Framework. Perfect for getting started with Solana development.

## Features

- **Basic Solana Integration** - Connect and interact with Solana wallets
- **Wallet Connection** - Support for multiple Solana wallets
- **Balance Display** - View SOL balance
- **Minimal UI** - Clean, simple interface
- **Ready to Extend** - Easy to add more features

## Tech Stack

- **Next.js 14** - React framework with App Router
- **Solana Web3.js** - Blockchain interactions
- **Tailwind CSS** - Styling and responsive design
- **TypeScript** - Type safety

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
   - Configure network (mainnet/devnet)

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
| `HELIUS_API_KEY` | Enhanced RPC performance | No |
| `QUICKNODE_API_KEY` | Alternative RPC provider | No |

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
│   ├── page.tsx           # Main page with wallet integration
│   └── globals.css        # Global styles
├── components/            # React components (add as needed)
├── lib/                   # Utility libraries (add as needed)
├── public/               # Static assets
├── .env.example          # Environment variables template
├── next.config.js        # Next.js configuration
└── package.json          # Dependencies and scripts
```

## Adding More Features

This minimal template is designed to be extended. Use the Bonk Computer Framework CLI to add components:

```bash
# Add wallet connection component
bcf add wallet

# Add token swapping
bcf add swap

# Add NFT functionality
bcf add nft

# Add AI features
bcf add ai
```

## Extending the Application

### Common Next Steps

1. **Add Token Operations**
   - Token transfers
   - Token balance checking
   - Custom token support

2. **Add DeFi Features**
   - Token swapping via Jupiter
   - Liquidity provision
   - Yield farming

3. **Add NFT Support**
   - NFT display and trading
   - Minting capabilities
   - Collection management

4. **Add Gaming Features**
   - Player authentication
   - In-game assets
   - Leaderboards

### Code Examples

**Send SOL Transaction:**
```javascript
// Add to your component
const sendTransaction = async () => {
  // Implementation here
  console.log('Sending SOL...')
}
```

**Check Balance:**
```javascript
// Add balance checking logic
const checkBalance = async () => {
  // Implementation here
  console.log('Checking balance...')
}
```

## Customization

### Styling
- Modify `app/globals.css` for custom themes
- Update gradient colors in layout and components
- Customize button and card styles

### Layout
- Edit `app/layout.tsx` for global layout changes
- Modify `app/page.tsx` for main page structure
- Add new pages in the app directory

## Resources

- [Solana Documentation](https://docs.solana.com/)
- [Solana Web3.js Guide](https://docs.solana.com/developing/clients/javascript-api)
- [Next.js Documentation](https://nextjs.org/docs)
- [Bonk Computer Framework](https://github.com/bonkcomputer/framework)

## Support

For support and questions:
- Framework Issues: [GitHub Issues](https://github.com/bonkcomputer/framework/issues)
- Solana Support: [Solana Discord](https://discord.gg/solana)
- Next.js Help: [Next.js Discord](https://nextjs.org/discord)

## License

MIT License - see LICENSE file for details.
