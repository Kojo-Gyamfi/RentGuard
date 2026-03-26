"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAgreements } from "@/app/actions/agreement";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Calendar, DollarSign, Home } from "lucide-react";

export default function TenantLeasePage() {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getAgreements(user.id, "TENANT").then((res) => {
        if (res.success) setAgreements(res.agreements || []);
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
      <div className="bg-white p-6 rounded-lg shadow-sm border border-t-4 border-t-primary">
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Active Lease</h1>
        <p className="text-muted-foreground">View details of your current rental agreement.</p>
      </div>

      {agreements.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
          <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No active lease found</h3>
          <p className="text-muted-foreground">When an application is approved by the landlord, your lease details will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agreements.map((agreement) => (
            <Card key={agreement.id} className="shadow-sm border-gray-200">
              <CardHeader className="bg-primary/5 border-b pb-4">
                <CardTitle className="text-xl text-primary flex items-center">
                  <Home className="w-5 h-5 mr-2" /> {agreement.property.title}
                </CardTitle>
                <CardDescription className="flex items-center mt-2 text-md">
                  Landlord: <span className="font-bold text-gray-900 ml-1">{agreement.landlord.name}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3 text-primary" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lease Period</p>
                      <p className="font-medium text-md">
                        {new Date(agreement.startDate).toLocaleDateString()} - {new Date(agreement.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border">
                  <div className="flex items-center text-gray-700">
                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Monthly Rent</p>
                      <p className="font-black text-xl text-gray-900">GH₵ {agreement.rentAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-800">
                      ACTIVE
                    </span>
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
