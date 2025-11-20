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
  GraduationCap,
  Users,
  HelpCircle,
  ClipboardList,
  PenLine,
  History,
  Target,
  Coins,
} from "lucide-react";
import { PATH } from "./path";

// 언어 타입 정의
export type Language = "ko" | "lang2" | "lang3" | "lang4";

// export interface AdminMenuItem {
//   id: string;
//   title: string;
//   url: string;
//   icon?: LucideIcon;
//   isActive?: boolean;
//   subMenus?: {
//     id: string;
//     title: string;
//     url: string;
//   }[];
// }

// 메뉴 아이템 인터페이스
export interface MenuItem {
  id: string;
  title: string;
  baseUrl: string;
  url: string;
  subMenus?: MenuItem[];
  icon?: LucideIcon;
}

export const adminMenus: MenuItem[] = [
  {
    id: "dashboard",
    title: "대시보드",
    baseUrl: PATH.ADMIN_ROOT,
    url: PATH.ADMIN_ROOT,
    icon: BarChart3,
  },
  {
    id: "community",
    title: "공지사항",
    baseUrl: PATH.ADMIN_COMMUNITY,
    url: PATH.ADMIN_COMMUNITY_ANNOUNCEMENTS,
    icon: Megaphone,
  },
  {
    id: "missions",
    title: "미션",
    baseUrl: PATH.ADMIN_MISSIONS,
    url: PATH.ADMIN_MISSIONS_NOTICE,
    icon: Target,
    subMenus: [
      {
        id: "mission-notice",
        title: "공지",
        baseUrl: PATH.ADMIN_MISSIONS,
        url: PATH.ADMIN_MISSIONS_NOTICE,
        icon: FileText,
      },
    ],
  },
  // {
  //   id: "products",
  //   title: "제품",
  //   url: "/admin/products",
  //   icon: ShoppingBag,
  // },
  {
    id: "students",
    title: "수강생 관리",
    baseUrl: PATH.ADMIN_STUDENTS,
    url: PATH.ADMIN_STUDENTS,
    icon: User,
  },
  {
    id: "class",
    title: "기수관리",
    baseUrl: PATH.ADMIN_COHORT,
    url: PATH.ADMIN_COHORT,
    icon: GraduationCap,
  },

  // {
  //   id: "posts",
  //   title: "게시글",
  //   url: "/admin/posts",
  //   icon: FileText,
  // },
  // {
  //   id: "payment",
  //   title: "결제",
  //   url: "/admin/payment",
  //   icon: CreditCard,
  // },
];

export const studentMenus: MenuItem[] = [
  {
    id: "home",
    title: "홈",
    baseUrl: PATH.STUDENT_ROOT,
    url: PATH.STUDENT_ROOT,
    icon: BarChart3,
  },
  {
    id: "상품",
    title: "상품",
    baseUrl: PATH.STUDENT_PRODUCTS,
    url: PATH.STUDENT_PRODUCTS,
    icon: ShoppingBag,
  },
  {
    id: "주문",
    title: "주문",
    baseUrl: PATH.STUDENT_ORDERS,
    url: PATH.STUDENT_ORDERS,
    icon: ClipboardList,
    subMenus: [
      {
        id: "주문 대량 등록",
        title: "주문 대량 등록",
        baseUrl: PATH.STUDENT_ORDERS_ENTRY,
        url: PATH.STUDENT_ORDERS_ENTRY,
        icon: PenLine,
      },
      {
        id: "주문 목록",
        title: "주문 목록",
        baseUrl: PATH.STUDENT_ORDERS_LIST,
        url: PATH.STUDENT_ORDERS_LIST,
        icon: ClipboardList,
      },
      {
        id: "확정 주문",
        title: "확정 주문",
        baseUrl: PATH.STUDENT_ORDERS_HISTORY,
        url: PATH.STUDENT_ORDERS_HISTORY,
        icon: History,
      },
    ],
  },
  {
    id: "복비",
    title: "복비",
    baseUrl: PATH.STUDENT_POINTS,
    url: PATH.STUDENT_POINTS_CHARGE,
    icon: Coins,
    subMenus: [
      {
        id: "복비 충전",
        title: "복비 충전",
        baseUrl: PATH.STUDENT_POINTS,
        url: PATH.STUDENT_POINTS_CHARGE,
        icon: Coins,
      },
      {
        id: "복비 내역",
        title: "복비 내역",
        baseUrl: PATH.STUDENT_POINTS,
        url: PATH.STUDENT_POINTS_HISTORY,
        icon: History,
      },
    ],
  },
  {
    id: "수강생 라운지",
    title: "수강생 라운지",
    baseUrl: PATH.STUDENT_LOUNGE,
    url: PATH.STUDENT_LOUNGE_DASHBOARD,
    icon: Users,
    subMenus: [
      {
        id: "공지사항",
        title: "공지사항",
        baseUrl: PATH.STUDENT_LOUNGE,
        url: PATH.STUDENT_LOUNGE_ANNOUNCEMENTS,
        icon: Megaphone,
      },

      {
        id: "나의 미션",
        title: "나의 미션",
        baseUrl: PATH.STUDENT_LOUNGE,
        url: PATH.STUDENT_LOUNGE_MISSION,
        icon: Target,
      },
      {
        id: "QnA",
        title: "QnA",
        baseUrl: PATH.STUDENT_LOUNGE,
        url: PATH.STUDENT_LOUNGE_QNA,
        icon: HelpCircle,
      },
    ],
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
// export const getMenuTitle = (menu: MenuItem, lang: Language = "ko"): string => {
//   return menu.title[lang] || menu.title.ko;
// };

// 메뉴 ID로 메뉴 찾기
// export const findMenuById = (
//   id: string,
//   menus: MenuItem[] = mainMenus
// ): MenuItem | undefined => {
//   for (const menu of menus) {
//     if (menu.id === id) return menu;
//     if (menu.subMenus) {
//       const found = findMenuById(id, menu.subMenus);
//       if (found) return found;
//     }
//   }
//   return undefined;
// };

// 경로로 메뉴 찾기
// export const findMenuByPath = (
//   path: string,
//   menus: MenuItem[] = mainMenus
// ): MenuItem | undefined => {
//   for (const menu of menus) {
//     if (menu.href === path) return menu;
//     if (menu.subMenus) {
//       const found = findMenuByPath(path, menu.subMenus);
//       if (found) return found;
//     }
//   }
//   return undefined;
// };

// 기존 코드와의 호환성을 위한 변수
// export const subMenus =
//   mainMenus.find((menu) => menu.id === "about")?.subMenus || [];

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
