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
    id: "about",
    title: {
      ko: "병원소개",
      lang2: "",
      lang3: "",
      lang4: "",
    },
    href: "/about/hospital",
    subMenus: [
      {
        id: "hospital",
        title: {
          ko: "병원소개",
          lang2: " Introduction",
          lang3: "",
          lang4: "",
        },
        href: "/about/hospital",
      },
      // {
      // 	id: 'doctors',
      // 	title: {
      // 		ko: '의료진소개',
      // 		lang2: '',
      // 		lang3: '',
      // 		lang4: '',
      // 	},
      // 	href: '/about/doctors',
      // },
    ],
  },
  {
    id: "signature",
    title: {
      ko: "시그니처",
      lang2: "",
      lang3: "",
      lang4: "",
    },
    href: "/signature/full-depth-lifting",
    subMenus: [
      {
        id: "full-depth-lifting",
        title: {
          ko: "풀뎁스리프팅",
          lang2: "",
          lang3: "",
          lang4: "",
        },
        href: "/signature/full-depth-lifting",
      },
      {
        id: "shoulder",
        title: {
          ko: "직각어깨",
          lang2: "",
          lang3: "",
          lang4: "",
        },
        href: "/signature/shoulder",
      },
    ],
  },
  {
    id: "volumizing",
    title: {
      ko: "볼류마이징",
      lang2: "",
      lang3: "",
      lang4: "",
    },
    href: "/volumizing/sculptra",
    subMenus: [
      {
        id: "sculptra",
        title: {
          ko: "스컬트라 / 쥬베룩",
          lang2: "",
          lang3: "",
          lang4: "",
        },
        href: "/volumizing/sculptra",
      },
      {
        id: "filler",
        title: {
          ko: "필러",
          lang2: "",
          lang3: "",
          lang4: "",
        },
        href: "/volumizing/filler",
      },
    ],
  },
  {
    id: "thread-lifting",
    title: {
      ko: "실리프팅",
      lang2: "",
      lang3: "",
      lang4: "",
    },
    href: "/thread-lifting/nasolabial-jawline",
    subMenus: [
      {
        id: "nasolabial-jawline",
        title: {
          ko: "팔자 / 턱선",
          lang2: "",
          lang3: "",
          lang4: "",
        },
        href: "/thread-lifting/nasolabial-jawline",
      },
      {
        id: "eyebrows",
        title: {
          ko: "눈썹 / 폭스아이",
          lang2: "",
          lang3: "",
          lang4: "",
        },
        href: "/thread-lifting/eyebrows",
      },
    ],
  },
  {
    id: "lifting",
    title: {
      ko: "리프팅",
      lang2: "",
      lang3: "",
      lang4: "",
    },
    href: "/lifting/xerf",
    subMenus: [
      {
        id: "xerf",
        title: {
          ko: "세르프",
          lang2: "",
          lang3: "",
          lang4: "",
        },
        href: "/lifting/xerf",
      },
      {
        id: "ulthera",
        title: {
          ko: "울쎄라",
          lang2: "",
          lang3: "",
          lang4: "",
        },
        href: "/lifting/ulthera",
      },
      {
        id: "onda",
        title: {
          ko: "온다",
          lang2: "",
          lang3: "",
          lang4: "",
        },
        href: "/lifting/onda",
      },
      {
        id: "virtue",
        title: {
          ko: "버츄",
          lang2: "",
          lang3: "",
          lang4: "",
        },
        href: "/lifting/virtue",
      },
    ],
  },
  {
    id: "skin-booster",
    title: {
      ko: "스킨 부스터",
      lang2: "",
      lang3: "",
      lang4: "",
    },
    href: "/skin-booster/skin-booster",
    subMenus: [
      {
        id: "skin-booster",
        title: {
          ko: "스킨부스터",
          lang2: "",
          lang3: "",
          lang4: "",
        },
        href: "/skin-booster/skin-booster",
      },
    ],
  },
  {
    id: "muscle-lifting",
    title: {
      ko: "근육리프팅",
      lang2: "",
      lang3: "",
      lang4: "",
    },
    href: "/muscle-lifting/eve-titan",
    subMenus: [
      {
        id: "eve-titan",
        title: {
          ko: "이브타이탄",
          lang2: "",
          lang3: "",
          lang4: "",
        },
        href: "/muscle-lifting/eve-titan",
      },
    ],
  },
  {
    id: "skin",
    title: {
      ko: "피부",
      lang2: "",
      lang3: "",
      lang4: "",
    },
    href: "/skin/botox",
    subMenus: [
      {
        id: "botox",
        title: {
          ko: "보톡스",
          lang2: "",
          lang3: "",
          lang4: "",
        },
        href: "/skin/botox",
      },
      {
        id: "whitening-hair-removal",
        title: {
          ko: "화이트닝/제모",
          lang2: "",
          lang3: "",
          lang4: "",
        },
        href: "/skin/whitening-hair-removal",
      },
    ],
  },
  {
    id: "community",
    title: {
      ko: "커뮤니티",
      lang2: "",
      lang3: "",
      lang4: "",
    },
    href: "/community/news",
    subMenus: [
      {
        id: "news",
        title: {
          ko: "리올소식",
          lang2: "",
          lang3: "",
          lang4: "",
        },
        href: "/community/news",
      },
      {
        id: "before-after",
        title: {
          ko: "Before & After",
          lang2: "",
          lang3: "",
          lang4: "",
        },
        href: "/community/before-after",
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
