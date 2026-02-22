import Link from "next/link";
import { PropsWithChildren } from "react";

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="p-4 space-y-2">
          <Link
            href="/admin/users"
            className="block px-4 py-2 hover:bg-gray-50 rounded-md"
          >
            Users
          </Link>
          <Link
            href="/admin/orders"
            className="block px-4 py-2 hover:bg-gray-50 rounded-md"
          >
            Orders
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
