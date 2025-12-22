export interface CreatorPersona {
  id: string;
  name: string;
  description: string;
  iconName: "Bot" | "Zap" | "Lightbulb" | "TrendingUp";
  color: string;
  image?: string;
}

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
}

export type VideoStyle = "INFO" | "MOTIVATION" | "STORY" | "REVIEW";

export interface ThumbnailReference {
  id: string;
  url: string;
  title?: string;
}
