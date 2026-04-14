"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPropertyById } from "@/app/actions/property";
import PropertyForm from "@/components/PropertyForm";
import { Loader2 } from "lucide-react";

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      getPropertyById(params.id as string).then((res) => {
        if (res.success) {
          setProperty(res.property);
        } else {
          console.error(res.error);
          router.push("/dashboard/properties");
        }
        setLoading(false);
      });
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading property details...</p>
      </div>
    );
  }

  if (!property) return null;

  return (
    <div className="max-w-4xl mx-auto py-6">
      <PropertyForm initialData={property} isEditing={true} />
    </div>
  );
}
