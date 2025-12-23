"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  headerRight?: React.ReactNode;
}

export default function AccordionItem({
  title,
  children,
  defaultOpen = false,
  headerRight,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-white/5 rounded-2xl overflow-hidden bg-vzx-card mb-4 shadow-sm transition-all duration-300 hover:border-[#33DB98]/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-5 bg-white/5 hover:bg-white/10 transition-all text-left group"
      >
        <h2 className="text-lg font-bold text-white group-hover:text-[#33DB98] transition-colors">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {headerRight && (
            <div onClick={(e) => e.stopPropagation()}>{headerRight}</div>
          )}
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-[#33DB98]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-[#33DB98]" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="p-6 bg-transparent animate-fadeIn border-t border-white/5">
          {children}
        </div>
      )}
    </div>
  );
}

// export default AccordionItem;
