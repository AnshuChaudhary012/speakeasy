import React from 'react';
import { 
  Coffee, 
  Briefcase, 
  ShoppingBag, 
  Plane, 
  BookOpen 
} from 'lucide-react';
import { CONVERSATION_MODES } from '../constants/modes';

const iconMap = {
  Coffee,
  Briefcase,
  ShoppingBag,
  Plane,
  BookOpen
};

export default function ModeSelector({ currentModeId, onSelectMode }) {
  const activeMode = CONVERSATION_MODES.find(m => m.id === currentModeId) || CONVERSATION_MODES[0];

  return (
    <nav aria-label="Conversation modes" className="bg-slate-50 border-b border-slate-200 px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Mode Pills list */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {CONVERSATION_MODES.map((mode) => {
            const Icon = iconMap[mode.icon] || Coffee;
            const isActive = mode.id === currentModeId;

            return (
              <button
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                type="button"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-200 ring-2 ring-indigo-600/20'
                    : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                }`}
                aria-pressed={isActive}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{mode.title}</span>
              </button>
            );
          })}
        </div>

        {/* Current mode short explanation */}
        <div className="hidden md:flex items-center text-xs text-slate-500 font-medium">
          <span className="text-slate-400 mr-1.5 font-normal">Active Topic:</span>
          <span className="text-slate-700 font-medium">{activeMode.description}</span>
        </div>
      </div>
    </nav>
  );
}
