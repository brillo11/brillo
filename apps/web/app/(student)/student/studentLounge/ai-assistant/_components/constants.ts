import type { CreatorPersona } from "./types";

export const MOCK_CREATOR_PERSONAS: CreatorPersona[] = [
  {
    id: "p1",
    name: "The AI Specialist",
    description:
      "Expert in explaining complex AI tools simply. Focuses on tech tutorials and news.",
    iconName: "Bot",
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "p2",
    name: "Viral Trend Hunter",
    description:
      "Analyzes high-CTR thumbnails and hooks. Great for Shorts and lifestyle content.",
    iconName: "TrendingUp",
    color: "bg-red-100 text-red-600",
  },
  {
    id: "p3",
    name: "Storyteller",
    description:
      "Focuses on narrative structure and emotional connection. Ideal for vlogs and documentaries.",
    iconName: "Lightbulb",
    color: "bg-amber-100 text-amber-600",
  },
  {
    id: "p4",
    name: "Channel Starter",
    description:
      "Helps beginners plan their first 10 videos with consistent branding.",
    iconName: "Zap",
    color: "bg-green-100 text-green-600",
  },
];

export const MOCK_GENERATED_TITLES = [
  "How I built this in 24 hours (No Code)",
  "Stop doing THIS if you want to grow in 2024",
  "The Ultimate Guide for Beginners",
  "Why 99% of people fail at this",
  "I tried this for 7 days, here is what happened",
];

export const MOCK_THUMBNAIL_GUIDES = [
  {
    id: 1,
    title: "The 'Shocked' Face",
    desc: "Close up of face on the right, high contrast background, large text on left saying 'MISTAKE!'.",
  },
  {
    id: 2,
    title: "The 'Before & After'",
    desc: "Split screen. Left side desaturated (Before), Right side vibrant (After). Arrow in middle.",
  },
  {
    id: 3,
    title: "The Minimalist Object",
    desc: "Solid color background. Single object in center with a glowing outline. Question mark.",
  },
];

export const MOCK_GENERATED_SCRIPT = `
  [INTRO]
  (0:00 - 0:30)
  Hook: "Have you ever wondered why some channels explode overnight while others struggle for years? It's not luck. It's a formula."
  Visual: Fast-paced montage of successful creators.
  
  [BODY PARAGRAPH 1]
  (0:30 - 2:00)
  Concept: The 'Value First' Principle.
  Explanation: Don't ask for likes immediately. Give value first.
  Visual: Screen recording showing analytics graph going up.
  
  [BODY PARAGRAPH 2]
  (2:00 - 3:30)
  Concept: Consistency vs Quality.
  Explanation: It is a trap. You need 'Consistent Quality'.
  Visual: Talking head with text overlays of key points.
  
  [OUTRO]
  (3:30 - End)
  Call to Action: "If you want to learn the exact tools I use, click the video on screen now."
  Visual: End screen elements pointing to next video.
  `;
