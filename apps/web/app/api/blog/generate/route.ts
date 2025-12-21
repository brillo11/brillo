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
import { uploadToS3, editImageWithAI } from "@/serverActions/blog/ai-photo";
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
        try {
          // Send progress update
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "progress", step: 1, message: "요청 접수" })}\n\n`,
            ),
          );

          // Step 2: 프롬프트 생성
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "progress", step: 2, message: "프롬프트 생성" })}\n\n`,
            ),
          );

          const prompt = constructPrompt(formData);

          // Step 3: 본문 생성
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "progress", step: 3, message: "본문 생성" })}\n\n`,
            ),
          );

          // Use AI Gateway for text generation
          const result = await generateText({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
          });

          // Extract text from the result object
          const textContent = result.text || "";

          // 텍스트 먼저 전송 (플레이스홀더 포함된 상태로)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "content", content: textContent })}\n\n`,
            ),
          );

          // -------------------------------------------------------------------------
          // Image Generation Logic (Streaming Strategy)
          // -------------------------------------------------------------------------
          if (formData.options?.generateImageWithAi) {
            try {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "progress", step: 3, message: "이미지 생성 중..." })}\n\n`,
                ),
              );

              // 1. Find all placeholders: <img src="[IMAGE_PLACEHOLDER_N]" alt="Description" ... />
              const imgTagRegex =
                /<img[^>]*src="(\[IMAGE_PLACEHOLDER_\d+\])"[^>]*alt="([^"]*)"[^>]*>/g;
              const matches = [...textContent.matchAll(imgTagRegex)];

              if (matches.length > 0) {
                // 2. Generate images sequentially or in parallel?
                // Parallel is faster, but we send events as they finish.
                const imagePromises = matches.map(async (match) => {
                  const placeholder = match[1] || "";
                  const altText = match[2] || "";

                  if (!placeholder || !altText) return;

                  // Call the existing generateImageWithAI function
                  const imageResult = await generateImageWithAI(altText);

                  if (imageResult.success && imageResult.imageUrl) {
                    // 3. Upload generated image to S3
                    // imageResult.imageUrl is a data URL (data:image/png;base64,...)
                    const matches = imageResult.imageUrl.match(
                      /^data:(.+);base64,(.+)$/,
                    );
                    if (matches && matches.length >= 3) {
                      const mimeType = matches[1];
                      const base64Data = matches[2];

                      if (mimeType && base64Data) {
                        const buffer = Buffer.from(base64Data, "base64");

                        const timestamp = Date.now();
                        const uuid = uuidv4();
                        const extension = mimeType.split("/")[1] || "png";
                        const filename = `${timestamp}_${uuid}.${extension}`;

                        const cloudFrontUrl = await uploadToS3(
                          buffer,
                          `blog/output/content-images/${userId}`,
                          filename,
                          mimeType,
                        );

                        // 4. Send separate event for EACH image with CloudFront URL
                        controller.enqueue(
                          encoder.encode(
                            `data: ${JSON.stringify({
                              type: "image-data",
                              placeholder: placeholder,
                              imageUrl: cloudFrontUrl,
                            })}\n\n`,
                          ),
                        );
                      }
                    }
                  } else {
                    console.warn(`Failed to generate image for ${placeholder}`);
                  }
                });

                await Promise.all(imagePromises);
              }
            } catch (imgError) {
              console.error("Error during image generation process:", imgError);
            }
          }

          // -------------------------------------------------------------------------

          // Step 4: 유튜브 GIF 생성
          if (
            formData.gif?.youtubeUrl &&
            formData.gif?.startTimes?.length > 0
          ) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "progress", step: 4, message: "유튜브 GIF 생성 중..." })}\n\n`,
              ),
            );

            try {
              const lambdaUrl = process.env.YOUTUBE_GIF_LAMBDA_URL;
              if (lambdaUrl) {
                const response = await fetch(lambdaUrl, {
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
                    "Lambda GIF generation failed:",
                    await response.text(),
                  );
                }
              } else {
                console.warn("YOUTUBE_GIF_LAMBDA_URL not configured");
              }
            } catch (e) {
              console.error("Error calling GIF Lambda:", e);
            }
          } else {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "progress", step: 4, message: "유튜브 GIF 선택 안함" })}\n\n`,
              ),
            );
            await new Promise((resolve) => setTimeout(resolve, 500));
          }

          // Step 5: 원장님 사진 처리
          if (formData.photo?.originalUrl) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "progress", step: 5, message: "원장님 사진 보정 중..." })}\n\n`,
              ),
            );

            try {
              // 1. Check if placeholder exists in content
              // (If the AI followed instructions, there should be [DIRECTOR_PHOTO_PLACEHOLDER])
              // But even if not, we might want to force insert it or skip.
              // Let's rely on the placeholder for now.

              const placeholder = "[DIRECTOR_PHOTO_PLACEHOLDER]";
              if (textContent.includes(placeholder)) {
                // 2. Edit Image using Shared Library
                const instruction =
                  "Professional doctor portrait, trustworthy atmosphere, high quality, natural lighting. Maintain the person's identity but enhance the professional look suitable for a medical blog.";

                const editedFile = await editImageWithAI(
                  formData.photo.originalUrl,
                  "image/jpeg", // Assuming jpeg for now or we could pass content type if stored
                  instruction,
                );

                if (
                  editedFile &&
                  "base64Data" in editedFile &&
                  editedFile.base64Data
                ) {
                  // 3. Upload to S3
                  const editedBuffer = Buffer.from(
                    editedFile.base64Data as string,
                    "base64",
                  );
                  const timestamp = Date.now();
                  const uuid = uuidv4();
                  const editedFilename = `director_edited_${timestamp}_${uuid}.jpg`;

                  const outputUrl = await uploadToS3(
                    editedBuffer,
                    `blog/output/photos/${userId}`,
                    editedFilename,
                    "image/jpeg",
                  );

                  // 4. Send image-data event to replace placeholder
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        type: "image-data",
                        placeholder: placeholder,
                        imageUrl: outputUrl,
                      })}\n\n`,
                    ),
                  );
                } else {
                  console.warn(
                    "Director photo editing failed or returned no data",
                  );
                }
              } else {
                console.log(
                  "Director photo provided but no placeholder found in text.",
                );
              }
            } catch (photoError) {
              console.error("Error processing director photo:", photoError);
            }
          } else {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "progress", step: 5, message: "원장님 사진 건너뜀" })}\n\n`,
              ),
            );
            await new Promise((resolve) => setTimeout(resolve, 500));
          }

          // Step 6: 완성
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "progress", step: 6, message: "완성" })}\n\n`,
            ),
          );
          // Note: 'done' event doesn't need to send full content anymore if client is accumulating/updating,
          // but for safety we can send a done signal.
          // However, we shouldn't send the full text content again because it might not have the images injected (since we didn't update textContent variable).
          // Sending just empty content or the original textContent is fine, client relies on state.
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

function constructPrompt(formData: any): string {
  const { writingType, branding, contentPlanning, options, details, photo } =
    formData;

  // return `
  // 당신은 전문적인 의료 블로그 작성자입니다. 다음 정보와 규칙을 바탕으로 블로그 글을 작성해주세요.

  // # 필수 준수 사항 (최우선)

  // ## 1. 의료법 가이드라인 (반드시 준수)
  // ${MEDICAL_LAW_GUIDELINES}

  // ## 2. ⚠️ 의료법 금칙어 (절대 사용 금지)

  // **다음 단어와 유사한 표현을 절대 사용하지 마세요:**

  // ${FORBIDDEN_WORDS.map((word, i) => `${i + 1}. ${word}`).join('\n')}

  // **⚠️ 위반 시:** 의료법 제56조 위반으로 1년 이하의 징역 또는 1천만원 이하의 벌금

  // ## 3. ⚠️ 금지 문구 (절대 사용 금지)

  // **다음과 같은 표현을 절대 사용하지 마세요:**

  // ${FORBIDDEN_PHRASES.map((p, i) => `${i + 1}. ${p}`).join('\n')}

  // ## 4. 원고 작성 법칙 (15가지)
  // ${WRITING_RULES}

  // ## 5. 우수 제목 참고 예시
  // ${EXCELLENT_TITLES}

  // ${writingType === 'CONVERSION' ? `
  // ## 6. 전환용 글쓰기 참고
  // ${CONVERSION_EXAMPLES}
  // ` : ''}

  // ---
  return `
# 작성할 글 정보

## 글쓰기 유형
${writingType === "CONVERSION" ? "전환용 (문의/예약 유도 중심)" : "정보성 (교육/안내 중심)"}

## 브랜딩 정보
전문분야: ${branding.specialties.join(", ")}
${branding.brandingText}

## 글의 주제 및 타겟
주제: ${contentPlanning.subject || "미지정"}
타겟 독자: ${contentPlanning.targetAudience || "미지정"}
핵심 메시지: ${contentPlanning.keyMessage || "미지정"}
키워드: ${contentPlanning.keywords.join(", ") || "미지정"}

## 글 옵션
**말투 (매우 중요!):** ${options.styleReference}

${
  options.styleReference === "친절형"
    ? `
**말투 예시:**
- "이런 증상으로 고민하고 계신가요?" (O)
- "이런 증상으로 고민하고 계십니까?" (X)
- "저희 병원에서 도와드릴게요" (O)
- "저희 병원에서 도와드리겠습니다" (X)
- "치료 방법을 알려드릴게요" (O)
`
    : options.styleReference === "정중형"
      ? `
**말투 예시:**
- "이런 증상으로 고민하고 계십니까?" (O)
- "이런 증상으로 고민하고 계신가요?" (X)
- "저희 병원에서 도와드리겠습니다" (O)
- "저희 병원에서 도와드릴게요" (X)
- "치료 방법을 알려드리겠습니다" (O)
`
      : options.styleReference === "친근형"
        ? `
**말투 예시:**
- "이런 증상으로 고민하고 있어?" (O)
- "이런 증상으로 고민하고 계신가요?" (X)
- "우리 병원에서 도와줄게" (O)
- "저희 병원에서 도와드릴게요" (X)
- "치료 방법을 알려줄게" (O)
`
        : ""
}

**⚠️ 중요:** 글 전체에서 위 말투를 일관되게 사용해주세요. 다른 말투가 섞이면 안 됩니다.

이미지 생성: ${options.generateImageWithAi ? "예" : "아니오"}
필수 고지 사항 포함: ${options.disclaimerEnabled ? "예" : "아니오"}
**원장님 사진 첨부 여부**: ${photo?.originalUrl ? "예" : "아니오"}

## 세부 설정
글 길이: ${details.length}
${details.styleText ? `스타일 참고: ${details.styleText}` : ""}

---

# 작성 지침

1. 위 정보와 규칙을 바탕으로 전문적이고 독자의 관심을 끄는 블로그 글을 작성해주세요.
2. **의료법을 철저히 준수**하고, **금칙어를 절대 사용하지 마세요**.
3. **원고 작성 15가지 법칙**을 반드시 따라주세요.
4. **⚠️ 말투를 반드시 일관되게 유지**해주세요. 지정된 말투(${options.styleReference})로만 작성하고, 다른 말투가 섞이면 안 됩니다.

## ⚠️ HTML 출력 형식 (중요!)

**다음 규칙을 반드시 지켜주세요:**

- ❌ **절대 포함하지 말 것:** \`<!DOCTYPE>\`, \`<html>\`, \`<head>\`, \`<style>\`, \`<body>\` 태그
- ✅ **포함할 것:** 순수 콘텐츠 HTML만 (div, p, h1, h2, h3, img, a 등)
- ✅ **스타일링:** 인라인 스타일(\`style="..."\`)만 사용
- ✅ **구조:** 최상위는 \`<div>\` 태그로 시작

**올바른 출력 예시:**
<div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: 'Malgun Gothic', sans-serif;">
  <h1 style="font-size: 28px; color: #2C3E50;">제목</h1>
  <p style="line-height: 1.8; color: #333;">본문 내용...</p>
  <!-- 이하 콘텐츠 계속 -->
</div>

**잘못된 출력 예시 (절대 금지!):**
\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <style>...</style>
</head>
<body>
  <div>...</div>
</body>
</html>
\`\`\`

## 필수 포함 사항

${
  options.disclaimerEnabled
    ? `
**글 하단에 반드시 다음 의료법 준수 문구를 포함**해주세요:

<p style="color: #999; font-size: 12px; margin-top: 40px; line-height: 1.6;">
본 게시물은 의료 정보제공을 목적으로 한 해당 의원에서 작성한 의료 광고 글입니다. 
의료 광고 법 제 56조 1항을 준수했습니다. 
개인 체질, 건강 상태에 따라 차이가 있을 수 있으므로 의료진과 충분한 상담을 통해 치료를 결정하시길 바랍니다.
</p>
`
    : `
**의료법 준수 문구는 포함하지 마세요.**
`
}

${
  options.generateImageWithAi
    ? `
**이미지 생성:**
- 글의 주요 섹션마다 관련 이미지를 생성하여 삽입해주세요.
- 이미지는 \`<img src="[IMAGE_PLACEHOLDER_N]" alt="설명" style="width: 100%; max-width: 600px; margin: 20px auto; display: block; border-radius: 8px;" />\` 형식으로 삽입해주세요.
- N은 1부터 시작하는 순서 번호입니다 (예: IMAGE_PLACEHOLDER_1, IMAGE_PLACEHOLDER_2, ...)
- alt 속성에는 이미지에 대한 구체적인 설명을 작성해주세요 (예: "위장 건강 검진을 받는 환자", "병원 내부 시설")
`
    : ""
}

${
  photo?.originalUrl
    ? `
**원장님 사진 삽입:**
- 글의 서론(인사말) 또는 본문 중간 적절한 위치에 원장님 사진을 **반드시 1회** 삽입하세요.
- 삽입 형식: \`<img src="[DIRECTOR_PHOTO_PLACEHOLDER]" alt="진료를 보고 있는 편안한 인상의 원장님" style="width: 100%; max-width: 400px; margin: 20px auto; display: block; border-radius: 8px;" />\`
- 이 사진은 신뢰감을 주는 요소로 활용되어야 합니다.
`
    : ""
}
`;
}

/**
 * 사용 모델: google/gemini-2.5-flash (Nanobanana)
 * 참고: Nanobanana는 Google Gemini 2.5 Flash Image 모델의 내부 코드명/별칭으로 알려져 있습니다.
 */
async function generateImageWithAI(
  prompt: string,
  aspectRatio:
    | "1:1"
    | "2:3"
    | "3:2"
    | "3:4"
    | "4:3"
    | "4:5"
    | "5:4"
    | "9:16"
    | "16:9"
    | "21:9" = "16:9",
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    // Nano Banana (Gemini 2.5 Flash Image) 모델 사용
    // 문서에 따라 generateText를 사용하고 result.files에서 이미지를 확인합니다.
    console.log("이미지 프롬포트 : ", prompt);
    const result: any = await generateText({
      model: "google/gemini-2.5-flash-image",
      prompt: `Generate an image of: ${prompt}`, // 이미지 생성을 명시적으로 요청
      providerOptions: {
        google: {
          imageConfig: {
            aspectRatio: aspectRatio,
          },
        },
      },
    });

    // result.files에서 이미지 확인 (Vercel AI SDK 최신 버전 기능)
    // 문서: Images are available in result.files
    if (result.files && result.files.length > 0) {
      console.log(`Gemini Image Gen Files Found: ${result.files.length}`);
      const firstFile = result.files[0];

      // console.log(`이미지 파일:`, firstFile);

      // DefaultGeneratedFile 객체에서 정보 추출
      const base64Data = firstFile.base64Data;
      const mimeType = firstFile.mediaType; // 'image/png'

      // 데이터 URL 생성
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      // contentType 확인
      // const mimeType = firstFile.contentType || firstFile.mimeType || 'image/png';

      if (base64Data) {
        const imageDataUrl = dataUrl;
        return {
          success: true,
          imageUrl: imageDataUrl,
        };
      }
    } else {
      console.log("Gemini Image Gen: No files found in result.files");
    }

    // 만약 result.files가 비어있다면, steps를 확인 (fallback)
    if (result.steps && result.steps.length > 0) {
      console.log("Gemini Image Gen: Checking steps...");
      // const step = result.steps[0];
    }

    console.warn("이미지가 생성되지 않았습니다.");
    return {
      success: false,
      error:
        "이미지 생성 결과가 없습니다. (모델이 텍스트만 반환했을 수 있습니다)",
    };
  } catch (error) {
    console.error(
      "이미지 생성 오류 (Nanobanana/Gemini 2.5 Flash Image):",
      error,
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}
