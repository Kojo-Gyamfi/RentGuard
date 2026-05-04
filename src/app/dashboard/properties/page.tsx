"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getPropertiesByLandlord, deleteProperty } from "@/app/actions/property";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, MapPin, Home, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  images: string[];
  status: string;
}

export default function PropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      getPropertiesByLandlord(user.id).then((res) => {
        if (res.success) setProperties(res.properties || []);
        else {
          toast.error("Failed to load properties", {
            description: res.error || "Please try again later.",
          });
        }
        setLoading(false);
      });
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    
    toast("Delete this property?", {
      description: "This action cannot be undone. You cannot delete a property with active rental agreements.",
      duration: Infinity,
      action: {
        label: "Yes, Delete",
        onClick: async () => {
          setDeletingId(id);
          const res = await deleteProperty(id, user.id);
          if (res.success) {
            setProperties(prev => prev.filter(p => p.id !== id));
            toast.success("Property deleted successfully.");
          } else {
            toast.error("Failed to delete property", {
              description: res.error || "Please try again.",
            });
          }
          setDeletingId(null);
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  if (loading) return (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-lg border shadow-sm border-t-4 border-t-primary gap-4 sm:gap-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Properties</h1>
          <p className="text-muted-foreground mt-1">Manage your property listings and status</p>
        </div>
        <Link href="/dashboard/properties/new">
          <Button className="flex items-center gap-2 px-6 h-11 text-md font-medium"><Plus className="w-5 h-5"/> Add New Property</Button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Home className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No properties listed yet</h3>
          <p className="text-muted-foreground mb-6">Start by adding your first rental property to the platform.</p>
          <Link href="/dashboard/properties/new">
            <Button>Add Property Now</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {properties.map((prop) => (
            <Card key={prop.id} className="overflow-hidden shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 bg-white border-gray-200">
              <div className="h-52 w-full bg-gray-100 relative">
                <Image src={prop.images[0]} alt={prop.title} fill className="object-cover" />
                <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full text-xs font-bold shadow-sm">
                  {prop.status}
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="font-bold text-xl mb-2 line-clamp-1">{prop.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <MapPin className="w-4 h-4 mr-1.5 shrink-0" />
                  <span className="line-clamp-1">{prop.location}</span>
                </div>
                <div className="flex justify-between items-end mt-4 pt-4 border-t gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Monthly Rent</p>
                    <p className="font-black text-xl text-primary">GH₵ {prop.price.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/properties/${prop.id}/edit`}>
                      <Button variant="outline" size="sm" className="hover:bg-primary hover:text-white transition-colors">Edit</Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(prop.id)}
                      disabled={deletingId === prop.id}
                      className="text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200 transition-colors"
                    >
                      {deletingId === prop.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


