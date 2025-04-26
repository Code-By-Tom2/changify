import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ngo", "donor"]).default("donor"),
  name: z.string().optional(),
  organizationName: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);
    const { email, password, role, name, organizationName } = validatedData;

    // Check if user exists in either NGO or Donor table
    const existingNGO = await db.nGO.findUnique({
      where: { email },
    });

    const existingDonor = await db.donor.findUnique({
      where: { email },
    });

    if (existingNGO || existingDonor) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "ngo") {
      if (!organizationName) {
        return NextResponse.json(
          { message: "Organization name is required for NGO registration" },
          { status: 400 }
        );
      }

      const ngo = await db.nGO.create({
        data: {
          email,
          password: hashedPassword,
          organizationName,
          role: "ngo",
        },
      });

      return NextResponse.json(
        { message: "NGO registered successfully", id: ngo.id },
        { status: 201 }
      );
    } else {
      if (!name) {
        return NextResponse.json(
          { message: "Name is required for donor registration" },
          { status: 400 }
        );
      }

      const donor = await db.donor.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: "donor",
        },
      });

      return NextResponse.json(
        { message: "Donor registered successfully", id: donor.id },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 