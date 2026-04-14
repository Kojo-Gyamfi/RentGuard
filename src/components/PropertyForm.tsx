"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createProperty, updateProperty } from "@/app/actions/property";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/Textarea";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface PropertyFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function PropertyForm({ initialData, isEditing = false }: PropertyFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    location: initialData?.location || "",
    price: initialData?.price?.toString() || "",
    images: initialData?.images || [], // Existing image URLs
  });
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // New files to upload
  const [previews, setPreviews] = useState<string[]>([]); // Preview URLs for new files
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeSelectedImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_: File, i: number) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews((prev) => prev.filter((_: string, i: number) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_: string, i: number) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError("");

    try {
      const uploadedUrls = [...formData.images];

      // Upload new files only on save
      if (selectedFiles.length > 0) {
        setUploading(true);
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `property-images/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('properties')
            .upload(filePath, file);

          if (uploadError) throw new Error("Failed to upload some images.");

          const { data: { publicUrl } } = supabase.storage
            .from('properties')
            .getPublicUrl(filePath);
          
          uploadedUrls.push(publicUrl);
        }
        setUploading(false);
      }

      const data = {
        ...formData,
        price: parseFloat(formData.price),
        images: uploadedUrls,
      };

      let res;
      if (isEditing && initialData?.id) {
        res = await updateProperty(initialData.id, data, user.id);
      } else {
        res = await createProperty(data, user.id);
      }

      if (res.success) {
        router.push("/dashboard/properties");
        router.refresh();
      } else {
        throw new Error(res.error || `Failed to ${isEditing ? 'update' : 'create'} property.`);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <Card className="shadow-sm border-t-4 border-t-primary overflow-hidden">
      <CardHeader className="bg-slate-50/50">
        <CardTitle className="text-2xl">{isEditing ? "Edit Property" : "Add New Property"}</CardTitle>
        <CardDescription>
          {isEditing 
            ? "Update the details of your property listing." 
            : "Fill in the details to list your property on RentGuard."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">Property Title</Label>
            <Input
              id="title"
              placeholder="e.g. Modern 2-Bedroom Apartment in Cantonments"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="h-11 border-slate-200 focus:ring-primary/20 transition-all font-medium"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
            <Textarea
              id="description"
              className="min-h-[120px] border-slate-200 focus:ring-primary/20 transition-all resize-none"
              placeholder="Describe the amenities, nearby attractions, and rental conditions..."
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-semibold">Monthly Rent (GH₵)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">GH₵</span>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="2500"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="h-11 pl-12 border-slate-200 focus:ring-primary/20 transition-all font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-semibold">Location (City/Neighborhood)</Label>
              <Input
                id="location"
                placeholder="e.g. East Legon, Accra"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className="h-11 border-slate-200 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-semibold">Property Images</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* Existing Images */}
              {formData.images.map((url: string, index: number) => (
                <div key={`existing-${index}`} className="relative aspect-square rounded-xl overflow-hidden group border-2 border-slate-100 bg-slate-50 shadow-sm transition-all hover:border-primary/30">
                  <img src={url} alt={`Existing ${index + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-md transform translate-y-[-4px] group-hover:translate-y-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* New Previews */}
              {previews.map((url: string, index: number) => (
                <div key={`new-${index}`} className="relative aspect-square rounded-xl overflow-hidden group border-2 border-primary/20 bg-primary/5 shadow-sm transition-all hover:border-primary/40">
                  <img src={url} alt={`New Preview ${index + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors" />
                  <button
                    type="button"
                    onClick={() => removeSelectedImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-md transform translate-y-[-4px] group-hover:translate-y-0 z-10"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary/80 text-white text-[10px] font-bold rounded uppercase tracking-wider backdrop-blur-sm">
                    Pending
                  </div>
                </div>
              ))}
              
              <label 
                className={`relative aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  uploading || loading
                    ? "bg-slate-50 border-slate-200 cursor-not-allowed" 
                    : "bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/40 hover:shadow-inner"
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                  disabled={uploading || loading}
                />
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                ) : (
                  <>
                    <div className="p-3 bg-primary/10 rounded-full mb-2 group-hover:scale-110 transition-transform">
                      <ImagePlus className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500">Upload Photos</span>
                  </>
                )}
              </label>
            </div>
            <p className="text-[11px] text-slate-400 font-medium italic">
              * Add high-quality professional photos of your property to attract more tenants.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              <span>{error}</span>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-4 border-t px-6 py-5 bg-slate-50/50">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={loading}
            className="hover:bg-slate-200/50 font-medium text-slate-500"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading || uploading} 
            className="px-8 h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] font-bold"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isEditing ? "Updating..." : "Publishing..."}</span>
              </span>
            ) : (
              isEditing ? "Save Changes" : "Publish"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
