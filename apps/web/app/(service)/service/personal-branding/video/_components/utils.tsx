import { Bot, Zap, Lightbulb, TrendingUp } from "lucide-react";

export const renderIcon = (name: string, className: string) => {
  switch (name) {
    case "Bot":
      return <Bot className={className} />;
    case "Zap":
      return <Zap className={className} />;
    case "Lightbulb":
      return <Lightbulb className={className} />;
    case "TrendingUp":
      return <TrendingUp className={className} />;
    default:
      return <Bot className={className} />;
  }
};
