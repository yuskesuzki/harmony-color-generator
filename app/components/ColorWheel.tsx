'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

type ColorWheelProps = {
  hue: number;
  saturation: number;
  lightness: number;
  baseColorHex: string;
  setHue: (h: number) => void;
  setSaturation: (s: number) => void;
  setLightness: (l: number) => void;
};

export default function ColorWheel({ hue, saturation, lightness, baseColorHex, setHue, setSaturation, setLightness }: ColorWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateHueFromEvent = useCallback((e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    setHue(Math.round(angle));
  }, [setHue]);

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    calculateHueFromEvent(e);
  };

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (isDragging) calculateHueFromEvent(e);
    };
    const handlePointerUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove, { passive: false });
      window.addEventListener('touchend', handlePointerUp);
    }
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, calculateHueFromEvent]);

  const pointerAngle = (hue - 90) * (Math.PI / 180);
  const wheelRadius = 92;
  const dynamicWheelGradient = `conic-gradient(from 0deg, hsl(0, ${saturation}%, ${lightness}%), hsl(60, ${saturation}%, ${lightness}%), hsl(120, ${saturation}%, ${lightness}%), hsl(180, ${saturation}%, ${lightness}%), hsl(240, ${saturation}%, ${lightness}%), hsl(300, ${saturation}%, ${lightness}%), hsl(360, ${saturation}%, ${lightness}%))`;

  return (
    <div className="flex flex-col items-center justify-start bg-white p-6 rounded-2xl border border-gray-100 shadow-sm w-full lg:w-auto">
      <h2 className="text-sm font-bold text-gray-500 mb-6 uppercase tracking-widest">Base Color</h2>

      {/* カラーホイール */}
      <div
        ref={wheelRef} onMouseDown={handlePointerDown} onTouchStart={handlePointerDown}
        className="relative w-64 h-64 rounded-full shadow-inner cursor-crosshair touch-none transition-colors duration-100"
        style={{ background: dynamicWheelGradient }}
      >
        <div className="absolute inset-6 bg-white rounded-full shadow-inner pointer-events-none"></div>
        <div
          className="absolute w-6 h-6 border-[3px] border-white rounded-full shadow-md pointer-events-none transition-transform"
          style={{
            backgroundColor: baseColorHex,
            left: `calc(50% + ${Math.cos(pointerAngle) * wheelRadius}px - 12px)`,
            top: `calc(50% + ${Math.sin(pointerAngle) * wheelRadius}px - 12px)`,
            boxShadow: '0 0 4px rgba(0,0,0,0.3)'
          }}
        ></div>
      </div>

      {/* クイック選択ボタン */}
      <div className="mt-8 flex gap-3">
        {[
          { label: 'White', l: 100 },
          { label: 'Black', l: 0 },
        ].map((item) => (
          <button
            key={item.l}
            onClick={() => { setSaturation(0); setLightness(item.l); }}
            className={`w-8 h-8 rounded-full shadow-sm border-2 transition-transform hover:scale-110 ${lightness === item.l && saturation === 0 ? 'border-blue-500' : 'border-gray-200'}`}
            style={{ backgroundColor: `hsl(0, 0%, ${item.l}%)` }}
            title={item.label}
          />
        ))}
      </div>

      {/* 新規：統合されたスライダー群 */}
      <div className="mt-8 w-full max-w-[16rem] space-y-6">
        <div>
          <label className="flex justify-between text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">
            <span>彩度</span><span className="text-gray-500 font-mono">{saturation}%</span>
          </label>
          <input
            type="range" min="0" max="100" value={saturation}
            onChange={(e) => setSaturation(parseInt(e.target.value))}
            onDoubleClick={() => setSaturation(0)}
            className="w-full h-4 rounded-lg appearance-none cursor-pointer shadow-inner"
            style={{ background: `linear-gradient(to right, hsl(${hue}, 0%, ${lightness}%), hsl(${hue}, 100%, ${lightness}%))` }}
          />
        </div>
        <div>
          <label className="flex justify-between text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">
            <span>明度</span><span className="text-gray-500 font-mono">{lightness}%</span>
          </label>
          <input
            type="range" min="0" max="100" value={lightness}
            onChange={(e) => setLightness(parseInt(e.target.value))}
            onDoubleClick={() => setLightness(50)}
            className="w-full h-4 rounded-lg appearance-none cursor-pointer shadow-inner"
            style={{ background: `linear-gradient(to right, #000, hsl(${hue}, ${saturation}%, 50%), #fff)` }}
          />
        </div>
      </div>

    </div>
  );
}