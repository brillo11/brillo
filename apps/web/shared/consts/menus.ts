import {
  Workflow,
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
  PlayCircle,
  Video,
  Award,
  CheckCircle2,
  BookMarked,
  Library,
  NotebookPen,
  Bot,
  Wand2,
  Youtube,
  TrendingUp,
  Sparkles,
  Flame,
  Instagram,
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
  section?: string; // 섹션 구분자
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
  {
    id: "youtube",
    title: "YouTube",
    baseUrl: PATH.ADMIN_YOUTUBE_CHANNELS,
    url: PATH.ADMIN_YOUTUBE_CHANNELS,
    icon: Video,
    subMenus: [
      {
        id: "youtube-channels",
        title: "채널",
        baseUrl: PATH.ADMIN_YOUTUBE_CHANNELS,
        url: PATH.ADMIN_YOUTUBE_CHANNELS,
        icon: Video,
      },
      {
        id: "youtube-videos",
        title: "영상",
        baseUrl: PATH.ADMIN_YOUTUBE_VIDEOS,
        url: PATH.ADMIN_YOUTUBE_VIDEOS,
        icon: PlayCircle,
      },
    ],
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

export const serviceMenus: MenuItem[] = [
  {
    id: "dashboard",
    title: "대시보드",
    baseUrl: PATH.SERVICE_DASHBOARD,
    url: PATH.SERVICE_DASHBOARD,
    icon: Home,
  },
  {
    id: "personal-branding",
    title: "퍼스널 브랜딩",
    baseUrl: PATH.SERVICE_PERSONAL_BRANDING,
    url: PATH.SERVICE_PERSONAL_BRANDING,
    icon: Wand2,
    subMenus: [
      {
        id: "퍼스널 브랜딩",
        title: "워크플로우",
        baseUrl: PATH.SERVICE_PERSONAL_BRANDING,
        url: PATH.SERVICE_PERSONAL_BRANDING_WORKFLOW,
        icon: Sparkles,
      },
      {
        id: "blog",
        title: "블로그",
        baseUrl: PATH.SERVICE_PERSONAL_BRANDING,
        url: PATH.SERVICE_PERSONAL_BRANDING_BLOG,
        icon: PenLine,
      },
      {
        id: "threads",
        title: "쓰레드",
        baseUrl: PATH.SERVICE_PERSONAL_BRANDING,
        url: PATH.SERVICE_PERSONAL_BRANDING_THREADS,
        icon: MessageCircle,
      },
      {
        id: "instagram",
        title: "인스타그램",
        baseUrl: PATH.SERVICE_PERSONAL_BRANDING,
        url: PATH.SERVICE_PERSONAL_BRANDING_INSTAGRAM,
        icon: Instagram,
      },
      {
        id: "video",
        title: "영상 제작",
        baseUrl: PATH.SERVICE_PERSONAL_BRANDING,
        url: PATH.SERVICE_PERSONAL_BRANDING_VIDEO,
        icon: Youtube,
      },
    ],
  },
  {
    id: "outlier",
    title: "트렌드 분석",
    baseUrl: PATH.SERVICE_TRENDS,
    url: PATH.SERVICE_TRENDS,
    icon: TrendingUp,
    subMenus: [
      {
        id: "아웃라이어",
        title: "아웃라이어",
        baseUrl: PATH.SERVICE_TRENDS_OUTLIER,
        url: PATH.SERVICE_TRENDS_OUTLIER,
        icon: Flame,
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
