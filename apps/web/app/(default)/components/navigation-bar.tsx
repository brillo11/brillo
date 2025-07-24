"use client";

import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { getCurrentUserProfile } from "@/serverActions/auth/auth.actions";
// import { useUserStore } from "@/store";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/sheet";
import { ChevronDown, LogOut, Menu, User, PlayCircle } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { mainMenus } from "@/consts/menus";
import { detailMenus } from "@/consts/menus";

interface UserProfile {
  id: string;
  nickname: string;
  image?: string;
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  status: "loading" | "authenticated" | "unauthenticated";
}

const Sidebar = ({ isOpen, setIsOpen, status }: SidebarProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">메뉴 열기</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-6">
        <SheetTitle></SheetTitle>
        <Link href="/" className="mb-8 flex items-center space-x-2">
          <Image
            src="/mostone-academy-black.png"
            alt="MosTone Vocal Academy"
            width={120}
            height={40}
            priority
          />
        </Link>
        <nav className="flex flex-col gap-4">
          {mainMenus.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="hover:text-primary text-muted-foreground flex items-center gap-3 text-sm font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.title.ko}
            </Link>
          ))}
        </nav>

        {status === "authenticated" && profile ? (
          <div className="my-4 border-t pt-4">
            <div className="mb-4 flex items-center gap-4">
              <Image
                src={profile?.image || "/icons/user_default_profile.png"}
                alt="사용자 프로필"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="font-medium">{profile?.nickname}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link href="/mypage">
                  <User className="mr-2 h-4 w-4" />
                  마이페이지
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link href="/myClass">
                  <PlayCircle className="mr-2 h-4 w-4" />내 강의
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                onClick={() => {
                  setProfile(null);
                  signOut();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </Button>
            </div>
          </div>
        ) : (
          <div className="my-4 border-t pt-4">
            <Link href="/auth/signin">
              <Button
                variant="default"
                className="mx-auto inline-flex w-[100px] justify-center"
              >
                로그인
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default function NavigationBar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const checkUserStatusAndRedirect = async () => {
      if (status === "authenticated" && session?.user?.id) {
        try {
          const userProfile = await getCurrentUserProfile();
          if (userProfile.isNewUser) {
            router.push("/auth/setNickname");
          }
        } catch (error) {
          console.error("사용자 상태 확인 중 오류:", error);
        }
      }
    };

    checkUserStatusAndRedirect();
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchUserProfile();
    }
  }, [status, session]);

  const [isOpen, setIsOpen] = useState(false);
  const fetchUserProfile = async () => {
    try {
      const profile = await getCurrentUserProfile();
      setProfile(profile);
    } catch (error) {
      console.error("사용자 정보를 가져오는 중 오류 발생:", error);
    } finally {
    }
  };

  // 현재 페이지 활성 상태 확인
  const isActiveLink = (href: string) => {
    if (href.startsWith("/#")) return false; // 스크롤 링크는 별도 처리
    return pathname === href;
  };

  const renderAuthSection = () => {
    switch (status) {
      case "loading":
        return <div className="h-10 w-20 animate-pulse rounded bg-gray-200" />;

      case "authenticated":
        return profile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hidden gap-2 md:flex"
              >
                <Image
                  src={profile?.image || "/icons/user_default_profile.png"}
                  alt="사용자 프로필"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex items-center">
                  <span className="text-sm font-medium">
                    {profile?.nickname}
                  </span>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <div>
                  <p className="font-medium">{profile?.nickname}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/mypage" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>마이페이지</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/class" className="cursor-pointer">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  <span>강의실</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-500 hover:text-red-600 focus:text-red-600"
                onClick={() => {
                  setProfile(null);
                  signOut();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>로그아웃</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="h-10 w-20 animate-pulse rounded bg-gray-200" />
        );

      case "unauthenticated":
        return (
          <Link href="/auth/signin">
            <Button variant="default" className="hidden md:inline-flex">
              로그인
            </Button>
          </Link>
        );

      default:
        return null;
    }
  };

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b px-6 backdrop-blur">
      <div className="flex h-16 w-full items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/mostone-academy-black.png"
              alt="MosTone Vocal Academy"
              width={120}
              height={40}
              priority
            />
          </Link>
          {/* 왼쪽: 디테일 페이지 스크롤 네비게이션 */}
          <nav className="hidden gap-6 xl:flex">
            {detailMenus.map((item) => (
              <Link
                key={`detail-${item.id}`}
                href={item.href}
                className="hover:text-primary text-foreground text-sm font-medium transition-colors"
              >
                {item.title.ko}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* 우측: 새로운 페이지 네비게이션 */}
          <nav className="hidden gap-4 md:flex">
            {mainMenus.map((item) => (
              <Link
                key={`page-${item.id}`}
                href={item.href}
                className={`hover:text-primary flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActiveLink(item.href)
                    ? "font-semibold text-[#FF3B30]"
                    : "text-foreground"
                }`}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.title.ko}
              </Link>
            ))}
          </nav>

          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} status={status} />
          {renderAuthSection()}
        </div>
      </div>
    </header>
  );
}
