import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, List, Folder, FileText, Settings, Users, DollarSign, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SidebarProps {
  role: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Successfully logged out.");
    } catch (error) {
      toast.error("An error occurred while logging out.");
    }
  };

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
          onClick={handleSignOut}
          className="group flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 bg-red-500/20 border border-red-200/80 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 hover:shadow-sm"
        >
          <LogOut className="h-5 w-5 shrink-0 text-red-500 group-hover:text-white transition-colors" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}
