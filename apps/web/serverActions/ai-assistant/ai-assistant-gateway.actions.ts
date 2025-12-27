"use server";

import { z } from "zod";
import { prisma } from "@repo/database";
import { requireStudent } from "@/shared/lib/auth-guards";
import { generateObjectAI } from "@/shared/serverActions/aiGateway";

// --- Schemas (Copied/Adapted from ai-assistant.actions.ts) ---

const setSchema = z.object({
  thumbnailTitle: z.string(),
  videoTitle: z.string(),
  thumbnailGuide: z
    .string()
    .describe(
      "썸네일 이미지 생성을 위한 상세한 시각적 묘사 및 가이드 (등장 요소, 배경, 분위기 등)"
    ),
});

const titleSchema = z.object({
  sets: z.array(setSchema).length(3),
});

const thumbnailGuideSetSchema = z.object({
  guideTitle: z.string().describe("markdown 형식으로 작성"),
  guideDescription: z.string().describe("markdown 형식으로 작성"),
  guideSummary: z.string().describe("markdown 형식으로 작성"),
});

const thumbnailGuideSchema = z.object({
  thumbnailGuides: z.array(thumbnailGuideSetSchema).length(3),
});

const scriptChapterSchema = z.object({
  title: z
    .string()
    .describe("📌 이모지로 시작하는 자극적인 챕터 제목 (한 문장)"),
  content: z.string().describe("약 1분 분량의 바로 읽을 수 있는 대본"),
});

const scriptSchema = z.object({
  intro: z
    .string()
    .describe(
      "🎬 인트로 (초반 30초): 제목과 썸네일에서 끌어낸 후킹과 기대감을 이어가며 놀라운 사실, 중대한 약속, 로드맵을 자연스럽게 녹여낸 30초 분량 대본"
    ),
  selfIntro: z.string().describe("자기소개: 간단한 자기소개"),
  chapters: z.array(scriptChapterSchema).length(3).describe("본론 3개 챕터"),
  outro: z
    .string()
    .describe(
      "🎬 마무리: 핵심 요약, 구독/좋아요 요청, 다음 영상 예고와 댓글 참여 유도"
    ),
});

const metadataSchema = z.object({
  description: z
    .string()
    .describe("대본 내용을 검색 친화적으로 300자 내외로 요약"),
  timestamps: z
    .array(
      z.object({
        time: z.string().describe("타임스탬프 시간 (예: 0:00, 1:30)"),
        title: z.string().describe("해당 시간의 제목"),
      })
    )
    .describe("인트로~마무리까지 임의 시간 배치된 타임스탬프"),
  hashtags: z.array(z.string()).length(4).describe("관련 키워드 4개"),
  tags: z
    .array(z.string())
    .max(7)
    .describe("제목·대본 관련 키워드, 오타 가능성 키워드 포함 최대 7개"),
});

const shortsTitleSchema = z.object({
  chapterTitle: z.string().describe("챕터 제목"),
  titles: z
    .array(z.string())
    .min(2)
    .max(3)
    .describe("해당 챕터의 쇼츠 제목 2~3개"),
});

const shortsTitlesSchema = z.object({
  shortsTitles: z.array(shortsTitleSchema).describe("각 챕터별 쇼츠 제목"),
});

// --- Helper Functions ---

async function getSessionData(sessionId: string) {
  const session = await requireStudent();
  const userId = session.user.id;

  const aiSession = await prisma.aIAssistantSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
  });

  if (!aiSession) {
    throw new Error("Session not found or unauthorized");
  }

  return aiSession;
}

// --- Actions ---

export async function sendTitleResponses(
  sessionId: string,
  topic: string,
  targetAudience?: string,
  keyInsights?: string,
  videoStyle?: string
): Promise<any> {
  // sessionId is unused for generation but kept for compatibility if needed, 
  // or purely used for auth check if we wanted (but retrieval is not needed here).
  // We'll require student auth at least.
  await requireStudent();

  let userMessage = `주제: ${topic}`;
  if (targetAudience) userMessage += `\n대상 고객: ${targetAudience}`;
  if (keyInsights) userMessage += `\n핵심 인사이트: ${keyInsights}`;
  if (videoStyle) userMessage += `\n영상 스타일: ${videoStyle}`;

  const system = `1. 사용자가 주제를 입력하면 **ABCD 제목 공식**을 적용한 **3개의 기획안 세트**를 제시한다. 각 세트는 [썸네일 텍스트, 영상 제목, 썸네일 가이드]로 구성된다.

(대상 고객과 핵심 인사이트가 제공된 경우, 이를 충분히 반영한다.)

각 안은 다음 구조를 따른다:
- **썸네일 후킹 텍스트**: 자극적이고 짧게, 단순하게 (AB+C 조합 응용).
- **영상 제목**: 설명과 키워드 포함, 썸네일 텍스트와 안 겹치게, 굵은 볼드체, 이모지 제외(여성향만 허용). ABCD 공식 응용.
- **썸네일 가이드**: 해당 제목과 텍스트에 어울리는 **구체적인 이미지 생성 프롬프트 설명**. (등장 인물, 표정, 배경, 소품, 구도, 색감 등을 구체적으로 묘사).

- "시니어" -> "60대 이상/어르신" 등으로 순화.`;

  const result = await generateObjectAI(titleSchema, userMessage, system);

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to generate titles");
  }

  return result.data;
}

export async function sendThumbnailGuideResponses(
  sessionId: string,
  selectedTitleIndex: number
): Promise<any> {
  const session = await getSessionData(sessionId);
  const titleResponses: any = session.titleResponses;
  
  if (!titleResponses || !titleResponses.sets || !titleResponses.sets[selectedTitleIndex]) {
    throw new Error("Selected title data not found in session");
  }
  
  const selectedSet = titleResponses.sets[selectedTitleIndex];
  
  const prompt = `썸네일 가이드 만들어줘.
선택된 기획안:
- 제목: ${selectedSet.videoTitle}
- 썸네일 텍스트: ${selectedSet.thumbnailTitle}
- 초기 가이드: ${selectedSet.thumbnailGuide}

위 내용을 바탕으로 디자이너에게 의뢰할 수 있는 수준의 구체적인 썸네일 가이드 3가지를 제안해줘.`;

  const result = await generateObjectAI(thumbnailGuideSchema, prompt);
  
  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to generate thumbnail guides");
  }

  return result.data;
}

export async function sendScriptResponses(
  sessionId: string,
  referenceScript?: string
): Promise<any> {
  const session = await getSessionData(sessionId);
  
  const titleResponses: any = session.titleResponses;
  const selectedTitleIndex = session.selectedTitleIndex;
  
  if (!titleResponses || selectedTitleIndex === null) {
    throw new Error("Missing title data");
  }
  
  const selectedSet = titleResponses.sets[selectedTitleIndex];
  
  // Optional: Include thumbnail info if available
  // const thumbnailUrls = session.thumbnailUrls; // Just URL, maybe not useful for script text generation unless we analyzed it.
  
  let prompt = `대본을 만들어줘.
주제/제목: ${selectedSet.videoTitle}
썸네일 텍스트: ${selectedSet.thumbnailTitle}

다음 지침을 따라줘:
- 여러 대본 후보 없이 한 개의 대본만 제공한다.
- 전체 길이는 최대 4분 이내.
- **인트로 (초반 30초)**: 제목과 썸네일에서 끌어낸 후킹과 기대감을 이어가며 놀라운 사실, 중대한 약속, 로드맵을 자연스럽게 녹여낸 30초 분량 대본.
- **본론**: 자기소개와 3개의 챕터, 각 챕터는 한 문장으로 자극적인 제목을 붙이고, 약 1분 분량으로 바로 읽을 수 있는 대본을 작성한다.
  - 각 챕터 제목 앞에는 📌 이모지를 붙인다.
- **마무리**: 핵심 요약, 구독/좋아요 요청, 다음 영상 예고와 댓글 참여 유도.
- Opinion/Reason/Example/Offer와 같은 분류는 넣지 않고, 완성된 읽기용 대본만 제공한다.`;

  if (referenceScript) {
    prompt += `\n\n중요: 다음 글의 스타일(문체, 톤앤매너)을 참고하여 대본을 작성해줘. 내용은 주제에 맞게 하되, 말투와 서술 방식은 아래 글과 비슷하게 해줘:\n"""\n${referenceScript.slice(0, 3000)}\n"""`;
  }

  const result = await generateObjectAI(scriptSchema, prompt);

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to generate script");
  }

  return result.data;
}

export async function sendMetadataResponses(sessionId: string): Promise<any> {
  const session = await getSessionData(sessionId);
  const scriptResponses: any = session.scriptResponses;

  if (!scriptResponses) {
    throw new Error("Script data not found");
  }

  const fullScript = `인트로:\n${scriptResponses.intro}\n\n자기소개:\n${scriptResponses.selfIntro}\n\n본론:\n${scriptResponses.chapters?.map((ch: any) => `${ch.title}\n${ch.content}`).join("\n\n") || ""}\n\n마무리:\n${scriptResponses.outro}`;

  const prompt = `아래에 제공된 대본의 전체 내용을 읽고, 그 내용을 바탕으로 메타데이터를 생성해줘.

=== 대본 내용 시작 ===
${fullScript}
=== 대본 내용 끝 ===

중요: 설명(description) 필드는 반드시 위 대본에 실제로 나온 내용을 바탕으로 작성해야 해. 
- 대본에서 다룬 구체적인 내용, 팁, 방법론, 사례 등을 포함해야 해.
- 단순히 제목이나 주제만 요약하는 것이 아니라, 대본에 실제로 나온 내용을 300자 내외로 검색 친화적으로 요약해 줘.

지침:
- **설명**: 위 대본에 실제로 나온 구체적인 내용을 검색 친화적으로 300자 내외로 요약.
- **타임스탬프**: 인트로~마무리까지 임의 시간 배치.
- **해시태그**: 관련 키워드 4개 제시.
- **태그**: 제목·대본 관련 키워드, 오타 가능성 키워드 포함, 최대 7개.`;

  const result = await generateObjectAI(metadataSchema, prompt);

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to generate metadata");
  }

  return result.data;
}

export async function sendShortsTitlesResponses(sessionId: string): Promise<any> {
  const session = await getSessionData(sessionId);
  const scriptResponses: any = session.scriptResponses;
  
  if (!scriptResponses) {
     throw new Error("Script data not found");
  }
  
  const chapters = scriptResponses.chapters || [];
  const chaptersContent = chapters.map((ch: any, idx: number) => `Chapter ${idx+1}: ${ch.title}\n${ch.content}`).join("\n\n");

  const prompt = `쇼츠 제목 만들어줘.
  
대본 내용:
${chaptersContent}

각 챕터별로 2~3개의 쇼츠용 제목을 ABCD 제목 공식에 따라 제시해줘. 쇼츠 제목은 짧고 직관적이며, 강한 후킹과 자극적인 표현을 포함해야 해.`;

  const result = await generateObjectAI(shortsTitlesSchema, prompt);

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to generate shorts titles");
  }

  return result.data;
}
