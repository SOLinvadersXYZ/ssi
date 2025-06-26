// Mock Privy server auth for development
export async function verifyPrivyToken(token: string): Promise<any | null> {
  try {
    // In a real implementation, you would use the Privy server SDK to verify the token
    // For now, we'll just return a dummy user object
    return {
      id: "dummy-user-id",
      wallet: {
        address: "0x1234567890abcdef",
      },
      email: {
        address: "user@example.com",
        verified: true,
      },
    }
  } catch (error) {
    console.error("Error verifying Privy token:", error)
    return null
  }
}
