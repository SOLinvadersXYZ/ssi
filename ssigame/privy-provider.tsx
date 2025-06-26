"use client"
import React, { useState, useEffect } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import type { PrivyClientConfig } from "@privy-io/react-auth";

// Main wrapper component
export default function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  // State to track if we're on client-side
  const [mounted, setMounted] = useState(false);
  
  // Set mounted to true when component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Always render children during server-side rendering
  // This ensures hydration matching between server and client
  if (!mounted) {
    return <>{children}</>;
  }
  
  // Get app ID from environment variable
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  
  // If app ID is missing, show error message
  if (!appId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-4">
        <h1 className="text-2xl font-bold text-yellow-400 mb-4">Configuration Error</h1>
        <p className="mb-4">Privy App ID is not configured. Please check your environment variables.</p>
      </div>
    );
  }
  
  // Client-side rendering with Privy provider
  // Configuration for wallet login
  const config: PrivyClientConfig = {
    loginMethods: ["wallet", "email"],
    appearance: {
      theme: "dark",
      accentColor: "#F7BE38"
    }
  };

  return (
    <PrivyProvider
      appId={appId}
      config={config}
    >
      {children}
    </PrivyProvider>
  );
}
