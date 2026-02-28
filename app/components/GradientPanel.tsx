'use client';

import React, { useState, useEffect } from 'react';
import { hexToRgbStruct, rgbToHex } from '../utils/colorUtils';

type GradientPanelProps = {
  palette: string[];
  selectedIndices: number[];
  extractedPalette: string[];
  onExtractColors: (hexes: string[]) => void;
  onClearExtracted: () => void;
  onSelectExtractedColor: (hex: string) => void;
};

export default function GradientPanel({
  palette,
  selectedIndices,
  extractedPalette,
  onExtractColors,
  onClearExtracted,
  onSelectExtractedColor
}: GradientPanelProps) {

  const [startPoint, setStartPoint] = useState<{x: number, y: number} | null>(null);
  const [hoverPoint, setHoverPoint] = useState<{x: number, y: number} | null>(null);

  useEffect(() => {
    setStartPoint(null);
    setHoverPoint(null);
  }, [selectedIndices, palette]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (startPoint) {
      const rect = e.currentTarget.getBoundingClientRect();
      setHoverPoint({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseLeave = () => {
    setHoverPoint(null);
  };

  const handleGradientClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 2色、3色、4色の場合のみ処理を許可
    if (selectedIndices.length !== 2 && selectedIndices.length !== 3 && selectedIndices.length !== 4) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!startPoint) {
      setStartPoint({ x, y });
      setHoverPoint({ x, y });
    } else {
      const endPoint = { x, y };

      const canvas = document.createElement('canvas');
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // 2色：線形グラデーション
      if (selectedIndices.length === 2) {
        const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
        grad.addColorStop(0, palette[selectedIndices[0]]);
        grad.addColorStop(0.1, palette[selectedIndices[0]]); // 0%~10%
        grad.addColorStop(0.9, palette[selectedIndices[1]]); // 90%~100%
        grad.addColorStop(1, palette[selectedIndices[1]]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      // 新規：3色 線形グラデーション
      else if (selectedIndices.length === 3) {
        const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
        grad.addColorStop(0, palette[selectedIndices[0]]);
        grad.addColorStop(0.1, palette[selectedIndices[0]]);   // 左端 0%~10%
        grad.addColorStop(0.45, palette[selectedIndices[1]]);  // 中央 45%~55%
        grad.addColorStop(0.55, palette[selectedIndices[1]]);
        grad.addColorStop(0.9, palette[selectedIndices[2]]);   // 右端 90%~100%
        grad.addColorStop(1, palette[selectedIndices[2]]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      // 4色：メッシュグラデーション
      else if (selectedIndices.length === 4) {
        ctx.fillStyle = palette[selectedIndices[0]];
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const drawRadial = (cx: number, cy: number, colorHex: string) => {
          const rgb = hexToRgbStruct(colorHex);
          const radius = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
          grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`);
          grad.addColorStop(0.15, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`); // 中心から15%
          grad.addColorStop(0.8, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        };

        drawRadial(0, 0, palette[selectedIndices[0]]);
        drawRadial(canvas.width, 0, palette[selectedIndices[1]]);
        drawRadial(0, canvas.height, palette[selectedIndices[2]]);
        drawRadial(canvas.width, canvas.height, palette[selectedIndices[3]]);
      }

      const extractedHexes: string[] = [];
      for (let i = 0; i < 8; i++) {
        const t = i / 7;
        const px = startPoint.x + (endPoint.x - startPoint.x) * t;
        const py = startPoint.y + (endPoint.y - startPoint.y) * t;

        const safeX = Math.max(0, Math.min(Math.round(px), canvas.width - 1));
        const safeY = Math.max(0, Math.min(Math.round(py), canvas.height - 1));

        const pixel = ctx.getImageData(safeX, safeY, 1, 1).data;
        extractedHexes.push(rgbToHex({ r: pixel[0], g: pixel[1], b: pixel[2] }));
      }

      onExtractColors(extractedHexes);

      setStartPoint(null);
      setHoverPoint(null);
    }
  };

  // 見た目のCSSグラデーション
  const gradientStyles = selectedIndices.length === 2
    ? {
        background: `linear-gradient(to right, ${palette[selectedIndices[0]]} 0%, ${palette[selectedIndices[0]]} 10%, ${palette[selectedIndices[1]]} 90%, ${palette[selectedIndices[1]]} 100%)`
      }
    // 新規：3色のCSSグラデーション
    : selectedIndices.length === 3
    ? {
        background: `linear-gradient(to right, ${palette[selectedIndices[0]]} 0%, ${palette[selectedIndices[0]]} 10%, ${palette[selectedIndices[1]]} 45%, ${palette[selectedIndices[1]]} 55%, ${palette[selectedIndices[2]]} 90%, ${palette[selectedIndices[2]]} 100%)`
      }
    : selectedIndices.length === 4
    ? {
        backgroundColor: palette[selectedIndices[0]],
        backgroundImage: `
          radial-gradient(circle at 0% 0%, ${palette[selectedIndices[0]]} 0%, ${palette[selectedIndices[0]]} 15%, ${palette[selectedIndices[0]]}00 80%),
          radial-gradient(circle at 100% 0%, ${palette[selectedIndices[1]]} 0%, ${palette[selectedIndices[1]]} 15%, ${palette[selectedIndices[1]]}00 80%),
          radial-gradient(circle at 0% 100%, ${palette[selectedIndices[2]]} 0%, ${palette[selectedIndices[2]]} 15%, ${palette[selectedIndices[2]]}00 80%),
          radial-gradient(circle at 100% 100%, ${palette[selectedIndices[3]]} 0%, ${palette[selectedIndices[3]]} 15%, ${palette[selectedIndices[3]]}00 80%)
        `
      }
    : {};

  return (
    <div className="mt-12 pt-8 border-t border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          Gradient Generator
        </h2>
        <span className="text-sm font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
          選択中: {selectedIndices.length} / 4
        </span>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 md:p-10 flex flex-col items-center justify-center min-h-[280px] shadow-inner transition-all duration-500 relative">
        {/* 条件に 3 を追加 */}
        {(selectedIndices.length === 2 || selectedIndices.length === 3 || selectedIndices.length === 4) ? (
          <div
            className="w-full h-48 rounded-2xl shadow-md border border-gray-200/50 cursor-crosshair hover:shadow-lg transition-shadow relative overflow-hidden"
            title="クリックして始点を決め、もう一度クリックして終点を決めます"
            onClick={handleGradientClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={gradientStyles}
          >
            {startPoint && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md">
                {hoverPoint && (
                  <>
                    <line
                      x1={startPoint.x} y1={startPoint.y}
                      x2={hoverPoint.x} y2={hoverPoint.y}
                      stroke="white" strokeWidth="2" strokeDasharray="4 4"
                    />
                    {Array.from({length: 8}).map((_, i) => {
                      const t = i / 7;
                      const cx = startPoint.x + (hoverPoint.x - startPoint.x) * t;
                      const cy = startPoint.y + (hoverPoint.y - startPoint.y) * t;
                      return (
                        <circle key={i} cx={cx} cy={cy} r="3" fill="white" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
                      );
                    })}
                  </>
                )}
                <circle cx={startPoint.x} cy={startPoint.y} r="5" fill="#3b82f6" stroke="white" strokeWidth="2" />
              </svg>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <svg className="mx-auto mb-3 opacity-50" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m21 16-5.16-5.16a2 2 0 0 0-2.83 0l-5.16 5.16"></path><path d="m14.41 14.41-2.58-2.58a2 2 0 0 0-2.83 0L2 19"></path><circle cx="8.5" cy="8.5" r="1.5"></circle></svg>
            <p className="font-bold">グラデーションを生成できません</p>
            <p className="text-sm mt-1">上のパレットから色を <b>2つ</b>、<b>3つ</b> または <b>4つ</b> クリックして選択してください。</p>
          </div>
        )}

        {(selectedIndices.length === 2 || selectedIndices.length === 3 || selectedIndices.length === 4) && (
          <div className="text-sm text-gray-500 mt-6 font-bold flex flex-col items-center gap-1">
            <p className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
              グラデーション内をクリックして <b>始点</b> を決め、もう一度クリックして <b>終点</b> を決めてください。
            </p>
            <p className="text-xs text-gray-400 font-normal">指定した直線上から8色を均等に抽出してパレットに展開します。</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 border-dashed">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md font-bold text-gray-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/></svg>
            Extracted Colors (Max 8)
          </h3>
          <button
            onClick={onClearExtracted}
            disabled={extractedPalette.length === 0}
            className={`text-xs font-bold px-3 py-1.5 rounded transition-colors ${extractedPalette.length === 0 ? 'text-gray-300' : 'text-red-500 hover:bg-red-50'}`}
          >
            クリア
          </button>
        </div>

        <div className="flex gap-2 sm:gap-3">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
            const color = extractedPalette[index];
            return (
              <div
                key={index}
                onClick={() => color && onSelectExtractedColor(color)}
                title={color ? "クリックしてメインカラーにセット" : "グラデーションから抽出した色がここに入ります"}
                className={`flex-1 h-16 sm:h-20 rounded-xl shadow-sm border-2 transition-all duration-300 flex items-end justify-center pb-2 ${
                  color ? 'border-transparent cursor-pointer hover:scale-105' : 'border-dashed border-gray-200 bg-gray-50/50'
                }`}
                style={{ backgroundColor: color || 'transparent' }}
              >
                {color && (
                  <span className="bg-white/90 text-gray-800 backdrop-blur-sm px-1 sm:px-2 py-1 rounded text-[10px] sm:text-xs font-mono font-bold uppercase shadow-sm">
                    {color}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}