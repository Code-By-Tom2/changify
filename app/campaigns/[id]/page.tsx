"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layouts/page-container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "next-themes";
import { Moon, Sun, ArrowLeft, Calendar, Target, Users, Heart, Plus } from "lucide-react";
import Image from "next/image";
import { CampaignUpdateDialog } from "@/components/campaign-update-dialog";

interface CampaignUpdate {
  id: string;
  content: string;
  createdAt: string;
}

interface Campaign {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  purpose: string;
  deadline: string;
  ngoId: string;
  ngoName: string;
  ngoLogo: string;
  createdAt: string;
  updates: CampaignUpdate[];
}

export default function CampaignPage({ params }: { params: { id: string } }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNgoOwner, setIsNgoOwner] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const fetchCampaign = async () => {
    try {
      const response = await fetch(`/api/campaigns/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch campaign');
      }
      const data = await response.json();
      setCampaign(data);

      // Check if current user is the NGO owner
      const userId = localStorage.getItem('userId');
      setIsNgoOwner(userId === data.ngoId);
    } catch (error) {
      console.error('Error fetching campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [params.id]);

  if (loading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaign details...</p>
        </div>
      </PageContainer>
    );
  }

  if (!campaign) {
    return (
      <PageContainer className="flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Campaign Not Found</h2>
          <p className="mt-2 text-muted-foreground">The campaign you're looking for doesn't exist.</p>
          <Button 
            className="mt-4" 
            onClick={() => router.push('/ngo/profile')}
          >
            Return to Profile
          </Button>
        </div>
      </PageContainer>
    );
  }

  const progress = (campaign.currentAmount / campaign.targetAmount) * 100;
  const daysLeft = Math.max(0, Math.ceil(
    (new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  ));

  return (
    <PageContainer className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-10 bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/ngo/profile')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Campaign Details</h1>
            </div>
            <div className="flex items-center gap-4">
              {isNgoOwner && (
                <Button
                  variant="outline"
                  onClick={() => router.push('/ngo/dashboard')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Campaign
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-6 mb-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {campaign.ngoLogo && (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={campaign.ngoLogo}
                      alt={campaign.ngoName}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-3xl font-bold text-foreground">{campaign.title}</h2>
                  <p className="text-muted-foreground">by {campaign.ngoName}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Target Amount</p>
                    <p className="font-semibold">${campaign.targetAmount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Raised</p>
                    <p className="font-semibold">${campaign.currentAmount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Days Left</p>
                    <p className="font-semibold">{daysLeft} days</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-xl font-semibold mb-2">About This Campaign</h3>
                <p className="text-muted-foreground">{campaign.purpose}</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Donors</h3>
              <div className="space-y-4">
                <p className="text-center text-muted-foreground">No donations yet.</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Campaign Updates</h3>
                <CampaignUpdateDialog
                  campaignId={campaign.id}
                  onUpdatePosted={fetchCampaign}
                  isNgoOwner={isNgoOwner}
                />
              </div>
              <div className="space-y-4">
                {campaign.updates && campaign.updates.length > 0 ? (
                  campaign.updates.map((update) => (
                    <div key={update.id} className="border-b pb-4 last:border-0">
                      <p className="text-muted-foreground mb-2">{update.content}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(update.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">
                    {isNgoOwner 
                      ? "Post your first update to keep donors informed!"
                      : "No updates yet. Check back soon!"}
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
} 