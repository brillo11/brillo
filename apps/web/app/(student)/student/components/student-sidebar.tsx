"use client";

import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  Coins,
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
    <Sidebar collapsible="icon" className="border-none shadow-sm bg-[#F9EBDD]">
      {/* 헤더 섹션 */}
      <SidebarHeader className="bg-[#F9EBDD] border-b border-[#F2779C]/10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="bg-transparent hover:bg-[#F2779C]/10"
            >
              <Link
                href={PATH.STUDENT_ROOT}
                className="flex items-center gap-3"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#F2779C] to-[#E85A89] text-white">
                  <Image
                    src="/logo_yhd.png"
                    alt="연화당 로고"
                    width={32}
                    height={32}
                    className="h-6 w-auto"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-[#2C3E50]">
                    연화당
                  </span>
                  <span className="truncate text-xs text-[#2C3E50]/70">
                    수강생
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* 메인 콘텐츠 */}
      <SidebarContent className="bg-[#F9EBDD]">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <nav className="flex-1 px-4 py-6">
              <ul className="space-y-1">
                {studentMenus.map((item) => {
                  const isActive =
                    pathname === item.url ||
                    (![PATH.STUDENT_ROOT].includes(item.baseUrl) &&
                      pathname.startsWith(item.baseUrl));

                  if (item.subMenus) {
                    return (
                      <Collapsible
                        key={item.id}
                        asChild
                        defaultOpen={isActive}
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              tooltip={item.title}
                              isActive={isActive}
                              className="w-full justify-between text-[#2C3E50] hover:text-[#F2779C] hover:bg-[#F2779C]/10 data-[active=true]:text-[#F2779C] data-[active=true]:bg-[#F2779C]/10"
                            >
                              <div className="flex items-center gap-2">
                                {item.icon && <item.icon className="h-5 w-5" />}
                                <span>{item.title}</span>
                              </div>
                              <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.subMenus.map((subItem) => {
                                const isSubActive =
                                  pathname === subItem.url ||
                                  pathname.startsWith(subItem.baseUrl);
                                return (
                                  <SidebarMenuSubItem key={subItem.id}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={isSubActive}
                                      className="text-[#2C3E50] hover:text-[#F2779C] hover:bg-[#F2779C]/10 data-[active=true]:text-[#F2779C] data-[active=true]:bg-[#F2779C]/10"
                                    >
                                      <Link href={subItem.url}>
                                        {subItem.icon && (
                                          <subItem.icon className="h-4 w-4" />
                                        )}
                                        <span>{subItem.title}</span>
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
                  }

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={isActive}
                        className="text-[#2C3E50] hover:text-[#F2779C] hover:bg-[#F2779C]/10 data-[active=true]:text-[#F2779C] data-[active=true]:bg-[#F2779C]/10"
                      >
                        <Link href={item.url}>
                          {item.icon && <item.icon className="h-5 w-5" />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </ul>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 푸터 섹션 */}
      <SidebarFooter className="bg-[#F9EBDD] border-t border-[#F2779C]/10 p-4 space-y-2">
        {/* 복비 배지 */}
        <Link href={PATH.STUDENT_POINTS_CHARGE}>
          <div className="w-full bg-gradient-to-r from-[#3BB4C1] to-[#2C8A99] text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-2">
            <Coins className="h-4 w-4" />
            <span>복비 {points.toLocaleString()} 냥</span>
          </div>
        </Link>

        {/* 프로필 및 로그아웃 */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/50">
            <div className="w-8 h-8 bg-gradient-to-br from-[#F2779C] to-[#E85A89] rounded-full flex items-center justify-center text-white">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#2C3E50] truncate">
                내 정보
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-[#2C3E50] hover:text-[#F2779C] hover:bg-[#F2779C]/10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* 사이드바 토글 버튼 */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={toggleSidebar}
              className="w-full bg-white/50 hover:bg-white/70 text-[#2C3E50]"
            >
              {state === "expanded" ? (
                <>
                  <ChevronLeft className="h-4 w-4" />
                  <span>접기</span>
                </>
              ) : (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span>펼치기</span>
                </>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
