import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { EXCELLENT_TITLES } from '@/app/(service)/service/personal-branding/blog/__ref/excellent-titles';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.json();
        const { branding, contentPlanning } = formData;

        const prompt = `
당신은 전문적인 블로그 제목 작성자입니다.

# 작성할 제목 정보

## 브랜딩 정보
활동 분야: ${branding.specialties.join(', ')}
${branding.brandingText}

## 글의 주제 및 타겟
주제: ${contentPlanning.subject || '미지정'}
타겟 독자: ${contentPlanning.targetAudience || '미지정'}
핵심 메시지: ${contentPlanning.keyMessage || '미지정'}
키워드: ${contentPlanning.keywords.join(', ') || '미지정'}

---

# 작성 지침

1. 위 정보를 바탕으로 **블로그 제목 5개**를 생성해주세요.
2. **${EXCELLENT_TITLES}**의 패턴을 활용하세요.
3. 각 제목은 다음 규칙을 따라주세요:
   - 핵심 키워드를 포함
   - 총 길이 20~25자 내외
   - 독자의 클릭을 유도하는 매력적인 제목
   - 호기심 유발, 혜택 제시, 신뢰성 강조 등 다양한 패턴 활용

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
            .split('\n')
            .filter(line => line.trim().match(/^\d+\./))
            .map(line => line.replace(/^\d+\.\s*/, '').trim())
            .filter(title => title.length > 0)
            .slice(0, 5);

        return NextResponse.json({
            success: true,
            titles
        });

    } catch (error) {
        console.error('제목 생성 오류:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : '제목 생성 중 오류가 발생했습니다.'
            },
            { status: 500 }
        );
    }
}
