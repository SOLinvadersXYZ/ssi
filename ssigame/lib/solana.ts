import { Connection, PublicKey, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { TOKEN_CONFIG } from "@/config/token-config"
import { createTransferCheckedInstruction, getAssociatedTokenAddress, getMint } from "@solana/spl-token"

// Create a connection to the Solana network
const getConnection = () => {
  const endpoint =
    TOKEN_CONFIG.network === "mainnet-beta"
      ? "https://api.mainnet-beta.solana.com"
      : TOKEN_CONFIG.network === "testnet"
        ? "https://api.testnet.solana.com"
        : "https://api.devnet.solana.com"

  return new Connection(endpoint, "confirmed")
}

// Check if a user has the required token balance
export async function checkTokenBalance(walletAddress: string): Promise<boolean> {
  // DEVELOPMENT MODE: Always return true to allow gameplay without tokens
  // IMPORTANT: Remove this before production deployment
  console.log("DEV MODE: Bypassing token check for wallet", walletAddress)
  return true;
  
  /* PRODUCTION CODE - Uncomment for production
  try {
    const connection = getConnection()
    const userPublicKey = new PublicKey(walletAddress)
    const tokenPublicKey = new PublicKey(TOKEN_CONFIG.tokenAddress)

    // Get the associated token account
    const tokenAccount = await getAssociatedTokenAddress(tokenPublicKey, userPublicKey)

    try {
      // Get token account info
      const tokenAccountInfo = await connection.getTokenAccountBalance(tokenAccount)

      // Check if the user has enough tokens
      const balance = Number(tokenAccountInfo.value.amount) / Math.pow(10, tokenAccountInfo.value.decimals)
      return balance >= TOKEN_CONFIG.requiredAmount
    } catch (error) {
      // If there's an error, the token account might not exist
      console.error("Error checking token balance:", error)
      return false
    }
  } catch (error) {
    console.error("Failed to check token balance:", error)
    return false
  }
  */
}

// Create a transaction to pay for the game
export async function createPaymentTransaction(
  walletAddress: string,
  receiverAddress: string,
): Promise<Transaction | null> {
  try {
    const connection = getConnection()
    const userPublicKey = new PublicKey(walletAddress)
    const receiverPublicKey = new PublicKey(receiverAddress)
    const tokenPublicKey = new PublicKey(TOKEN_CONFIG.tokenAddress)

    // Get the associated token accounts
    const senderTokenAccount = await getAssociatedTokenAddress(tokenPublicKey, userPublicKey)

    const receiverTokenAccount = await getAssociatedTokenAddress(tokenPublicKey, receiverPublicKey)

    // Get the token mint to determine decimals
    const mint = await getMint(connection, tokenPublicKey)

    // Create a new transaction
    const transaction = new Transaction()

    // Add the transfer instruction
    transaction.add(
      createTransferCheckedInstruction(
        senderTokenAccount,
        tokenPublicKey,
        receiverTokenAccount,
        userPublicKey,
        BigInt(TOKEN_CONFIG.requiredAmount * Math.pow(10, mint.decimals)),
        mint.decimals,
      ),
    )

    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = userPublicKey

    return transaction
  } catch (error) {
    console.error("Failed to create payment transaction:", error)
    return null
  }
}

// Get SOL balance
export async function getSolBalance(walletAddress: string): Promise<number> {
  try {
    const connection = getConnection()
    const publicKey = new PublicKey(walletAddress)
    const balance = await connection.getBalance(publicKey)
    return balance / LAMPORTS_PER_SOL
  } catch (error) {
    console.error("Failed to get SOL balance:", error)
    return 0
  }
}
