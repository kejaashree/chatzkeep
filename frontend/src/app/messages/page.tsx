"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Send, Paperclip, X } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import toast from "react-hot-toast";

interface Message {
  _id: string;
  sender: { _id: string; firstName: string; lastName: string; avatar?: string };
  receiver: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  createdAt: string;
  isRead: boolean;
}

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }>;
  lastMessage?: Message;
  lastMessageAt: string;
  unreadCount?: Record<string, number>;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"All" | "Unread" | "General">("All");
  const [uploading, setUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout>();

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const { data } = await api.get("/messages/conversations");
      setConversations(data);
    } catch {}
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Socket setup
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    socket.on("message:receive", (msg: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      loadConversations();
    });

    socket.on("users:online", (users: string[]) => {
      setOnlineUsers(users);
    });

    socket.on("message:typing", ({ senderId }: { senderId: string }) => {
      if (activeConv) {
        const other = getOtherParticipant(activeConv);
        if (other?._id === senderId) setIsTyping(true);
      }
    });

    socket.on("message:stopTyping", () => setIsTyping(false));

    return () => {
      socket.off("message:receive");
      socket.off("users:online");
      socket.off("message:typing");
      socket.off("message:stopTyping");
    };
  }, [user, activeConv, loadConversations]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConv) return;
    api.get(`/messages/${activeConv._id}`).then(({ data }) => {
      setMessages(data);
    });
  }, [activeConv]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const getOtherParticipant = (conv: Conversation) =>
    conv.participants.find((p) => p._id !== user?._id);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeConv || !user) return;
    const other = getOtherParticipant(activeConv);
    if (!other) return;

    const socket = getSocket();
    const content = input.trim();
    setInput("");

    try {
      const { data } = await api.post("/messages", {
        receiverId: other._id,
        content,
      });

      setMessages((prev) => [...prev, data.message]);
      socket.emit("message:send", { receiverId: other._id, message: data.message });
      loadConversations();
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleTyping = (val: string) => {
    setInput(val);
    if (!activeConv) return;
    const socket = getSocket();
    const other = getOtherParticipant(activeConv);
    if (!other) return;

    socket.emit("message:typing", { receiverId: other._id, senderId: user?._id });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("message:stopTyping", { receiverId: other._id, senderId: user?._id });
    }, 1500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv || !user) return;
    const other = getOtherParticipant(activeConv);
    if (!other) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data: uploadData } = await api.post("/upload", formData);

      const { data } = await api.post("/messages", {
        receiverId: other._id,
        content: "",
        fileUrl: uploadData.fileUrl,
        fileName: uploadData.fileName,
        fileType: uploadData.fileType,
      });

      setMessages((prev) => [...prev, data.message]);
      const socket = getSocket();
      socket.emit("message:send", { receiverId: other._id, message: data.message });
      loadConversations();
    } catch {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const other = getOtherParticipant(conv);
    if (!other) return false;
    const name = `${other.firstName} ${other.lastName}`.toLowerCase();
    if (search && !name.includes(search.toLowerCase())) return false;
    if (tab === "Unread") {
      const count = conv.unreadCount?.[user?._id || ""] || 0;
      return count > 0;
    }
    return true;
  });

  const activeOther = activeConv ? getOtherParticipant(activeConv) : null;
  const isActiveOnline = activeOther
    ? onlineUsers.includes(activeOther._id)
    : false;

  // Group messages by date
  const groupedMessages = messages.reduce<Record<string, Message[]>>(
    (acc, msg) => {
      const date = format(new Date(msg.createdAt), "yyyy-MM-dd");
      if (!acc[date]) acc[date] = [];
      acc[date].push(msg);
      return acc;
    },
    {}
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Message" />
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation list */}
          <div className="w-72 bg-white border-r border-gray-100 flex flex-col">
            {/* Search */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex px-3 py-2 gap-1 border-b border-gray-100">
              {(["All", "Unread", "General"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                    tab === t
                      ? "text-primary-600 border-b-2 border-primary-600"
                      : "text-gray-500"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => {
                const other = getOtherParticipant(conv);
                if (!other) return null;
                const isOnline = onlineUsers.includes(other._id);
                const initials = `${other.firstName[0]}${other.lastName?.[0] || ""}`;
                const unread = conv.unreadCount?.[user?._id || ""] || 0;
                const isActive = activeConv?._id === conv._id;

                return (
                  <div
                    key={conv._id}
                    onClick={() => setActiveConv(conv)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      isActive ? "bg-primary-50 border-r-2 border-primary-600" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {other.avatar ? (
                          <img src={other.avatar} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className="text-gray-600 text-sm font-semibold">
                            {initials}
                          </span>
                        )}
                      </div>
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {other.firstName} {other.lastName}
                        </p>
                        <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                          {conv.lastMessageAt
                            ? formatDistanceToNow(new Date(conv.lastMessageAt), {
                                addSuffix: false,
                              })
                            : ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 truncate">
                          {conv.lastMessage?.content || conv.lastMessage?.fileName || ""}
                        </p>
                        {unread > 0 && (
                          <span className="ml-2 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredConversations.length === 0 && (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No conversations yet
                </div>
              )}
            </div>
          </div>

          {/* Chat area */}
          {activeConv && activeOther ? (
            <div className="flex-1 flex flex-col">
              {/* Chat header */}
              <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {activeOther.avatar ? (
                        <img src={activeOther.avatar} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <span className="text-gray-600 text-sm font-semibold">
                          {activeOther.firstName[0]}{activeOther.lastName?.[0] || ""}
                        </span>
                      )}
                    </div>
                    {isActiveOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {activeOther.firstName} {activeOther.lastName}
                    </p>
                    <p className={`text-xs ${isActiveOnline ? "text-green-500" : "text-gray-400"}`}>
                      {isActiveOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
                <button className="px-4 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  View Profile
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {Object.entries(groupedMessages).map(([date, msgs]) => (
                  <div key={date}>
                    {/* Date separator */}
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs text-gray-400">
                        {format(new Date(date), "MMMM d, yyyy")}
                      </span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {msgs.map((msg) => {
                      const isMine = msg.sender._id === user?._id;
                      return (
                        <div
                          key={msg._id}
                          className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}
                        >
                          <div className={`max-w-xs lg:max-w-md ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                            {msg.fileUrl ? (
                              <a
                                href={msg.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm ${
                                  isMine
                                    ? "bg-primary-600 text-white"
                                    : "bg-white border border-gray-200 text-gray-700"
                                }`}
                              >
                                <span>📎</span>
                                <span className="truncate max-w-xs">{msg.fileName}</span>
                              </a>
                            ) : (
                              <div
                                className={`px-4 py-2.5 rounded-2xl text-sm ${
                                  isMine
                                    ? "bg-primary-600 text-white rounded-br-sm"
                                    : "bg-white border border-gray-200 text-gray-700 rounded-bl-sm"
                                }`}
                              >
                                {msg.content}
                              </div>
                            )}
                            <span className="text-xs text-gray-400 mt-1 px-1">
                              {format(new Date(msg.createdAt), "HH:mm aa")}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className="bg-white border-t border-gray-100 px-6 py-4">
                <form onSubmit={sendMessage} className="flex items-center gap-3">
                  <input
                    value={input}
                    onChange={(e) => handleTyping(e.target.value)}
                    placeholder="Really thank you so much... |"
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Paperclip className="w-4 h-4" />
                    {uploading ? "Uploading..." : "Upload files"}
                  </button>
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-5xl mb-4">💬</p>
                <p className="text-lg font-medium text-gray-500">
                  Select a conversation
                </p>
                <p className="text-sm">Choose from your existing conversations</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
