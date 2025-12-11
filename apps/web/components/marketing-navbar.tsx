"use client";

import { Logo } from "@repo/ui/components/proBlocks/logo";
import { useSession } from "@/shared/lib/auth-client";
import Link from "next/link";
import { PATH } from "@/shared/consts/path";
import { useEffect, useState } from "react";

interface MarketingNavbarProps {
  onLoginClick: () => void;
}

export function MarketingNavbar({ onLoginClick }: MarketingNavbarProps) {
  const { data: session, isPending } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydration mismatch prevention: render simple state or nothing initially if needed, 
  // but simpler to just let it mount. 
  // For auth, usually it's better to show loading or nothing until session is known if critical,
  // but for navbar, showing 'Login' briefly is acceptable, or we can wait.
  // Given the previous mismatch issues, let's be safe.
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo variant="full" size="md" />
          
          <div className="flex items-center gap-4">
             {mounted && session ? (
               <Link
                 href={PATH.STUDENT_ROOT}
                 className="flex items-center gap-2 text-gray-600 hover:text-red-600 font-medium text-sm transition-colors"
               >
                 <span>학습 페이지로 이동하기</span>
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
               </Link>
             ) : (
                <button
                  onClick={onLoginClick}
                  className="text-gray-600 hover:text-red-600 font-medium text-sm transition-colors"
                >
                  로그인
                </button>
             )}
          </div>
        </div>
      </div>
    </nav>
  );
}
