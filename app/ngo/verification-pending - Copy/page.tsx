"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import Image from "next/image";

export default function VerificationPendingPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Changify
          </span>
        </Link>
      </div>

      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-gray-400 hover:text-white"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>

      <Card className="w-full max-w-md p-8 bg-[#0F1115] border border-[#1F2937] text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-yellow-500/10 p-3">
          <AlertCircle className="h-12 w-12 text-yellow-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">
          Verification Pending
        </h1>

        <p className="text-gray-400 mb-6">
          Thank you for registering with Changify! Your NGO account is currently under review. 
          Our team will verify your account within 2-3 business days to ensure the authenticity 
          of your organization.
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-[#1A1C23] rounded-lg">
            <p className="text-sm text-gray-400">
              During this time, you can:
            </p>
            <ul className="text-sm text-gray-400 list-disc list-inside mt-2">
              <li>Update your verification details if needed</li>
              <li>Explore Changify&apos;s features</li>
              <li>Prepare your campaign materials</li>
            </ul>
          </div>

          <p className="text-sm text-gray-500">
            Need to update your verification details?{" "}
            <Link
              href="/ngo/verification"
              className="text-blue-500 hover:text-blue-400 hover:underline"
            >
              Click here
            </Link>
          </p>

          <Link href="/" className="block">
            <Button 
              variant="outline" 
              className="w-full bg-[#1F2937] text-white border-[#374151] hover:bg-[#374151] hover:text-white transition-colors"
            >
              Return to Changify Home
            </Button>
          </Link>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Questions? Contact support@changify.com
        </div>
      </Card>
    </div>
  );
}