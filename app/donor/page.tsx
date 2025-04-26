"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Campaign {
  id: string;
  title: string;
  description: string;
  target: number;
  collected: number;
  upiId: string;
  ngo: {
    organizationName: string;
    email: string;
  };
}

export default function DonorDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/campaigns");
      if (!response.ok) {
        console.error("Response not ok:", await response.text());
        throw new Error("Failed to fetch campaigns");
      }
      const data = await response.json();
      console.log("Fetched campaigns:", data);
      setCampaigns(data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast({
        title: "Error",
        description: "Failed to fetch campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyUPIId = (upiId: string) => {
    navigator.clipboard.writeText(upiId);
    toast({
      title: "Success",
      description: "UPI ID copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Active Campaigns</h1>
          <p className="text-gray-400 mt-1">Support NGOs by contributing to their campaigns</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-400">Loading campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="bg-[#0F1115] border border-[#1F2937] p-8">
            <div className="text-center">
              <p className="text-gray-400">No active campaigns at the moment</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="bg-[#0F1115] border border-[#1F2937] p-6">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {campaign.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {campaign.description}
                </p>

                <div className="mb-4">
                  <p className="text-gray-400">NGO: {campaign.ngo.organizationName}</p>
                  <p className="text-gray-500 text-sm">{campaign.ngo.email}</p>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{Math.round((campaign.collected / campaign.target) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (campaign.collected / campaign.target) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>₹{campaign.collected.toLocaleString()}</span>
                    <span>₹{campaign.target.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  onClick={() => copyUPIId(campaign.upiId)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Copy UPI ID: {campaign.upiId}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 