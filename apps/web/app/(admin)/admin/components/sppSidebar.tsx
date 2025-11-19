"use client";

import {
  Home,
  LogOut,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
import { MenuItem, adminMenus, studentMenus } from "@/shared/consts/menus";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { METADATA } from "@/shared/consts/metadata";
import { Button } from "@repo/ui/components/button";
import { signOut } from "@/shared/lib/auth-client";
import { PATH } from "@/shared/consts/path";
import Image from "next/image";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, toggleSidebar } = useSidebar();

  const isAdmin = pathname.includes(PATH.ADMIN_ROOT);
  const isStudent = pathname.includes(PATH.STUDENT_ROOT);
  const rootUrl = isAdmin
    ? PATH.ADMIN_ROOT
    : isStudent
      ? PATH.STUDENT_ROOT
      : "/";
  const items = pathname.includes(PATH.ADMIN_ROOT) ? adminMenus : studentMenus;

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("로그아웃 오류:", error);
      // 오류가 발생해도 홈으로 이동
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
              href={rootUrl}
              className="flex items-center justify-center w-full"
            >
              <Image
                src="/logo_yhd.png"
                alt="logo"
                width={350}
                height={100}
                className="h-[40px] w-auto"
              />
              {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E53935] text-white">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{METADATA.TITLE}</h2>
              </div> */}
            </Link>
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 hover:bg-gray-100"
              title="사이드바 접기"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button> */}
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
                {items.map((item) => {
                  const isActive =
                    pathname === item.url ||
                    (![PATH.ADMIN_ROOT, PATH.STUDENT_ROOT].includes(
                      item.baseUrl
                    ) &&
                      pathname.startsWith(item.baseUrl));

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
                                  ? "bg-slate-800 text-white shadow-sm"
                                  : "hover:bg-slate-100 text-slate-600 hover:text-slate-800"
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
                                const isSubActive = pathname === subMenu.url;
                                return (
                                  <li key={subMenu.title}>
                                    <Link
                                      href={subMenu.url}
                                      className={`group w-full text-left px-4 py-3 rounded-lg flex items-center transition-all duration-200 ${
                                        isSubActive
                                          ? "bg-slate-800 text-white shadow-sm"
                                          : "hover:bg-slate-100 text-slate-600 hover:text-slate-800"
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
                              ? "bg-slate-800 text-white shadow-sm"
                              : "hover:bg-slate-100 text-slate-600 hover:text-slate-800"
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="사이트 보기">
              <Link href="/">
                <Home className="h-4 w-4" />
                <span>사이트 보기</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
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
