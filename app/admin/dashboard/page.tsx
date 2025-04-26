"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Building, Mail, Phone, FileText, MapPin, Globe, Target } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface NGO {
  id: string;
  organizationName: string;
  email: string;
  createdAt: string;
  verificationStatus: string;
  phone: string;
  website: string;
  location: string;
  purpose: string;
  impact: string;
}

export default function AdminDashboard() {
  const [pendingNGOs, setPendingNGOs] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated") {
      console.log("User is not authenticated, redirecting to login");
      router.push("/admin/login");
      return;
    }

    if (session?.user?.email !== "admin@changify.com") {
      console.log("User is not admin, redirecting to home");
      router.push("/");
      return;
    }

    console.log("User is admin, fetching NGOs");
    fetchPendingNGOs();
  }, [status, session, router]);

  const fetchPendingNGOs = async () => {
    try {
      setLoading(true);
      console.log("Fetching NGOs from dashboard");
      
      const response = await fetch("/api/admin/pending-ngos");
      console.log("API Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("API Error:", errorData);
        throw new Error(errorData?.error || "Failed to fetch pending NGOs");
      }
      
      const data = await response.json();
      console.log("Received NGOs:", data);
      
      if (!Array.isArray(data)) {
        console.error("Invalid response format:", data);
        throw new Error("Invalid response format from server");
      }
      
      setPendingNGOs(data);
    } catch (error) {
      console.error("Error in fetchPendingNGOs:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch pending NGOs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  const handleVerification = async (ngoId: string, action: "approve" | "reject") => {
    try {
      console.log(`Attempting to ${action} NGO with ID:`, ngoId);
      
      const response = await fetch("/api/admin/verify-ngo", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.user?.email}`
        },
        body: JSON.stringify({ ngoId, action }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to update NGO status");
      }

      const data = await response.json();
      console.log("Verification data:", data);
      
      toast({
        title: "Success",
        description: `NGO ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      });

      await fetchPendingNGOs();
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process verification",
        variant: "destructive",
      });
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!session || session.user?.email !== "admin@changify.com") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">NGO Verification Dashboard</h1>
            <p className="text-gray-400 mt-1">Review and verify NGO applications</p>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-gray-400">
              Pending Verifications: <span className="text-white">{pendingNGOs.length}</span>
            </p>
            <Button
              onClick={fetchPendingNGOs}
              variant="outline"
              className="border-[#1F2937] hover:bg-[#1F2937]"
            >
              Refresh
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-[#1F2937] hover:bg-[#1F2937]"
            >
              Logout
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-400">Loading...</p>
          </div>
        ) : pendingNGOs.length === 0 ? (
          <Card className="bg-[#0F1115] border border-[#1F2937] p-8">
            <div className="text-center">
              <p className="text-gray-400 text-lg">No pending NGO verifications</p>
              <p className="text-gray-500 mt-2">All NGO applications have been processed</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingNGOs.map((ngo) => (
              <Card
                key={ngo.id}
                className="bg-[#0F1115] border border-[#1F2937] p-6"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white text-lg font-semibold">
                        {ngo.organizationName}
                      </h3>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-gray-400">
                          <Mail className="w-4 h-4 mr-2" />
                          {ngo.email}
                        </div>
                        {ngo.phone && (
                          <div className="flex items-center text-gray-400">
                            <Phone className="w-4 h-4 mr-2" />
                            {ngo.phone}
                          </div>
                        )}
                        {ngo.location && (
                          <div className="flex items-center text-gray-400">
                            <MapPin className="w-4 h-4 mr-2" />
                            {ngo.location}
                          </div>
                        )}
                        {ngo.website && (
                          <div className="flex items-center text-gray-400">
                            <Globe className="w-4 h-4 mr-2" />
                            <a
                              href={ngo.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {ngo.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleVerification(ngo.id, "approve")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleVerification(ngo.id, "reject")}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>

                  {ngo.purpose && (
                    <div className="mt-4">
                      <h4 className="text-white font-medium mb-2">Purpose</h4>
                      <p className="text-gray-400">{ngo.purpose}</p>
                    </div>
                  )}

                  {ngo.impact && (
                    <div className="mt-4">
                      <h4 className="text-white font-medium mb-2">Impact</h4>
                      <p className="text-gray-400">{ngo.impact}</p>
                    </div>
                  )}

                  <div className="text-gray-500 text-sm mt-4">
                    Applied: {new Date(ngo.createdAt).toLocaleDateString()}
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