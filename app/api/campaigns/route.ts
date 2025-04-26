import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    console.log("Fetching active campaigns");
    
    const campaigns = await db.campaign.findMany({
      where: {
        status: {
          equals: "active",
          mode: "insensitive"
        }
      },
      include: {
        ngo: {
          select: {
            organizationName: true,
            logo: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`Found ${campaigns.length} active campaigns`);
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get NGO id from email
    const ngo = await db.nGO.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!ngo) {
      return NextResponse.json(
        { error: "NGO not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { title, targetAmount, deadline, description, upiId, city } = body;

    // Validate required fields
    if (!title || !targetAmount || !deadline || !description || !upiId || !city) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create campaign
    const campaign = await db.campaign.create({
      data: {
        title,
        targetAmount: parseFloat(targetAmount),
        deadline: new Date(deadline),
        description,
        upiId,
        city,
        ngoId: ngo.id,
        status: "active" // Ensure consistent case
      },
      include: {
        ngo: {
          select: {
            organizationName: true,
            logo: true,
          },
        },
      },
    });

    console.log("Created new campaign:", campaign.id);
    return NextResponse.json(campaign);
  } catch (error: any) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign", details: error.message },
      { status: 500 }
    );
  }
}
