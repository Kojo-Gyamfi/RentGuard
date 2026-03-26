"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getLandlordApplications, updateApplicationStatus } from "@/app/actions/application";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, Home } from "lucide-react";

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getLandlordApplications(user.id).then((res) => {
        if (res.success) setApplications(res.applications || []);
        setLoading(false);
      });
    }
  }, [user]);

  const handleUpdate = async (id: string, status: "APPROVED" | "REJECTED") => {
    if (!user) return;
    const confirmMessage = status === "APPROVED" 
      ? "Are you sure you want to approve this tenant? This will automatically generate a 1-year rental agreement and set the property to RENTED."
      : "Are you sure you want to reject this application?";
      
    if (!window.confirm(confirmMessage)) return;

    const res = await updateApplicationStatus(id, status, user.id);
    if (res.success) {
      setApplications(apps => apps.map(app => app.id === id ? { ...app, status } : app));
    } else {
      alert(res.error || "Failed to update application.");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-t-4 border-t-primary">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Rental Applications</h1>
        <p className="text-muted-foreground">Review incoming tenant applications and manage approvals.</p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Applications Yet</h3>
          <p className="text-muted-foreground">When tenants apply for your properties, they will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => (
            <Card key={app.id} className="shadow-sm border-gray-200">
              <CardHeader className="bg-slate-50/50 border-b pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className={`px-2.5 py-1 text-xs font-bold rounded shadow-sm ${
                    app.status === 'APPROVED' ? 'bg-green-500 text-white' : 
                    app.status === 'REJECTED' ? 'bg-red-500 text-white' : 'bg-yellow-400 text-yellow-900'
                  }`}>
                    {app.status}
                  </div>
                  <span className="text-sm text-gray-500 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="text-lg flex items-center">
                  <Home className="w-4 h-4 mr-2 text-primary" />
                  {app.property.title}
                </CardTitle>
                <CardDescription className="font-semibold text-primary">
                  GH₵ {app.property.price?.toLocaleString()} / month
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900">{app.tenant.name}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">{app.tenant.email}</span>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Applicant Message</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded italic border">
                      "{app.message || 'No additional message.'}"
                    </p>
                  </div>
                </div>
              </CardContent>
              
              {app.status === "PENDING" && (
                <CardFooter className="flex justify-between gap-3 bg-gray-50 border-t py-4">
                  <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleUpdate(app.id, "REJECTED")}>
                    Decline
                  </Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdate(app.id, "APPROVED")}>
                    Approve
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
