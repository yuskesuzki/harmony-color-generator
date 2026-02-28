'use client';

import React, { useState, useEffect } from 'react';
import { hexToHsl, hslToRgb, rgbToHex, ColorEvolver } from './utils/colorUtils';
import ColorWheel from './components/ColorWheel';
import GradientPanel from './components/GradientPanel';
import HarmonyPanel from './components/HarmonyPanel';
import SavedPalette from './components/SavedPalette'; // ← 新規追加
import PaletteHistory from './components/PaletteHistory';
import ExtractedHistory from './components/ExtractedHistory';

export default function ColorPicker() {
  // --- UI状態の管理 ---
  const [activeTab, setActiveTab] = useState<'harmony' | 'gradient'>('harmony');

  // --- カラー・パレット状態の管理 ---
  const [hue, setHue] = useState<number>(220);
  const [saturation, setSaturation] = useState<number>(80);
  const [lightness, setLightness] = useState<number>(50);

  const [hexInput, setHexInput] = useState<string>('#195cff');
  const [palette, setPalette] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [extractedPalette, setExtractedPalette] = useState<string[]>([]);

  // --- 履歴状態の管理 ---
  const [paletteHistory, setPaletteHistory] = useState<string[][]>([]);
  const [extractedHistory, setExtractedHistory] = useState<string[][]>([]);

  const baseColorHex = rgbToHex(hslToRgb({ h: hue, s: saturation, l: lightness }));

  useEffect(() => {
    setHexInput(baseColorHex);
  }, [baseColorHex]);

  const loadColorToMain = (hex: string) => {
    const hsl = hexToHsl(hex);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    if (/^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val)) {
      loadColorToMain(val);
    }
  };

  const handleEyedropper = async () => {
    // @ts-ignore
    if (!window.EyeDropper) return alert('お使いのブラウザはスポイト機能に対応していません。');
    try {
      // @ts-ignore
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      loadColorToMain(result.sRGBHex);
    } catch (e) {
      console.log('Eyedropper cancelled');
    }
  };

  const handleSaveToPalette = () => {
    setPalette(prev => [baseColorHex, ...prev].slice(0, 5));
    setSelectedIndices([]);
  };

  const handleClearPalette = () => {
    setPalette([]);
    setSelectedIndices([]);
  };

  const handlePaletteSlotClick = (index: number) => {
    const savedColor = palette[index];
    if (savedColor) {
      setSelectedIndices(prev => {
        if (prev.includes(index)) return prev.filter(i => i !== index);
        if (prev.length >= 4) return prev;
        return [...prev, index];
      });
    } else {
      setPalette(prev => {
        const newPalette = [...prev];
        newPalette[index] = baseColorHex;
        return newPalette;
      });
    }
  };

  const handleRemoveCellFromPalette = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setPalette(prev => {
      const newPalette = [...prev];
      newPalette[index] = '';
      return newPalette;
    });
    setSelectedIndices(prev => prev.filter(i => i !== index));
  };

  const handleHarmonyUpdate = (newPalette: string[]) => {
    setPalette(newPalette);
    setSelectedIndices([]);
  };

  const handleGenerateGA = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const evolver = new ColorEvolver({ h: hue, s: saturation, l: lightness });
      const bestPalette = evolver.evolve(100);
      const genHexes = bestPalette.colors.map(c => rgbToHex(hslToRgb(c)));
      setPalette([baseColorHex, ...genHexes]);
      setSelectedIndices([]);
      setIsGenerating(false);
    }, 50);
  };

  // --- 履歴操作 ---
  const handleSaveToHistory = () => {
    if (palette.some(c => c)) setPaletteHistory(prev => [[...palette], ...prev]);
  };
  const handleLoadFromHistory = (historyPalette: string[]) => {
    setPalette([...historyPalette]);
    setSelectedIndices([]);
  };
  const handleDeleteHistory = (index: number) => setPaletteHistory(prev => prev.filter((_, i) => i !== index));
  const handleClearHistory = () => setPaletteHistory([]);

  const handleSaveToExtractedHistory = () => {
    if (extractedPalette.some(c => c)) setExtractedHistory(prev => [[...extractedPalette], ...prev]);
  };
  const handleLoadFromExtractedHistory = (historyPalette: string[]) => setExtractedPalette([...historyPalette]);
  const handleDeleteExtractedHistory = (index: number) => setExtractedHistory(prev => prev.filter((_, i) => i !== index));
  const handleClearExtractedHistory = () => setExtractedHistory([]);


  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans flex flex-col items-center justify-center pb-20">
      <div className="w-full max-w-4xl bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100">

        <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center tracking-wide">🎨 Harmony Color Generator</h1>

        {/* --- タブ・ナビゲーション --- */}
        <div className="flex bg-gray-100 p-1.5 rounded-xl mb-10">
          <button
            onClick={() => setActiveTab('harmony')}
            className={`flex-1 py-3 text-sm sm:text-base font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'harmony'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
            1. カラー＆調和
          </button>
          <button
            onClick={() => setActiveTab('gradient')}
            className={`flex-1 py-3 text-sm sm:text-base font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'gradient'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            2. グラデーション＆抽出
          </button>
        </div>

        {/* --- タブ1: カラー＆調和コンテンツ --- */}
        {activeTab === 'harmony' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-stretch">

              <ColorWheel
                hue={hue} saturation={saturation} lightness={lightness} baseColorHex={baseColorHex}
                setHue={setHue} setSaturation={setSaturation} setLightness={setLightness}
              />

              <div className="flex-1 flex flex-col justify-between gap-8 w-full">
                <div className="flex flex-col sm:flex-row items-center gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-24 h-24 rounded-xl shadow-md border-4 border-white flex-shrink-0 transition-colors duration-100" style={{ backgroundColor: baseColorHex }}></div>
                  <div className="flex-1 w-full flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-gray-500 font-bold mb-2 uppercase tracking-wider">Selected Color</p>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text" value={hexInput} onChange={handleHexInputChange}
                          className="w-full bg-white border border-gray-300 text-gray-800 font-mono font-bold text-xl px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-widest"
                          maxLength={7}
                        />
                        <button onClick={handleEyedropper} className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center justify-center flex-shrink-0" title="画面から色を取得">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/></svg>
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 font-mono mb-4">HSL({hue}, {saturation}%, {lightness}%)</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between gap-8 w-full">
                  <button onClick={handleSaveToPalette} className="w-full bg-green-500 hover:bg-gray-300 text-gray-800 font-bold py-2.5 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2">
                    単色をパレットの左端に保存
                  </button>
                </div>

                <HarmonyPanel
                  hue={hue}
                  saturation={saturation}
                  lightness={lightness}
                  onUpdatePalette={handleHarmonyUpdate}
                />
              </div>

            </div>


            {/* コンポーネント化した SavedPalette */}
            <SavedPalette
              palette={palette}
              selectedIndices={selectedIndices}
              isGenerating={isGenerating}
              onGenerateGA={handleGenerateGA}
              onClearPalette={handleClearPalette}
              onSlotClick={handlePaletteSlotClick}
              onRemoveCell={handleRemoveCellFromPalette}
            />

            <PaletteHistory
              currentPalette={palette}
              history={paletteHistory}
              onSaveToHistory={handleSaveToHistory}
              onLoadFromHistory={handleLoadFromHistory}
              onDeleteHistory={handleDeleteHistory}
              onClearHistory={handleClearHistory}
            />
          </div>
        )}

        {/* --- タブ2: グラデーション＆抽出コンテンツ --- */}
        {activeTab === 'gradient' && (
          <div className="animate-in fade-in duration-500">

            <div className="mb-8">
              <p className="text-sm text-gray-600 font-bold flex items-center gap-2 bg-blue-50 border border-blue-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                Step 1: 下のパレットから色を2つまたは4つクリックして選択します。
              </p>

              {/* コンポーネント化した SavedPalette */}
              <SavedPalette
                palette={palette}
                selectedIndices={selectedIndices}
                isGenerating={isGenerating}
                onGenerateGA={handleGenerateGA}
                onClearPalette={handleClearPalette}
                onSlotClick={handlePaletteSlotClick}
                onRemoveCell={handleRemoveCellFromPalette}
              />
            </div>

            <GradientPanel
              palette={palette}
              selectedIndices={selectedIndices}
              extractedPalette={extractedPalette}
              onExtractColors={(hexes) => setExtractedPalette(hexes)}
              onClearExtracted={() => setExtractedPalette([])}
              onSelectExtractedColor={loadColorToMain}
            />

            <ExtractedHistory
              currentPalette={extractedPalette}
              history={extractedHistory}
              onSaveToHistory={handleSaveToExtractedHistory}
              onLoadFromHistory={handleLoadFromExtractedHistory}
              onDeleteHistory={handleDeleteExtractedHistory}
              onClearHistory={handleClearExtractedHistory}
            />
          </div>
        )}

      </div>
    </div>
  );
}
