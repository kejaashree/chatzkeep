"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Settings } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/messages", icon: MessageSquare, label: "Message" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="w-52 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-100">
        <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">C</span>
        </div>
        <span className="text-lg font-bold">
          Chatz<span className="text-primary-600">keep</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Subscribe card */}
      <div className="m-3 bg-primary-600 rounded-xl p-4 text-white text-xs">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-3">
          <MessageSquare className="w-4 h-4" />
        </div>
        <p className="font-semibold text-sm mb-1">Get Unlimited Access and Feel Free.</p>
        <p className="text-primary-100 mb-3">
          Subscription Keeps Going And Going, And Going...
        </p>
        <button className="w-full py-1.5 bg-white text-primary-600 text-xs font-bold rounded-lg hover:bg-primary-50 transition-colors">
          Subscribe Now
        </button>
      </div>
    </aside>
  );
}
