# S.S.I. (SOL SPACE INVADERS)

![S.S.I. Game Logo](public/images/bonk-logo.png)

A retro-style arcade shooter game featuring Bonk the dog defending the galaxy against invading enemies. Built with Next.js, TypeScript, and Web Canvas API.

## 🎮 Game Features

### Core Gameplay
- **Retro Pixel Art Style**: Classic arcade aesthetic with modern web technologies
- **Physics-Based Movement**: Smooth, responsive controls with acceleration and momentum
- **Multiple Weapons**: Collect and use different weapon types (spread, rapid, plasma, homing)
- **Power-Ups**: Shield, speed boost, extra lives, bombs, and time freeze
- **Boss Battles**: Challenging boss encounters at key levels
- **Progressive Difficulty**: Increasing challenge as you advance through levels
- **Achievement System**: Unlock achievements for various gameplay milestones
- **High Score Tracking**: Local and server-side leaderboard functionality

### Advanced Features
- **Token Integration**: Play using BSI tokens with Solana blockchain integration
- **User Authentication**: Secure login with Privy authentication
- **Leaderboards**: Global, weekly, and monthly high score tracking
- **Friend System**: Add friends and view their profiles
- **Challenge System**: Challenge friends to beat your high scores
- **Reward System**: Earn rewards for topping leaderboards
- **Social Sharing**: Share achievements, high scores, and victories on social media
- **Mobile Support**: Responsive design with touch controls for mobile play
- **Admin Panel**: Manage rewards and game settings (for game administrators)

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- A Vercel account (for deployment)
- A Privy account (for authentication)
- A Solana wallet (for token functionality)

### Environment Variables
Create a `.env.local` file in the root directory with the following variables:

\`\`\`
# Privy Authentication
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_JWKS_ENDPOINT=https://auth.privy.io/jwks
PRIVY_MOBILE_CLIENT_ID=your_privy_mobile_client_id
PRIVY_WEB_CLIENT_ID=your_privy_web_client_id
PRIVY_SIGING_KEY=your_privy_signing_key

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# Base URL (optional - will auto-detect in browser)
NEXT_PUBLIC_BASE_URL=https://your-deployment-url.vercel.app
\`\`\`

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/bonk-space-invaders.git
cd bonk-space-invaders
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the game.

### Deployment

The easiest way to deploy the game is using Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Configure the environment variables in the Vercel dashboard
4. Deploy

## 🎯 Game Controls

### Desktop Controls
- **WASD or Arrow Keys**: Move the ship
- **Space**: Shoot
- **B**: Use bomb
- **P or Esc**: Pause game

### Mobile Controls
- **Virtual Joystick**: Move the ship
- **Fire Button**: Shoot
- **Bomb Button**: Use bomb
- **Pause Button**: Pause game
- **Double Tap**: Alternative way to use bomb

## 🛠️ Customization

### Game Settings
Players can customize their experience through the in-game settings menu:
- Sound effects volume
- Music volume
- Difficulty level
- Vibration (mobile)
- Auto-share achievements

### Developer Customization

#### Adding New Weapons
Add new weapon types in `game-objects.ts` by extending the `ProjectileImpl` class and adding the weapon type to the `weaponTypes` array in `bonk-shooter.tsx`.

#### Adding New Enemies
Create new enemy types by extending the `EnemyImpl` class in `game-objects.ts`.

#### Adding New Levels
Add new levels to the `levels` array in `bonk-shooter.tsx` with custom parameters.

#### Adding New Achievements
Add new achievements to the `DEFAULT_ACHIEVEMENTS` array in `game-state.ts`.

## 🔧 Troubleshooting

### Common Issues

#### Game Performance Issues
- Ensure your browser is up to date
- Close other resource-intensive applications
- Try reducing the game window size
- Check if hardware acceleration is enabled in your browser

#### Mobile Controls Not Working
- Ensure you're using a modern mobile browser
- Try refreshing the page
- Check if you have "touch action" restrictions in your browser settings

#### Authentication Problems
- Clear browser cookies and cache
- Ensure your Privy credentials are correctly set up
- Check browser console for specific error messages

#### Token Payment Issues
- Ensure your Solana wallet is properly connected
- Check if you have sufficient BSI tokens
- Verify network connectivity to the Solana blockchain

### Getting Help
If you encounter issues not covered here, please:
1. Check the browser console for error messages
2. Open an issue on the GitHub repository
3. Contact the development team at support@bsi-game.com

## 🔄 Update and Maintenance

### Updating the Game
1. Pull the latest changes from the repository
2. Install any new dependencies
3. Run the development server to test changes
4. Deploy the updated version

### Backing Up Data
The game uses Vercel Blob Storage for persistent data. To back up:
1. Use the Vercel CLI to download blob data
2. Regularly export leaderboard and user data
3. Keep a backup of your environment variables

## 🧩 Architecture

### Frontend
- **Next.js**: React framework for the UI
- **TypeScript**: Type-safe JavaScript
- **Canvas API**: For game rendering
- **Tailwind CSS**: For UI styling
- **shadcn/ui**: Component library

### Backend
- **Next.js API Routes**: Server-side functionality
- **Vercel Blob Storage**: Data persistence
- **Privy**: Authentication and user management
- **Solana Web3.js**: Blockchain integration

### Data Flow
1. User authenticates via Privy
2. Game state is managed client-side during gameplay
3. High scores and achievements are saved to Vercel Blob Storage
4. Leaderboards and challenges are managed via API routes
5. Token transactions are processed via Solana blockchain

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Pixel art assets created by [Your Name]
- Sound effects from [Source]
- Music by [Artist]
- Special thanks to the Bonk community

---

Made with ❤️ for the Bonk community
\`\`\`

Now, let's create a meta.tsx file to ensure our social sharing has proper metadata:
