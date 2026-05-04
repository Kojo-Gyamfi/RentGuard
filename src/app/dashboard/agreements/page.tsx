"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAgreements } from "@/app/actions/agreement";
import { getUserProfile } from "@/app/actions/user";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Calendar, DollarSign, User, Mail, Phone, MapPin } from "lucide-react";
import { useCallback } from "react";

interface Agreement {
  id: string;
  property: {
    title: string;
    location: string;
  };
  tenant: {
    name: string;
    email: string;
    phone: string | null;
  };
  landlord: {
    name: string;
    email: string;
    phone: string | null;
  };
  startDate: Date | string;
  endDate: Date | string;
  rentAmount: number;
}

export default function AgreementsPage() {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  const loadAgreements = useCallback(async (userRole: "LANDLORD" | "TENANT") => {
    if (!user) return;
    const res = await getAgreements(user.id, userRole);
    if (res.success) setAgreements(res.agreements as Agreement[] || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      getUserProfile(user.id).then((res) => {
        if (res.success && res.user) {
          const userRole = res.user.role;
          setRole(userRole);
          loadAgreements(userRole as "LANDLORD" | "TENANT");
        } else {
          setLoading(false);
        }
      });
    }
  }, [user, loadAgreements]);

  if (loading) return (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-t-4 border-t-primary">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Active Agreements</h1>
        <p className="text-muted-foreground">Manage your finalized rental leases and contact details.</p>
      </div>

      {agreements.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
          <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No active agreements</h3>
          <p className="text-muted-foreground">Approved applications will automatically generate lease agreements here.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {agreements.map((agreement) => {
            const otherParty = role === "LANDLORD" ? agreement.tenant : agreement.landlord;
            const otherPartyLabel = role === "LANDLORD" ? "Tenant" : "Landlord";

            return (
              <Card key={agreement.id} className="shadow-sm border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="bg-slate-50 border-b pb-4">
                  <CardTitle className="text-xl line-clamp-1 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-primary" />
                    {agreement.property.title}
                  </CardTitle>
                  <CardDescription className="flex items-center mt-2 text-gray-600">
                    <MapPin className="w-3.5 h-3.5 mr-1.5" />
                    {agreement.property.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {/* Other Party Info */}
                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex items-center mb-2">
                      <div className="bg-primary/10 p-1.5 rounded-full mr-2">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none mb-0.5">{otherPartyLabel}</p>
                        <p className="font-bold text-gray-900 leading-none">{otherParty.name}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 mt-3 pt-3 border-t">
                      <a href={`mailto:${otherParty.email}`} className="flex items-center text-sm text-gray-600 hover:text-primary transition-colors">
                        <Mail className="w-3.5 h-3.5 mr-2 text-gray-400" />
                        {otherParty.email}
                      </a>
                      {otherParty.phone && (
                        <a href={`tel:${otherParty.phone}`} className="flex items-center text-sm text-gray-600 hover:text-primary transition-colors">
                          <Phone className="w-3.5 h-3.5 mr-2 text-gray-400" />
                          {otherParty.phone}
                        </a>
                      )}
                    </div>
                  </div>

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
            );
          })}
        </div>
      )}
    </div>
  );
}
