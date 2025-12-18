"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";
import { PATH } from "@/shared/consts/path";
import { signOut } from "@/shared/lib/auth-client";
import { useSession } from "@/shared/lib/auth-client";
import { cn } from "@/shared/lib/utils";

interface UserHeaderProps {
  className?: string;
}

export function UserHeader({ className }: UserHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: session, isPending: isLoading } = useSession();
  const user = session?.user;

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("로그아웃 오류:", error);
      router.push("/");
    }
  };

  // 마이페이지 경로 결정
  const getMyPagePath = () => {
    if (pathname.includes(PATH.ADMIN_ROOT)) {
      return PATH.ADMIN_PROFILE;
    }
    return PATH.SERVICE_PROFILE;
  };

  if (isLoading || !user) {
    return null;
  }

  const userImage = (user as any)?.image;
  const userName = (user as any)?.name || (user as any)?.nickname || "사용자";
  const userEmail = (user as any)?.email || "";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm",
        className
      )}
    >
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end h-[60px]">
          {/* 프로필 드롭다운 */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {/* 프로필 이미지 또는 아이콘 */}
              {userImage ? (
                <Image
                  src={userImage}
                  alt={userName}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-[#3B82F6] to-[#1E3A8A] rounded-full flex items-center justify-center text-white shadow-sm">
                  <User className="h-4 w-4" />
                </div>
              )}

              {/* 닉네임 */}
              <span className="hidden sm:block text-sm font-medium text-slate-700">
                {userName}
              </span>

              <ChevronDown
                className={cn(
                  "h-4 w-4 text-slate-500 transition-transform",
                  isDropdownOpen && "rotate-180"
                )}
              />
            </button>

            {/* 드롭다운 메뉴 */}
            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 z-20 overflow-hidden">
                  {/* 사용자 정보 */}
                  <div className="px-4 py-3 border-b border-slate-200">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {userName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {userEmail}
                    </p>
                  </div>

                  {/* 메뉴 아이템 */}
                  <div className="py-1">
                    <Link
                      href={getMyPagePath()}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-[#3B82F6]/10 hover:text-[#3B82F6] transition-all"
                    >
                      <Settings className="h-4 w-4" />
                      마이페이지
                    </Link>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleSignOut();
                      }}
                      className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all"
                    >
                      <LogOut className="h-4 w-4" />
                      로그아웃
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
