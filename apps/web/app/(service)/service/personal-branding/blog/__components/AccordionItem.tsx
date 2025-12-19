"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  headerRight?: React.ReactNode;
}

export default function AccordionItem({ title, children, defaultOpen = false, headerRight }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-blue-500 mb-6 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-5 bg-blue-500 hover:bg-blue-600 transition-colors text-left"
      >
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <div className="flex items-center gap-2">
          {headerRight && <div onClick={(e) => e.stopPropagation()}>{headerRight}</div>}
          {isOpen ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
        </div>
      </button>
      
      {isOpen && (
        <div className="p-6 bg-white animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
};

// export default AccordionItem;