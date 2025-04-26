import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    console.log("Starting NGO verification process");
    
    // Check if user is admin
    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (!session?.user?.email) {
      console.log("No session found");
      return NextResponse.json(
        { error: "Unauthorized - No session" },
        { status: 401 }
      );
    }

    if (session.user.email !== "admin@changify.com") {
      console.log("Non-admin user attempted access:", session.user.email);
      return NextResponse.json(
        { error: "Unauthorized - Not an admin" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("Request body:", body);

    const { ngoId, action } = body;

    if (!ngoId || !action) {
      console.log("Missing required fields:", { ngoId, action });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if NGO exists
    const ngo = await db.nGO.findUnique({
      where: { id: ngoId }
    });

    if (!ngo) {
      console.log("NGO not found:", ngoId);
      return NextResponse.json(
        { error: "NGO not found" },
        { status: 404 }
      );
    }

    console.log("Found NGO:", ngo);

    if (action === "approve") {
      console.log("Approving NGO:", ngoId);
      const updatedNGO = await db.nGO.update({
        where: { id: ngoId },
        data: {
          verificationStatus: "VERIFIED",
          isVerified: true,
        },
      });
      console.log("NGO approved:", updatedNGO);
      return NextResponse.json(updatedNGO);
    } else if (action === "reject") {
      console.log("Rejecting NGO:", ngoId);
      const updatedNGO = await db.nGO.update({
        where: { id: ngoId },
        data: {
          verificationStatus: "REJECTED",
          isVerified: false,
        },
      });
      console.log("NGO rejected:", updatedNGO);
      return NextResponse.json(updatedNGO);
    } else {
      console.log("Invalid action:", action);
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error handling NGO verification:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
