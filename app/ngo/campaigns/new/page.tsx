"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layouts/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    targetAmount: "",
    deadline: "",
    description: "",
    upiId: "",
    city: "",
  });

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Campaign title is required");
      return false;
    }
    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      toast.error("Please enter a valid target amount");
      return false;
    }
    if (!formData.deadline) {
      toast.error("Please select a deadline");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Campaign description is required");
      return false;
    }
    if (!formData.upiId.trim()) {
      toast.error("UPI ID is required");
      return false;
    }
    if (!formData.city.trim()) {
      toast.error("City is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          targetAmount: parseFloat(formData.targetAmount),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create campaign");
      }

      toast.success("Campaign created successfully!");
      router.push("/ngo/profile"); // Redirect to profile page after success
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto py-8">
        <Card className="bg-card shadow-lg">
          <CardHeader className="text-center border-b border-border/20 pb-6">
            <CardTitle className="text-2xl font-bold">Create New Campaign</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-muted/50 p-6 rounded-lg space-y-6">
                <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Campaign Title*</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter campaign title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="bg-background"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetAmount">Target Amount (₹)*</Label>
                    <Input
                      id="targetAmount"
                      name="targetAmount"
                      type="number"
                      placeholder="Enter target amount"
                      value={formData.targetAmount}
                      onChange={handleChange}
                      required
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline*</Label>
                    <Input
                      id="deadline"
                      name="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={handleChange}
                      required
                      className="bg-background"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Campaign City*</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Enter campaign city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="bg-background"
                  />
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="upiId">UPI ID*</Label>
                  <Input
                    id="upiId"
                    name="upiId"
                    placeholder="Enter your UPI ID (e.g., yourname@bank)"
                    value={formData.upiId}
                    onChange={handleChange}
                    required
                    className="bg-background"
                  />
                  <p className="text-sm text-muted-foreground">
                    This UPI ID will be used to receive donations
                  </p>
                </div>
              </div>

              {/* Campaign Description */}
              <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                <h2 className="text-lg font-semibold mb-4">Campaign Details</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Campaign Description*</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your campaign's purpose, goals, and how the funds will be used..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="min-h-[150px] bg-background resize-none"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full py-6 text-lg"
                disabled={loading}
              >
                {loading ? "Creating Campaign..." : "Create Campaign"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
} 