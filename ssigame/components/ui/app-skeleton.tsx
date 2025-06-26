import { Skeleton } from "./skeleton"

// Navbar skeleton component
export function NavbarSkeleton() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Skeleton className="h-6 w-12 bg-gray-700" />
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-16 bg-gray-700 my-6" />
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Skeleton className="h-8 w-24 bg-gray-700" />
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Skeleton className="h-8 w-8 bg-gray-700" />
          </div>
        </div>
      </div>
    </nav>
  )
}

// Page content skeleton
export function PageSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Skeleton className="h-8 w-64 mb-2 bg-gray-700" />
      <Skeleton className="h-4 w-96 mb-6 bg-gray-700" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border border-gray-700 rounded-lg">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-32 bg-gray-700" />
              <Skeleton className="h-6 w-20 bg-gray-700" />
            </div>
            <Skeleton className="h-4 w-full mt-2 bg-gray-700" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Home page skeleton
export function HomeSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-4">
      <Skeleton className="h-16 w-48 mb-6 bg-gray-700" />
      <Skeleton className="h-8 w-64 mb-8 bg-gray-700" />
      
      {/* Wallet status skeleton */}
      <div className="mb-8">
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-600 w-80">
          <Skeleton className="h-6 w-32 mb-2 bg-gray-700" />
          <Skeleton className="h-4 w-48 bg-gray-700" />
        </div>
      </div>

      {/* Button skeletons */}
      <div className="flex flex-col md:flex-row gap-4 mb-12">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-32 bg-gray-700" />
        ))}
      </div>

      {/* Description skeleton */}
      <div className="max-w-2xl text-center space-y-2">
        <Skeleton className="h-4 w-full bg-gray-700" />
        <Skeleton className="h-4 w-3/4 bg-gray-700 mx-auto" />
        <Skeleton className="h-4 w-1/2 bg-gray-700 mx-auto" />
      </div>
    </div>
  )
}

// Game loading skeleton
export function GameSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <div className="text-yellow-500 text-2xl font-mono mb-4">Loading Game...</div>
      <div className="w-64 h-4 bg-gray-800 rounded-full overflow-hidden mb-4">
        <div className="h-full bg-yellow-500 animate-pulse" style={{ width: "60%" }} />
      </div>
      <div className="space-y-2 text-center">
        <Skeleton className="h-4 w-48 bg-gray-700" />
        <Skeleton className="h-4 w-32 bg-gray-700" />
      </div>
    </div>
  )
}

// Leaderboard skeleton
export function LeaderboardSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Skeleton className="h-8 w-48 mb-2 bg-gray-700" />
      <Skeleton className="h-4 w-64 mb-6 bg-gray-700" />
      
      {/* Tabs skeleton */}
      <div className="flex space-x-1 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 bg-gray-700" />
        ))}
      </div>

      {/* Leaderboard entries skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-4 border border-gray-700 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Skeleton className="w-8 h-8 rounded-full bg-gray-700 mr-3" />
                <Skeleton className="h-6 w-32 bg-gray-700" />
              </div>
              <div className="flex items-center">
                <div className="text-right mr-4">
                  <Skeleton className="h-6 w-20 bg-gray-700 mb-1" />
                  <Skeleton className="h-4 w-16 bg-gray-700" />
                </div>
              </div>
            </div>
            <Skeleton className="h-3 w-24 bg-gray-700 mt-2" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Generic app loading skeleton
export function AppSkeleton() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <NavbarSkeleton />
      <PageSkeleton />
    </div>
  )
} 