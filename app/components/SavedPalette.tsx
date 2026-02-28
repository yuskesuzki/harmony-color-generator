'use client';

import React from 'react';

type SavedPaletteProps = {
  palette: string[];
  selectedIndices: number[];
  isGenerating: boolean;
  onGenerateGA: () => void;
  onClearPalette: () => void;
  onSlotClick: (index: number) => void;
  onRemoveCell: (e: React.MouseEvent, index: number) => void;
};

export default function SavedPalette({
  palette,
  selectedIndices,
  isGenerating,
  onGenerateGA,
  onClearPalette,
  onSlotClick,
  onRemoveCell
}: SavedPaletteProps) {
  return (
    <div className="mt-8 pt-8 border-t border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
          Saved Palette
        </h2>
        <div className="flex gap-3">
          <button
            onClick={onGenerateGA}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
          >
            {isGenerating ? 'AI計算中...' : 'ランダム調和 (5色)'}
          </button>
          <button
            onClick={onClearPalette}
            disabled={palette.length === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-bold ${palette.length === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
          >
            クリア
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {[0, 1, 2, 3, 4].map((index) => {
          const savedColor = palette[index];
          const isSelected = selectedIndices.includes(index);

          return (
            <div
              key={index}
              onClick={() => onSlotClick(index)}
              className={`relative flex-1 h-24 rounded-2xl shadow-sm border-2 transition-all duration-300 flex items-end justify-center pb-2 group/cell cursor-pointer ${
                savedColor
                  ? (isSelected ? 'border-blue-500 scale-105 shadow-md' : 'border-transparent hover:scale-[1.02]')
                  : 'border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-blue-300'
              }`}
              style={{ backgroundColor: savedColor || 'transparent' }}
            >
              {savedColor && <span className="bg-white/90 text-gray-800 px-2 py-1 rounded text-xs font-mono font-bold uppercase">{savedColor}</span>}
              {isSelected && <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg></div>}
              {!savedColor && <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></div>}

              {savedColor && (
                <button
                  onClick={(e) => onRemoveCell(e, index)}
                  className="absolute top-2 left-2 w-6 h-6 bg-black/40 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-all z-10"
                  title="この枠の色をクリア"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
