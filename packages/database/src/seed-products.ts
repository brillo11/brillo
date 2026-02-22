import { config } from "dotenv";
config({ path: "../../.env" });
import { PrismaClient } from "../generated/client/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

async function main() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://brillo:brillo1212%21%21@pg1101.gabiadb.com:5432/brillo?sslmode=disable";
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("Seeding Man and Woman products...");

  const womanProducts = [
    {
      name: "Visual Consulting (90분) - Woman",
      description:
        "데이터 기반 정밀 진단 + 극대화 전략 설계. 피부시술과 성형 포함 맞춤형 Visual Roadmap 제공",
      price: 330000,
      category: "Woman",
      tags: ["90min", "Consulting", "Visual"],
      featured: true,
    },
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
  ];

  const manProducts = [
    {
      name: "Visual Consulting (90분) - Man",
      description:
        "데이터 기반 정밀 진단 + 극대화 전략 설계. 가치와 품격을 표현하는 비주얼 로드맵 작성",
      price: 330000,
      category: "Man",
      tags: ["90min", "Consulting", "Visual"],
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
  ];

  for (const p of [...womanProducts, ...manProducts]) {
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
