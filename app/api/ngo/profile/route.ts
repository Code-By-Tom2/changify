import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET endpoint to fetch NGO profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const ngo = await db.nGO.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        organizationName: true,
        phone: true,
        location: true,
        website: true,
        logo: true,
        donationNeeded: true,
        purpose: true,
        impact: true,
        isVerified: true,
        verificationStatus: true,
        role: true,
        campaigns: {
          select: {
            id: true,
            title: true,
            description: true,
            // add other campaign fields you want
          }
        }
      }
    });

    if (!ngo) {
      return NextResponse.json(
        { error: "NGO not found" },
        { status: 404 }
      );
    }

    const campaigns = await db.campaign.findMany({ where: { ngoId: ngo.id } });

    return NextResponse.json({ ngo, campaigns });
  } catch (error) {
    console.error("Error fetching NGO profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update NGO profile
export async function PATCH(req: Request) {
  try {
    const { userId, ...updateData } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updatedProfile = await db.nGO.update({
      where: {
        id: userId,
      },
      data: {
        organizationName: updateData.organizationName,
        phone: updateData.phone,
        location: updateData.location,
        website: updateData.website,
        logo: updateData.logo,
        donationNeeded: updateData.donationNeeded,
        purpose: updateData.purpose,
        impact: updateData.impact,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating NGO profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 