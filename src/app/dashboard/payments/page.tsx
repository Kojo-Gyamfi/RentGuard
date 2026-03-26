"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getPayments, logPayment } from "@/app/actions/payment";
import { getAgreements } from "@/app/actions/agreement";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Receipt } from "lucide-react";
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
  const [submitting, setSubmitting] = useState(false);

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
    
    const res = await logPayment(selectedAgreement, parseFloat(amount), reference, user.id);
    if (res.success) {
      alert("Payment logged successfully.");
      setAmount("");
      setReference("");
      // reload payments
      const payRes = await getPayments(user.id, "TENANT");
      if (payRes.success) setPayments(payRes.payments || []);
    } else {
      alert("Failed to log payment.");
    }
    setSubmitting(false);
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
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Property</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Ref ID</th>
                      <th className="text-right px-6 py-3 font-semibold text-gray-600">Amount</th>
                      <th className="text-center px-6 py-3 font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {p.agreement.property.title}
                          <div className="text-xs text-gray-500 font-normal mt-0.5">
                            {role === "LANDLORD" ? `Tenant: ${p.agreement.tenant.name}` : `Landlord: ${p.agreement.landlord.name}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{p.reference}</td>
                        <td className="px-6 py-4 text-right font-bold text-green-600 whitespace-nowrap">
                           GH₵ {p.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {p.status}
                          </Badge>
                        </td>
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
