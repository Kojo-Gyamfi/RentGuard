import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, List, Folder, FileText, Settings, Users, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  role: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const getLinks = () => {
    if (role === "LANDLORD") {
      return [
        { name: "Overview", href: "/dashboard", icon: Home },
        { name: "My Properties", href: "/dashboard/properties", icon: List },
        { name: "Applications", href: "/dashboard/applications", icon: Folder },
        { name: "Agreements", href: "/dashboard/agreements", icon: FileText },
        { name: "Payments", href: "/dashboard/payments", icon: DollarSign },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
      ];
    }
    if (role === "TENANT") {
      return [
        { name: "Overview", href: "/dashboard", icon: Home },
        { name: "Browse Properties", href: "/dashboard/properties/browse", icon: List },
        { name: "My Applications", href: "/dashboard/applications", icon: Folder },
        { name: "My Lease", href: "/dashboard/lease", icon: FileText },
        { name: "Payments", href: "/dashboard/payments", icon: DollarSign },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
      ];
    }
    if (role === "ADMIN") {
      return [
        { name: "Overview", href: "/dashboard", icon: Home },
        { name: "Verifications", href: "/dashboard/verifications", icon: FileText },
        { name: "Users", href: "/dashboard/users", icon: Users },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
      ];
    }
    return [];
  };

  const links = getLinks();

  return (
    <div className="flex h-full w-64 flex-col bg-slate-100 border-r border-slate-200/80 shrink-0">
      <div className="p-6 border-b border-slate-200/80">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">RentGuard</h2>
        <p className="text-sm font-semibold text-slate-500 capitalize mt-0.5">{role.toLowerCase()} Portal</p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-50/80 text-blue-700 shadow-sm ring-1 ring-blue-100"
                  : "text-slate-500 hover:bg-slate-100/60 hover:text-slate-800"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-200/60">
        <button
          onClick={signOut}
          className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
