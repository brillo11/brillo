"use server";

import { prisma } from "@repo/database";
import { requireStudent } from "@/shared/lib/auth-guards";
import OpenAI from "openai";

const openAiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIAssistantSessionData {
  id: string;
  title: string | null;
  titleMessage: string | null;
  titleResponses: any | null;
  selectedTitle: string | null;
  selectedTitleIndex: number | null;
  thumbnailGuideResponses: any | null;
  selectedThumbnailGuideIndex: number | null;
  thumbnailResponses: string | null;
  scriptResponses: string | null;
  metadataResponses: any | null;
  shortsTitlesResponses: any | null;
  step: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AI 어시스턴트 세션 생성
 */
export async function createAIAssistantSession(): Promise<string> {
  const session = await requireStudent();
  const userId = session.user.id;

  // OpenAI conversation 생성
  const conversation = await openAiClient.conversations.create({});
  const conversationId = conversation.id;

  const newSession = await prisma.aIAssistantSession.create({
    data: {
      userId,
      conversationId,
    },
  });

  return newSession.id;
}

/**
 * 사용자의 모든 AI 어시스턴트 세션 조회
 */
export async function getAIAssistantSessions(): Promise<
  AIAssistantSessionData[]
> {
  const session = await requireStudent();
  const userId = session.user.id;

  const sessions = await prisma.aIAssistantSession.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      title: true,
      titleMessage: true,
      titleResponses: true,
      selectedTitle: true,
      selectedTitleIndex: true,
      thumbnailGuideResponses: true,
      selectedThumbnailGuideIndex: true,
      thumbnailResponses: true,
      scriptResponses: true,
      metadataResponses: true,
      shortsTitlesResponses: true,
      step: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return sessions as AIAssistantSessionData[];
}

/**
 * 특정 세션 조회
 */
export async function getAIAssistantSession(
  sessionId: string
): Promise<AIAssistantSessionData | null> {
  const session = await requireStudent();
  const userId = session.user.id;

  const aiSession = await prisma.aIAssistantSession.findFirst({
    where: {
      id: sessionId,
      userId, // 본인 세션만 조회 가능
    },
    select: {
      id: true,
      title: true,
      titleMessage: true,
      titleResponses: true,
      selectedTitle: true,
      selectedTitleIndex: true,
      thumbnailGuideResponses: true,
      selectedThumbnailGuideIndex: true,
      thumbnailResponses: true,
      scriptResponses: true,
      metadataResponses: true,
      shortsTitlesResponses: true,
      step: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return aiSession as AIAssistantSessionData | null;
}

/**
 * 세션 데이터 업데이트
 */
export async function updateAIAssistantSession(
  sessionId: string,
  updates: {
    titleMessage?: string;
    titleResponses?: any;
    selectedTitle?: string;
    selectedTitleIndex?: number | null;
    thumbnailGuideResponses?: any;
    selectedThumbnailGuideIndex?: number | null;
    thumbnailResponses?: string;
    scriptResponses?: string;
    metadataResponses?: any;
    shortsTitlesResponses?: any;
    step?: string;
  },
  title?: string
): Promise<void> {
  const session = await requireStudent();
  const userId = session.user.id;

  await prisma.aIAssistantSession.updateMany({
    where: {
      id: sessionId,
      userId, // 본인 세션만 업데이트 가능
    },
    data: {
      ...updates,
      ...(title && { title }),
    },
  });
}

/**
 * 세션 삭제
 */
export async function deleteAIAssistantSession(
  sessionId: string
): Promise<void> {
  const session = await requireStudent();
  const userId = session.user.id;

  await prisma.aIAssistantSession.deleteMany({
    where: {
      id: sessionId,
      userId, // 본인 세션만 삭제 가능
    },
  });
}
