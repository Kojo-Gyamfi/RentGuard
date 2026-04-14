"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getPropertiesByLandlord } from "@/app/actions/property";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, MapPin } from "lucide-react";

export default function PropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getPropertiesByLandlord(user.id).then((res) => {
        if (res.success) setProperties(res.properties || []);
        else console.error(res.error);
        setLoading(false);
      });
    }
  }, [user]);

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
                <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" />
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
                <div className="flex justify-between items-end mt-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Monthly Rent</p>
                    <p className="font-black text-xl text-primary">GH₵ {prop.price.toLocaleString()}</p>
                  </div>
                  <Link href={`/dashboard/properties/${prop.id}/edit`}>
                    <Button variant="outline" size="sm" className="hover:bg-primary hover:text-white transition-colors">Edit</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Need to import Home for the empty state
function Home(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}
