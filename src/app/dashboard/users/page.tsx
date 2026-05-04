"use client";

import { useEffect, useState } from "react";
import { getAllUsers } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string | Date;
  _count?: {
    properties: number;
    applications: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUsers().then((res) => {
      if (res.success) setUsers(res.users || []);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-t-4 border-t-primary">
        <h1 className="text-3xl font-bold tracking-tight mb-1">User Management</h1>
        <p className="text-muted-foreground">View and manage all registered users on the platform.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Name</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600 hidden md:table-cell">Email</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Role</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Verified</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600 hidden lg:table-cell">Properties</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600 hidden lg:table-cell">Applications</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{u.email}</td>
                <td className="px-6 py-4">
                  <Badge variant={u.role === "ADMIN" ? "default" : "outline"} className="capitalize text-xs">
                    {u.role.toLowerCase()}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  {u.isVerified ? (
                    <span className="flex items-center gap-1 text-green-600 font-medium text-xs">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">Unverified</span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-600 hidden lg:table-cell">{u._count?.properties ?? 0}</td>
                <td className="px-6 py-4 text-gray-600 hidden lg:table-cell">{u._count?.applications ?? 0}</td>
                <td className="px-6 py-4 text-gray-500 text-xs">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">No users found.</div>
        )}
      </div>
    </div>
  );
}
