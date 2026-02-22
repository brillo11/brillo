"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center px-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-suit font-medium pt-0.5">뒤로가기</span>
        </button>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-12">{children}</main>
    </div>
  );
}
