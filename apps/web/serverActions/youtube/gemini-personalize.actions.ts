"use server";

import { GoogleGenAI } from "@google/genai";

/**
 * Gemini API를 사용하여 YouTube 대본을 개인화된 학습 자료로 변환
 * 공식 문서: https://ai.google.dev/gemini-api/docs/quickstart?hl=ko#javascript
 */
export async function personalizeTranscriptWithGemini(
  transcript: string,
  studentLevel?: string,
  learningGoals?: string
) {
  console.log(`[personalizeTranscriptWithGemini] ========== 시작 ==========`);
  console.log(
    `[personalizeTranscriptWithGemini] 대본 길이:`,
    transcript.length
  );

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error(`[personalizeTranscriptWithGemini] Gemini API 키 없음`);
      return {
        success: false,
        error: "Gemini API 키가 설정되지 않았습니다.",
      };
    }

    // 프롬프트 구성
    const prompt = `다음은 YouTube 영상의 자막(대본)입니다. 이 대본을 바탕으로 수강생 개인에게 맞춘 학습 자료를 생성해주세요.

요구사항:
1. 원본 대본의 핵심 내용을 유지하면서 학습자 수준에 맞게 재구성
2. 어려운 용어나 개념이 있으면 쉽게 설명 추가
3. 학습 목표에 맞는 핵심 포인트를 강조
4. 실용적인 예시나 연습 문제 제시
5. 개인별 학습 속도에 맞춘 구성

${studentLevel ? `학습자 수준: ${studentLevel}` : ""}
${learningGoals ? `학습 목표: ${learningGoals}` : ""}

원본 대본:
${transcript}

위 대본을 바탕으로 개인화된 학습 자료를 생성해주세요. 다음 형식으로 작성해주세요:

# 학습 자료

## 핵심 내용 요약
[대본의 핵심 내용을 요약]

## 주요 개념 설명
[중요한 개념들을 쉽게 설명]

## 학습 포인트
[학습자가 집중해야 할 부분]

## 실습 및 적용
[실제로 활용할 수 있는 방법]

## 추가 학습 자료
[관련하여 더 공부하면 좋을 내용]`;

    console.log(`[personalizeTranscriptWithGemini] Gemini API 호출 시작`);

    // Google GenAI 클라이언트 초기화 (환경 변수 GEMINI_API_KEY에서 자동 로드)
    const ai = new GoogleGenAI({});

    // 콘텐츠 생성 (공식 문서 방식)
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // 빠르고 효율적, 또는 "gemini-2.5-pro" (더 강력)
      contents: prompt,
    });

    const personalizedContent = response.text || "";

    if (!personalizedContent) {
      console.error(`[personalizeTranscriptWithGemini] 응답 텍스트 없음`);
      return {
        success: false,
        error: "Gemini API에서 응답을 받지 못했습니다.",
      };
    }

    console.log(
      `[personalizeTranscriptWithGemini] 개인화된 내용 생성 완료: ${personalizedContent.length}자`
    );

    return {
      success: true,
      personalizedContent: personalizedContent,
    };
  } catch (error: any) {
    console.error("[personalizeTranscriptWithGemini] 전체 오류:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      error: error,
    });

    return {
      success: false,
      error:
        error?.message || "개인화된 학습 자료 생성 중 오류가 발생했습니다.",
    };
  }
}
