"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Copy, Search, Filter, SortAsc, SortDesc } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Campaign {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  upiId: string;
  ngo: {
    organizationName: string;
    logo: string;
  };
}

export default function DonorDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [isDonationDialogOpen, setIsDonationDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    filterAndSortCampaigns();
  }, [campaigns, searchQuery, sortOrder]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      console.log("Fetching campaigns from API");
      
      const response = await fetch("/api/campaigns");
      console.log("API Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("API Error:", errorData);
        throw new Error(errorData?.error || "Failed to fetch campaigns");
      }
      
      const data = await response.json();
      console.log("Received campaigns:", data);
      
      if (!Array.isArray(data)) {
        console.error("Invalid response format:", data);
        throw new Error("Invalid response format from server");
      }
      
      setCampaigns(data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCampaigns = () => {
    let filtered = [...campaigns];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (campaign) =>
          campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campaign.ngo.organizationName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.deadline).getTime();
      const dateB = new Date(b.deadline).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setFilteredCampaigns(filtered);
  };

  const handleDonate = async (campaignId: string) => {
    try {
      const amount = parseFloat(donationAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid donation amount");
      }

      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId,
          amount,
          donorId: session?.user?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to process donation");
      }

      toast({
        title: "Success",
        description: "Thank you for your donation!",
      });

      // Refresh campaigns to update amounts
      await fetchCampaigns();
      setIsDonationDialogOpen(false);
      setDonationAmount("");
    } catch (error) {
      console.error("Donation error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process donation",
        variant: "destructive",
      });
    }
  };

  const copyUPIId = (upiId: string) => {
    navigator.clipboard.writeText(upiId);
    toast({
      title: "Success",
      description: "UPI ID copied to clipboard",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <p className="text-gray-400">Loading campaigns...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Active Campaigns</h1>
          <p className="text-gray-400 mt-1">Support NGOs by contributing to their campaigns</p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1F2937] border-[#374151] text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select
              value={sortOrder}
              onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
            >
              <SelectTrigger className="w-[180px] bg-[#1F2937] border-[#374151] text-white">
                <SelectValue placeholder="Sort by deadline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Deadline: Soonest</SelectItem>
                <SelectItem value="desc">Deadline: Latest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredCampaigns.length === 0 ? (
          <Card className="bg-[#0F1115] border border-[#1F2937] p-8">
            <div className="text-center">
              <p className="text-gray-400">No campaigns found</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.id} className="bg-[#0F1115] border border-[#1F2937] p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-white text-lg font-semibold">{campaign.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{campaign.ngo.organizationName}</p>
                  </div>
                  
                  <p className="text-gray-400 text-sm">{campaign.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Target: ₹{campaign.targetAmount}</span>
                      <span className="text-gray-400">Raised: ₹{campaign.currentAmount}</span>
                    </div>
                    <Progress 
                      value={(campaign.currentAmount / campaign.targetAmount) * 100} 
                      className="h-2"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-gray-400 text-sm">
                      Deadline: {new Date(campaign.deadline).toLocaleDateString()}
                    </p>
                    <Dialog open={isDonationDialogOpen && selectedCampaign?.id === campaign.id} onOpenChange={setIsDonationDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setIsDonationDialogOpen(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Donate
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#0F1115] border border-[#1F2937]">
                        <DialogHeader>
                          <DialogTitle className="text-white">Make a Donation</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <Label htmlFor="amount" className="text-gray-200">Donation Amount (₹)</Label>
                            <Input
                              id="amount"
                              type="number"
                              value={donationAmount}
                              onChange={(e) => setDonationAmount(e.target.value)}
                              className="bg-[#1F2937] border-[#374151] text-white"
                              placeholder="Enter amount"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-200">UPI ID</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                value={campaign.upiId}
                                readOnly
                                className="bg-[#1F2937] border-[#374151] text-white"
                              />
                              <Button
                                onClick={() => copyUPIId(campaign.upiId)}
                                variant="outline"
                                className="border-[#1F2937] hover:bg-[#1F2937]"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleDonate(campaign.id)}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            Confirm Donation
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
