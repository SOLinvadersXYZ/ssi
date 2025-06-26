"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAppLoading } from "@/hooks/use-app-loading";
import { NavbarSkeleton, AppSkeleton } from "@/components/ui/app-skeleton";
import { LoadingProgress } from "@/components/loading-progress";

// Dynamically import components with SSR disabled
const PrivyProviderWrapper = dynamic(() => import("@/privy-provider"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
    <div className="text-yellow-500 text-xl font-mono">Initializing...</div>
  </div>
});

const Navbar = dynamic(() => import("@/components/navbar").then(mod => ({ default: mod.Navbar })), {
  ssr: false,
  loading: () => <NavbarSkeleton />
});

// Client providers component with enhanced loading management
export function ClientProviders({ children }: { children: React.ReactNode }) {
  // Use state to track client-side mounting
  const [mounted, setMounted] = useState(false);
  const { isAppReady, isNavbarReady, loadingProgress, error } = useAppLoading();
  
  // Only set mounted to true after component mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Always return the same structure for server and initial client render
  // This prevents hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <NavbarSkeleton />
        <main>
          <div className="flex items-center justify-center min-h-screen">
            <LoadingProgress 
              progress={30} 
              title="S.S.I."
              subtitle="SOL SPACE INVADERS"
            />
          </div>
        </main>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl font-mono mb-4">Error Loading App</div>
          <div className="text-gray-400 font-mono">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-yellow-500 text-black rounded font-mono"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show loading state with synchronized navbar and content
  if (!isAppReady) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        {isNavbarReady ? <Navbar /> : <NavbarSkeleton />}
        <main>
          <div className="flex items-center justify-center min-h-screen">
            <LoadingProgress 
              progress={loadingProgress} 
              title="S.S.I."
              subtitle="SOL SPACE INVADERS"
            />
          </div>
        </main>
      </div>
    );
  }
  
  // App is ready - render everything
  return (
    <PrivyProviderWrapper>
      <Navbar />
      <main>{children}</main>
    </PrivyProviderWrapper>
  );
}
