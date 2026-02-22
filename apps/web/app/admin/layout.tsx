import Link from "next/link";
import { PropsWithChildren } from "react";

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">관리자 패널</h1>
        </div>
        <nav className="p-4 space-y-2">
          <Link
            href="/admin/users"
            className="block px-4 py-2 hover:bg-gray-50 rounded-md"
          >
            회원 관리
          </Link>
          <Link
            href="/admin/orders"
            className="block px-4 py-2 hover:bg-gray-50 rounded-md"
          >
            결제내역 관리
          </Link>
          <Link
            href="/admin/reviews"
            className="block px-4 py-2 hover:bg-gray-50 rounded-md"
          >
            리뷰 관리
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
