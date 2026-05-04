"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getLandlordApplications, getTenantApplications, updateApplicationStatus, cancelApplication, acceptOffer } from "@/app/actions/application";
import { getUserProfile } from "@/app/actions/user";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { User, Mail, Phone, Calendar, Home, MapPin, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useCallback } from "react";

interface Application {
  id: string;
  status: string;
  createdAt: string | Date;
  message?: string | null;
  property: {
    title: string;
    price: number;
    location?: string;
    images?: string[];
    landlord?: {
      name: string;
      email: string;
      phone?: string | null;
    };
  };
  tenant?: {
    name: string;
    email: string;
    phone?: string | null;
  };
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadApplications = useCallback(async (userRole: string) => {
    if (!user) return;
    setLoading(true);
    try {
      if (userRole === "LANDLORD") {
        const res = await getLandlordApplications(user.id);
        if (res.success) setApplications(res.applications ?? []);
      } else if (userRole === "TENANT") {
        const res = await getTenantApplications(user.id);
        if (res.success) setApplications(res.applications ?? []);
      }
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      getUserProfile(user.id).then((res) => {
        if (res.success && res.user) {
          setRole(res.user.role);
          loadApplications(res.user.role);
        } else {
          setLoading(false);
        }
      });
    }
  }, [user, loadApplications]);

  const handleUpdate = async (id: string, status: "APPROVED" | "REJECTED") => {
    if (!user) return;
    
    const nextStatus = status === "APPROVED" ? "OFFERED" : "REJECTED";

    toast(
      status === "APPROVED"
        ? "Approve this application?"
        : "Reject this application?",
      {
        description: nextStatus === "OFFERED"
          ? "This will send a formal offer to the tenant for their review."
          : "The tenant will be notified that their application was declined.",
        duration: Infinity,
        action: {
          label: nextStatus === "OFFERED" ? "Yes, Send Offer" : "Yes, Reject",
          onClick: async () => {
            setProcessingId(id);
            const res = await updateApplicationStatus(id, nextStatus, user.id);
            if (res.success) {
              setApplications(apps => apps.map(app => app.id === id ? { ...app, status: nextStatus } : app));
              toast.success(
                nextStatus === "OFFERED" ? "Offer sent!" : "Application rejected",
                {
                  description: nextStatus === "OFFERED"
                    ? "The tenant has been notified to review the offer."
                    : "The tenant has been notified about this decision.",
                }
              );
            } else {
              toast.error("Failed to update application", {
                description: res.error || "Please try again.",
              });
            }
            setProcessingId(null);
          },
        },
        cancel: {
          label: "Cancel",
          onClick: () => {},
        },
      }
    );
  };

  const handleCancel = async (id: string) => {
    if (!user) return;
    
    toast("Withdraw this application?", {
      description: "This will permanently remove your application from the landlord's list.",
      duration: Infinity,
      action: {
        label: "Yes, Withdraw",
        onClick: async () => {
          setProcessingId(id);
          const res = await cancelApplication(id, user.id);
          if (res.success) {
            setApplications(apps => apps.filter(app => app.id !== id));
            toast.success("Application withdrawn", {
              description: "Your application has been successfully removed.",
            });
          } else {
            toast.error("Failed to withdraw", {
              description: res.error || "Please try again.",
            });
          }
          setProcessingId(null);
        },
      },
      cancel: {
        label: "Keep It",
        onClick: () => {},
      },
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "APPROVED":
        return { color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle, iconColor: "text-green-500" };
      case "OFFERED":
        return { color: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock, iconColor: "text-blue-500" };
      case "REJECTED":
        return { color: "bg-red-50 text-red-700 border-red-200", icon: XCircle, iconColor: "text-red-500" };
      default:
        return { color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock, iconColor: "text-amber-500" };
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  // ─── TENANT VIEW ───────────────────────────────────────────────
  if (role === "TENANT") {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-t-4 border-t-primary">
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Applications</h1>
          <p className="text-muted-foreground">Track the status of your rental applications.</p>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
            <Home className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No applications yet</h3>
            <p className="text-muted-foreground mb-4">You haven&apos;t applied to any properties yet.</p>
            <Link href="/dashboard/properties/browse" className={cn(buttonVariants({ variant: "default" }), "mt-4")}>
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {applications.map((app) => {
              const statusConfig = getStatusConfig(app.status);
              const StatusIcon = statusConfig.icon;
              return (
                <Card key={app.id} className="overflow-hidden shadow-sm border-gray-200 bg-white hover:shadow-md transition-shadow">
                  {/* Property Image */}
                  {app.property?.images?.[0] && (
                    <div className="h-40 w-full bg-gray-100 relative">
                      <Image src={app.property.images[0]} alt={app.property.title} fill className="object-cover" />
                      <div className="absolute top-3 right-3">
                        <Badge className={`${statusConfig.color} border font-bold text-xs shadow-sm flex items-center gap-1`}>
                          <StatusIcon className={`w-3 h-3 ${statusConfig.iconColor}`} />
                          {app.status}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <CardContent className="p-5">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{app.property.title}</h3>
                    
                    {app.property?.location && (
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-primary" />
                        <span className="truncate">{app.property.location}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border mb-3">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Monthly Rent</p>
                        <p className="font-black text-lg text-primary">GH₵ {app.property.price?.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Landlord</p>
                        <p className="text-sm font-medium text-gray-900">{app.property.landlord?.name || 'N/A'}</p>
                        <div className="flex flex-col items-end gap-1 mt-1">
                          <a href={`mailto:${app.property.landlord?.email}`} className="text-[10px] text-primary hover:underline flex items-center">
                            <Mail className="w-2.5 h-2.5 mr-1" />
                            {app.property.landlord?.email}
                          </a>
                          {app.property.landlord?.phone && (
                            <a href={`tel:${app.property.landlord?.phone}`} className="text-[10px] text-gray-500 hover:underline flex items-center">
                              <Phone className="w-2.5 h-2.5 mr-1" />
                              {app.property.landlord?.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {app.message && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Your Message</p>
                        <p className="text-sm text-gray-600 italic line-clamp-2">&quot;{app.message}&quot;</p>
                      </div>
                    )}

                    <div className="mt-3 flex items-center text-xs text-gray-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </div>

                    {app.status === "OFFERED" && (
                      <div className="mt-4 pt-4 border-t space-y-2">
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm"
                          onClick={async () => {
                            if (!user) return;
                            setProcessingId(app.id);
                            const res = await acceptOffer(app.id, user.id);
                            if (res.success) {
                              toast.success("Offer accepted!", {
                                description: "Your lease agreement has been generated. Please proceed to make the initial payment.",
                              });
                              loadApplications("TENANT");
                            } else {
                              toast.error("Failed to accept offer", { description: res.error });
                            }
                            setProcessingId(null);
                          }}
                          disabled={processingId === app.id}
                        >
                          {processingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          Accept Offer
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors font-semibold flex items-center justify-center gap-1"
                          onClick={() => handleCancel(app.id)}
                          disabled={processingId === app.id}
                        >
                          {processingId === app.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          Decline & Withdraw
                        </Button>
                      </div>
                    )}

                    {app.status === "PENDING" && (
                      <div className="mt-4 pt-4 border-t">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors font-semibold flex items-center justify-center gap-1"
                          onClick={() => handleCancel(app.id)}
                          disabled={processingId === app.id}
                        >
                          {processingId === app.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          Withdraw Application
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ─── LANDLORD VIEW ─────────────────────────────────────────────
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
          {applications.map((app) => {
            const statusConfig = getStatusConfig(app.status);
            const StatusIcon = statusConfig.icon;
            return (
              <Card key={app.id} className="shadow-sm border-gray-200">
                <CardHeader className="bg-slate-50/50 border-b pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={`${statusConfig.color} border font-bold text-xs shadow-sm flex items-center gap-1`}>
                      <StatusIcon className={`w-3 h-3 ${statusConfig.iconColor}`} />
                      {app.status}
                    </Badge>
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
                      <span className="font-medium text-gray-900">{app.tenant?.name}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <a href={`mailto:${app.tenant?.email ?? ""}`} className="text-gray-600 hover:text-primary transition-colors">
                        {app.tenant?.email}
                      </a>
                    </div>
                    {app.tenant?.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <a href={`tel:${app.tenant.phone}`} className="text-gray-600 hover:text-primary transition-colors">
                          {app.tenant.phone}
                        </a>
                      </div>
                    )}
                    
                    <div className="mt-4 pt-3 border-t">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Applicant Message</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded italic border">
                        &quot;{app.message || 'No additional message.'}&quot;
                      </p>
                    </div>
                  </div>
                </CardContent>
                
                {app.status === "PENDING" && (
                  <CardFooter className="flex justify-between gap-3 bg-gray-50 border-t py-4">
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleUpdate(app.id, "REJECTED")}
                      disabled={processingId === app.id}
                    >
                      {processingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Decline"}
                    </Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleUpdate(app.id, "APPROVED")}
                      disabled={processingId === app.id}
                    >
                      {processingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Offer"}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
