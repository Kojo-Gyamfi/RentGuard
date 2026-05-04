"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAllAvailableProperties, applyForProperty } from "@/app/actions/property";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import { MapPin, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  images: string[];
  landlord: {
    name: string;
    email: string;
  };
}

export default function BrowsePropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("I am interested in this property and would like to arrange a viewing or proceed with the application.");

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async (locationFilter?: string) => {
    setLoading(true);
    const res = await getAllAvailableProperties({ location: locationFilter });
    if (res.success) setProperties(res.properties ?? []);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProperties(search);
  };

  const handleApply = async (propertyId: string) => {
    if (!user) return;
    setSubmitting(true);
    try {
      const res = await applyForProperty(propertyId, message, user.id);
      if (res.success) {
        toast.success("Application submitted!", {
          description: "The landlord will review your application and get back to you soon.",
        });
        setApplyingTo(null);
        setMessage("I am interested in this property and would like to arrange a viewing or proceed with the application.");
      } else {
        toast.error("Application failed", {
          description: res.error || "Could not submit your application. Please try again.",
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An unexpected error occurred. Please try again later.";
      toast.error("Something went wrong", {
        description: errorMsg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-t-4 border-t-primary">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Browse Properties</h1>
        <p className="text-muted-foreground mb-6">Find your ideal rental property and apply instantly.</p>
        
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
          <Input 
            placeholder="Search by city, neighborhood, etc..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 shadow-sm"
          />
          <Button type="submit" className="px-6 font-semibold shadow-sm"><Search className="w-4 h-4 mr-2"/>Search</Button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center p-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
          <h3 className="text-xl font-bold text-gray-800 mb-2">No properties found</h3>
          <p className="text-muted-foreground">We couldn&apos;t find any available properties matching your criteria.</p>
          {search && (
            <Button variant="link" onClick={() => { setSearch(""); loadProperties(); }} className="mt-4 text-primary">
              Clear filters and show all
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((prop) => (
            <Card key={prop.id} className="overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border-gray-200 bg-white flex flex-col">
              <div className="h-56 w-full bg-gray-100 relative group">
                <Image src={prop.images[0]} alt={prop.title} fill className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1.5 text-sm font-black rounded-full shadow-md">
                  GH₵ {prop.price.toLocaleString()} <span className="text-gray-500 text-xs font-medium">/mo</span>
                </div>
              </div>
              <CardContent className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">{prop.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-3 bg-gray-50 w-fit px-2 py-1 rounded-md">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-primary" />
                  <span className="truncate">{prop.location}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-auto">{prop.description}</p>
              </CardContent>
              <CardFooter className="p-5 bg-gray-50/50 border-t flex-col items-start gap-4">
                <div className="text-xs text-gray-500 font-medium">
                  Listed by {prop.landlord?.name || 'Landlord'}
                </div>
                {applyingTo === prop.id ? (
                  <div className="w-full space-y-3 animate-in slide-in-from-top-2">
                    <Textarea 
                      placeholder="Add a message to the landlord..." 
                      value={message} 
                      onChange={(e) => setMessage(e.target.value)} 
                      className="text-sm border-primary/20 focus-visible:ring-primary/30 min-h-[80px] resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2 w-full">
                      <Button
                        className="flex-1 font-semibold"
                        onClick={() => handleApply(prop.id)}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
                        ) : (
                          "Submit Application"
                        )}
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => setApplyingTo(null)} disabled={submitting}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <Button className="w-full font-bold shadow-sm" onClick={() => setApplyingTo(prop.id)}>Apply for Rental</Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
