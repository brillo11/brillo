'use client';

import { useState } from 'react';
import { useBlogForm } from './BlogFormContext';
import { Copy, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export default function CurrentState() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { formData } = useBlogForm();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed top-20 right-10 bg-white rounded-xl border border-slate-200 shadow-xl z-50 max-w-2xl w-full max-h-[80vh] flex flex-col">
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center justify-between p-4 border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <h1 className="font-bold text-slate-900">Current Form State</h1>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">JSON</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Copy JSON"
          >
            {copied ? (
              <CheckCircle2 size={18} className="text-green-600" />
            ) : (
              <Copy size={18} className="text-slate-600" />
            )}
          </button>
          {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
        </div>
      </div>
      
      {isOpen && (
        <div className="p-4 overflow-auto flex-1">
          <pre className="text-xs font-mono bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}