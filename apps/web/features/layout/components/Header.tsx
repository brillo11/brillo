"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LoginButton } from "@/features/auth/LoginButton";
import { cn } from "@/shared/lib/utils";

export function Header() {
  const pathname = usePathname();
  const isDarkHeader = pathname === "/" || pathname === "/about";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] h-14 transition-colors duration-300",
        isDarkHeader ? "bg-black" : "bg-white border-b border-gray-100/50",
      )}
    >
      <div className="relative max-w-screen-xl mx-auto top-0 h-full px-4 xl:px-0 flex items-center">
        {/* Logo */}
        <Link href="/">
          <img
            className={cn(
              "w-[93px] h-[35px] object-contain transition-all duration-300",
              !isDarkHeader && "invert",
            )}
            alt="Brillo Logo"
            src="https://c.animaapp.com/oAayiH1p/img/group-2@2x.png"
          />
        </Link>

        {/* Navigation */}
        <div className="hidden md:inline-flex items-center gap-[33px] absolute left-1/2 -translate-x-1/2">
          {[
            { label: "About", href: "/about" },
            { label: "Woman", href: "/woman" },
            { label: "Man", href: "/man" },
            { label: "VIP/Celeb", href: "/vip" },
            { label: "FAQ", href: "/faq" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "relative w-fit [font-family:'Playfair_Display',Helvetica] font-medium text-xs tracking-[-0.24px] leading-[normal] transition-colors duration-300",
                isDarkHeader
                  ? "text-white hover:text-gray-300"
                  : "text-black hover:text-gray-600",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* User Icon / Login */}
        <div
          className={cn(
            "absolute right-4 lg:right-0 transition-all duration-300",
            !isDarkHeader && "invert opacity-80 hover:opacity-100",
          )}
        >
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
