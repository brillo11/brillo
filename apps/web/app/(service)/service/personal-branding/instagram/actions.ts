"use server";

import { generateText } from "ai";
import { generateImageWithAI } from "@/shared/serverActions/aiGateway";

export type InstagramStyle = "RETENTION" | "AIDA" | "PAS" | "BAB";
export type InstagramAspectRatio = "9:16" | "4:5" | "1:1";

export async function generateInstagramImage(
  context: {
    visual: string;
    mainText: string;
    miniTexts: string;
    directions: string;
  },
  aspectRatio: InstagramAspectRatio,
) {
  try {
    const finalPrompt = `
    Context for Instagram Card News Design:
    - Visual Background/Concept: ${context.visual}
    - Main Headline (Big & Bold): "${context.mainText}"
    - Subtext/Body (Smaller, Readable): "${context.miniTexts}"
    - Design Style/Directions: ${context.directions}
    
    Design a professional Instagram Card News image. 
    1. LAYOUT: Clear typographic hierarchy. The Main Headline should be prominent and readable. The Subtext should be balanced and legible.
    2. BACKGROUND: High-quality visual based on the description, darkened or overlayed if necessary to ensure text readability. If characters or places appear, the background/setting MUST be Korea. 
    3. STYLE: Modern, clean, and aesthetic. Follow the design directions.
    4. TEXT RENDERING: You MUST render the text onto the image. Ensure the spelling is correct and the font style matches the vibe. Do NOT display any other text except the Main Headline and Subtext/Body.
    `;

    const result = await generateImageWithAI(finalPrompt, aspectRatio);

    if (result.success && result.imageUrl) {
      return { success: true, url: result.imageUrl };
    } else {
      throw new Error(result.error || "Image generation failed");
    }
  } catch (error) {
    console.error("Image Generation API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function generateInstagramContent(
  topic: string,
  style: InstagramStyle,
) {
  try {
    let prompt = `You are an expert Instagram content creator. Create a card news script for the topic: "${topic}".
    
    Style: ${style}
    
    Structure Guide:
    `;

    if (style === "RETENTION") {
      prompt += `
      - Total 8 pages.
      - Page 1: Hook (Grab attention)
      - Page 2: Empathy (Relate to user)
      - Page 3-6: Core Information (Deliver value)
      - Page 7: Summary
      - Page 8: CTA (Call to Action)
      - Goal: Maximize retention and completion rate.
      `;
    } else if (style === "AIDA") {
      prompt += `
      - Structure: Attention -> Interest -> Desire -> Action
      - Page 1: Attention (Headline)
      - Page 2-3: Interest (Engage)
      - Page 4-6: Desire (Benefits)
      - Page 7-8: Action (CTA)
      - Goal: Logical flow, persuasive.
      `;
    } else if (style === "PAS") {
      prompt += `
      - Structure: Problem -> Agitation -> Solution
      - Page 1: Problem (Identify pain point)
      - Page 2-3: Agitation (Amplify pain)
      - Page 4-5: Solution (Solve it)
      - Goal: Emotional connection, urgency.
      `;
    } else if (style === "BAB") {
      prompt += `
      - Structure: Before -> After -> Bridge
      - Page 1-2: Before (Current situation)
      - Page 3-4: After (Desired future)
      - Page 5-6: Bridge (How to get there)
      - Goal: Hope, transformation.
      `;
    }

    prompt += `
    
    Output strictly as a JSON array of objects, where each object is composed with 4 parts:
    - visual
    - mainText
    - miniTexts
    - directions

    Example: [{"visual": "...", "mainText": "...", "miniTexts": "...", "directions": "..."}, ...]
    Do not include any markdown formatting like \`\`\`json or \`\`\`. Just the raw JSON array.
    Language: Korean.
    `;

    // const { text } = await generateText({
    //   model: google("gemini-3-flash" as any),
    //   prompt: prompt,
    // });

    const { text: generatedText } = await generateText({
      model: "google/gemini-3-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = generatedText;
    if (!content) {
      throw new Error("No content generated");
    }

    console.log({ generatedText });

    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return { success: true, pages: parsed };
      } else {
        return { success: false, error: "Invalid format returned" };
      }
    } catch (e) {
      // Fallback cleanup if markdown blocks exist
      const cleaned = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      try {
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) {
          return { success: true, pages: parsed };
        }
      } catch (e2) {
        return { success: false, error: "JSON parsing failed" };
      }
      return { success: false, error: "JSON parsing failed" };
    }
  } catch (error) {
    console.error("Error generating content:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
