"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile } from "@/app/actions/user";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldAlert, UploadCloud, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      getUserProfile(user.id).then((res) => {
        if (res.success) setProfile(res.user);
      });
    }
  }, [user]);

  const handleUpload = async () => {
    if (!file || !user) return;
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('verifications')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('verifications').getPublicUrl(filePath);

      const res = await fetch('/api/user/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supabaseUserId: user.id, ghanaCardUrl: data.publicUrl })
      });

      if (res.ok) {
        toast.success("Ghana Card uploaded!", {
          description: "Your document is now awaiting admin approval.",
        });
        setProfile({ ...profile, ghanaCardUrl: data.publicUrl });
        setFile(null);
      } else {
        throw new Error("Failed to update profile.");
      }
    } catch (error: any) {
      toast.error("Upload failed", {
        description: `${error.message}. Ensure you have a public bucket named 'verifications' in Supabase Storage.`,
      });
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-t-4 border-t-primary">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile and verify your identity.</p>
      </div>

      <Card className="shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle>Identity Verification</CardTitle>
          <CardDescription>
            {profile.isVerified 
              ? "Your identity has been successfully verified by a RentGuard admin."
              : "Upload your Ghana Card to verify your identity. This is required for safety."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 bg-gray-50 p-5 rounded-xl border">
            {profile.isVerified ? (
              <><ShieldCheck className="w-10 h-10 text-green-500" /> <div><h4 className="font-bold text-gray-900 text-lg">Verified User</h4><p className="text-sm text-gray-500">You have full access to RentGuard features.</p></div></>
            ) : profile.ghanaCardUrl ? (
               <><ShieldAlert className="w-10 h-10 text-yellow-500" /> <div><h4 className="font-bold text-gray-900 text-lg">Verification Pending</h4><p className="text-sm text-gray-500">Your card is under review by our administrators.</p></div></>
            ) : (
               <><ShieldAlert className="w-10 h-10 text-red-500" /> <div><h4 className="font-bold text-gray-900 text-lg">Unverified Access</h4><p className="text-sm text-gray-500">Please upload your Ghana Card to lift account restrictions.</p></div></>
            )}
          </div>

          {!profile.isVerified && !profile.ghanaCardUrl && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex gap-3 text-yellow-800 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p><strong>Admin Setup Required:</strong> To test this feature locally, you must create a public bucket named exactly <code>verifications</code> in your Supabase Storage dashboard.</p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors bg-white">
                <input
                  type="file"
                  id="document"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="document" className="cursor-pointer flex flex-col items-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <UploadCloud className="w-7 h-7 text-primary" />
                  </div>
                  <span className="font-bold text-gray-900 text-lg">Click to select file</span>
                  <span className="text-sm text-gray-500 mt-1">PNG, JPG, or PDF (Max 5MB)</span>
                </label>
              </div>
              
              {file && (
                <div className="flex justify-between items-center bg-blue-50 text-blue-900 p-4 rounded-xl border border-blue-100 font-medium text-sm shadow-sm">
                  <span className="truncate mr-4">{file.name}</span>
                  <Button onClick={handleUpload} disabled={uploading} className="shadow-md">
                    {uploading ? "Uploading..." : "Submit Securely"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
