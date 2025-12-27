import { generateText } from "ai";
import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/shared/lib/auth";
import { H3_STYLE } from "@/features/blog/constants";

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
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { currentContent, refineRequest, formData } = await req.json();
    const { branding, contentPlanning, options, brandingMode } = formData;

    if (!currentContent || !refineRequest) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const isDefaultBranding =
      !branding.brandingText ||
      branding.brandingText.trim() === "" ||
      branding.brandingText.trim() === DEFAULT_BRANDING_TEXT.trim();

    const prompt = `
# 당신의 역할
당신은 '퍼스널 브랜딩' 전문 카피라이터입니다. 
사용자가 작성한 기존 블로그 글을 사용자의 추가 요청에 맞춰 수정하는 것이 당신의 목표입니다.

# 기존 블로그 글 (HTML 형식)
\`\`\`html
${currentContent}
\`\`\`

# 사용자의 수정 요청
"${refineRequest}"

# 작성 지침
1. **요청 반영:** 사용자의 수정 요청을 정확하게 반영하세요. 
2. **HTML 구조 유지:** 기존의 HTML 구조(div, p, h2, h3, img, a 등)와 인라인 스타일을 최대한 유지하면서 내용만 수정하세요.
3. **브랜딩 일관성:** 기존 글의 톤앤매너와 브랜딩 전략을 유지하세요.
4. **이미지 태그 보존:** 기존 글에 포함된 \`<img>\` 태그(src, alt, style 포함)는 절대 삭제하거나 변경하지 말고, 적절한 위치에 그대로 두세요.
5. **순수 HTML 출력 (중요 !!!) :** \`<!DOCTYPE>\`, \`<html>\`, \`<head>\`, \`<body>\` 태그 없이 순수 콘텐츠 HTML만 출력하세요. 최상위는 \`<div>\`로 시작해야 합니다. 기존 전달된 블로그 글의 최상위는 \`\`\`html 로 싸져있지만, 이를 제거하고 순수 HTML 출력을 해주세요.

    6. **헤딩 스타일링**: 새로 추가되거나 수정되는 \`h3\` 태그에는 반드시 다음 스타일을 적용하세요: "${H3_STYLE}"

# 추가 문맥 (브랜딩 전략 유지 및 참고용)
- **브랜딩 모드:** ${brandingMode}
- **브랜딩 정보:** 
${
  !isDefaultBranding
    ? branding.brandingText
    : "- 작성자 정보 없음 (객관적 통찰 및 보편적 권위 기반의 톤 유지)"
}
- **주제:** ${contentPlanning.subject}
- **타겟:** ${contentPlanning.targetAudience}
- **말투:** ${options.styleReference}
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

    return NextResponse.json({
      success: true,
      updatedContent: result.text,
    });
  } catch (error) {
    console.error("Refinement API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
