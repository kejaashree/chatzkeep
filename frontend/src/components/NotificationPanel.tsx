"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  _id: string;
  sender?: { firstName: string; lastName: string; avatar?: string };
  type: string;
  content: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
}

interface Props {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tab, setTab] = useState<"all" | "unread" | "archive">("all");

  useEffect(() => {
    api.get("/notifications").then((r) => setNotifications(r.data));
  }, []);

  const filtered = notifications.filter((n) => {
    if (tab === "unread") return !n.isRead;
    if (tab === "archive") return n.isArchived;
    return !n.isArchived;
  });

  const markRead = async (id: string) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead && !n.isArchived).length;

  return (
    <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Notification</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 py-3 border-b border-gray-100">
        {(["all", "unread", "archive"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
              tab === t
                ? "bg-primary-600 text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {t}
            {t === "all" && unreadCount > 0 && (
              <span className="ml-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs inline-flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No notifications
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n._id}
              onClick={() => markRead(n._id)}
              className={`flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 ${
                !n.isRead ? "bg-primary-50/30" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                {n.sender?.avatar ? (
                  <img
                    src={n.sender.avatar}
                    className="w-9 h-9 rounded-full object-cover"
                    alt=""
                  />
                ) : (
                  <span className="text-primary-600 text-xs font-bold">
                    {n.sender
                      ? `${n.sender.firstName[0]}${n.sender.lastName?.[0] || ""}`
                      : "AH"}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {n.sender
                    ? `${n.sender.firstName} ${n.sender.lastName}`
                    : "Admin Hospital"}
                </p>
                <p className="text-xs text-gray-500 truncate">{n.content}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {formatDistanceToNow(new Date(n.createdAt), {
                  addSuffix: false,
                })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
