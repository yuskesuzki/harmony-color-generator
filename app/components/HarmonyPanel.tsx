/**
 * HarmonyPanelコンポーネントは、選択された色を基に論理的な色彩調和を生成し、ユーザーがワンクリックでパレットに展開できるインタラクティブなパネルを提供します。
 */

// クライアントで動きます。
'use client';

// Reactから必要なフックをインポート
import React from 'react';
// 色変換ユーティリティ関数をインポート
import { hslToRgb, rgbToHex } from '../utils/colorUtils';

// コンポーネントで使うプロパティの型定義
type HarmonyPanelProps = {
  hue: number;
  saturation: number;
  lightness: number;
  onUpdatePalette: (newPalette: string[]) => void;
};

export default function HarmonyPanel({ hue, saturation, lightness, onUpdatePalette }: HarmonyPanelProps) {

  // 幾何学的な色彩調和を生成
  const generateGeometricHarmony = (colorCount: number, mode: 'equidistant' | 'centered', spreadAngle?: number) => {
    const newPalette: string[] = [];
    if (mode === 'equidistant') {
      const stepAngle = 360 / colorCount;
      for (let i = 0; i < colorCount; i++) {
        const h = (hue + stepAngle * i + 360) % 360;
        newPalette.push(rgbToHex(hslToRgb({ h, s: saturation, l: lightness })));
      }
    } else if (mode === 'centered' && spreadAngle) {
      const stepAngle = spreadAngle / (colorCount - 1);
      const midIndex = Math.floor(colorCount / 2);
      for (let i = 0; i < colorCount; i++) {
        const h = (hue + (i - midIndex) * stepAngle + 360) % 360;
        newPalette.push(rgbToHex(hslToRgb({ h, s: saturation, l: lightness })));
      }
    }
    onUpdatePalette(newPalette);
  };

  // 明度・彩度のパラメータ調和を生成
  const generateParametricHarmony = (type: 'lightness' | 'saturation') => {
    const newPalette: string[] = [];
    const offsets = [-20, 0, 20];
    offsets.forEach(offset => {
      let h = hue, s = saturation, l = lightness;
      if (type === 'lightness') l = Math.max(0, Math.min(100, lightness + offset));
      else if (type === 'saturation') s = Math.max(0, Math.min(100, saturation + offset));
      newPalette.push(rgbToHex(hslToRgb({ h, s, l })));
    });
    onUpdatePalette(newPalette);
  };

  return (
    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 shadow-sm">
      <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">論理的な色彩調和をパレットに展開</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button onClick={() => generateGeometricHarmony(3, 'centered', 30)} className="bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 font-bold py-2 px-2 rounded-lg shadow-sm text-xs">同一色相 (3色/±15°)</button>
        <button onClick={() => generateGeometricHarmony(3, 'centered', 60)} className="bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 font-bold py-2 px-2 rounded-lg shadow-sm text-xs">隣接色相 (3色/±30°)</button>
        <button onClick={() => generateGeometricHarmony(2, 'equidistant')} className="bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 font-bold py-2 px-2 rounded-lg shadow-sm text-xs">ダイアード (2色)</button>
        <button onClick={() => generateGeometricHarmony(3, 'equidistant')} className="bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 font-bold py-2 px-2 rounded-lg shadow-sm text-xs">トライアド (3色)</button>
        <button onClick={() => generateGeometricHarmony(4, 'equidistant')} className="bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 font-bold py-2 px-2 rounded-lg shadow-sm text-xs">テトラード (4色)</button>
        <button onClick={() => generateGeometricHarmony(5, 'equidistant')} className="bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 font-bold py-2 px-2 rounded-lg shadow-sm text-xs">ペンタード (5色)</button>
        <button onClick={() => generateParametricHarmony('lightness')} className="bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 font-bold py-2 px-2 rounded-lg shadow-sm text-xs">明度変化 (3色/±20%)</button>
        <button onClick={() => generateParametricHarmony('saturation')} className="bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 font-bold py-2 px-2 rounded-lg shadow-sm text-xs">彩度変化 (3色/±20%)</button>
      </div>
    </div>
  );
}
