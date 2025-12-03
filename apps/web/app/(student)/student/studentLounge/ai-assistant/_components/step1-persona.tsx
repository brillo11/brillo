"use client";

import { ArrowRight, Check } from "lucide-react";
import type { CreatorPersona } from "./types";
import { MOCK_CREATOR_PERSONAS } from "./constants";
import { renderIcon } from "./utils";

interface Step1PersonaProps {
  selectedPersona: CreatorPersona | null;
  onSelectPersona: (persona: CreatorPersona) => void;
  onNext: () => void;
}

export function Step1Persona({
  selectedPersona,
  onSelectPersona,
  onNext,
}: Step1PersonaProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Choose Your AI Partner
        </h2>
        <p className="text-gray-500">
          Select a persona to help you create your next viral video.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_CREATOR_PERSONAS.map((persona) => (
          <div
            key={persona.id}
            onClick={() => onSelectPersona(persona)}
            className={`cursor-pointer border-2 rounded-xl p-6 transition-all duration-200 hover:shadow-md flex items-start gap-4 ${
              selectedPersona?.id === persona.id
                ? "border-red-600 bg-red-50"
                : "border-gray-100 bg-white hover:border-red-200"
            }`}
          >
            <div className={`p-3 rounded-full shrink-0 ${persona.color}`}>
              {renderIcon(persona.iconName, "w-6 h-6")}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">{persona.name}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {persona.description}
              </p>
            </div>
            {selectedPersona?.id === persona.id && (
              <div className="ml-auto text-red-600">
                <Check size={24} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-8">
        <button
          disabled={!selectedPersona}
          onClick={onNext}
          className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          Next Step <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
