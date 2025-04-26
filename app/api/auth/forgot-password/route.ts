import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateVerificationCode } from "@/lib/utils";
import bcrypt from "bcryptjs";

// In-memory store for verification codes (replace with Redis in production)
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const ngo = await db.nGO.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!ngo) {
      return NextResponse.json(
        { message: "No account found with this email" },
        { status: 404 }
      );
    }

    // Generate a 6-digit verification code
    const code = generateVerificationCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes from now

    // Store the verification code
    verificationCodes.set(email, { code, expiresAt });

    // TODO: Send email with verification code in production
    console.log(`Verification code for ${email}: ${code}`);

    return NextResponse.json({
      message: "Verification code sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { message: "Email, code, and new password are required" },
        { status: 400 }
      );
    }

    const storedCode = verificationCodes.get(email);

    if (!storedCode) {
      return NextResponse.json(
        { message: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    if (storedCode.expiresAt < Date.now()) {
      verificationCodes.delete(email);
      return NextResponse.json(
        { message: "Verification code has expired" },
        { status: 400 }
      );
    }

    if (storedCode.code !== code) {
      return NextResponse.json(
        { message: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.nGO.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Remove used verification code
    verificationCodes.delete(email);

    return NextResponse.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
} 