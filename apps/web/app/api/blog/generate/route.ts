import { generateText } from "ai";
import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
// import {
//     FORBIDDEN_WORDS,
//     FORBIDDEN_PHRASES,
//     WRITING_RULES,
//     EXCELLENT_TITLES,
//     MEDICAL_LAW_GUIDELINES,
//     CONVERSION_EXAMPLES,
// } from '@/lib/reference-materials';
import { auth } from "@/shared/lib/auth";
import { uploadToS3 } from "@/serverActions/blog/ai-photo";
import {
  generateImageWithAI,
  editImageWithAI,
} from "@/shared/serverActions/aiGateway";
import { v4 as uuidv4 } from "uuid";

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

    const userId = session.user.id;
    // console.log('✅ User ID:', userId);
    const formData = await req.json();

        // Step 1: 요청 접수
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const tasks: Promise<any>[] = [];

                try {
                    // 1. 유튜브 GIF 생성 태스크 시작 (병렬)
                    if (formData.gif?.youtubeUrl && formData.gif?.startTimes?.length > 0) {
                        tasks.push((async () => {
                            try {
                                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', step: 4, message: '유튜브 GIF 생성 시작' })}\n\n`));
                                const serverUrl = "http://121.126.124.4:5000/make-gif";
                                const response = await fetch(serverUrl, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        url: formData.gif.youtubeUrl,
                                        times: formData.gif.startTimes,
                                        userId: userId
                                    })
                                });

                                if (response.ok) {
                                    const result = await response.json();
                                    if (result.urls && result.urls.length > 0) {
                                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                                            type: 'gif-result',
                                            urls: result.urls
                                        })}\n\n`));
                                    }
                                } else {
                                    console.error('GIF generation server failed:', await response.text());
                                }
                            } catch (e) {
                                console.error('Error calling GIF server:', e);
                            }
                        })());
                    }

                    // 2. 본문 생성 프로세스 (순차)
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', step: 1, message: '요청 접수' })}\n\n`));
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', step: 2, message: '프롬프트 생성' })}\n\n`));

                    const prompt = constructPrompt(formData);
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', step: 3, message: '본문 생성' })}\n\n`));

                    const result = await generateText({
                        model: "google/gemini-3-flash",
                        messages: [
                            {
                                role: "user",
                                content: prompt,
                            },
                        ],
                    });

                    const textContent = result.text || '';
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', content: textContent })}\n\n`));

                    // 3. 이미지 생성 및 인물 사진 처리 (본문이 필요하므로 본문 생성 후 병렬 시작)
                    const contentProcessingTasks: Promise<any>[] = [];

                    // AI 이미지 생성
                    if (formData.options?.generateImageWithAi) {
                        contentProcessingTasks.push((async () => {
                            try {
                                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', step: 3, message: '이미지 생성 중...' })}\n\n`));
                                const imgTagRegex = /<img[^>]*src="(\[IMAGE_PLACEHOLDER_\d+\])"[^>]*alt="([^"]*)"[^>]*>/g;
                                const matches = [...textContent.matchAll(imgTagRegex)];

                                if (matches.length > 0) {
                                    await Promise.all(matches.map(async (match) => {
                                        const placeholder = match[1] || '';
                                        const altText = match[2] || '';
                                        if (!placeholder || !altText) return;

                                        const imageResult = await generateImageWithAI(altText);
                                        if (imageResult.success && imageResult.imageUrl) {
                                            const imgMatches = imageResult.imageUrl.match(/^data:(.+);base64,(.+)$/);
                                            if (imgMatches && imgMatches.length >= 3) {
                                                const mimeType = imgMatches[1];
                                                const base64Data = imgMatches[2];
                                                if (mimeType && base64Data) {
                                                    const buffer = Buffer.from(base64Data, 'base64');
                                                    const filename = `${Date.now()}_${uuidv4()}.${mimeType.split('/')[1] || 'png'}`;
                                                    const cloudFrontUrl = await uploadToS3(buffer, `blog/output/content-images/${userId}`, filename, mimeType);
                                                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'image-data', placeholder, imageUrl: cloudFrontUrl })}\n\n`));
                                                }
                                            }
                                        }
                                    }));
                                }
                            } catch (e) {
                                console.error("Error during image generation:", e);
                            }
                        })());
                    }

                    // 인물 사진 처리
                    if (formData.photo?.originalUrl) {
                        contentProcessingTasks.push((async () => {
                            try {
                                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', step: 5, message: '인물 사진 보정 중...' })}\n\n`));
                                const placeholder = '[DIRECTOR_PHOTO_PLACEHOLDER]';
                                if (textContent.includes(placeholder)) {
                                    const instruction = "Professional portrait, trustworthy atmosphere, high quality, natural lighting. Maintain the person's identity but enhance the professional look suitable for a personal branding blog.";
                                    const editResult = await editImageWithAI(instruction, formData.photo.originalUrl, 'image/jpeg');

                                    if (editResult.success && editResult.imageUrl) {
                                        const base64Data = editResult.imageUrl.split(',')[1];
                                        if (base64Data) {
                                            const editedBuffer = Buffer.from(base64Data, 'base64');
                                            const editedFilename = `profile_edited_${Date.now()}_${uuidv4()}.jpg`;
                                            const outputUrl = await uploadToS3(editedBuffer, `blog/output/photos/${userId}`, editedFilename, 'image/jpeg');
                                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'image-data', placeholder, imageUrl: outputUrl })}\n\n`));
                                        }
                                    }
                                }
                            } catch (e) {
                                console.error('Error processing profile photo:', e);
                            }
                        })());
                    }

                    // 모든 백그라운드 태스크 대기 (GIF 포함)
                    await Promise.all([...tasks, ...contentProcessingTasks]);

                    // Step 6: 완성
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', step: 6, message: '완성' })}\n\n`));
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', content: textContent })}\n\n`));

          controller.close();
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message: error instanceof Error ? error.message : "Unknown error" })}\n\n`,
            ),
          );
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

function constructPrompt(formData: any): string {
  const { writingType, branding, contentPlanning, options, details, photo } =
    formData;

    return `
# 당신의 역할
당신은 '퍼스널 브랜딩' 전문 카피라이터입니다. 
작성자의 전문성과 가치를 자연스럽게 녹여내면서 독자에게 실질적인 도움을 주는 고품질 블로그 글을 작성하는 것이 당신의 목표입니다.

# 작성할 글 정보

## 1. 글쓰기 전략 (가장 중요)
- **유형:** ${
      writingType === "CONVERSION"
        ? "전환용 (문의/구독 유도 중심)"
        : writingType === "BALANCED"
          ? "공감/경험형 (경험 공유 및 신뢰 구축 중심)"
          : "정보성 (지식 공유 및 안내 중심)"
    }
- **브랜딩 노출 강도:** ${
      options.brandingIntensity === 'MINIMAL' 
        ? '최소 (정보 전달에 집중)' 
        : options.brandingIntensity === 'STRONG' 
          ? '강함 (작성자의 전문성 전면 배치)' 
          : '보통 (경험과 정보의 조화)'
    }

## 2. 브랜딩 및 페르소나 정보
- **활동 분야:** ${branding.specialties.join(', ')}
- **작성자 상세 정보:** 
${branding.brandingText}

## 3. 기획 및 주제
- **주제:** ${contentPlanning.subject || '미지정'}
- **타겟 독자:** ${contentPlanning.targetAudience || '미지정'}
- **핵심 메시지:** ${contentPlanning.keyMessage || '미지정'}
- **필수 키워드:** ${contentPlanning.keywords.join(', ') || '미지정'}

## 4. 스타일 및 옵션
- ## 글 옵션
**말투 (매우 중요!):** ${options.styleReference}

${
  options.styleReference === "친절형"
    ? `
**말투 예시:**
- "이런 고민을 하고 계신가요?" (O)
- "이런 고민을 하고 계십니까?" (X)
- "제가 도와드릴게요" (O)
- "제가 도와드리겠습니다" (X)
- "작은 팁을 공유해 드릴게요" (O)
` : options.styleReference === '정중형' ? `
**말투 예시:**
- "이런 고민을 하고 계십니까?" (O)
- "이런 고민을 하고 계신가요?" (X)
- "제가 도와드리겠습니다" (O)
- "제가 도와드릴게요" (X)
- "유익한 정보를 안내해 드리겠습니다" (O)
` : options.styleReference === '친근형' ? `
**말투 예시:**
- "이런 고민 하고 있어?" (O)
- "이런 고민을 하고 계신가요?" (X)
- "내가 도와줄게" (O)
- "제가 도와드릴게요" (X)
- "알짜 팁을 알려줄게" (O)
` : ''}
**⚠️ 중요:** 글 전체에서 위 말투를 일관되게 사용해주세요. 다른 말투가 섞이면 안 됩니다.
- **목표 글 길이:** 공백 포함 **${details.length}** 내외 (순수 텍스트 기준)
- **인물 사진 활용:** ${photo?.originalUrl ? '예 (신뢰도 향상 요소)' : '아니오'}
${details.styleText ? `- **참고 스타일 가이드:**\n${details.styleText}` : ''}

---

# 세부 작성 지침

1. **글 길이 엄수 (CRITICAL):**
   - **HTML 태그와 CSS 코드를 제외한 순수 본문 텍스트**가 반드시 **${details.length}**에 가깝게 작성되어야 합니다.
   - 제공된 정보가 많더라도 핵심 위주로 요약하여 지정된 길이를 초과하지 않도록 **매우 간결하고 압축적으로** 작성하세요.
   - 현재 설정된 길이에 비해 내용이 너무 길어지지 않도록 주의하세요.

2. **문체 및 스타일 반영:**
   ${details.styleText ? `- 제공된 **'참고 스타일 가이드'**의 문체, 단어 선택, 문장 구조를 최대한 분석하여 유사한 느낌으로 작성하세요.` : ''}
   - 지정된 말투(${options.styleReference})를 기본으로 하되, 전체적인 분위기를 일관되게 유지하세요.

3. **브랜딩 강도별 서술 방식:**
   - **[MINIMAL]**: 작성자는 철저히 '큐레이터' 역할을 합니다. 정보의 정확성에 집중하고, 작성자의 정보는 글 하단에 짧게 언급하세요.
   - **[BALANCED]**: 작성자는 '친절한 조언자'입니다. 정보 사이사이에 개인적인 통찰을 섞어 공감대를 형성하세요.
   - **[STRONG]**: 작성자는 '분야의 전문가'입니다. 문제 해결책을 명확히 제시하고 본인의 성과나 철학을 근거로 활용하세요.

4. **콘텐츠 구조:**
   - **도입부**: 독자의 문제 상황에 공감하며 시작하세요.
   - **본문**: 가독성을 위해 소제목(h2, h3)을 활용하세요.
   - **종결부**: 내용을 요약하고, ${writingType === 'CONVERSION' ? '강력한 행동 유도(CTA)를 포함하세요.' : '독자에게 응원의 메시지를 던지며 마무리하세요.'}

5. **⚠️ HTML 출력 형식 (중요!)**
   - ❌ **절대 포함하지 말 것:** \`<!DOCTYPE>\`, \`<html>\`, \`<head>\`, \`<style>\`, \`<body>\` 태그
   - ✅ **포함할 것:** 순수 콘텐츠 HTML만 (div, p, h1, h2, h3, img, a 등)
   - ✅ **스타일링:** 인라인 스타일(\`style="..."\`)만 사용하되, **스타일 코드가 너무 길어져서 본문 내용을 압도하지 않도록 효율적으로 작성**하세요.
   - ✅ **구조:** 최상위는 \`<div>\` 태그로 시작

6. **필수 포함 사항:**
${options.disclaimerEnabled ? `
- **글 하단 안내 문구**: 반드시 다음 안내 문구를 포함해주세요:
  <p style="color: #999; font-size: 12px; margin-top: 40px; line-height: 1.6;">
  본 게시물은 정보 제공 및 브랜딩을 목적으로 작성되었습니다. 
  내용 중 포함된 정보는 일반적인 참고용이며, 상세한 사항은 전문가와 상담하시기 바랍니다.
  </p>
` : ''}

${options.generateImageWithAi ? `
- **이미지 생성 및 삽입**:
  - 글의 주요 섹션마다 관련 이미지를 생성하여 삽입해주세요.
  - 이미지는 \`<img src="[IMAGE_PLACEHOLDER_N]" alt="설명" style="width: 100%; max-width: 600px; margin: 20px auto; display: block; border-radius: 8px;" />\` 형식으로 삽입해주세요.
  - N은 1부터 시작하는 순서 번호입니다 (예: IMAGE_PLACEHOLDER_1, IMAGE_PLACEHOLDER_2, ...)
  - alt 속성에는 이미지에 대한 구체적인 설명을 작성해주세요 (예: "노트북으로 작업 중인 모습", "세련된 사무실 내부")
` : ''}

${photo?.originalUrl ? `
- **인물/프로필 사진 삽입**:
  - 글의 서론(인사말) 또는 본문 중간 적절한 위치에 인물 사진을 **반드시 1회** 삽입하세요.
  - 삽입 형식: \`<img src="[DIRECTOR_PHOTO_PLACEHOLDER]" alt="신뢰감을 주는 작성자 모습" style="width: 100%; max-width: 400px; margin: 20px auto; display: block; border-radius: 8px;" />\`
` : ''}

7. **금기 사항:**
   - 기계적인 나열보다는 사람이 쓴 것 같은 자연스러운 흐름을 유지하세요.
   - 지정된 말투(${options.styleReference})를 절대 벗어나지 마세요.
`;
}

