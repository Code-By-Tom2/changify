'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSession, signOut } from 'next-auth/react';

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Changify
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Home
            </Link>
            <Link
              href="/campaigns"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/campaigns" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Campaigns
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                <Link href="/ngo/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/ngo/login" })}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/ngo/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
} 