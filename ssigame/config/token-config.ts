// Token configuration
export const TOKEN_CONFIG = {
  // Token details
  tokenAddress: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", // BSI token address
  tokenSymbol: "BSI", // Token symbol for display
  requiredAmount: 1, // Amount required to play
  network: "devnet", // "mainnet-beta", "testnet", or "devnet"
  receiverAddress: "YOUR_RECEIVER_ADDRESS", // Address to receive payments

  // Admin configuration
  adminUserId: "bsioperator", // Replace with the actual admin user ID

  // Reward configuration
  weeklyRewards: {
    1: 100, // 1st place: 100 BSI
    2: 75, // 2nd place: 75 BSI
    3: 50, // 3rd place: 50 BSI
    5: 25, // 4th-5th place: 25 BSI
    10: 10, // 6th-10th place: 10 BSI
  },

  monthlyRewards: {
    1: 500, // 1st place: 500 BSI
    2: 300, // 2nd place: 300 BSI
    3: 200, // 3rd place: 200 BSI
    5: 100, // 4th-5th place: 100 BSI
    10: 50, // 6th-10th place: 50 BSI
  },
}

// Environment variables
export const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || ""
export const NEXT_PUBLIC_PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""
