"use client";

import { ArrowRight, Check } from "lucide-react";
import type { CreatorPersona, Step } from "./types";
import { MOCK_CREATOR_PERSONAS } from "./constants";
import { renderIcon } from "./utils";
import Image from "next/image";

interface Step1PersonaProps {
  selectedPersona: CreatorPersona | null;
  onSelectPersona: (persona: CreatorPersona) => void;
  onStepChange: (step: Step) => void;
}

export function Step1Persona({
  selectedPersona,
  onSelectPersona,
  onStepChange,
}: Step1PersonaProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white">AI 파트너 선택</h2>
        <p className="text-gray-400">
          다음 영상 제작을 도와줄 페르소나를 선택해주세요.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_CREATOR_PERSONAS.map((persona) => (
          <div
            key={persona.id}
            onClick={() => onSelectPersona(persona)}
            className={`cursor-pointer border-2 rounded-xl p-6 transition-all duration-200 hover:shadow-md flex items-start gap-4 ${
              selectedPersona?.id === persona.id
                ? "border-[#33DB98] bg-[#33DB98]/10"
                : "border-white/10 bg-white/5 hover:border-[#33DB98]/50"
            }`}
          >
            {persona.image ? (
              <div className="relative w-12 h-12">
                <Image
                  src={persona.image}
                  alt={persona.name}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
            ) : (
              <div
                className={`p-3 rounded-full shrink-0 ${persona.color} overflow-hidden`}
              >
                {renderIcon(persona.iconName, "w-6 h-6")}
              </div>
            )}
            <div>
              <h3 className="font-bold text-white mb-1">{persona.name}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {persona.description}
              </p>
            </div>
            {selectedPersona?.id === persona.id && (
              <div className="ml-auto text-[#33DB98]">
                <Check size={24} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-8">
        <button
          disabled={!selectedPersona}
          onClick={() => onStepChange(2)}
          className="px-8 py-3 bg-[#33DB98] text-black rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#33DB98]/90 transition-colors flex items-center gap-2"
        >
          Next Step <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
