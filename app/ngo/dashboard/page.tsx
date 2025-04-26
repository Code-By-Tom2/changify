"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layouts/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Moon, Sun, Upload, Image as ImageIcon, Check, Plus, Users } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Progress } from "@/components/ui/progress";
import { useUnifiedToast } from "@/hooks/use-unified-toast";
import { useMountedTheme } from "@/hooks/use-mounted-theme";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";

interface NGO {
  id: string;
  name: string;
  email: string;
  description: string;
  location: string;
  website: string;
  phone: string;
  logo: string;
  donationNeeded: number;
  purpose: string;
  impact: string;
  createdAt: string;
  updatedAt: string;
  organizationName: string;
  isVerified: boolean;
}

interface DonationCampaign {
  title: string;
  targetAmount: number;
  purpose: string;
  deadline: string;
}

interface NgoProfile {
  id: string;
  organizationName: string;
  isVerified: boolean;
  verificationStatus: string;
}

interface Campaign {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: string;
  upiId: string;
}

export default function NGODashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [ngo, setNGO] = useState<NGO | null>(null);
  const [editedNGO, setEditedNGO] = useState<NGO | null>(null);
  const [campaign, setCampaign] = useState<DonationCampaign>({
    title: "",
    targetAmount: 0,
    purpose: "",
    deadline: ""
  });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepStatus, setStepStatus] = useState({
    basicInfo: false,
    donationNeeds: false,
    impact: false
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [profile, setProfile] = useState<NgoProfile | null>(null);
  
  const { success, error: unifiedError } = useUnifiedToast();
  const { theme, setTheme } = useTheme();
  const { mounted } = useMountedTheme();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/ngo/login");
    } else if (status === "authenticated") {
      setLoading(false);
    }
  }, [status, router]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');

    if (!userId) {
      router.push('/ngo/login');
      return;
    }

    const fetchNGO = async () => {
      try {
        const response = await fetch(`/api/ngo/${userId}`, {
          headers: {
            'x-ngo-name': userName || '',
            'x-ngo-email': userEmail || '',
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch NGO data');
        }
        
        const data = await response.json();
        
        setNGO(data);
        setEditedNGO(data);
        
        if (data.name && data.name !== userName) {
          localStorage.setItem('userName', data.name);
        }
        
        if (data.logo) {
          setImagePreview(data.logo);
        }

        // Update step status based on existing data
        setStepStatus({
          basicInfo: Boolean(data.name && data.phone && data.website && data.location),
          donationNeeds: Boolean(data.donationNeeded),
          impact: Boolean(data.purpose && data.impact)
        });
      } catch (error: any) {
        unifiedError('Failed to load NGO data');
      } finally {
        setLoading(false);
      }
    };

    const fetchCampaigns = async () => {
      try {
        const response = await fetch('/api/campaigns');
        if (!response.ok) {
          throw new Error('Failed to fetch campaigns');
        }
        const data = await response.json();
        setCampaigns(data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        unifiedError('Failed to load campaigns');
      }
    };

    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/ngo/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch NGO profile');
        }
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching NGO profile:', error);
        unifiedError('Failed to load NGO profile');
      }
    };

    fetchNGO();
    fetchCampaigns();
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/ngo/login" });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const { url: imageUrl } = await uploadToCloudinary(file);

      if (imageUrl) {
        setEditedNGO(prev => prev ? {...prev, logo: imageUrl} : null);
        await handleSaveAndNext();
      }
    } catch (error: any) {
      unifiedError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveAndNext = async () => {
    if (!editedNGO) return;

    try {
      const response = await fetch(`/api/ngo/${editedNGO.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedNGO),
      });

      if (!response.ok) {
        throw new Error('Failed to update NGO details');
      }

      setNGO(editedNGO);
      
      // Update step status
      if (currentStep === 1) {
        setStepStatus(prev => ({ ...prev, basicInfo: true }));
      } else if (currentStep === 2) {
        setStepStatus(prev => ({ ...prev, donationNeeds: true }));
      } else if (currentStep === 3) {
        setStepStatus(prev => ({ ...prev, impact: true }));
      }

      // Move to next step
      if (currentStep < 3) {
        setCurrentStep(prev => prev + 1);
      }

      success('Information saved successfully');
    } catch (error: any) {
      unifiedError('Error saving information');
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.isVerified) {
      unifiedError('Your NGO profile must be verified before creating campaigns');
      return;
    }

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...campaign,
          ngoId: profile.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }

      success('Campaign created successfully');
      setCampaign({
        title: "",
        targetAmount: 0,
        purpose: "",
        deadline: ""
      });
    } catch (err) {
      unifiedError('Failed to create campaign');
    }
  };

  const renderStepIndicator = () => (
    <div className="space-y-4 mb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Setup Progress</h2>
        <span className="text-sm text-muted-foreground">
          {Math.round(
            (Object.values(stepStatus).filter(Boolean).length / 3) * 100
          )}% Complete
        </span>
      </div>
      <Progress 
        value={(Object.values(stepStatus).filter(Boolean).length / 3) * 100}
        className="h-2 mb-6"
      />
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === step
                    ? 'bg-primary text-primary-foreground'
                    : stepStatus[step === 1 ? 'basicInfo' : step === 2 ? 'donationNeeds' : 'impact']
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {stepStatus[step === 1 ? 'basicInfo' : step === 2 ? 'donationNeeds' : 'impact'] ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step
                )}
              </div>
              {step < 3 && (
                <div className={`w-20 h-1 mx-2 ${
                  stepStatus[step === 1 ? 'basicInfo' : 'donationNeeds']
                    ? 'bg-green-500'
                    : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-2">
        <p className="text-sm text-muted-foreground">
          {currentStep === 1 ? 'Basic Information' : 
           currentStep === 2 ? 'Donation Needs' : 
           'Impact & Description'}
        </p>
      </div>
    </div>
  );

  if (!mounted) return null;

  if (loading || status === "loading") {
    return (
      <PageContainer className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </PageContainer>
    );
  }

  if (!session) {
    router.push("/ngo/login");
    return null;
  }

  return (
    <PageContainer className="p-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>NGO Dashboard</CardTitle>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Welcome, {session.user?.name}</h2>
              <p className="text-muted-foreground">Email: {session.user?.email}</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => router.push("/ngo/campaigns/new")}>
                Add Campaign
              </Button>
              <Button variant="outline" onClick={() => router.push("/ngo/profile")}>
                View Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}