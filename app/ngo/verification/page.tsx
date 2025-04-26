"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageContainer } from "@/components/layouts/page-container";
import { Upload } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function NGOVerificationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    website: "",
    city: "",
    logo: "",
    description: "",
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = "";
    if (imagePreview) {
      // Upload to Cloudinary
      const uploadRes = await fetch("/api/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imagePreview }),
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        toast.error("Image upload failed");
        setLoading(false);
        return;
      }
      imageUrl = uploadData.url;
    }

    // Now send imageUrl to your verification API
    const response = await fetch("/api/ngo/verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        city: formData.city,
        description: formData.description,
        logo: imageUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save NGO details");
    }

    toast.success("Profile details submitted successfully!");
    
    // Redirect to verification pending page
    router.push("/ngo/verification-pending");
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
        <div className="bg-card rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Complete Your NGO Profile</h1>
            <p className="text-muted-foreground mt-2">
              Please provide your NGO details for verification
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Profile Picture */}
            <div className="bg-muted/50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
              <div className="flex flex-col items-center gap-4">
                {imagePreview && (
                  <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-primary/10">
                    <Image
                      src={imagePreview}
                      alt="Profile preview"
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                )}
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="profile-picture"
                  />
                  <Label
                    htmlFor="profile-picture"
                    className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Photo
                  </Label>
                </div>
              </div>
            </div>

            {/* Section 2: Contact Information */}
            <div className="bg-muted/50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address*</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ngo@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number*</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website Link</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://your-ngo-website.com"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City*</Label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="Enter your city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 3: NGO Description */}
            <div className="bg-muted/50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">NGO Description</h2>
              <div className="space-y-2">
                <Label htmlFor="description">Tell us about your NGO*</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your NGO's mission, vision, and the impact you want to create..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="min-h-[150px] resize-none"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-6 text-lg"
              disabled={loading}
            >
              {loading ? "Saving..." : "Complete Profile"}
            </Button>
          </form>
        </div>
      </div>
    </PageContainer>
  );
} 