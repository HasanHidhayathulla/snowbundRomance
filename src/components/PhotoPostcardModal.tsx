/**
 * Solstice Postcard Photo Mode Modal
 * Allows players to review snapshot captures, apply romantic vintage filters,
 * customize captions and Solstice holiday stamps, and download souvenir postcards.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Check,
  Download,
  Filter,
  Heart,
  RotateCcw,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';

interface PhotoPostcardModalProps {
  photoDataUrl: string | null;
  onClose: () => void;
  onPostcardSaved?: () => void;
}

type PhotoFilter = 'normal' | 'rose_gold' | 'golden_hearth' | 'aurora_glow' | 'vintage_monochrome';

export const PhotoPostcardModal: React.FC<PhotoPostcardModalProps> = ({
  photoDataUrl,
  onClose,
  onPostcardSaved,
}) => {
  const [filter, setFilter] = useState<PhotoFilter>('rose_gold');
  const [stamp, setStamp] = useState<string>('Solstice Greetings · Valentine Valley');
  const [caption, setCaption] = useState<string>('“Love is warmer than the winter snow.”');
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const STAMP_PRESETS = [
    'Solstice Greetings · Valentine Valley',
    'Snowbound Hearts · First Snow',
    'Warmest Winter Wishes · With Love',
    'Winter Solstice Festival · Reunited',
  ];

  const CAPTION_PRESETS = [
    '“Love is warmer than the winter snow.”',
    '“Our tracks meet beneath the solstice stars.”',
    '“No blizzard can freeze the heart that loves.”',
    '“Together under the alpine lanterns.”',
  ];

  // Render combined postcard onto 2D canvas with border, stamp, and styling
  useEffect(() => {
    if (!photoDataUrl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = photoDataUrl;
    img.onload = () => {
      // Set canvas dimensions
      const width = 800;
      const height = 520;
      canvas.width = width;
      canvas.height = height;

      // Draw cozy parchment background border
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Inner photo rectangle with padding
      const padX = 24;
      const padY = 24;
      const photoW = width - padX * 2;
      const photoH = height - padY * 2 - 64; // space for postcard bottom caption

      ctx.save();
      // Apply filters via canvas filter
      switch (filter) {
        case 'rose_gold':
          ctx.filter = 'contrast(1.08) saturate(1.3) sepia(0.2) hue-rotate(-10deg)';
          break;
        case 'golden_hearth':
          ctx.filter = 'contrast(1.1) brightness(1.05) saturate(1.4) sepia(0.4)';
          break;
        case 'aurora_glow':
          ctx.filter = 'contrast(1.15) saturate(1.5) hue-rotate(45deg)';
          break;
        case 'vintage_monochrome':
          ctx.filter = 'grayscale(1) contrast(1.2) brightness(0.95)';
          break;
        default:
          ctx.filter = 'none';
      }

      ctx.drawImage(img, padX, padY, photoW, photoH);
      ctx.restore();

      // Postcard photographic border inset
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(padX, padY, photoW, photoH);

      // Top-Right Holiday Stamp
      ctx.save();
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.roundRect(width - 240, padY + 12, 216, 32, 6);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 2]);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stamp.toUpperCase(), width - 132, padY + 32);
      ctx.restore();

      // Bottom Area: Caption & Date
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'italic 16px Georgia, serif';
      ctx.textAlign = 'left';
      ctx.fillText(caption, padX + 8, height - 36);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 11px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('VALENTINE VALLEY POSTAL SERVICE · SOLSTICE EDITION', width - padX - 8, height - 36);
    };
  }, [photoDataUrl, filter, stamp, caption]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `snowbound-solstice-postcard-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      setIsDownloaded(true);
      if (onPostcardSaved) {
        onPostcardSaved();
      }
    } catch (e) {
      console.error('Failed to export postcard:', e);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/85 z-50 select-none">
      <div className="w-full max-w-4xl bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-800/60 text-rose-300">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Solstice Postcard Photo Studio
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/60 font-semibold">
                  Photo Mode
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize your winter village memories, choose nostalgic filters & stamps, and save as souvenir.
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

        {/* Studio Content */}
        <div className="flex-1 overflow-y-auto py-4 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Postcard Canvas Preview */}
          <div className="lg:col-span-2 flex flex-col items-center">
            <div className="w-full rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-950 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="w-full h-auto max-h-[50vh] object-contain rounded-lg"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Full 800x520 high-definition postal keepsake with holiday wax seal & caption</span>
            </p>
          </div>

          {/* Customization Controls */}
          <div className="flex flex-col gap-4 text-xs">
            {/* 1. Photo Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-rose-400" />
                <span>Atmospheric Lens Filter</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'rose_gold', label: 'Rose Blush' },
                  { id: 'golden_hearth', label: 'Golden Hearth' },
                  { id: 'aurora_glow', label: 'Aurora Emerald' },
                  { id: 'vintage_monochrome', label: 'Vintage B&W' },
                  { id: 'normal', label: 'Natural Crystal' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id as PhotoFilter)}
                    className={`px-2.5 py-1.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      filter === f.id
                        ? 'border-rose-500 bg-rose-950/60 text-white font-semibold'
                        : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Solstice Stamp */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>Holiday Stamp</span>
              </label>
              <select
                value={stamp}
                onChange={(e) => setStamp(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                {STAMP_PRESETS.map((s, idx) => (
                  <option key={idx} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Romantic Caption */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Romantic Caption</span>
              </label>
              <select
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-rose-500 cursor-pointer mb-1.5"
              >
                {CAPTION_PRESETS.map((c, idx) => (
                  <option key={idx} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Or type a custom romantic note..."
                maxLength={60}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
          >
            Back to Plowing (Esc)
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-rose-950/50 cursor-pointer transition-all active:scale-95"
          >
            {isDownloaded ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Postcard Saved! Download Again?</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Save Postcard Souvenir (.PNG)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
