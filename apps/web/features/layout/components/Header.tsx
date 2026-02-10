"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LoginButton } from "@/features/auth/LoginButton";
import { cn } from "@/shared/lib/utils";
import { MobileSidebar } from "./MobileSidebar";

export function Header() {
  const pathname = usePathname();
  const isDarkHeader = pathname === "/" || pathname === "/about";

  const navItems = [
    { label: "About", href: "/about" },
    { label: "Woman", href: "/woman" },
    { label: "Man", href: "/man" },
    { label: "VIP/Celeb", href: "/vip" },
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] h-21 pt-7 transition-colors duration-300",
        isDarkHeader ? "bg-black" : "bg-white border-b border-gray-100/50",
      )}
    >
      <div className="relative w-full mx-auto top-0 h-full px-4 xl:px-[18px] flex items-center justify-between md:justify-normal">
        {/* Mobile Hamburger - Left */}
        <MobileSidebar isDark={isDarkHeader} navItems={navItems} />

        {/* Logo - Center on Mobile, Left on Desktop */}
        <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:mr-auto">
          <Link href="/">
            <img
              className={cn(
                "w-[93px] h-[35px] object-contain transition-all duration-300",
                !isDarkHeader && "invert",
              )}
              alt="Brillo Logo"
              src="/images/layout/brillo-logo-text.png"
            />
          </Link>
        </div>

        {/* Desktop Navigation - Center */}
        <div className="hidden md:absolute md:left-1/2 md:-translate-x-1/2 md:flex items-center gap-[33px]">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="relative w-fit font-playfair font-medium text-xs tracking-[-0.24px] leading-[normal] transition-colors duration-300"
              style={{
                color: isDarkHeader ? "#FFFFFF" : "#111111",
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* User Icon / Login - Right */}
        <div
          className={cn(
            "relative transition-all duration-300",
            !isDarkHeader && "invert opacity-80 hover:opacity-100",
          )}
        >
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
