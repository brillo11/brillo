import { generateText } from "ai";

/**
 * 사용 모델: google/gemini-2.5-flash (Nanobanana)
 * 참고: Nanobanana는 Google Gemini 2.5 Flash Image 모델의 내부 코드명/별칭으로 알려져 있습니다.
 */
export async function generateImageWithAI(
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
      model: "google/gemini-3-pro-image",
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
