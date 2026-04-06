"use client";

import Link from "next/link";
import { PropsWithChildren, useState } from "react";
import { Menu, X } from "lucide-react";

export default function AdminLayout({ children }: PropsWithChildren) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 flex-col md:flex-row">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-white border-b p-4">
        <h1 className="text-xl font-bold">관리자 패널</h1>
        <button onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`w-64 bg-white border-r fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h1 className="text-xl font-bold">관리자 패널</h1>
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <Link
            href="/admin/users"
            className="block px-4 py-2 hover:bg-gray-50 rounded-md"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            회원 관리
          </Link>
          <Link
            href="/admin/orders"
            className="block px-4 py-2 hover:bg-gray-50 rounded-md"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            결제내역 관리
          </Link>
          <Link
            href="/admin/reviews"
            className="block px-4 py-2 hover:bg-gray-50 rounded-md"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            리뷰 관리
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
