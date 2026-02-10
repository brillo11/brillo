"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@repo/ui/components/sheet";
import { Menu } from "lucide-react";

interface MobileSidebarProps {
  isDark: boolean;
  navItems: { label: string; href: string }[];
}

export function MobileSidebar({ isDark, navItems }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger className="md:hidden z-50">
        <Menu
          className={cn(
            "w-6 h-6 transition-colors duration-300",
            isDark ? "text-white" : "text-black",
          )}
        />
      </SheetTrigger>
      <SheetContent
        side="left"
        className={cn(
          "w-full p-0 border-none transition-colors duration-300",
          isDark ? "bg-black" : "bg-white",
        )}
      >
        <div className="flex flex-col h-full pt-20 px-6">
          <div className="flex flex-col gap-8 items-center justify-center flex-1 pb-20">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "font-playfair text-3xl font-medium transition-colors duration-300 hover:opacity-70",
                  isDark ? "text-white" : "text-black",
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
