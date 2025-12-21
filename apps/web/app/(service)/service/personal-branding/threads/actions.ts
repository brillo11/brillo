"use server";

import { generateText } from "ai";

export type ThreadsStyle = "EMPATHY" | "TIPS" | "DEBATE" | "NETWORKING";

export async function generateThreadsContent(
  topic: string,
  style: ThreadsStyle,
  targetAudience?: string,
  insight?: string,
) {
  try {
    let styleGuide = "";

    switch (style) {
      case "EMPATHY":
        styleGuide = `
        1. "나만 이런 거 아니지?" 공감형 썰 (일상 & 유머)
        - 특징: 완벽해 보이는 모습보다는 실수담, 퇴사 욕구, 직장 내 빌런, 연애 고민 등 누구나 겪을 법한 이야기를 풉니다. '솔직함'이 무기입니다. "인스타에서는 행복한 척하지만 사실은..."이라는 식의 반전 매력이 잘 통합니다.
        - 형식: 사진 없이 3~5줄 정도의 짧은 텍스트.
        - 톤앤매너: 꾸밈없는 날것(Raw), 솔직함, 약간은 찌질하거나 웃픈 감성.
        `;
        break;
      case "TIPS":
        styleGuide = `
        2. "이거 알면 인생 편해짐" 꿀팁 & 인사이트 (정보 공유)
        - 특징: 저장(Save)과 재공유(Repost)를 유도하는 실용적인 정보글입니다. 긴 글을 선호하는 쓰레드 유저들의 특성상, 퀄리티 높은 정보는 빠르게 확산됩니다.
        - 형식: 첫 줄에 강력한 후킹(Hook) 문구를 넣고, 타래(답글)로 정보를 이어가는 '스레드(실타래)' 형식을 주로 사용합니다.
        - 톤앤매너: 유용한, 구체적인, 경험에 기반한 찐 정보. 커리어/자기계발/찐경험담 위주.
        `;
        break;
      case "DEBATE":
        styleGuide = `
        3. "님들 이거 어떻게 생각함?" 논쟁 & 토론 유도
        - 특징: 댓글 참여를 폭발적으로 늘리는 유형입니다. 밸런스 게임이나 가벼운 논쟁 거리를 던집니다. (예: 탕수육 부먹 vs 찍먹, 연애 밸런스 게임 등).
        - 형식: 질문을 던지고 의견을 묻는 방식.
        - 톤앤매너: 도발적인(가볍게), 참여 유도적인, 호불호가 갈리는 주제.
        `;
        break;
      case "NETWORKING":
        styleGuide = `
        4. "쓰친(쓰레드 친구) 구함" 친목 & 네트워킹
        - 특징: '반말 모드'나 '존댓말 모드'를 프로필에 명시하며 친구를 사귀는 문화. 업계 네트워킹이나 취미 공유.
        - 형식: 자기소개 + 친구 찾기. 서로를 '쓰님', '쓰친' 등으로 부름.
        - 톤앤매너: 개방적인, 친근한, 네트워킹 목적.
        `;
        break;
    }

    const prompt = `
    You are an expert content creator for Korean Threads (쓰레드).
    Create a highly engaging Threads post series (Main post + replies/follow-ups) based on the following inputs:

    Topic: "${topic}"
    Target Audience: "${targetAudience || "General Threads users"}"
    User Insight (Optional): "${insight || "None provided"}"

    Selected Style: ${style}
    
    [Style Guide]
    ${styleGuide}

    [General Threads Culture Tips]
    - First Sentence is Critical: It must hook the reader immediately.
    - Tone: Can be casual (Banmal) or polite (Jondaetmal) but must be AUTHENTIC. Avoid corporate stiff tone. Use "Text-Hip" vibe.
    - Line Breaks: Use frequent line breaks for readability (Enter key).
    - Length: Main post should be punchy. Follow-up posts (replies) can elaborate.
    
    Output strictly as a JSON object with the following structure:
    {
      "posts": [
        "Content of the first (main) post...",
        "Content of the first reply (if needed)...",
        "Content of the second reply (if needed)..."
      ]
    }
    
    Do not include any markdown formatting like \`\`\`json or \`\`\`. Just the raw JSON.
    Language: Korean.
    `;

    const { text: generatedText } = await generateText({
      model: "google/gemini-3-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = generatedText.trim();
    if (!content) {
      throw new Error("No content generated");
    }

    // JSON Parsing Logic with robust fallback
    let parsedResources;
    try {
      // First try direct parse
      parsedResources = JSON.parse(content);
    } catch (e) {
      // Clean markdown if present
      const cleaned = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      try {
        parsedResources = JSON.parse(cleaned);
      } catch (e2) {
        throw new Error("Failed to parse generation result");
      }
    }

    if (parsedResources && Array.isArray(parsedResources.posts)) {
      return { success: true, posts: parsedResources.posts as string[] };
    } else {
      throw new Error("Invalid format returned");
    }
  } catch (error) {
    console.error("Threads Generation Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
