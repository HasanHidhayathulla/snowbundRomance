/**
 * Settings and Preferences Modal for Snowbound Hearts
 * Allows players to tune Master, Music, and SFX volumes, toggle radar,
 * inspect control mappings, and reset game progress.
 */

import React, { useState, useRef } from 'react';
import {
  Compass,
  Download,
  FileText,
  Headphones,
  Keyboard,
  RotateCcw,
  Sliders,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import {
  exportSaveDataJSON,
  importSaveDataJSON,
  type GameSettings,
} from '../game/storage';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onClose,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [activeTab, setActiveTab] = useState<'audio' | 'controls' | 'backup'>('audio');
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportData = () => {
    const json = exportSaveDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snowbound-hearts-save-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupMessage('Save data exported successfully!');
    setTimeout(() => setBackupMessage(null), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importSaveDataJSON(content);
      if (success) {
        setBackupMessage('Save imported! Reloading game...');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setBackupMessage('Error: Invalid save file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/80 z-40 select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col gap-5 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-rose-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Audio & Village Preferences</h3>
              <p className="text-xs text-slate-400">Customize soundscape and display settings</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'audio' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Audio & HUD</span>
          </button>

          <button
            onClick={() => setActiveTab('controls')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'controls' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Keybinds</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'backup' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save Backup</span>
          </button>
        </div>

        {/* Tab 1: Audio Volume & Display Controls */}
        {activeTab === 'audio' && (
          <div className="flex flex-col gap-4 overflow-y-auto">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Audio Synthesizer Bus
            </h4>

            {/* Master Volume */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-200">
                  <Volume2 className="w-4 h-4 text-rose-400" />
                  Master Volume
                </span>
                <span className="font-mono text-slate-400">
                  {Math.round(settings.masterVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={(e) => onUpdateSettings({ masterVolume: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            {/* Ambient Music Volume */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-200">
                  <Headphones className="w-4 h-4 text-purple-400" />
                  Ambient Solstice Music
                </span>
                <span className="font-mono text-slate-400">
                  {Math.round(settings.musicVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => onUpdateSettings({ musicVolume: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Sound FX Volume */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-200">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Snow Plowing & Tractor FX
                </span>
                <span className="font-mono text-slate-400">
                  {Math.round(settings.sfxVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => onUpdateSettings({ sfxVolume: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Display & Radar Toggles */}
            <div className="flex flex-col gap-3 pt-3 border-t border-slate-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Display & Navigation
              </h4>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Village Minimap Radar</div>
                    <div className="text-[11px] text-slate-400">Display situational radar during gameplay</div>
                  </div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ showRadar: !settings.showRadar })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    settings.showRadar ? 'bg-rose-600 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Keybinding & Accessibility Reference */}
        {activeTab === 'controls' && (
          <div className="flex flex-col gap-2.5 overflow-y-auto">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Keyboard Reference & Controls
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50 flex items-center justify-between">
                <span className="text-slate-300">Drive Forward</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-[11px]">W / ↑</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50 flex items-center justify-between">
                <span className="text-slate-300">Reverse</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-[11px]">S / ↓</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50 flex items-center justify-between">
                <span className="text-slate-300">Steer Left</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-[11px]">A / ←</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50 flex items-center justify-between">
                <span className="text-slate-300">Steer Right</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-[11px]">D / →</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50 flex items-center justify-between">
                <span className="text-slate-300">Steam Boost Turbo</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 font-mono text-[11px]">Space</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50 flex items-center justify-between">
                <span className="text-slate-300">Postcard Photo Mode</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-pink-300 font-mono text-[11px]">P</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50 flex items-center justify-between">
                <span className="text-slate-300">Solstice Workshop</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-rose-300 font-mono text-[11px]">G</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50 flex items-center justify-between">
                <span className="text-slate-300">Solstice Scrapbook</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-rose-300 font-mono text-[11px]">L</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50 flex items-center justify-between">
                <span className="text-slate-300">Pause / Close Dialog</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[11px]">Esc</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50 flex items-center justify-between">
                <span className="text-slate-300">Touch Controls</span>
                <span className="text-slate-400 text-[11px]">Virtual HUD</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Backup, Export & Reset */}
        {activeTab === 'backup' && (
          <div className="flex flex-col gap-3.5 overflow-y-auto">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Save Data Management
            </h4>

            {backupMessage && (
              <div className="p-2.5 rounded-lg bg-rose-950/70 border border-rose-800 text-xs text-rose-200">
                {backupMessage}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={handleExportData}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Export Save File (.json)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-amber-400" />
                <span>Import Save File (.json)</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>

            {/* Data Reset */}
            <div className="pt-2 border-t border-slate-800">
              {!showConfirmReset ? (
                <button
                  onClick={() => setShowConfirmReset(true)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-950/50 border border-slate-700 hover:border-rose-800/60 text-xs font-medium text-slate-400 hover:text-rose-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Reset Saved Data & Upgrades</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800">
                  <p className="text-xs text-rose-200 flex-1">Reset all upgrades and progress to factory fresh?</p>
                  <button
                    onClick={() => {
                      onResetProgress();
                      setShowConfirmReset(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                  >
                    Yes, Reset
                  </button>
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Done Button */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Save & Return (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
