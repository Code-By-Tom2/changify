"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageContainer } from "@/components/layouts/page-container";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export default function NGOLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Check profile status
      const profileRes = await fetch("/api/ngo/profile");
      const profileData = await profileRes.json();

      if (!profileData) {
        throw new Error("Failed to fetch profile data");
      }

      toast.success("Logged in successfully!");
      
      // Check verification status
      if (!profileData.isVerified) {
        // If profile is not verified, check if details are complete
        if (!profileData.phone || !profileData.website || !profileData.location) {
          // If profile is incomplete, redirect to verification
          router.push("/ngo/verification");
        } else {
          // If profile is complete but pending verification
          router.push("/ngo/verification-pending");
        }
      } else {
        // If profile is verified, redirect to profile page
        router.push("/ngo/profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
      toast.error("Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign in to your NGO Account</h1>
          <p className="text-muted-foreground mt-2">
            Enter your credentials to access your account
          </p>
        </div>

        {error && (
          <div className="text-sm text-destructive text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/ngo/register"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Don't have an account? Sign up
          </Link>
          <div className="mt-2">
            <Link
              href="/ngo/forgot-password"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}