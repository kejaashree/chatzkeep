"use client";
import { useState } from "react";
import { Bell, Search, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import NotificationPanel from "./NotificationPanel";

interface TopbarProps {
  title: string;
  extraAction?: React.ReactNode;
}

export default function Topbar({ title, extraAction }: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const initials = user
    ? `${user.firstName[0]}${user.lastName?.[0] || ""}`.toUpperCase()
    : "?";

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 relative z-40">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
      </div>

      <div className="flex items-center gap-3 flex-1 max-w-md mx-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search candidate, vacancy, etc..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {extraAction}
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <Bell className="w-4 h-4 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          {showNotifications && (
            <NotificationPanel onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* User avatar */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </button>
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
