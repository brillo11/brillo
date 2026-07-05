import { config } from "dotenv";
config({ path: "../../.env" });
import { PrismaClient } from "../generated/client/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("Seeding Man and Woman products...");

  const womanProducts = [
    // {
    //   name: "Visual Consulting (80분) - Woman",
    //   description:
    //     "데이터 기반 정밀 진단 + 극대화 전략 설계. 피부시술과 성형 포함 맞춤형 Visual Roadmap 제공",
    //   price: 350000,
    //   category: "Woman",
    //   tags: ["80min", "Consulting", "Visual"],
    //   featured: true,
    // },
    {
      name: "Fashion Styling (240분) - Woman",
      description:
        "나만의 시각적인 매력을 차별화 하는 동행 퍼스널 쇼핑. Signature Look Styling - 아이덴티티와 라이프스타일 반영",
      price: 880000,
      category: "Woman",
      tags: ["240min", "Styling", "Fashion", "Shopping"],
    },
    {
      name: "Total Visual Making (420분) - Woman",
      description:
        "Full Package - 컨설팅, 동행 쇼핑, 헤어 & 메이크업, 프로필 촬영. 필요 시 메디컬 연계 극대화 지원",
      price: 1100000,
      category: "Woman",
      tags: ["420min", "Total", "Making", "Package"],
      featured: true,
    },
    {
      name: "VIP & Celeb Directing - Woman",
      description:
        "비즈니스, 촬영, 그리고 무대와 영상 등 특별한 순간 가장 빛나는 당신을 위한 프라이빗 케어. 시술과 성형 메디컬 연계까지 확장, 드라마틱한 변화를 지원",
      price: 2000000,
      category: "Woman",
      tags: ["VIP", "Directing", "Private", "Care"],
      featured: true,
    },
  ];

  const manProducts = [
    {
      name: "Visual Consulting (80분) - Man",
      description:
        "데이터 기반 정밀 진단 + 극대화 전략 설계. 가치와 품격을 표현하는 비주얼 로드맵 작성",
      price: 350000,
      category: "Man",
      tags: ["80min", "Consulting", "Visual"],
      featured: true,
    },
    {
      name: "Fashion Styling (240분) - Man",
      description:
        "나만의 시각적인 매력을 차별화 하는 동행 퍼스널 쇼핑. Signature Look Styling - 아이덴티티와 라이프스타일 반영",
      price: 770000,
      category: "Man",
      tags: ["240min", "Styling", "Fashion", "Shopping"],
    },
    {
      name: "Total Visual Making (420분) - Man",
      description:
        "Full Package - 컨설팅, 동행 쇼핑, 헤어 & 메이크업, 프로필 촬영.",
      price: 990000,
      category: "Man",
      tags: ["420min", "Total", "Making", "Package"],
      featured: true,
    },
    {
      name: "VIP & Celeb Directing - Man",
      description:
        "비즈니스, 촬영, 무대와 영상 등 특별한 순간 가장 빛나는 당신을 위한 프라이빗 케어.",
      price: 2000000,
      category: "Man",
      tags: ["VIP", "Directing", "Private", "Care"],
      featured: true,
    },
  ];

  const vipProducts = [
    {
      name: "프로젝트 단위 관리 (1개월 / 3개월 / 6개월)",
      description:
        "지속적 업그레이드 + 풀케어 매니지먼트. 고급 회원 전용 연간 멤버십 프로그램 운영",
      price: 3000000,
      category: "VIP",
      tags: ["Project", "Management", "Membership"],
      featured: true,
    },
    {
      name: "피부 & 성형 컨시어지",
      description:
        "전문 피부과· 성형외과 협업, 최적화된 시술 및 수술 플랜 제안 (회복 관리 포함), 불필요한 시술/수술은 배제, 꼭 필요한 업그레이드만 제안",
      price: 1000000,
      category: "VIP",
      tags: ["Skin", "PlasticSurgery", "Concierge"],
      featured: true,
    },
    {
      name: "프라이빗 컨설팅과 공간",
      description:
        "호텔 라운지· 프라이빗 공간 진행, 시간· 장소 맞춤형 예약, 비밀 보장 시스템 (보안 계약, 촬영물 관리)",
      price: 2000000,
      category: "VIP",
      tags: ["Private", "Consulting", "Space"],
      featured: true,
    },
  ];

  for (const p of [...womanProducts, ...manProducts, ...vipProducts]) {
    await prisma.product.create({
      data: p,
    });
    console.log(`Created product: ${p.name}`);
  }

  console.log("Seeding complete.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
