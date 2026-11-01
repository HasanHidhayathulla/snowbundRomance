/**
 * Solstice Postcard Photo Engine Subsystem
 * Captures WebGL canvas renders, applies romantic visual filters,
 * and composites vintage Solstice postal stamps, greetings, and borders.
 */

export interface PostcardFilter {
  id: string;
  name: string;
  colorGrade: string; // CSS filter string
  borderAccent: string;
}

export const POSTCARD_FILTERS: PostcardFilter[] = [
  {
    id: 'hearth',
    name: 'Warm Solstice Hearth',
    colorGrade: 'sepia(0.2) saturate(1.3) contrast(1.05) brightness(1.03)',
    borderAccent: '#f43f5e',
  },
  {
    id: 'aurora',
    name: 'Northern Aurora Blush',
    colorGrade: 'hue-rotate(20deg) saturate(1.4) contrast(1.1) brightness(1.05)',
    borderAccent: '#ec4899',
  },
  {
    id: 'frost',
    name: 'Alpine Powder Frost',
    colorGrade: 'hue-rotate(-15deg) contrast(1.15) brightness(1.08) saturate(1.1)',
    borderAccent: '#38bdf8',
  },
  {
    id: 'midnight',
    name: 'Midnight Solstice',
    colorGrade: 'contrast(1.2) brightness(0.95) saturate(1.25)',
    borderAccent: '#fbbf24',
  },
];

export interface PostcardStamp {
  id: string;
  title: string;
  sub: string;
  symbol: string;
}

export const POSTCARD_STAMPS: PostcardStamp[] = [
  { id: 'stamp-1', title: 'VALENTINE VALLEY', sub: 'AIR MAIL · SOLSTICE', symbol: '❤' },
  { id: 'stamp-2', title: 'HEARTPLOW EXPEDITION', sub: 'FIRST POWDER CLEAR', symbol: '❄' },
  { id: 'stamp-3', title: 'GRAND SOLSTICE REUNION', sub: 'TOWN SQUARE POST', symbol: '★' },
  { id: 'stamp-4', title: 'WITH ALL MY WARMTH', sub: 'SPECIAL DELIVERY', symbol: '✉' },
];

export const POSTCARD_CAPTIONS: string[] = [
  '“No blizzard is cold enough to freeze what I feel for you.”',
  '“Clear roads, warm hearths, and everlasting winter love.”',
  '“Greetings from Valentine Valley, where the lanterns never dim.”',
  '“Under the solstice stars, hand in hand beside the plow.”',
  '“May your winter days be cozy and your heart forever warm.”',
];

export interface CompositePostcardOptions {
  sourceCanvas: HTMLCanvasElement;
  filterId: string;
  stampId: string;
  caption: string;
  clearedPercent: number;
}

/**
 * Composite a high-resolution postcard image from WebGL canvas
 */
export async function generatePostcardDataUrl(options: CompositePostcardOptions): Promise<string> {
  const { sourceCanvas, filterId, stampId, caption, clearedPercent } = options;
  const filter = POSTCARD_FILTERS.find((f) => f.id === filterId) || POSTCARD_FILTERS[0];
  const stamp = POSTCARD_STAMPS.find((s) => s.id === stampId) || POSTCARD_STAMPS[0];

  // Target high-definition postcard dimensions
  const width = 1200;
  const height = 800;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Vintage Textured Cardboard Border
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  // Outer ornate border frame
  ctx.strokeStyle = filter.borderAccent;
  ctx.lineWidth = 4;
  ctx.strokeRect(18, 18, width - 36, height - 36);

  ctx.strokeStyle = '#ffffff25';
  ctx.lineWidth = 1;
  ctx.strokeRect(26, 26, width - 52, height - 52);

  // 2. Render WebGL scene with filter into the center picture frame
  const photoMarginX = 36;
  const photoMarginY = 36;
  const photoWidth = width - photoMarginX * 2;
  const photoHeight = height - photoMarginY * 2 - 120; // reserve bottom banner for caption

  ctx.save();
  ctx.filter = filter.colorGrade;
  ctx.drawImage(sourceCanvas, photoMarginX, photoMarginY, photoWidth, photoHeight);
  ctx.restore();

  // Thin inner shadow around photo
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(photoMarginX, photoMarginY, photoWidth, photoHeight);

  // 3. Solstice Postal Stamp in Top-Right
  const stampWidth = 140;
  const stampHeight = 110;
  const stampX = photoMarginX + photoWidth - stampWidth - 16;
  const stampY = photoMarginY + 16;

  // Stamp paper background
  ctx.save();
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(stampX, stampY, stampWidth, stampHeight);

  // Perforated stamp border
  ctx.strokeStyle = '#991b1b';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 4]);
  ctx.strokeRect(stampX + 4, stampY + 4, stampWidth - 8, stampHeight - 8);
  ctx.setLineDash([]);

  // Stamp typography & symbol
  ctx.fillStyle = '#7f1d1d';
  ctx.font = 'bold 26px serif';
  ctx.textAlign = 'center';
  ctx.fillText(stamp.symbol, stampX + stampWidth / 2, stampY + 44);

  ctx.font = 'bold 9px sans-serif';
  ctx.fillText(stamp.title, stampX + stampWidth / 2, stampY + 68);

  ctx.font = 'italic 8px sans-serif';
  ctx.fillStyle = '#991b1b';
  ctx.fillText(stamp.sub, stampX + stampWidth / 2, stampY + 84);

  ctx.font = 'bold 8px monospace';
  ctx.fillText(`${clearedPercent}% CLEARED`, stampX + stampWidth / 2, stampY + 98);
  ctx.restore();

  // 4. Postal Postmark Cancellation Mark
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(stampX + 10, stampY + stampHeight / 2, 34, 0, Math.PI * 2);
  ctx.stroke();

  // Wavy cancellation lines
  for (let i = -12; i <= 12; i += 8) {
    ctx.beginPath();
    ctx.moveTo(stampX - 50, stampY + stampHeight / 2 + i);
    ctx.bezierCurveTo(
      stampX - 30, stampY + stampHeight / 2 + i - 6,
      stampX - 10, stampY + stampHeight / 2 + i + 6,
      stampX + 15, stampY + stampHeight / 2 + i
    );
    ctx.stroke();
  }
  ctx.restore();

  // 5. Bottom Postcard Note Section
  const bottomY = photoMarginY + photoHeight + 14;

  // Left side: Romantic handwritten cursive quote
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'italic 600 20px "Georgia", serif';
  ctx.textAlign = 'left';
  ctx.fillText(caption, photoMarginX + 16, bottomY + 42);

  // Subtitle / Location
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px sans-serif';
  ctx.fillText('Snowbound Hearts: Winter Solstice · Valentine Valley, Alpine Pass', photoMarginX + 16, bottomY + 70);

  // Right side: Official Solstice Postal Crest
  ctx.textAlign = 'right';
  ctx.fillStyle = '#fb7185';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('SOLSTICE POSTAL SERVICE', width - photoMarginX - 16, bottomY + 38);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '11px monospace';
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  ctx.fillText(`DISPATCHED: ${dateStr.toUpperCase()} · ${clearedPercent}% ROADS OPEN`, width - photoMarginX - 16, bottomY + 58);

  ctx.fillStyle = '#64748b';
  ctx.font = '10px monospace';
  ctx.fillText('SERIES 1 · POSTAL ARCHIVE', width - photoMarginX - 16, bottomY + 74);

  return canvas.toDataURL('image/png');
}
