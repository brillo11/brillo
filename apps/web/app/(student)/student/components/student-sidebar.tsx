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
import { signOut } from "@/shared/lib/auth-client";
import { PATH } from "@/shared/consts/path";
import Image from "next/image";

export function StudentSidebar({ points = 0 }: { points?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, toggleSidebar } = useSidebar();

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
      <SidebarHeader className="bg-white">
        {state === "expanded" ? (
          // 펼쳐진 상태: 기존 헤더
          <div className="flex items-center justify-between p-2">
            <Link
              href={PATH.STUDENT_ROOT}
              className="flex items-center gap-3 w-full px-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#1E3A8A] text-white shadow-md">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-slate-900 truncate">
                  LearnFlow
                </h2>
                <p className="text-xs text-slate-500 truncate">수강생</p>
              </div>
            </Link>
          </div>
        ) : (
          // 접힌 상태: 전체가 펼치기 버튼
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
            <nav className="flex-1 px-4 py-6">
              <ul className="space-y-1">
                {studentMenus.map((item) => {
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
                        defaultOpen={isActive}
                        className="group/collapsible"
                      >
                        <li>
                          <CollapsibleTrigger asChild>
                            <button
                              className={`group w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-all duration-200 ${
                                isActive
                                  ? "bg-[#3B82F6] text-white shadow-sm"
                                  : "hover:bg-[#3B82F6]/10 text-slate-600 hover:text-[#3B82F6]"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                {item.icon && (
                                  <item.icon
                                    className={`w-5 h-5 transition-colors ${
                                      isActive
                                        ? "text-white"
                                        : "text-slate-400 group-hover:text-slate-600"
                                    }`}
                                  />
                                )}
                                <span
                                  className={`font-medium text-sm lg:text-base transition-colors ${
                                    isActive
                                      ? "text-white"
                                      : "text-slate-600 group-hover:text-slate-800"
                                  }`}
                                >
                                  {item.title}
                                </span>
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
                                // 서브 메뉴의 active 판단: 정확한 URL 매칭만 사용
                                const isSubActive = pathname === subMenu.url;
                                return (
                                  <li key={subMenu.title}>
                                    <Link
                                      href={subMenu.url}
                                      className={`group w-full text-left px-4 py-3 rounded-lg flex items-center transition-all duration-200 ${
                                        isSubActive
                                          ? "bg-[#3B82F6] text-white shadow-sm"
                                          : "hover:bg-[#3B82F6]/10 text-slate-600 hover:text-[#3B82F6]"
                                      }`}
                                    >
                                      <span
                                        className={`font-medium text-sm lg:text-base transition-colors ${
                                          isSubActive
                                            ? "text-white"
                                            : "text-slate-600 group-hover:text-slate-800"
                                        }`}
                                      >
                                        {subMenu.title}
                                      </span>
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
                          className={`group w-full text-left px-4 py-3 rounded-lg flex items-center transition-all duration-200 ${
                            isActive
                              ? "bg-[#3B82F6] text-white shadow-sm"
                              : "hover:bg-[#3B82F6]/10 text-slate-600 hover:text-[#3B82F6]"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {item.icon && (
                              <item.icon
                                className={`w-5 h-5 transition-colors ${
                                  isActive
                                    ? "text-white"
                                    : "text-slate-400 group-hover:text-slate-600"
                                }`}
                              />
                            )}
                            <span
                              className={`font-medium text-sm lg:text-base transition-colors ${
                                isActive
                                  ? "text-white"
                                  : "text-slate-600 group-hover:text-slate-800"
                              }`}
                            >
                              {item.title}
                            </span>
                          </div>
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
      <SidebarFooter className="border-t">
        {/* 포인트 배지 (접힌 상태에서는 숨김) */}
        {state === "expanded" && (
          <div className="px-4 py-2 border-b border-slate-200">
            <Link href={PATH.STUDENT_POINTS_CHARGE}>
              <div className="w-full bg-gradient-to-r from-[#3B82F6] to-[#1E3A8A] text-white px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer hover:from-[#2563EB] hover:to-[#1E40AF] transition-all flex items-center gap-2 shadow-md">
                <Coins className="h-4 w-4" />
                <span>포인트 {points.toLocaleString()}P</span>
              </div>
            </Link>
          </div>
        )}
        <SidebarMenu>
          {state === "expanded" && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="프로필 설정">
                <Link href={PATH.STUDENT_PROFILE}>
                  <User className="h-4 w-4" />
                  <span>프로필 설정</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="로그아웃"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              <span>로그아웃</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
