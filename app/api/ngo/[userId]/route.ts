import { NextResponse } from 'next/server';

// Mock data for demonstration - replace with your actual database query
const mockNGOData = {
  id: "1",
  name: "Example NGO",
  email: "contact@examplengo.org",
  description: "We are dedicated to making a positive impact in our community.",
  location: "New York, USA",
  website: "https://examplengo.org",
  phone: "+1 (555) 123-4567",
  logo: "/logo.png",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-03-19T00:00:00.000Z"
};

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Get the userId from the URL parameters
    const userId = params.userId;

    // TODO: Replace this with actual database query
    // For now, return mock data
    const ngoData = {
      id: userId,
      name: "Example NGO", // This will be overridden by the stored name
      email: "",  // This will be overridden by the stored email
      description: "We are dedicated to making a positive impact in our community.",
      location: "New York, USA",
      website: "https://examplengo.org",
      phone: "+1 (555) 123-4567",
      logo: "",
      donationNeeded: 0,
      purpose: "",
      impact: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Get the stored NGO details from localStorage (if available)
    const storedName = request.headers.get('x-ngo-name');
    const storedEmail = request.headers.get('x-ngo-email');

    if (storedName) {
      ngoData.name = storedName;
    }
    if (storedEmail) {
      ngoData.email = storedEmail;
    }

    return NextResponse.json(ngoData);
  } catch (error) {
    console.error('Error fetching NGO data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NGO data' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    const updates = await request.json();

    // TODO: Update this with actual database update logic
    // For now, just return the updated data
    return NextResponse.json(updates);
  } catch (error) {
    console.error('Error updating NGO data:', error);
    return NextResponse.json(
      { error: 'Failed to update NGO data' },
      { status: 500 }
    );
  }
} 