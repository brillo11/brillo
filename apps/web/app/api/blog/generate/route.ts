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
import { getYouTubeTranscript } from "@/serverActions/youtube/youtube-transcript.actions";
import { getCompetitorStats } from "@/serverActions/blog/competitor-stats";
import { v4 as uuidv4 } from "uuid";
import { H3_STYLE } from "@/features/blog/constants";

/**
 * MM:SS 형식을 초 단위로 변환
 */
function timeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(":");
  if (parts.length === 2) {
    return parseInt(parts[0] || "0") * 60 + parseInt(parts[1] || "0");
  }
  return parseInt(timeStr) || 0;
}

/**
 * 자막에서 특정 시간 구간의 텍스트 추출
 */
function extractTranscriptSegments(
  transcript: { text: string; start: number }[],
  startTimes: string[],
) {
  return startTimes.map((timeStr, index) => {
    const startSec = timeToSeconds(timeStr);
    const endSec = startSec + 5; // 5초 구간

    const segmentText = transcript
      .filter((item) => item.start >= startSec && item.start <= endSec)
      .map((item) => item.text)
      .join(" ")
      .trim();

    return {
      index: index + 1,
      time: timeStr,
      text: segmentText || "(자막 없음 - 화면 분위기에 맞춰 작성)",
    };
  });
}

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

    // 상위 노출 블로그 통계 가져오기
    let competitorStats = null;
    if (formData.contentPlanning?.keywords?.length > 0) {
      const stats = await getCompetitorStats(formData.contentPlanning.keywords[0]);
      if (stats.success) {
        competitorStats = stats;
      }
    }

    // 유튜브 자막 정보 추출
    let gifContexts: { index: number; time: string; text: string }[] = [];
    if (formData.gif?.youtubeUrl && formData.gif?.startTimes?.length > 0) {
      try {
        const transcriptResult = await getYouTubeTranscript(formData.gif.youtubeUrl);
        if (transcriptResult.success && transcriptResult.transcript) {
          gifContexts = extractTranscriptSegments(transcriptResult.transcript, formData.gif.startTimes);
        }
        console.log('✅ GIF Contexts:', gifContexts);
      } catch (e) {
        console.error("Error fetching transcript for GIF contexts:", e);
      }
    }

    // Step 1: 요청 접수
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const tasks: Promise<void | boolean | unknown>[] = [];

        try {
          // 1. 유튜브 GIF 생성 태스크 시작 (병렬)
          if (
            formData.gif?.youtubeUrl &&
            formData.gif?.startTimes?.length > 0
          ) {
            tasks.push(
              (async () => {
                try {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ type: "progress", step: 4, message: "유튜브 GIF 생성 시작" })}\n\n`,
                    ),
                  );
                  const serverUrl = "http://121.126.124.4:5000/make-gif";
                  const response = await fetch(serverUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      url: formData.gif.youtubeUrl,
                      times: formData.gif.startTimes,
                      userId: userId,
                    }),
                  });

                  if (response.ok) {
                    const result = await response.json();
                    if (result.urls && result.urls.length > 0) {
                      // 개별 GIF 데이터를 플레이스홀더와 함께 전송
                      result.urls.forEach((url: string, index: number) => {
                        const placeholder = `[GIF_PLACEHOLDER_${index + 1}]`;
                        controller.enqueue(
                          encoder.encode(
                            `data: ${JSON.stringify({
                              type: "image-data", // image-data 타입을 재사용하여 클라이언트 교체 로직 활용
                              placeholder,
                              imageUrl: url,
                            })}\n\n`,
                          ),
                        );
                      });

                      // 전체 결과도 전송 (기존 클라이언트 호환성 유지)
                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({
                            type: "gif-result",
                            urls: result.urls,
                          })}\n\n`,
                        ),
                      );
                    }
                  } else {
                    console.error(
                      "GIF generation server failed:",
                      await response.text(),
                    );
                  }
                } catch (e) {
                  console.error("Error calling GIF server:", e);
                }
              })(),
            );
          }

          // 2. 본문 생성 프로세스 (순차)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "progress", step: 1, message: "요청 접수" })}\n\n`,
            ),
          );
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "progress", step: 2, message: "프롬프트 생성" })}\n\n`,
            ),
          );

          const prompt = constructPrompt(formData, gifContexts, competitorStats);
          console.log('✅ Prompt:', prompt);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "progress", step: 3, message: "본문 생성" })}\n\n`,
            ),
          );

          const result = await generateText({
            model: "google/gemini-3-flash",
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
          });

          const textContent = result.text || "";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "content", content: textContent })}\n\n`,
            ),
          );

          // 3. 이미지 생성 및 인물 사진 처리 (본문이 필요하므로 본문 생성 후 병렬 시작)
          const contentProcessingTasks: Promise<void | boolean | unknown>[] = [];

          // AI 이미지 생성
          if (formData.options?.generateImageWithAi) {
            contentProcessingTasks.push(
              (async () => {
                try {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ type: "progress", step: 3, message: "이미지 생성 중..." })}\n\n`,
                    ),
                  );
                  const imgTagRegex =
                    /<img[^>]*src="(\[IMAGE_PLACE_?HOLDER_\d+\])"[^>]*alt="([^"]*)"[^>]*>/gi;
                  const matches = [...textContent.matchAll(imgTagRegex)];

                  if (matches.length > 0) {
                    await Promise.all(
                      matches.map(async (match) => {
                        const placeholder = match[1] || "";
                        const altText = match[2] || "";
                        if (!placeholder || !altText) return;

                        const imageResult = await generateImageWithAI(altText);
                        if (imageResult.success && imageResult.imageUrl) {
                          const imgMatches = imageResult.imageUrl.match(
                            /^data:(.+);base64,(.+)$/,
                          );
                          if (imgMatches && imgMatches.length >= 3) {
                            const mimeType = imgMatches[1];
                            const base64Data = imgMatches[2];
                            if (mimeType && base64Data) {
                              const buffer = Buffer.from(base64Data, "base64");
                              const filename = `${Date.now()}_${uuidv4()}.${mimeType.split("/")[1] || "png"}`;
                              const cloudFrontUrl = await uploadToS3(
                                buffer,
                                `blog/output/content-images/${userId}`,
                                filename,
                                mimeType,
                              );
                              controller.enqueue(
                                encoder.encode(
                                  `data: ${JSON.stringify({ type: "image-data", placeholder, imageUrl: cloudFrontUrl })}\n\n`,
                                ),
                              );
                            }
                          }
                        }
                      }),
                    );
                  }
                } catch (e) {
                  console.error("Error during image generation:", e);
                }
              })(),
            );
          }

          // 인물 사진 처리
          if (formData.photo?.originalUrl) {
            contentProcessingTasks.push(
              (async () => {
                try {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ type: "progress", step: 5, message: "인물 사진 보정 중..." })}\n\n`,
                    ),
                  );
                  const placeholder = "[DIRECTOR_PHOTO_PLACEHOLDER]";
                  if (textContent.includes(placeholder)) {
                    const instruction =
                      "Professional portrait, trustworthy atmosphere, high quality, natural lighting. Maintain the person's identity but enhance the professional look suitable for a personal branding blog.";
                    const editResult = await editImageWithAI(
                      instruction,
                      formData.photo.originalUrl,
                      "image/jpeg",
                    );

                    if (editResult.success && editResult.imageUrl) {
                      const base64Data = editResult.imageUrl.split(",")[1];
                      if (base64Data) {
                        const editedBuffer = Buffer.from(base64Data, "base64");
                        const editedFilename = `profile_edited_${Date.now()}_${uuidv4()}.jpg`;
                        const outputUrl = await uploadToS3(
                          editedBuffer,
                          `blog/output/photos/${userId}`,
                          editedFilename,
                          "image/jpeg",
                        );
                        controller.enqueue(
                          encoder.encode(
                            `data: ${JSON.stringify({ type: "image-data", placeholder, imageUrl: outputUrl })}\n\n`,
                          ),
                        );
                      }
                    }
                  }
                } catch (e) {
                  console.error("Error processing profile photo:", e);
                }
              })(),
            );
          }

          // 모든 백그라운드 태스크 대기 (GIF 포함)
          await Promise.all([...tasks, ...contentProcessingTasks]);

          // Step 6: 완성
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "progress", step: 6, message: "완성" })}\n\n`,
            ),
          );
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "done", content: textContent })}\n\n`,
            ),
          );

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

const DEFAULT_BRANDING_TEXT = `[자기소개 및 브랜드 슬로건]


[주요 전문 분야 및 경력]


[나만의 핵심 가치 및 차별점]
1. 
2. 
3. 

[대표적인 성과 및 포트폴리오]


[독자 혜택 및 문의 링크]`;

function constructPrompt(
  formData: any,
  gifContexts: { index: number; time: string; text: string }[] = [],
  competitorStats: { averageImageCount: number } | null = null,
): string {
  const { brandingMode, branding, contentPlanning, options, details, photo } =
    formData;

  const isDefaultBranding =
    !branding.brandingText ||
    branding.brandingText.trim() === "" ||
    branding.brandingText.trim() === DEFAULT_BRANDING_TEXT.trim();

  // 상위 노출 블로그 통계를 기반으로 이미지 쿼터 계산
  const avgN = competitorStats?.averageImageCount || 3; // 기본값 3개
  const G = formData.gif?.startTimes?.length || 0;
  const P = photo?.originalUrl ? 1 : 0;

  // 1. GIF 인접성 분석 (20초 이내)
  const gifSequences: number[][] = [];
  if (G > 0 && formData.gif?.startTimes) {
    const times = formData.gif.startTimes.map(timeToSeconds);
    let currentSequence: number[] = [1];

    for (let i = 1; i < times.length; i++) {
      // 이전 GIF와 시작 시간 차이가 20초 이내이면 같은 그룹
      if (times[i] - times[i - 1] <= 20) {
        currentSequence.push(i + 1);
      } else {
        gifSequences.push(currentSequence);
        currentSequence = [i + 1];
      }
    }
    gifSequences.push(currentSequence);
  }

  // 2. 전체 목표치(avgN)에 맞추기 위해 필요한 AI 이미지 개수 산출
  const requiredAiCount = Math.max(0, avgN - G - P);

  // 3. '유효 미디어 단위' 계산 (GIF 시퀀스는 1개로 취급)
  const effectiveG = gifSequences.length || G;
  const totalUnits = effectiveG + P + requiredAiCount;

  // 4. 가독성을 위한 최대 '영역(Area)' 개수 계산 (250자당 1개 지점)
  const textLength = parseInt(details.length) || 1000;
  const safetyCap = Math.max(1, Math.floor(textLength / 250));

  // 5. 실제 이미지가 들어갈 '지점'의 총 개수
  const totalAreaCount = Math.min(totalUnits, safetyCap);

  // AI에게 전체 이미지 총합을 알려주기 위한 변수 (프롬프트용)
  const totalImages = G + P + requiredAiCount;

  return `
# 당신의 역할
당신은 '퍼스널 브랜딩' 전문 카피라이터입니다. 
작성자의 전문성과 가치를 자연스럽게 녹여내면서 독자에게 실질적인 도움을 주는 고품질 블로그 글을 작성하는 것이 당신의 목표입니다.

# 작성할 글 정보

## 1. 글쓰기 전략 (가장 중요)
- **브랜딩 노출 강도:** ${
    brandingMode === "MINIMAL"
      ? "최소 (정보 전달 및 큐레이션 중심)"
      : brandingMode === "STRONG"
        ? "강함 (통찰력 있는 리더의 시점, 반전의 통찰 제시)"
        : "보통 (공감적 페이스메이커, 경험과 정보의 조화)"
  }

## 2. 브랜딩 및 페르소나 정보
${
  !isDefaultBranding
    ? `**[작성자 상세 정보]**
${branding.brandingText}

**[⚠️ 중요: 퍼스널 브랜딩 극대화 전략]**
- 작성자의 개인적 서사나 성과를 조작하지 마세요. (Hallucination 방지)
- **근거 중심 브랜딩**: 작성자의 실제 성과와 경험을 글의 핵심 논거(Proof Point)로 적극 활용하여 가치를 증명하세요.
- **브릿지 전략**: 작성자의 실제 성과를 '업계 표준' 혹은 '검증된 법칙'의 증거로 제시하여, 개인의 성공을 보편적 실력으로 승격시키세요.
- **실전적 통찰 추출**: 단순한 경험 나열이 아닌, 그 과정에서 얻은 '날카로운 원칙(Insight)'을 독자에게 제시하세요.
${brandingMode === "BALANCED" ? "- **공감적 증명**: 과거의 결핍이나 고민을 먼저 공유하고, 현재의 성과 데이터를 통해 그 해결책을 증명하며 유대감을 형성하세요." : ""}
- 위의 모든 전략을 반드시 사용해야 하는 것은 아닙니다. 자연스럽게 사용할 수 있다면 사용하세요.
- 문의 링크로 명시된 링크(예시 : https://www.google.com, https://open.kakao.com/o/abcdefg 등)가 포함되어있지 않다면 문의 항목은 작성하지 마세요.`
    : `** 작성자 상세 정보가 제공되지 않았습니다. [⚠️ 중요: 작성자 정보 부재 시 대응 지침]**
- 작성자의 개인적 서사를 절대 지어내지 마세요. (Hallucination 방지)
- **시점 제어**: 1인칭 단수('나')보다는 1인칭 복수('우리') 혹은 3인칭 관찰자 시점을 활용하여 객관성과 전문성을 확보하세요.
- **권위의 전이**: 업계 통계, 유명 인사의 격언, 심리학적 법칙을 인용하여 '그것을 선별한 작성자의 안목'으로 권위를 확보하세요.
- **프레임워크/사례 활용**: '검증된 단계별 공식' 혹은 '글로벌 기업/인사의 성공 사례'를 분석하여 논리적 깊이를 채우세요.
- **모드별 대체 페르소나**:
    - [STRONG]: '통찰력 있는 비평가'가 되어 대중의 잘못된 상식을 날카롭게 지적하세요.
    - [BALANCED]: '공감적 문제 제기자'가 되어 독자가 겪는 고통을 생생하게 묘사하는 데 집중하세요.
    - [MINIMAL]: '지식 큐레이터'가 되어 정보를 정갈하게 요약하고 체크리스트를 제공하세요.`
}

## 3. 기획 및 주제
- **주제:** ${contentPlanning.subject || "미지정"}
- **타겟 독자:** ${contentPlanning.targetAudience || "미지정"}
- **핵심 메시지:** ${contentPlanning.keyMessage || "미지정"}
- **필수 키워드:** ${contentPlanning.keywords.join(", ") || "미지정"}

${
  gifContexts.length > 0
    ? `
## 4. 참고 영상 GIF 정보
아래는 본문에 포함될 YouTube GIF 이미지들의 맥락 정보입니다. 
각 GIF 의 맥락을 해석하고 본문에 자연스럽게 녹아들어 글의 설득력을 더하거나 공감을 유도할 수 있도록 작성하세요.

${gifContexts
  .map(
    (ctx) =>
      `- GIF ${ctx.index} (${ctx.time}): "${ctx.text}"`,
  )
  .join("\n")}
`
    : ""
}

## 5. 스타일 및 옵션
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
`
    : options.styleReference === "정중형"
      ? `
**말투 예시:**
- "이런 고민을 하고 계십니까?" (O)
- "이런 고민을 하고 계신가요?" (X)
- "제가 도와드리겠습니다" (O)
- "제가 도와드릴게요" (X)
- "유익한 정보를 안내해 드리겠습니다" (O)
`
      : options.styleReference === "친근형"
        ? `
**말투 예시:**
- "이런 고민 하고 있어?" (O)
- "이런 고민을 하고 계신가요?" (X)
- "내가 도와줄게" (O)
- "제가 도와드릴게요" (X)
- "알짜 팁을 알려줄게" (O)
`
        : ""
}
**⚠️ 중요:** 글 전체에서 위 말투를 일관되게 사용해주세요. 다른 말투가 섞이면 안 됩니다.
- **목표 글 길이:** 공백 포함 **${details.length}** 내외 (순수 텍스트 기준)
- **인물 사진 활용:** ${photo?.originalUrl ? "예 (신뢰도 향상 요소)" : "아니오"}
${details.styleText ? `- **참고 스타일 가이드:**\n${details.styleText}` : ""}

---

# 세부 작성 지침

1. **글 길이 엄수 (CRITICAL):**
   - **HTML 태그와 CSS 코드를 제외한 순수 본문 텍스트**가 반드시 **${details.length}**에 가깝게 작성되어야 합니다.
   - 제공된 정보가 많더라도 핵심 위주로 요약하여 지정된 길이를 초과하지 않도록 **매우 간결하고 압축적으로** 작성하세요.
   - 현재 설정된 길이에 비해 내용이 너무 길어지지 않도록 주의하세요.

2. **문체 및 스타일 반영:**
   ${details.styleText ? `- 제공된 **'참고 스타일 가이드'**의 문체, 단어 선택, 문장 구조를 최대한 분석하여 유사한 느낌으로 작성하세요.` : ""}
   - 지정된 말투(${options.styleReference})를 기본으로 하되, 전체적인 분위기를 일관되게 유지하세요.

3. **브랜딩 강도별 서술 방식:**
   - **[MINIMAL]**: 작성자는 철저히 '객관적 전달자' 역할을 합니다. 정보의 정확성에 집중하고, 작성자의 정보는 글 하단에 짧게 언급하세요.
   - **[BALANCED]**: 작성자는 '공감적 페이스메이커'입니다. 가짜 경험 대신 "우리가 흔히 겪는 실수나 경험, 문제"를 언급하며 공감대를 형성하고, 함께 해결해 나가는 따뜻한 톤을 유지하세요.
   - **[STRONG]**: 작성자는 '통찰력 있는 리더'입니다. 강요가 아닌, 독자가 미처 생각하지 못한 '반전의 통찰(Counter-intuitive Insight)'을 제시하여 지적 권위를 확보하세요.

4. **콘텐츠 구조:**
   - **도입부**: 독자의 문제 상황에 깊이 공감하거나, 날카로운 질문을 던지며 시작하세요.
   - **본문**: 가독성을 위해 소제목(h2, h3)을 활용하고, 검증된 프레임워크나 사례 분석을 통해 논리를 강화하세요.
   - **종결부**: 내용을 요약하고, ${brandingMode === "STRONG" ? "확신에 찬 가치 제안(Value Proposition)을 포함하세요." : "독자에게 응원의 메시지를 던지며 마무리하세요."}

5. **⚠️ HTML 출력 형식 (중요!)**
   - ❌ **절대 포함하지 말 것:** \`<!DOCTYPE>\`, \`<html>\`, \`<head>\`, \`<style>\`, \`<body>\` 태그
   - ✅ **포함할 것:** 순수 콘텐츠 HTML만 (div, p, h1, h2, h3, img, a 등)
   - ✅ **스타일링:** 인라인 스타일(\`style="..."\`)만 사용하되, **스타일 코드가 너무 길어져서 본문 내용을 압도하지 않도록 효율적으로 작성**하세요.
   - **[중요] 헤딩 스타일링**: 모든 \`h3\` 태그에는 반드시 다음 스타일을 적용하세요:
     "${H3_STYLE}"
   - ✅ **구조:** 최상위는 \`<div>\` 태그로 시작

6. **이미지 및 미디어 삽입 규칙 (CRITICAL):**
   당신은 본문에 다음 미디어들을 **총 ${totalAreaCount}개의 영역**에 나누어 배치해야 합니다.

   **[미디어 리스트]**
   ${P > 0 ? `- **인물 사진 (${P}개)**: [DIRECTOR_PHOTO_PLACEHOLDER]` : ""}
   ${G > 0 ? `- **유튜브 GIF (${G}개)**: [GIF_PLACEHOLDER_1] ~ [GIF_PLACEHOLDER_${G}]` : ""}
   ${
     gifSequences.filter((s) => s.length > 1).length > 0
       ? `   (⚠️ 중요: ${gifSequences
           .filter((s) => s.length > 1)
           .map((s) => `[GIF_PLACEHOLDER_${s.join("], [GIF_PLACEHOLDER_")}]`)
           .join(", ")}는 서로 인접한 시간대의 연속된 장면입니다. 반드시 같은 영역에 묶어서 배치하세요.)`
       : ""
   }
   ${requiredAiCount > 0 ? `- **AI 생성 이미지 (${requiredAiCount}개)**: [IMAGE_PLACEHOLDER_1] ~ [IMAGE_PLACEHOLDER_${requiredAiCount}]` : ""}

   **[삽입 지침]**
   1. 본문 전체에 **총 ${totalAreaCount}개의 이미지 삽입 영역**을 설정하세요.
   2. 위 미디어 리스트의 모든 플레이스홀더를 해당 영역들에 **하나도 빠짐없이** 분산 배치하세요.
   3. 만약 미디어의 총 개수(${totalImages}개)가 영역의 개수(${totalAreaCount}개)보다 많다면, **한 영역에 여러 개의 플레이스홀더를 함께 삽입**하세요.
      - 예: 한 지점에 인물 사진과 AI 이미지를 함께 배치하거나, 연관된 AI 이미지 2개를 묶어서 배치.
   4. 한 영역에 묶이는 이미지는 **최대 3개**를 넘지 않아야 하며, 서로 문맥상 자연스럽게 어울려야 합니다.
   5. 플레이스홀더는 반드시 다음 형식을 **글자 하나 틀리지 않고 똑같이** 사용하세요 (중간에 언더바를 추가하지 마세요):
      - 인물 사진: \`<img src="[DIRECTOR_PHOTO_PLACEHOLDER]" alt="신뢰감을 주는 작성자 모습" style="width: 100%; max-width: 400px; margin: 20px auto; display: block; border-radius: 8px;" />\`
      - 유튜브 GIF: \`<img src="[GIF_PLACEHOLDER_N]" alt="영상 설명" style="width: 100%; max-width: 600px; margin: 20px auto; display: block; border-radius: 8px;" />\`
      - AI 이미지: \`<img src="[IMAGE_PLACEHOLDER_N]" alt="이미지 상세 설명" style="width: 100%; max-width: 600px; margin: 20px auto; display: block; border-radius: 8px;" />\`
      - **⚠️ 매우 중요**: \`[IMAGE_PLACE_HOLDER_N]\` 또는 \`[GIF_PLACE_HOLDER_N]\` 처럼 중간에 언더바(_)를 더 넣으면 시스템이 인식하지 못합니다. 반드시 \`PLACEHOLDER\` (언더바 없음) 형식을 엄수하세요.
   6. AI 이미지의 alt 속성에는 **데이터 수치나 비교 내용을 도표/그래프 형태로 묘사하는 내용을 포함하면 좋습니다.** 
   7. 데이터 수치나 비교 내용이 아닌 문맥에 어울리는 일반적인 이미지라면 **이미지에 대한 구체적인 설명을 작성해주세요** (예: "노트북으로 작업 중인 모습", "세련된 사무실 내부")

${
  options.disclaimerEnabled
    ? `
- **글 하단 안내 문구**: 반드시 다음 안내 문구를 포함해주세요:
  <p style="color: #999; font-size: 12px; margin-top: 40px; line-height: 1.6;">
  본 게시물은 정보 제공 및 브랜딩을 목적으로 작성되었습니다. 
  내용 중 포함된 정보는 일반적인 참고용이며, 상세한 사항은 전문가와 상담하시기 바랍니다.
  </p>
`
    : ""
}

7. **금기 사항:**
   - 기계적인 나열보다는 사람이 쓴 것 같은 자연스러운 흐름을 유지하세요.
   - 지정된 말투(${options.styleReference})를 절대 벗어나지 마세요.
`;
}
