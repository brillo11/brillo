"use server";

import { generateText } from "ai";

export type ThreadsStyle =
  | "EMPATHY"
  | "TIPS"
  | "DEBATE"
  | "NETWORKING"
  | "FACT_BOMBER"
  | "BUILDING_IN_PUBLIC"
  | "MY_WAY"
  | "CURATION";
export type ThreadsTone = "AUTO" | "POLITE" | "CASUAL" | "MIXED";

export async function generateThreadsContent(
  topic: string,
  style: ThreadsStyle,
  tone: ThreadsTone = "AUTO",
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
        break;
      case "NETWORKING":
        styleGuide = `
        4. "쓰친(쓰레드 친구) 구함" 친목 & 네트워킹
        - 특징: '반말 모드'나 '존댓말 모드'를 프로필에 명시하며 친구를 사귀는 문화. 업계 네트워킹이나 취미 공유.
        - 형식: 자기소개 + 친구 찾기. 서로를 '쓰님', '쓰친' 등으로 부름.
        - 톤앤매너: 개방적인, 친근한, 네트워킹 목적.
        `;
        break;
        break;
      case "FACT_BOMBER":
        styleGuide = `
        5. "뼈 때리는 팩트폭격" 팩폭 & 현실 조언
        - 특징: 듣기 좋은 말보다는 '불편하지만 반드시 알아야 할 현실'을 직설적으로 이야기합니다. 어설픈 위로보다는 정신이 번쩍 드는 조언을 원하는 사람들에게 통합니다.
        - 형식: "착각하지 마세요.", "언제까지 그렇게 살 건가요?" 같은 강렬한 문구로 시작.
        - 톤앤매너: 냉철한, 직설적인, 군더더기 없는, 본질을 꿰뚫는. (단, 비난이 아닌 건설적인 비판이어야 함)
        `;
        break;
      case "BUILDING_IN_PUBLIC":
        styleGuide = `
        6. "성장 기록" Building in Public
        - 특징: 성공한 결과가 아니라, 고군분투하는 과정을 팝니다. 서툰 과정, 실패 경험, 작은 성취를 실시간으로 공유하여 "나도 같이 성장하고 싶다"는 팬덤을 만듭니다.
        - 형식: 오늘의 목표/실패/배운점 회고, 작업 과정 스크린샷 묘사 등.
        - 톤앤매너: 투명한, 진정성 있는, 겸손하지만 열정적인.
        `;
        break;
      case "MY_WAY":
        styleGuide = `
        7. "마이웨이 / 소신 발언"
        - 특징: 남들의 시선을 신경 쓰지 않는 독자적인 시각이나 취향을 드러냅니다. 남을 설득하려 하지 않고 "나는 이렇다"라고 선언하는 쿨한 태도입니다.
        - 형식: 통념을 뒤집는 한 마디, 나의 확고한 취향 선언.
        - 톤앤매너: 자신감 있는, 쿨한, 독립적인, 힙한.
        `;
        break;
      case "CURATION":
        styleGuide = `
        8. "큐레이션 / 정보 요약"
        - 특징: 바쁜 사람들을 위해 뉴스, 트렌드, 좋은 문장 등을 3줄 요약 등으로 떠먹여 줍니다. 팔로워를 빠르게 늘리는 데 유리합니다.
        - 형식: 리스트업 (1., 2., 3.), 핵심 요약.
        - 톤앤매너: 친절한, 스마트한, 핵심만 짚어주는.
        `;
        break;
    }

    let toneGuide = "";
    switch (tone) {
      case "POLITE":
        toneGuide =
          "John-daet-mal (존댓말 모드): Polite, respectful, Soft spoken but witty.";
        break;
      case "CASUAL":
        toneGuide =
          "Ban-mal (반말 모드): Casual, friendly, direct, like talking to a close friend.";
        break;
      case "MIXED":
        toneGuide =
          "Ban-jon-dae (반존대 모드): Mix of polite and casual. E.g., starting with polite but ending with casual, or vice versa, to create a unique charming vibe.";
        break;
      case "AUTO":
      default:
        toneGuide =
          "Automatic: Choose the most appropriate tone based on the Style and Topic. For Empathy/Networking, prefer Casual/Mixed. For Tips/Debate, prefer Polite/Mixed.";
        break;
    }

    const prompt = `
    You are an expert content creator for Korean Threads (쓰레드).
    Create a highly engaging Threads post series (Main post + replies/follow-ups) based on the following inputs:

    Topic: "${topic}"
    Target Audience: "${targetAudience || "General Threads users"}"
    User Insight (Optional): "${insight || "None provided"}"

    Selected Style: ${style}
    Selected Tone: ${tone}
    
    [Style Guide]
    ${styleGuide}

    [Tone Guide]
    ${toneGuide}

    [General Threads Culture Tips]
    - First Sentence is Critical: It must hook the reader immediately.
    - Tone: Must be AUTHENTIC. Avoid corporate stiff tone. Use "Text-Hip" vibe.
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
