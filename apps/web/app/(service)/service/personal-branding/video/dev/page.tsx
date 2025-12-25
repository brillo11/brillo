"use client";

import { useState } from "react";
import { YoutubeTranscriptTest } from "../_components/YoutubeTranscriptTest";

export default function TranscriptTestPage() {
  const [referenceScript, setReferenceScript] = useState("");

  return (
    <div className="container mx-auto p-12 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-8">YouTube Transcript Test Page</h1>
      
      <div className="bg-[#1E1E1E] border border-white/5 rounded-2xl p-8">
        <YoutubeTranscriptTest 
            referenceScript={referenceScript} 
            onReferenceScriptChange={setReferenceScript} 
        />
        
        <div className="mt-8 p-4 bg-black/40 rounded-xl border border-white/10">
            <h3 className="text-sm font-bold text-gray-400 mb-2">Parent State Check:</h3>
            <p className="text-xs text-gray-500 break-all">
                {referenceScript ? referenceScript.slice(0, 200) + "..." : "No script loaded in parent."}
            </p>
        </div>
      </div>
    </div>
  );
}
