"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAgreements } from "@/app/actions/agreement";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Calendar, DollarSign, User } from "lucide-react";

export default function AgreementsPage() {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getAgreements(user.id, "LANDLORD").then((res) => {
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
        <h1 className="text-3xl font-bold tracking-tight mb-2">Active Agreements</h1>
        <p className="text-muted-foreground">Manage your finalized rental leases and tenant details.</p>
      </div>

      {agreements.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
          <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No active agreements</h3>
          <p className="text-muted-foreground">Approved applications will automatically generate lease agreements here.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {agreements.map((agreement) => (
            <Card key={agreement.id} className="shadow-sm border-gray-200">
              <CardHeader className="bg-slate-50 border-b pb-4">
                <CardTitle className="text-xl line-clamp-1">{agreement.property.title}</CardTitle>
                <CardDescription className="flex items-center mt-2">
                  <User className="w-4 h-4 mr-2" /> Tenant: <span className="font-semibold text-gray-900 ml-1">{agreement.tenant.name}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1 flex items-center"><Calendar className="w-3.5 h-3.5 mr-1"/> Start Date</p>
                    <p className="font-medium">{new Date(agreement.startDate).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1 flex items-center"><Calendar className="w-3.5 h-3.5 mr-1"/> End Date</p>
                    <p className="font-medium">{new Date(agreement.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 flex flex-col items-center justify-center">
                  <div className="flex items-center text-primary font-bold text-sm mb-1">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Monthly Rent
                  </div>
                  <span className="text-2xl font-black text-primary">GH₵ {agreement.rentAmount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
