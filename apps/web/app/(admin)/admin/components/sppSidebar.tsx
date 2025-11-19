"use client";

import {
  Home,
  LogOut,
  BarChart3,
  ChevronLeft,
  ChevronRight,
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
import { AdminMenuItem } from "@/shared/consts/menus";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { METADATA } from "@/shared/consts/metadata";
import { Button } from "@repo/ui/components/button";
import { signOut } from "@/shared/lib/auth-client";

interface Props {
  items: AdminMenuItem[];
}

export function AppSidebar({ items }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, toggleSidebar } = useSidebar();

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
    <Sidebar collapsible="icon" className="border-r bg-white">
      {/* 헤더 섹션 */}
      <SidebarHeader className="border-b">
        {state === "expanded" ? (
          // 펼쳐진 상태: 기존 헤더
          <div className="flex items-center justify-between p-4">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E53935] text-white">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{METADATA.TITLE}</h2>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 hover:bg-gray-100"
              title="사이드바 접기"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
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
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive =
                  pathname === item.url ||
                  (item.url !== "/admin" && pathname.startsWith(item.url));

                if (item.subMenus) {
                  return (
                    <Collapsible
                      key={item.id}
                      asChild
                      defaultOpen={item.isActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            className={`${item.isActive ? "bg-[#E53935] text-white hover:bg-[#E53935] hover:text-white" : ""}`}
                          >
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            {item?.subMenus && (
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.subMenus?.map((subMenu) => {
                              const isSubActive = pathname === subMenu.url;
                              return (
                                <SidebarMenuSubItem key={subMenu.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    className={`${isSubActive ? "bg-[#E53935] text-white hover:bg-[#E53935] hover:text-white" : ""}`}
                                  >
                                    <Link href={subMenu.url}>
                                      <span>{subMenu.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                } else {
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        className={`${isActive ? "bg-[#E53935] text-white hover:bg-[#E53935] hover:text-white" : ""}`}
                      >
                        <Link href={item.url}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }
              })}
            </SidebarMenu>
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
