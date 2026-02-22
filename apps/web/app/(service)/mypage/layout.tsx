"use client";

import React, { PropsWithChildren } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MyPageLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "내 정보",
      href: "/mypage/me",
    },
    {
      name: "내 주문 내역",
      href: "/mypage/orders",
    },
    {
      name: "내 리뷰 보기",
      href: "/mypage/reviews",
    },
  ];

  return (
    <div className="bg-[#f7f3f0] w-full min-h-screen pb-20 pt-40 flex flex-col items-center">
      <div className="max-w-[1000px] w-full mx-auto px-4">
        {/* Title */}
        <h1 className="font-suit text-[24px] leading-[32px] text-black mb-8 text-center md:text-left">
          마이페이지
        </h1>

        <div className="flex flex-col md:flex-row gap-12 md:gap-24">
          {/* Sidebar Navigation */}
          <aside className="w-full text-center md:text-left md:w-48 flex-shrink-0">
            <nav className="flex flex-row md:flex-col gap-4 overflow-x-auto md:overflow-visible pb-2 md:pb-0 border-b md:border-b-0 border-[#d4d4d4]">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block whitespace-nowrap px-4 py-2 md:px-0 md:py-3 text-sm font-suit transition-colors relative ${
                      isActive
                        ? "text-black font-bold border-b-2 md:border-b-0 md:border-l-2 border-black -mb-[2px] md:-mb-0 md:-ml-[2px]"
                        : "text-gray-500 hover:text-black"
                    }`}
                  >
                    <span className="md:pl-4">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 w-full bg-transparent">{children}</main>
        </div>
      </div>
    </div>
  );
}
