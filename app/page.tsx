"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LockKeyhole } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      {/* Navigation Bar */}
      <nav className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <span className="text-white">Sign In</span>
          <Button
            variant="ghost"
            className="text-gray-500 hover:text-gray-400 flex items-center gap-2 p-0"
            onClick={() => router.push('/admin/login')}
          >
            <LockKeyhole className="h-4 w-4" />
            Admin
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
        <div className="text-center space-y-8 max-w-2xl mx-auto px-4">
          <h1 className="text-6xl font-bold tracking-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#9333EA] bg-clip-text text-transparent">
              Changify
            </span>
          </h1>
          <p className="text-lg text-gray-400">
            Empowering change through meaningful connections. Choose how you want to contribute.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Button 
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-8 py-6 text-lg rounded-md"
              onClick={() => router.push('/donor/login')}
            >
              Continue as Donor
            </Button>
            <Button 
              className="bg-[#1F2937] hover:bg-[#374151] text-white px-8 py-6 text-lg rounded-md"
              onClick={() => router.push('/ngo/login')}
            >
              Continue as NGO
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}