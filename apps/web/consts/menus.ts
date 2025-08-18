import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  LucideIcon,
  User,
  Star,
  BookOpen,
  CreditCard,
  Megaphone,
  MessageCircle,
  BarChart3,
  FileText,
  ShoppingBag,
  MessageSquare,
} from "lucide-react";

// 언어 타입 정의
export type Language = "ko" | "lang2" | "lang3" | "lang4";

export interface AdminMenuItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  subMenus?: {
    id: string;
    title: string;
    url: string;
  }[];
}

// 메뉴 아이템 인터페이스
export interface MenuItem {
  id: string;
  title: {
    ko: string;
    lang2: string;
    lang3?: string;
    lang4?: string;
  };
  href: string;
  subMenus?: MenuItem[];
  icon?: LucideIcon;
}

export const adminMenus: AdminMenuItem[] = [
  {
    id: "dashboard",
    title: "대시보드",
    url: "/admin",
    icon: BarChart3,
  },
  {
    id: "products",
    title: "제품",
    url: "/admin/products",
    icon: ShoppingBag,
  },
  {
    id: "user",
    title: "유저",
    url: "/admin/user",
    icon: User,
  },
  {
    id: "posts",
    title: "게시글",
    url: "/admin/posts",
    icon: FileText,
  },
  {
    id: "payment",
    title: "결제",
    url: "/admin/payment",
    icon: CreditCard,
  },
];

// 메인 메뉴

export const mainMenus: MenuItem[] = [
  {
    id: "notice",
    title: {
      ko: "공지사항",
      lang2: "Notice",
    },
    href: "/notice",
    icon: Megaphone,
  },
  {
    id: "products",
    title: {
      ko: "제품",
      lang2: "Products",
    },
    href: "/products",
    icon: ShoppingBag,
  },
  {
    id: "cart",
    title: {
      ko: "장바구니",
      lang2: "Cart",
    },
    href: "/cart",
    icon: ShoppingBag,
  },
  {
    id: "board",
    title: {
      ko: "게시글",
      lang2: "Board",
    },
    href: "/board/free",
    icon: MessageSquare,
  },
  {
    id: "payment",
    title: {
      ko: "결제",
      lang2: "Payment",
    },
    href: "/payment",
    icon: CreditCard,
  },
];

export const detailMenus: MenuItem[] = [
  {
    id: "intro",
    title: {
      ko: "소개",
      lang2: "Intro",
    },
    href: "/detail/#intro",
  },
  {
    id: "detail",
    title: {
      ko: "상세",
      lang2: "Detail",
    },
    href: "/detail/#detail",
  },
  {
    id: "event",
    title: {
      ko: "이벤트",
      lang2: "Event",
    },
    href: "/detail/#event",
  },
];

export const snsMenus = [
  {
    id: "blog",
    href: "#",
    iconBlack: "/images/layout/blog_black.svg",
    iconWhite: "/images/layout/blog.svg",
  },
  {
    id: "cafe",
    href: "#",
    iconBlack: "/images/layout/cafe_black.svg",
    iconWhite: "/images/layout/cafe.svg",
  },
  {
    id: "instagram",
    href: "#",
    iconBlack: "/images/layout/instagram_black.svg",
    iconWhite: "/images/layout/instagram.svg",
  },
  {
    id: "youtube",
    href: "#",
    iconBlack: "/images/layout/youtube_black.svg",
    iconWhite: "/images/layout/youtube.svg",
  },
];

// 특정 언어로 메뉴 제목 가져오기
export const getMenuTitle = (menu: MenuItem, lang: Language = "ko"): string => {
  return menu.title[lang] || menu.title.ko;
};

// 메뉴 ID로 메뉴 찾기
export const findMenuById = (
  id: string,
  menus: MenuItem[] = mainMenus
): MenuItem | undefined => {
  for (const menu of menus) {
    if (menu.id === id) return menu;
    if (menu.subMenus) {
      const found = findMenuById(id, menu.subMenus);
      if (found) return found;
    }
  }
  return undefined;
};

// 경로로 메뉴 찾기
export const findMenuByPath = (
  path: string,
  menus: MenuItem[] = mainMenus
): MenuItem | undefined => {
  for (const menu of menus) {
    if (menu.href === path) return menu;
    if (menu.subMenus) {
      const found = findMenuByPath(path, menu.subMenus);
      if (found) return found;
    }
  }
  return undefined;
};

// 기존 코드와의 호환성을 위한 변수
export const subMenus =
  mainMenus.find((menu) => menu.id === "about")?.subMenus || [];

export const surgeries = [
  {
    name: "얼굴 지방흡입",
  },
  {
    name: "가슴 지방이식",
  },
  {
    name: "복부 지방흡입",
  },
  {
    name: "여유증",
  },
  {
    name: "팔뚝 지방흡입",
  },
  {
    name: "골반&엉덩이 지방흡입",
  },
  {
    name: "지방흡입 재수술",
  },
  {
    name: "허벅지 지방흡입",
  },
];
