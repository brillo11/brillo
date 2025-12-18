"use client";

import { LogOut, ChevronRight, ChevronDown, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  useSidebar,
} from "@repo/ui/components/sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { serviceMenus } from "@/shared/consts/menus";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { signOut, useSession } from "@/shared/lib/auth-client";
import { PATH } from "@/shared/consts/path";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import Image from "next/image";

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
    <Sidebar
      collapsible="icon"
      className="border-r border-white/5 bg-[#0A0A0A]"
    >
      {/* 헤더 섹션 */}
      <SidebarHeader className="bg-[#0A0A0A] border-b border-white/5 p-0">
        {state === "expanded" ? (
          <div className="h-20 flex items-center px-8">
            {/* Logo */}
            <Link href={PATH.HOME} className="flex items-center gap-2">
              <Image
                src="/android-chrome-512x512.png"
                width={48}
                height={48}
                alt="logo"
              />
              {/* <div className="w-8 h-8 bg-[#33DB98] rounded flex items-center justify-center font-bold text-black text-base">
                VZX
              </div> */}
              {/* <span className="font-bold text-base tracking-tight text-white">
                VizionX
              </span> */}
            </Link>
          </div>
        ) : (
          <button
            onClick={toggleSidebar}
            className="flex h-16 w-full items-center justify-center transition-colors hover:bg-white/5"
            title="사이드바 펼치기"
          >
            <div className="w-8 h-8 bg-[#33DB98] rounded flex items-center justify-center font-bold text-black text-xl">
              V
            </div>
          </button>
        )}
      </SidebarHeader>

      {/* 메인 콘텐츠 */}
      <SidebarContent className="bg-[#0A0A0A] p-4 space-y-2">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <nav className="flex-1 overflow-y-auto">
              <ul className="space-y-2">
                {serviceMenus.map((item, index) => {
                  // 섹션 헤더 렌더링
                  if (item.section) {
                    return (
                      <div key={item.id} className="pt-4 pb-2">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500 pl-3">
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
                                  ? "bg-[#18181b] text-white border border-[#33DB98]/20 shadow-[0_0_15px_rgba(51,219,152,0.05)]"
                                  : "text-gray-500 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {item.icon && (
                                  <item.icon
                                    size={20}
                                    className={`transition-colors ${
                                      isActive
                                        ? "text-[#33DB98]"
                                        : "group-hover:text-white"
                                    }`}
                                  />
                                )}
                                <span>{item.title}</span>
                              </div>
                              <ChevronDown
                                className={`w-4 h-4 transition-all duration-200 ${
                                  isActive
                                    ? "text-white"
                                    : "text-gray-500 group-hover:text-white"
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
                                      <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500 pl-3">
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
                                          ? "bg-[#18181b] text-white border border-[#33DB98]/20 shadow-[0_0_15px_rgba(51,219,152,0.05)]"
                                          : "text-gray-500 hover:text-white hover:bg-white/5"
                                      }`}
                                    >
                                      {subMenu.icon && (
                                        <subMenu.icon
                                          size={16}
                                          className={`transition-colors ${
                                            isSubActive
                                              ? "text-[#33DB98]"
                                              : "group-hover:text-white"
                                          }`}
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
                              ? "bg-[#18181b] text-white border border-[#33DB98]/20 shadow-[0_0_15px_rgba(51,219,152,0.05)]"
                              : "text-gray-500 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {item.icon && (
                            <item.icon
                              size={20}
                              className={`transition-colors ${
                                isActive
                                  ? "text-[#33DB98]"
                                  : "group-hover:text-white"
                              }`}
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
      <div className="p-4 border-t border-white/5 bg-[#0A0A0A]">
        {state === "expanded" && user ? (
          <>
            <Link
              href={PATH.SERVICE_PROFILE}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white transition-colors"
            >
              <Settings size={20} />
              <span>설정</span>
            </Link>
            <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-vzx-card rounded-xl border border-white/5">
              <Avatar className="w-8 h-8 rounded-full border border-[#33DB98]">
                <AvatarImage src={userImage || ""} alt={userName} />
                <AvatarFallback className="bg-[#33DB98] text-black font-bold">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="text-gray-500 cursor-pointer hover:text-red-500 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Link
              href={PATH.SERVICE_PROFILE}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <Settings size={20} />
            </Link>
            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-red-500 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
