import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { campaignId, amount, donorId } = await req.json();

    if (!campaignId || !amount || !donorId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if campaign exists
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Create donation record
    const donation = await db.donation.create({
      data: {
        amount,
        campaignId,
        donorId,
      },
    });

    // Update campaign's current amount
    await db.campaign.update({
      where: { id: campaignId },
      data: {
        currentAmount: {
          increment: amount,
        },
      },
    });

    return NextResponse.json(donation);
  } catch (error) {
    console.error("Error processing donation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 