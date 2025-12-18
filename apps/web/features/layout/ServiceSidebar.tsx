"use client";

import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  Coins,
  GraduationCap,
  Settings,
  Home,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@repo/ui/components/sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MenuItem, studentMenus } from "@/shared/consts/menus";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { Button } from "@repo/ui/components/button";
import { signOut, useSession } from "@/shared/lib/auth-client";
import { PATH } from "@/shared/consts/path";
import Image from "next/image";
import { Logo } from "@repo/ui/components/proBlocks/logo";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";

export function ServiceSidebar({ points = 0 }: { points?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, toggleSidebar } = useSidebar();
  const { data: session } = useSession();
  const user = session?.user;

  const userImage = (user as any)?.image;
  const userName = (user as any)?.name || (user as any)?.nickname || "사용자";
  const userEmail = (user as any)?.email || "";

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("로그아웃 오류:", error);
      router.push("/");
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-none shadow-sm">
      {/* 헤더 섹션 */}
      <SidebarHeader className="bg-white border-b border-gray-100">
        {state === "expanded" ? (
          <div className="p-6 flex items-center">
            <Logo size="md" />
          </div>
        ) : (
          <button
            onClick={toggleSidebar}
            className="flex h-16 w-full items-center justify-center transition-colors hover:bg-gray-50"
            title="사이드바 펼치기"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        )}
      </SidebarHeader>

      {/* 메인 콘텐츠 */}
      <SidebarContent className="bg-white">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <nav className="flex-1 overflow-y-auto py-6 px-4">
              <ul className="space-y-1.5">
                {studentMenus.map((item, index) => {
                  // 섹션 헤더 렌더링
                  if (item.section) {
                    return (
                      <div key={item.id} className="pt-4 pb-2">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 pl-3">
                          {item.section}
                        </div>
                      </div>
                    );
                  }

                  // 부모 메뉴의 active 판단
                  let isActive = false;

                  // subMenu가 있는 경우, 자식 메뉴 중 하나가 정확히 active인지 확인
                  if (item.subMenus && item.subMenus.length > 0) {
                    // 자식 메뉴 중 하나가 정확히 매칭되는지 확인
                    isActive = item.subMenus.some(
                      (subItem) => pathname === subItem.url
                    );
                  } else {
                    // subMenu가 없는 경우, 정확한 URL 매칭만 사용
                    isActive = pathname === item.url;
                  }

                  if (item.subMenus) {
                    return (
                      <Collapsible
                        key={item.id}
                        asChild
                        defaultOpen={true}
                        className="group/collapsible"
                      >
                        <li suppressHydrationWarning>
                          <CollapsibleTrigger asChild>
                            <button
                              suppressHydrationWarning
                              className={`group w-full text-left px-4 py-3 rounded-xl flex items-center justify-between text-sm font-medium transition-all duration-200 ${
                                isActive
                                  ? "bg-red-50 text-red-700 shadow-sm"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {item.icon && (
                                  <item.icon
                                    size={20}
                                    className={
                                      isActive
                                        ? "text-red-600"
                                        : "text-gray-400"
                                    }
                                  />
                                )}
                                <span>{item.title}</span>
                              </div>
                              <ChevronDown
                                className={`w-4 h-4 transition-all duration-200 ${
                                  isActive
                                    ? "text-white"
                                    : "text-slate-300 group-hover:text-slate-500"
                                } group-data-[state=open]/collapsible:rotate-180`}
                              />
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <ul className="mt-1 space-y-1 pl-4">
                              {item.subMenus?.map((subMenu) => {
                                // 서브메뉴 내 섹션 헤더 렌더링
                                if (subMenu.section) {
                                  return (
                                    <div key={subMenu.id} className="pt-2 pb-1">
                                      <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 pl-3">
                                        {subMenu.section}
                                      </div>
                                    </div>
                                  );
                                }

                                // 서브 메뉴의 active 판단: 정확한 URL 매칭만 사용
                                const isSubActive = pathname === subMenu.url;

                                // 2단계 메뉴 렌더링
                                return (
                                  <li key={subMenu.title}>
                                    <Link
                                      href={subMenu.url}
                                      className={`group w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium transition-all duration-200 ${
                                        isSubActive
                                          ? "bg-red-50 text-red-700 shadow-sm"
                                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                      }`}
                                    >
                                      {subMenu.icon && (
                                        <subMenu.icon
                                          size={16}
                                          className={
                                            isSubActive
                                              ? "text-red-600"
                                              : "text-gray-400"
                                          }
                                        />
                                      )}
                                      <span>{subMenu.title}</span>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </CollapsibleContent>
                        </li>
                      </Collapsible>
                    );
                  } else {
                    return (
                      <li key={item.id}>
                        <Link
                          href={item.url}
                          className={`group w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? "bg-red-50 text-red-700 shadow-sm"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          {item.icon && (
                            <item.icon
                              size={20}
                              className={
                                isActive ? "text-red-600" : "text-gray-400"
                              }
                            />
                          )}
                          <span>{item.title}</span>
                        </Link>
                      </li>
                    );
                  }
                })}
              </ul>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 하단 메뉴 */}
      <SidebarFooter className="border-t border-gray-100 p-4">
        {state === "expanded" && user && (
          <>
            <div className="flex items-center gap-3 mb-4 px-2 p-2 rounded-lg bg-gray-50/50">
              <Avatar className="w-10 h-10 rounded-full border border-white shadow-sm">
                <AvatarImage src={userImage || ""} alt={userName} />
                <AvatarFallback className="bg-red-100 text-red-600">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">
                  {userName}
                </p>
                {userEmail && (
                  <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <Link
                href={PATH.STUDENT_PROFILE}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Settings size={18} />
                마이페이지
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                로그아웃
              </button>
            </div>
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
