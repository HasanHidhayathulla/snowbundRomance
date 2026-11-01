/**
 * Solstice Photo Mode Modal
 * Interactive snapshot framing, romantic color grade presets,
 * Solstice postal stamps, handwritten quote choices, and instant export.
 */

import React, { useState } from 'react';
import { Camera, Check, Download, Heart, RefreshCw, Sparkles, X } from 'lucide-react';
import {
  POSTCARD_CAPTIONS,
  POSTCARD_FILTERS,
  POSTCARD_STAMPS,
} from '../game/photoCapture';
import { savePostcardToStorage, type SavedPostcard } from '../game/storage';

interface PhotoModeModalProps {
  snowClearedPercent: number;
  onCapture: (filterId: string, stampId: string, caption: string) => Promise<string>;
  onClose: () => void;
  onOpenScrapbook: () => void;
}

export const PhotoModeModal: React.FC<PhotoModeModalProps> = ({
  snowClearedPercent,
  onCapture,
  onClose,
  onOpenScrapbook,
}) => {
  const [selectedFilter, setSelectedFilter] = useState(POSTCARD_FILTERS[0].id);
  const [selectedStamp, setSelectedStamp] = useState(POSTCARD_STAMPS[0].id);
  const [captionIndex, setCaptionIndex] = useState(0);
  const [customCaption, setCustomCaption] = useState(POSTCARD_CAPTIONS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedPostcard, setCapturedPostcard] = useState<SavedPostcard | null>(null);

  const handleCycleCaption = () => {
    const nextIdx = (captionIndex + 1) % POSTCARD_CAPTIONS.length;
    setCaptionIndex(nextIdx);
    setCustomCaption(POSTCARD_CAPTIONS[nextIdx]);
  };

  const handleTakeSnapshot = async () => {
    setIsProcessing(true);
    try {
      const dataUrl = await onCapture(selectedFilter, selectedStamp, customCaption);
      const newPostcard: SavedPostcard = {
        id: `postcard-${Date.now()}`,
        timestamp: Date.now(),
        imageDataUrl: dataUrl,
        caption: customCaption,
        filterName: POSTCARD_FILTERS.find((f) => f.id === selectedFilter)?.name || '',
        stampName: POSTCARD_STAMPS.find((s) => s.id === selectedStamp)?.title || '',
        clearedPercent: snowClearedPercent,
      };

      savePostcardToStorage(newPostcard);
      setCapturedPostcard(newPostcard);
    } catch (err) {
      console.error('Failed to capture postcard:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!capturedPostcard) return;
    const a = document.createElement('a');
    a.href = capturedPostcard.imageDataUrl;
    a.download = `snowbound-solstice-postcard-${Date.now()}.png`;
    a.click();
  };

  const currentFilterObj = POSTCARD_FILTERS.find((f) => f.id === selectedFilter);

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/85 z-40 select-none">
      <div className="w-full max-w-4xl bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-800/60 text-rose-300">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight text-white">Solstice Postcard Camera</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/60 font-semibold">
                  Photo Mode
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Frame your snowplowed village, apply warm filters, and save holiday postcards to your album.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col md:flex-row gap-6">
          {/* Left Preview Pane */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {capturedPostcard ? (
              <div className="flex flex-col items-center gap-3 w-full">
                <div className="relative rounded-xl overflow-hidden border-2 border-rose-500/60 shadow-2xl bg-black max-h-[50vh] flex items-center justify-center">
                  <img
                    src={capturedPostcard.imageDataUrl}
                    alt="Captured Solstice Postcard"
                    className="max-h-[48vh] w-auto object-contain rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Postcard (PNG)</span>
                  </button>

                  <button
                    onClick={() => setCapturedPostcard(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Take Another</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                {/* Viewfinder frame overlay */}
                <div
                  className="relative w-full aspect-[16/10] max-h-[46vh] rounded-2xl border-2 border-dashed border-rose-500/50 bg-slate-950/60 flex items-center justify-center overflow-hidden p-6 text-center"
                  style={{
                    boxShadow: `0 0 24px ${currentFilterObj?.borderAccent}33`,
                  }}
                >
                  {/* Corner marks */}
                  <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-rose-400" />
                  <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-rose-400" />
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-rose-400" />
                  <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-rose-400" />

                  <div className="flex flex-col items-center gap-2 max-w-sm pointer-events-none">
                    <Camera className="w-10 h-10 text-rose-400/80 animate-pulse" />
                    <p className="text-sm font-semibold text-slate-200">
                      Live Scene Viewfinder
                    </p>
                    <p className="text-xs text-slate-400 italic">
                      "{customCaption}"
                    </p>
                    <span className="text-[11px] font-mono text-cyan-300 mt-1">
                      {snowClearedPercent}% Roads Plowed
                    </span>
                  </div>
                </div>

                <button
                  disabled={isProcessing}
                  onClick={handleTakeSnapshot}
                  className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-sm shadow-lg shadow-rose-950/60 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-amber-200" />
                  <span>{isProcessing ? 'Developing Postcard...' : 'Snap Solstice Postcard'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Customization Controls */}
          <div className="w-full md:w-80 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-slate-800 md:pl-6">
            {/* Filter Presets */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Romantic Color Grade
              </label>
              <div className="grid grid-cols-2 gap-2">
                {POSTCARD_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilter(f.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                      selectedFilter === f.id
                        ? 'bg-rose-950/60 border-rose-500 text-white shadow-sm'
                        : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: f.borderAccent }}
                      />
                      <span className="font-semibold text-white">{f.name.split(' ')[0]}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">{f.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Postal Stamps */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Solstice Postal Stamp
              </label>
              <div className="grid grid-cols-2 gap-2">
                {POSTCARD_STAMPS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStamp(s.id)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedStamp === s.id
                        ? 'bg-rose-950/60 border-rose-500 text-white shadow-sm'
                        : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-300">{s.symbol}</span>
                      <span className="text-[10px] font-semibold text-slate-200 truncate ml-1">{s.title.split(' ')[0]}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 block truncate mt-0.5">{s.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quote Caption */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Postcard Inscription
                </label>
                <button
                  onClick={handleCycleCaption}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Randomize</span>
                </button>
              </div>

              <textarea
                rows={3}
                value={customCaption}
                onChange={(e) => setCustomCaption(e.target.value)}
                maxLength={90}
                className="w-full p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-rose-200 italic focus:outline-none focus:border-rose-500 resize-none"
              />
              <span className="text-[10px] text-slate-500 text-right">
                {customCaption.length}/90 characters
              </span>
            </div>

            {/* Quick Gallery Link */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  onClose();
                  onOpenScrapbook();
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-rose-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>View Solstice Photo Album</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            Return to Plowing (Esc / P)
          </button>
        </div>
      </div>
    </div>
  );
};
