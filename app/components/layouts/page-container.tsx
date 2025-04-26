"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LockKeyhole } from "lucide-react";

export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-[#0A0A0B] border-b border-[#1F2937] px-4 py-4 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-xl font-bold text-white">
              Changify
            </Link>
            <Link href="/" className="text-white hover:text-gray-300">
              Home
            </Link>
            <Link href="/campaigns" className="text-gray-400 hover:text-white">
              Campaigns
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/admin/login">
              <Button variant="ghost" className="text-gray-400 hover:text-white flex items-center gap-2">
                <LockKeyhole className="h-4 w-4" />
                Admin
              </Button>
            </Link>
            <Link href="/donor/login">
              <Button variant="ghost" className="text-white hover:text-gray-300">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content with padding for navbar */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
} 