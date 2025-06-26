"use client";

import AdminRewardsPanel from "@/components/admin-rewards-panel"
import Link from "next/link"

export default function AdminRewardsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-3xl font-bold text-yellow-400 mb-4 md:mb-0 font-mono">ADMIN REWARDS PANEL</h1>
          <div className="space-x-4">
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors font-mono"
            >
              ADMIN HOME
            </Link>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors font-mono"
            >
              MAIN SITE
            </Link>
          </div>
        </header>

        <AdminRewardsPanel />
      </div>
    </div>
  )
}
