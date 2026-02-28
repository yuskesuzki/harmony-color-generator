/**
 * PaletteHistoryコンポーネントは、ユーザーが作成したカラーパレットの履歴を管理し、保存、復元、削除、および全消去の機能を提供します。
 */

// クライアントで動きます。
'use client';

// Reactから必要なフックをインポート
import React from 'react';

// コンポーネントで使うプロパティの型定義
type PaletteHistoryProps = {
  currentPalette: string[];
  history: string[][];
  onSaveToHistory: () => void;
  onLoadFromHistory: (palette: string[]) => void;
  onDeleteHistory: (index: number) => void;
  onClearHistory: () => void;
};

// PaletteHistoryコンポーネントの定義
export default function PaletteHistory({
  currentPalette,
  history,
  onSaveToHistory,
  onLoadFromHistory,
  onDeleteHistory,
  onClearHistory
}: PaletteHistoryProps) {

  // 現在のパレットが完全に空かどうか（すべてundefinedまたは空文字か）を判定
  const isCurrentEmpty = currentPalette.length === 0 || currentPalette.every(c => !c);

  return (
    <div className="mt-12 pt-8 border-t border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
          </svg>
          Palette History
        </h2>

        <div className="flex gap-3">
          <button
            onClick={onSaveToHistory}
            disabled={isCurrentEmpty}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm ${
              isCurrentEmpty
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
            </svg>
            現在のパレットを履歴に保存
          </button>

          <button
            onClick={onClearHistory}
            disabled={history.length === 0}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
              history.length === 0
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200'
            }`}
          >
            全消去
          </button>
        </div>
      </div>

      { /* 履歴が空の場合のプレースホルダ表示と、履歴がある場合のパレットカード表示を条件分岐で切り替え */ }
      {history.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 border-dashed rounded-3xl p-10 text-center text-gray-400">
          <svg className="mx-auto mb-3 opacity-50" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
          </svg>
          <p className="font-bold">履歴はありません</p>
          <p className="text-sm mt-1">気に入ったパレットができたら「履歴に保存」ボタンを押してください。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((pal, index) => (
            <div key={index} className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 group">
              <div className="flex h-12 rounded-xl overflow-hidden border border-gray-100">
                {/* 5色の枠をループして表示（色が空の場合は市松模様やグレー背景にする） */}
                {[0, 1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className={`flex-1 ${!pal[i] ? 'bg-gray-50 border-r border-gray-100 last:border-0 flex items-center justify-center' : ''}`}
                    style={{ backgroundColor: pal[i] || 'transparent' }}
                  >
                    {!pal[i] && <span className="text-[10px] text-gray-300 font-bold">空</span>}
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs font-bold text-gray-400">#{history.length - index}</span>
                <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onLoadFromHistory(pal)}
                    className="text-xs text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg font-bold border border-blue-200"
                  >
                    復元する
                  </button>
                  <button
                    onClick={() => onDeleteHistory(index)}
                    className="text-xs text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg font-bold border border-red-200"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
