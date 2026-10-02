import React from 'react';
import { Sparkles } from 'lucide-react';

export default function QuickPrompts({ prompts = [], onSelectPrompt }) {
  if (!prompts || prompts.length === 0) return null;

  return (
    <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/60">
      <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          Try:
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {prompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => onSelectPrompt(prompt)}
              type="button"
              className="text-xs px-2.5 py-1 rounded-md bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 transition-colors shadow-2xs whitespace-nowrap cursor-pointer text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
