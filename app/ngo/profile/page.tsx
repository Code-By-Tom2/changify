"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layouts/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Plus, Users, Calendar, Target, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface NGOProfile {
  email: string;
  phone: string;
  website: string;
  city: string;
  logo: string;
  organizationName: string;
  purpose: string;
  verificationStatus: string;
  isVerified: boolean;
}

interface Campaign {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: string;
}

export default function NGOProfilePage() {
  const [profile, setProfile] = useState<NGOProfile | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns/ngo');
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch profile
        const profileRes = await fetch("/api/ngo/profile");
        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        const { ngo: profileData } = await profileRes.json();
        setProfile(profileData);

        // Only check verification status if not already verified
        if (!profileData.isVerified) {
          if (profileData.verificationStatus === "PENDING") {
            router.push("/ngo/verification");
            return;
          }

          if (profileData.verificationStatus === "REJECTED") {
            toast.error("Your NGO verification has been rejected. Please contact support.");
            return;
          }
        }

        // Fetch campaigns if verified
        if (profileData.isVerified) {
          await fetchCampaigns();
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to load data");
        if (!profile?.isVerified) {
          router.push("/ngo/verification");
        }
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchData();
    }
  }, [session, router, profile?.isVerified]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <p className="text-gray-400">No profile found</p>
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Profile Header */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Profile Picture */}
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/10">
                  {profile.logo ? (
                    <Image
                      src={profile.logo}
                      alt="NGO Logo"
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Users size={40} className="text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <h1 className="text-3xl font-bold">{profile.organizationName}</h1>
                    {profile.isVerified ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4">{profile.city}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p>{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p>{profile.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Website</p>
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {profile.website}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{profile.purpose}</p>
          </CardContent>
        </Card>

        {/* Campaigns Section - Only show if verified */}
        {profile.isVerified && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Campaigns</h2>
              <Link href="/ngo/campaigns/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{campaign.title}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Target className="w-4 h-4 mr-2" />
                        Target: ₹{campaign.targetAmount}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        Deadline: {new Date(campaign.deadline).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${(campaign.currentAmount / campaign.targetAmount) * 100}%`
                            }}
                          />
                        </div>
                        <span className="ml-2 text-xs">
                          {Math.round((campaign.currentAmount / campaign.targetAmount) * 100)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Collaboration Section - Only show if verified */}
        {profile.isVerified && (
          <Card>
            <CardHeader>
              <CardTitle>NGO Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6">
                <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Connect with Other NGOs</h3>
                <p className="text-muted-foreground mb-4">
                  Collaborate with other NGOs to create bigger impact
                </p>
                <Link href="/ngo/collaborate">
                  <Button variant="outline">
                    Find NGOs to Collaborate
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
} 