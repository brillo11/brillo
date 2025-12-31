import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";
// import { EXCELLENT_TITLES } from '@/app/(service)/service/personal-branding/blog/__ref/excellent-titles';

const EXCELLENT_TITLES = `
1. [숫자]가지 방법
2. ~하는 법
3. 왜 ~인가?
4. 절대 ~하지 마라
5. ~의 비밀
`;

const DEFAULT_BRANDING_TEXT = `[자기소개 및 브랜드 슬로건]


[주요 전문 분야 및 경력]


[나만의 핵심 가치 및 차별점]
1. 
2. 
3. 

[대표적인 성과 및 포트폴리오]


[독자 혜택 및 문의 링크]`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.json();
    const { branding, contentPlanning } = formData;
    const isDefaultBranding =
      !branding.brandingText ||
      branding.brandingText.trim() === "" ||
      branding.brandingText.trim() === DEFAULT_BRANDING_TEXT.trim();

    const prompt = `
# 당신의 역할
당신은 '퍼스널 브랜딩' 전문 카피라이터이자 블로그 제목 전문가입니다.
작성자의 전문성을 드러내면서도 타겟 독자의 클릭을 강력하게 유도하는 매력적인 제목을 만드는 것이 당신의 목표입니다.

# 작성할 제목 정보

## 1. 브랜딩 정보
${
  !isDefaultBranding
    ? `- **작성자 상세 정보:** \n${branding.brandingText}`
    : `** 작성자 상세 정보가 제공되지 않았습니다. [⚠️ 중요: 작성자 정보 부재 시 대응 지침]**
- 특정 개인의 성과를 지어내지 마세요.
- 대신 해당 분야의 보편적인 전문가 혹은 통찰력 있는 분석가의 관점에서 제목을 작성하세요.`
}

## 2. 글의 주제 및 타겟
- 주제: ${contentPlanning.subject || "미지정"}
- 타겟 독자: ${contentPlanning.targetAudience || "미지정"}
- 핵심 메시지: ${contentPlanning.keyMessage || "미지정"}
- 키워드: ${contentPlanning.keywords.join(", ") || "미지정"}

---

# 작성 지침

1. 위 정보를 바탕으로 **블로그 제목 5개**를 생성해주세요.
2. **${EXCELLENT_TITLES}**의 패턴을 활용하되, 현대적인 퍼스널 브랜딩 트렌드에 맞게 변형하세요.
3. 각 제목은 다음 규칙을 따라주세요:
   - 핵심 키워드를 자연스럽게 포함
   - 총 길이 20~25자 내외 (모바일 가독성 최적화)
   - **반전의 질문, 검증된 공식 제시, 통찰력 있는 비평** 등 다양한 전략을 활용하세요.
   - 독자가 "이건 꼭 읽어야 해"라고 느낄 만큼 구체적인 혜택이나 호기심을 자극하세요.

## 출력 형식

다음 형식으로 정확히 5개의 제목만 출력해주세요:

1. [제목1]
2. [제목2]
3. [제목3]
4. [제목4]
5. [제목5]

**주의:** 번호와 제목만 출력하고, 다른 설명이나 부연은 절대 추가하지 마세요.
`;

    const result = await generateText({
      model: "google/gemini-3-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const titles = result.text
      .split("\n")
      .filter((line) => line.trim().match(/^\d+\./))
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter((title) => title.length > 0)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      titles,
    });
  } catch (error) {
    console.error("제목 생성 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "제목 생성 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
