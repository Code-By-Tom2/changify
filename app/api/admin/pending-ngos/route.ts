import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== "admin@changify.com") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("Fetching pending NGOs from database");
    
    const pendingNGOs = await prisma.nGO.findMany({
      where: {
        verificationStatus: {
          equals: "PENDING",
          mode: "insensitive"
        }
      },
      select: {
        id: true,
        organizationName: true,
        email: true,
        createdAt: true,
        verificationStatus: true,
        phone: true,
        website: true,
        location: true,
        purpose: true,
        impact: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Found pending NGOs:", pendingNGOs.length);
    
    return NextResponse.json(pendingNGOs);
  } catch (error) {
    console.error("Error fetching pending NGOs:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending NGOs" },
      { status: 500 }
    );
  }
}
