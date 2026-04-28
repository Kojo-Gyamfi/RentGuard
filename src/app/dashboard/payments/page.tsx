"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getPayments, logPayment, verifyPayment } from "@/app/actions/payment";
import { getAgreements } from "@/app/actions/agreement";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DollarSign, Receipt } from "lucide-react";
import { toast } from "sonner";
import { getUserProfile } from "@/app/actions/user";

export default function PaymentsPage() {
  const { user } = useAuth();
  const [role, setRole] = useState<"LANDLORD" | "TENANT" | "ADMIN" | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [selectedAgreement, setSelectedAgreement] = useState("");
  const [purposeType, setPurposeType] = useState<"MONTHLY" | "YEARLY" | "DEPOSIT" | "OTHER">("MONTHLY");
  const [purposeMonth, setPurposeMonth] = useState(new Date().getMonth());
  const [purposeYear, setPurposeYear] = useState(new Date().getFullYear());
  const [customPurpose, setCustomPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      getUserProfile(user.id).then(res => {
        if (res.success && res.user) {
           setRole(res.user.role);
           
           Promise.all([
             (res.user.role === "LANDLORD" || res.user.role === "TENANT") ? getPayments(user.id, res.user.role as "LANDLORD" | "TENANT") : Promise.resolve({ success: false, payments: [] as any[] }),
             res.user.role === "TENANT" ? getAgreements(user.id, "TENANT") : Promise.resolve({ success: false, agreements: [] as any[] })
           ]).then(([payRes, agRes]) => {
             if (payRes.success) setPayments(payRes.payments || []);
             if (agRes.success && agRes.agreements) {
                setAgreements(agRes.agreements);
                if (agRes.agreements.length > 0) setSelectedAgreement(agRes.agreements[0].id);
             }
             setLoading(false);
           });
        }
      });
    }
  }, [user]);

  const handleLogPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedAgreement || !amount || !reference) return;
    setSubmitting(true);
    
    let finalPurpose = "";
    if (purposeType === "MONTHLY") {
      const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(purposeYear, purposeMonth));
      finalPurpose = `Rent for ${monthName} ${purposeYear}`;
    } else if (purposeType === "YEARLY") {
      finalPurpose = `Full Year Advance (${purposeYear})`;
    } else if (purposeType === "DEPOSIT") {
      finalPurpose = "Security Deposit";
    } else {
      finalPurpose = customPurpose;
    }

    const res = await logPayment(selectedAgreement, parseFloat(amount), reference, user.id, finalPurpose);
    if (res.success) {
      toast.success("Payment logged successfully!", {
        description: `${finalPurpose} (GH₵ ${parseFloat(amount).toLocaleString()}) recorded.`,
      });
      setAmount("");
      setReference("");
      setCustomPurpose("");
      // reload payments
      const payRes = await getPayments(user.id, "TENANT");
      if (payRes.success) setPayments(payRes.payments || []);
    } else {
      toast.error("Failed to log payment", {
        description: "Please check your details and try again.",
      });
    }
    setSubmitting(false);
  };

  const handleVerifyPayment = async (id: string) => {
    if (!user) return;
    setVerifyingId(id);
    const res = await verifyPayment(id, user.id);
    if (res.success) {
      toast.success("Payment verified!", {
        description: "The agreement is now ACTIVE and the property status has been updated.",
      });
      // reload payments
      const payRes = await getPayments(user.id, "LANDLORD");
      if (payRes.success) setPayments(payRes.payments || []);
    } else {
      toast.error("Verification failed", { description: res.error });
    }
    setVerifyingId(null);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-t-4 border-t-primary">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Payments</h1>
        <p className="text-muted-foreground">Manage and track your rent transactions.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Payment Form (Tenants only) */}
        {role === "TENANT" && agreements.length > 0 && (
          <Card className="lg:col-span-1 shadow-sm border-gray-200 h-fit">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-lg flex items-center"><DollarSign className="w-5 h-5 mr-2" /> Log New Payment</CardTitle>
              <CardDescription>Record a rent payment you've made.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleLogPayment} className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Purpose</Label>
                  <select 
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                    value={purposeType}
                    onChange={(e) => setPurposeType(e.target.value as any)}
                  >
                    <option value="MONTHLY">Monthly Rent</option>
                    <option value="YEARLY">Full Year Advance</option>
                    <option value="DEPOSIT">Security Deposit</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {purposeType === "MONTHLY" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Month</Label>
                      <select 
                        className="flex w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-sm"
                        value={purposeMonth}
                        onChange={(e) => setPurposeMonth(parseInt(e.target.value))}
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i} value={i}>
                            {new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2024, i))}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Year</Label>
                      <select 
                        className="flex w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-sm"
                        value={purposeYear}
                        onChange={(e) => setPurposeYear(parseInt(e.target.value))}
                      >
                        {[2024, 2025, 2026, 2027].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {purposeType === "YEARLY" && (
                  <div className="space-y-1">
                    <Label className="text-xs">Advance Year</Label>
                    <select 
                      className="flex w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-sm"
                      value={purposeYear}
                      onChange={(e) => setPurposeYear(parseInt(e.target.value))}
                    >
                      {[2024, 2025, 2026, 2027].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                )}

                {purposeType === "OTHER" && (
                  <div className="space-y-1">
                    <Label className="text-xs">Specify Detail</Label>
                    <Input 
                      placeholder="e.g. Partial rent for Q3" 
                      value={customPurpose} 
                      onChange={(e) => setCustomPurpose(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Select Lease</Label>
                  <select 
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                    value={selectedAgreement}
                    onChange={(e) => setSelectedAgreement(e.target.value)}
                    required
                  >
                    {agreements.map(ag => (
                      <option key={ag.id} value={ag.id}>
                        {ag.property.title} (GH₵ {ag.rentAmount})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Amount Paid (GH₵)</Label>
                  <Input type="number" step="0.01" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Transaction Reference ID</Label>
                  <Input placeholder="Momo ID or Bank Ref" value={reference} onChange={(e) => setReference(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full mt-2" disabled={submitting}>
                  {submitting ? "Logging..." : "Submit Payment Record"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Payment History Table */}
        <Card className={`shadow-sm border-gray-200 ${role === "TENANT" && agreements.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-lg flex items-center"><Receipt className="w-5 h-5 mr-2" /> Transaction History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {payments.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No payments recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Date</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Property / Purpose</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Ref ID</th>
                      <th className="text-right px-6 py-3 font-semibold text-gray-600">Amount</th>
                      <th className="text-center px-6 py-3 font-semibold text-gray-600">Status</th>
                      {role === "LANDLORD" && <th className="text-right px-6 py-3 font-semibold text-gray-600">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          <div className="flex flex-col">
                            <span>{p.agreement.property.title}</span>
                            <span className="text-[10px] text-primary font-black uppercase tracking-widest mt-1 bg-primary/5 w-fit px-1.5 py-0.5 rounded">
                              {p.purpose || "General Payment"}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 font-normal mt-1.5">
                            {role === "LANDLORD" ? `Tenant: ${p.agreement.tenant.name}` : `Landlord: ${p.agreement.landlord.name}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{p.reference}</td>
                        <td className="px-6 py-4 text-right font-bold text-green-600 whitespace-nowrap">
                           GH₵ {p.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant="outline" className={cn(
                            "font-bold px-2 py-1",
                            p.status === "COMPLETED" ? "bg-green-50 text-green-700 border-green-200" : 
                            p.status === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-red-50 text-red-700 border-red-200"
                          )}>
                            {p.status}
                          </Badge>
                        </td>
                        {role === "LANDLORD" && (
                          <td className="px-6 py-4 text-right">
                            {p.status === "PENDING" && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="bg-green-600 text-white hover:bg-green-700 hover:text-white border-none h-8 px-3"
                                onClick={() => handleVerifyPayment(p.id)}
                                disabled={verifyingId === p.id}
                              >
                                {verifyingId === p.id ? "..." : "Verify"}
                              </Button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
