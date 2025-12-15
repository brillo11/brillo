"use server";

import { GoogleGenAI } from "@google/genai";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Veo API 응답 타입
 */
interface VeoVideoResponse {
  success: boolean;
  videoUrl?: string;
  metadata?: {
    duration?: number;
    resolution?: string;
  };
  error?: string;
}

/**
 * 비디오를 S3에 업로드하고 CloudFront URL 반환
 */
async function uploadVideoToS3(
  videoBuffer: Buffer,
  sessionId?: string
): Promise<string> {
  const fileName = `ai-assistant/videos/${sessionId || Date.now()}_${Math.random().toString(36).substring(7)}.mp4`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: fileName,
    Body: videoBuffer,
    ContentType: "video/mp4",
    // ContentDisposition을 설정하지 않으면 브라우저에서 재생 가능 (inline)
  });

  await s3Client.send(command);

  const cloudFrontUrl = process.env.NEXT_PUBLIC_CLOUDFRONT_URL!;
  // https:// 프로토콜이 없으면 추가

  return `${cloudFrontUrl}/${fileName}`;
}

/**
 * Veo 3.0/3.1를 사용하여 비디오 생성
 * @param prompt 비디오 생성 프롬프트
 * @returns 생성된 비디오 URL 또는 에러
 */
export async function generateVideoWithVeo(
  prompt: string
): Promise<VeoVideoResponse> {
  try {
    const apiKey = process.env.GEMINI_API_KEY2;

    if (!apiKey) {
      return {
        success: false,
        error: "Google AI API 키가 설정되지 않았습니다.",
      };
    }

    console.log("🎬 Veo 비디오 생성 시작:", prompt);

    // Google Generative AI 초기화
    const genAI = new GoogleGenAI({ apiKey });

    // Veo 3.0 비디오 생성 요청 (비동기 작업 시작)
    const enhancedPrompt = `8초 이내의 자료 화면 만들어줘. 그리고 아래의 지시를 참고해줘.\n\n${prompt}`;

    console.log("📤 Veo API 요청 전송 중...");

    let operation = (await genAI.models.generateVideos({
      model: "veo-3.1-generate-preview",
      prompt: enhancedPrompt,
    })) as any;

    console.log("⏳ Operation 시작됨");

    // Operation이 완료될 때까지 폴링 (최대 5분)
    const maxAttempts = 30; // 30번 시도 (10초 * 30 = 5분)
    let attempts = 0;

    while (!operation.done && attempts < maxAttempts) {
      attempts++;
      console.log(`⏳ 비디오 생성 중... (${attempts}/${maxAttempts})`);

      // 10초 대기
      await new Promise((resolve) => setTimeout(resolve, 10000));

      // 공식 문서 방식으로 Operation 상태 확인
      try {
        operation = (await genAI.operations.getVideosOperation({
          operation: operation,
        })) as any;
      } catch (pollError) {
        console.error("⚠️ 폴링 에러:", pollError);
        // 에러가 발생해도 계속 시도 (네트워크 일시적 문제일 수 있음)
      }
    }

    // 타임아웃 체크
    if (!operation.done) {
      console.error("❌ 비디오 생성 타임아웃 (5분 초과)");
      return {
        success: false,
        error: "비디오 생성 시간이 초과되었습니다. 다시 시도해주세요.",
      };
    }

    // 에러 체크
    if (operation.error) {
      console.error("❌ 비디오 생성 에러:", operation.error);
      return {
        success: false,
        error: operation.error.message || "비디오 생성 중 오류가 발생했습니다.",
      };
    }

    // 비디오 추출 (공식 문서 방식: generatedVideos with capital V)
    const generatedVideos = operation.response?.generatedVideos;

    if (!generatedVideos || generatedVideos.length === 0) {
      console.error("❌ 생성된 비디오가 없습니다:", operation.response);
      return {
        success: false,
        error: "생성된 비디오를 찾을 수 없습니다.",
      };
    }

    const videoData = generatedVideos[0];
    const videoFile = videoData.video; // File 객체
    console.log(videoData);

    console.log("✅ Veo 비디오 생성 완료!");
    console.log("📹 비디오 파일:", videoFile);

    // 비디오 파일을 다운로드하여 URL 생성
    // 서버에서 파일을 저장하고 URL을 반환
    try {
      // 파일 URI 추출
      const fileUri = videoFile?.uri || videoFile?.name;

      if (!fileUri) {
        console.error("❌ 비디오 파일 URI를 찾을 수 없습니다:", videoFile);
        return {
          success: false,
          error: "비디오 파일 정보를 찾을 수 없습니다.",
        };
      }

      // Google Cloud Storage URI를 HTTPS URL로 변환
      let videoUrl = fileUri;

      if (fileUri.startsWith("gs://")) {
        videoUrl = fileUri.replace("gs://", "https://storage.googleapis.com/");
      }

      console.log("📹 비디오 URL:", videoUrl);

      return {
        success: true,
        videoUrl,
        metadata: {
          duration: videoData.duration,
          resolution: videoData.resolution,
        },
      };
    } catch (urlError) {
      console.error("❌ 비디오 URL 생성 에러:", urlError);
      return {
        success: false,
        error: "비디오 URL을 생성할 수 없습니다.",
      };
    }
  } catch (error) {
    console.error("❌ Veo 비디오 생성 에러:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "비디오 생성 중 오류가 발생했습니다.";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 비디오 다운로드 및 S3 업로드
 */
export async function downloadAndUploadVeoVideo(
  videoUrl: string,
  sessionId?: string
): Promise<{ success: boolean; s3Url?: string; error?: string }> {
  try {
    const apiKey = process.env.GEMINI_API_KEY2;

    if (!apiKey) {
      return {
        success: false,
        error: "Google AI API 키가 설정되지 않았습니다.",
      };
    }

    console.log("📥 비디오 다운로드 시작:", videoUrl);

    // API 키를 헤더에 포함하여 다운로드
    const response = await fetch(videoUrl, {
      headers: {
        "x-goog-api-key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Download failed: ${response.status} ${response.statusText}`
      );
    }

    // ArrayBuffer로 변환
    const arrayBuffer = await response.arrayBuffer();
    const videoBuffer = Buffer.from(arrayBuffer);

    console.log(
      `📊 다운로드 완료 - 파일 크기: ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`
    );

    // S3에 업로드
    console.log("☁️  S3 업로드 시작...");
    const s3Url = await uploadVideoToS3(videoBuffer, sessionId);

    console.log("✅ S3 업로드 완료:", s3Url);

    return {
      success: true,
      s3Url,
    };
  } catch (error) {
    console.error("❌ 비디오 처리 에러:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "비디오 처리 중 오류가 발생했습니다.";

    return {
      success: false,
      error: errorMessage,
    };
  }
}
