export interface CreatorPersona {
  id: string;
  name: string;
  description: string;
  iconName: "Bot" | "Zap" | "Lightbulb" | "TrendingUp";
  color: string;
}

export type Step = 1 | 2 | 3 | 4 | 5 | 6;

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
}
