import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { email, phone, website, city, logo } = body;

    // Validate required fields
    if (!email || !phone || !city) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if NGO exists
    const ngo = await db.nGO.findUnique({ where: { email: session.user.email } });
    if (!ngo) {
      return NextResponse.json(
        { error: 'NGO not found' },
        { status: 404 }
      );
    }

    // Update NGO profile
    const updatedNgo = await db.nGO.update({
      where: { email: session.user.email },
      data: {
        phone,
        location: city,
        website,
        logo,
        verificationStatus: "PENDING",
        isVerified: false,
      },
    });

    return NextResponse.json(updatedNgo);
  } catch (error) {
    console.error('Error in NGO verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 