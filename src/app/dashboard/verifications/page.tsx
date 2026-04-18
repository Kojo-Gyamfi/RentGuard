"use client";

import { useEffect, useState } from "react";
import { getPendingVerifications, approveVerification } from "@/app/actions/admin";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, User, Mail, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function VerificationsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    getPendingVerifications().then((res) => {
      if (res.success) setUsers(res.users || []);
      setLoading(false);
    });
  }, []);

  const handleApprove = async (userId: string) => {
    setProcessingId(userId);
    const res = await approveVerification(userId);
    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User verified!", {
        description: "The user now has full access to RentGuard features.",
      });
    } else {
      toast.error("Verification failed", {
        description: "Could not approve this user. Please try again.",
      });
    }
    setProcessingId(null);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-t-4 border-t-primary">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Identity Verifications</h1>
        <p className="text-muted-foreground">Review tenant Ghana Card submissions and approve verified users.</p>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
          <ShieldCheck className="mx-auto h-12 w-12 text-green-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">All clear!</h3>
          <p className="text-muted-foreground">No pending Ghana Card verifications at this time.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {users.map((u) => (
            <Card key={u.id} className="shadow-sm border-gray-200 bg-white">
              <CardHeader className="border-b bg-slate-50/50 pb-4">
                <div className="flex justify-between items-start mb-1">
                  <Badge variant="outline" className="capitalize text-xs">{u.role.toLowerCase()}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" /> {u.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {u.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Submitted Ghana Card:</p>
                <a href={u.ghanaCardUrl} target="_blank" rel="noreferrer">
                  <img
                    src={u.ghanaCardUrl}
                    alt="Ghana Card"
                    className="w-full h-36 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer"
                  />
                </a>
                <p className="text-xs text-muted-foreground mt-1 text-center">Click to view full size</p>
              </CardContent>
              <CardFooter className="border-t pt-4 bg-gray-50/50 flex gap-3">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                  onClick={() => handleApprove(u.id)}
                  disabled={processingId === u.id}
                >
                  {processingId === u.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 mr-1.5" />
                  )}
                  Approve
                </Button>
                <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50 font-semibold" disabled={processingId === u.id}>
                  Reject
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
