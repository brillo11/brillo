"use client";

import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";

export function ServiceHeader() {
  const pathname = usePathname();

  // Get the last segment of the path for the title
  const currentView =
    pathname.split("/").pop()?.replace(/-/g, " ") || "Dashboard";

  return (
    <header className="h-20 bg-vzx-bg/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-40 sticky top-0">
      <div className="flex items-center gap-4 text-gray-500">
        <span className="text-sm">VZX</span>
        <span className="text-gray-700">/</span>
        <span className="text-white font-medium capitalize">{currentView}</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search assets..."
            className="bg-[#1a1a1a] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:border-[#33DB98] outline-none text-white w-64 transition-all focus:w-80"
          />
          <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
        </div>
        <div className="relative cursor-pointer">
          <Bell className="text-gray-400 hover:text-white transition-colors" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#33DB98] rounded-full animate-pulse" />
        </div>
      </div>
    </header>
  );
}
