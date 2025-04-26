import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { User } from "next-auth";

// Extend the built-in User type to include role
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name?: string;
    role: string;
  }
  
  interface Session {
    user: User & {
      id: string;
      role: string;
    };
  }
}

type UserType = {
  id: string;
  email: string;
  password: string;
  role: string;
  name?: string;
  organizationName?: string;
};

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Please provide process.env.NEXTAUTH_SECRET");
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        try {
          // Check for admin login
          if (credentials.email === "admin@changify.com") {
            if (credentials.password === "adminc1234") {
              return {
                id: "admin",
                email: "admin@changify.com",
                name: "Admin",
                role: "admin",
              };
            }
            throw new Error("Invalid admin password");
          }

          // Try to find user in NGO table
          let user: UserType | null = await db.nGO.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              password: true,
              organizationName: true,
              role: true,
            },
          });

          // If not found in NGO table, try donor table
          if (!user) {
            user = await db.donor.findUnique({
              where: { email: credentials.email },
              select: {
                id: true,
                email: true,
                password: true,
                name: true,
                role: true,
              },
            });
          }

          if (!user) {
            throw new Error("User not found");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.organizationName || user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
}; 