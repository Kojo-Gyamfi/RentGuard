"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/app/actions/notification";
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date | string;
}

export default function Header({ role }: { role: string }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const res = await getUserNotifications(user.id);
    if (res.success) {
      setNotifications(res.notifications as Notification[] || []);
    }
  }, [user]);

  useEffect(() => {
    const timeout = setTimeout(fetchNotifications, 0);
    // Simple polling every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    // Optimistic UI update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    
    await markNotificationAsRead(id, user.id);
  };

  const handleMarkAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await markAllNotificationsAsRead(user.id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "SUCCESS": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "WARNING": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "ERROR": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-slate-800 hidden sm:block">
          Welcome back
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50/50">
                <h3 className="font-bold text-slate-800">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">
                    <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    You&apos;re all caught up!
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.map(n => (
                      <div 
                        key={n.id} 
                        className={cn(
                          "p-4 hover:bg-slate-50 transition-colors flex gap-3 relative group",
                          !n.isRead ? "bg-blue-50/30" : ""
                        )}
                      >
                        {!n.isRead && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                        )}
                        <div className="mt-0.5 shrink-0">
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm mb-0.5", !n.isRead ? "font-bold text-slate-900" : "font-medium text-slate-700")}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!n.isRead && (
                          <button 
                            onClick={(e) => handleMarkAsRead(n.id, e)}
                            className="shrink-0 p-1.5 h-fit rounded-full text-slate-400 hover:text-green-600 hover:bg-green-50 opacity-0 group-hover:opacity-100 transition-all"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-2 border-t bg-slate-50/50 text-center">
                <p className="text-xs text-slate-500 font-medium">Showing recent notifications</p>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar placeholder */}
        <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="text-sm font-bold text-primary">
            {role.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
}
