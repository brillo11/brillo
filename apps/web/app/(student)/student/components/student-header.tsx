"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, User, ChevronDown } from "lucide-react";
import { PATH } from "@/shared/consts/path";
import { studentMenus } from "@/shared/consts/menus";
import { Button } from "@repo/ui/components/button";
import { signOut } from "@/shared/lib/auth-client";

export function StudentHeader({ points = 0 }: { points?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const isActive = (url: string) => {
    if (url === PATH.STUDENT_ROOT) {
      return pathname === url;
    }
    return pathname.startsWith(url);
  };

  const hasActiveSubmenu = (menu: (typeof studentMenus)[0]) => {
    if (!menu.subMenus) return false;
    return menu.subMenus.some((sub) => isActive(sub.url));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // router.push("/auth/login");
      window.location.href = "/";
    } catch (error) {
      console.error("로그아웃 오류:", error);
      // 오류가 발생해도 로그인 페이지로 이동
      // router.push("/auth/login");
      window.location.href = "/";
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#F9EBDD]/95 backdrop-blur-md border-b border-[#F2779C]/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[70px]">
          {/* 좌측: 로고 (데스크톱) / 메뉴 버튼 (모바일) */}
          <div className="flex items-center gap-3">
            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex flex-col gap-1 p-2 hover:bg-[#F2779C]/10 rounded-lg transition-colors"
            >
              <Menu className="h-6 w-6 text-[#2C3E50]" />
            </button>

            {/* 로고 (데스크톱만 표시) */}
            <Link
              href={PATH.STUDENT_ROOT}
              className="hidden md:flex items-center gap-3 no-underline"
            >
              <Image
                src="/logo_yhd.png"
                alt="연화당 로고"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* 중앙: 네비게이션 (데스크톱) */}
          <nav className="hidden md:flex items-center gap-0">
            {studentMenus.map((menu) => {
              const active = isActive(menu.url) || hasActiveSubmenu(menu);
              const isSubmenuOpen = openSubmenu === menu.id;

              return (
                <div key={menu.id} className="relative group">
                  {menu.subMenus && menu.subMenus.length > 0 ? (
                    <>
                      <button
                        onClick={() =>
                          setOpenSubmenu(isSubmenuOpen ? null : menu.id)
                        }
                        className={`px-5 py-4 text-[15px] font-medium rounded-xl transition-all flex items-center gap-1 ${
                          active
                            ? "text-[#F2779C] bg-[#F2779C]/10"
                            : "text-[#2C3E50] hover:text-[#F2779C] hover:bg-[#F2779C]/10"
                        }`}
                      >
                        {menu.title}
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isSubmenuOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isSubmenuOpen && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                          {menu.subMenus.map((subMenu) => {
                            const subActive = isActive(subMenu.url);
                            return (
                              <Link
                                key={subMenu.id}
                                href={subMenu.url}
                                onClick={() => setOpenSubmenu(null)}
                                className={`block px-4 py-2 text-sm transition-all ${
                                  subActive
                                    ? "text-[#F2779C] bg-[#F2779C]/10 font-medium"
                                    : "text-[#2C3E50] hover:text-[#F2779C] hover:bg-[#F2779C]/10"
                                }`}
                              >
                                {subMenu.title}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={menu.url}
                      className={`px-5 py-4 text-[15px] font-medium rounded-xl transition-all ${
                        active
                          ? "text-[#F2779C] bg-[#F2779C]/10"
                          : "text-[#2C3E50] hover:text-[#F2779C] hover:bg-[#F2779C]/10"
                      }`}
                    >
                      {menu.title}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          {/* 우측: 복비(냥) 배지 + 프로필 */}
          <div className="flex items-center gap-4">
            {/* 복비(냥) 배지 */}
            <Link href={PATH.STUDENT_POINTS_CHARGE}>
              <div className="bg-gradient-to-r from-[#3BB4C1] to-[#2C8A99] text-white px-4 py-2 rounded-full text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity">
                복비 {points.toLocaleString()} 냥
              </div>
            </Link>

            {/* 프로필 아이콘 */}
            <div className="relative group">
              <div className="w-11 h-11 bg-gradient-to-br from-[#F2779C] to-[#E85A89] rounded-full flex items-center justify-center text-white cursor-pointer hover:shadow-lg transition-shadow">
                <User className="h-5 w-5" />
              </div>
              {/* 드롭다운 메뉴 */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 overflow-hidden">
                <div className="py-2">
                  <Link
                    href="/my-account"
                    className="block px-4 py-2 text-sm text-[#2C3E50] hover:bg-gradient-to-r hover:from-[#F2779C] hover:to-[#3BB4C1] hover:text-white transition-all"
                  >
                    내 정보
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-[#2C3E50] hover:bg-gradient-to-r hover:from-[#F2779C] hover:to-[#3BB4C1] hover:text-white transition-all"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#F2779C]/10 py-4">
            <nav className="flex flex-col gap-2">
              {studentMenus.map((menu) => {
                const active = isActive(menu.url) || hasActiveSubmenu(menu);
                const isSubmenuOpen = openSubmenu === menu.id;

                return (
                  <div key={menu.id}>
                    {menu.subMenus && menu.subMenus.length > 0 ? (
                      <>
                        <button
                          onClick={() =>
                            setOpenSubmenu(isSubmenuOpen ? null : menu.id)
                          }
                          className={`w-full text-left px-4 py-3 text-[15px] font-medium rounded-xl transition-all flex items-center justify-between ${
                            active
                              ? "text-[#F2779C] bg-[#F2779C]/10"
                              : "text-[#2C3E50] hover:text-[#F2779C] hover:bg-[#F2779C]/10"
                          }`}
                        >
                          {menu.title}
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              isSubmenuOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isSubmenuOpen && (
                          <div className="pl-4 mt-2 space-y-1">
                            {menu.subMenus.map((subMenu) => {
                              const subActive = isActive(subMenu.url);
                              return (
                                <Link
                                  key={subMenu.id}
                                  href={subMenu.url}
                                  onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    setOpenSubmenu(null);
                                  }}
                                  className={`block px-4 py-2 text-sm rounded-lg transition-all ${
                                    subActive
                                      ? "text-[#F2779C] bg-[#F2779C]/10 font-medium"
                                      : "text-[#2C3E50] hover:text-[#F2779C] hover:bg-[#F2779C]/10"
                                  }`}
                                >
                                  {subMenu.title}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={menu.url}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`px-4 py-3 text-[15px] font-medium rounded-xl transition-all ${
                          active
                            ? "text-[#F2779C] bg-[#F2779C]/10"
                            : "text-[#2C3E50] hover:text-[#F2779C] hover:bg-[#F2779C]/10"
                        }`}
                      >
                        {menu.title}
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
