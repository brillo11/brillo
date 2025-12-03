"use client";

import { Loader2, Sparkles } from "lucide-react";
import type { CreatorPersona } from "./types";
import { renderIcon } from "./utils";

interface Step2TopicProps {
  selectedPersona: CreatorPersona | null;
  topic: string;
  onTopicChange: (topic: string) => void;
  onSubmit: () => void;
  isGenerating: boolean;
}

export function Step2Topic({
  selectedPersona,
  topic,
  onTopicChange,
  onSubmit,
  isGenerating,
}: Step2TopicProps) {
  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 py-8">
      <div>
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4 ${selectedPersona?.color}`}
        >
          {selectedPersona && renderIcon(selectedPersona.iconName, "w-4 h-4")}
          <span>{selectedPersona?.name} is ready</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          What is your video about?
        </h2>
        <p className="text-gray-500">
          Enter a keyword or a rough idea. I'll help you refine it.
        </p>
      </div>

      <div className="relative">
        <input
          type="text"
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          placeholder="e.g., How to study effectively, My travel vlog to Japan..."
          className="w-full text-lg p-6 border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:outline-none shadow-sm transition-colors text-center disabled:opacity-70 disabled:cursor-not-allowed"
          onKeyDown={(e) => e.key === "Enter" && !isGenerating && onSubmit()}
          disabled={isGenerating}
        />
      </div>

      <button
        disabled={!topic.trim() || isGenerating}
        onClick={onSubmit}
        className="px-10 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold text-lg hover:shadow-lg disabled:opacity-70 transition-all flex items-center gap-2 mx-auto"
      >
        {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
        Generate Ideas
      </button>
    </div>
  );
}
