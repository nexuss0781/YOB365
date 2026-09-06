import React from 'react';
import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause audio' },
    { key: 'Ctrl + →', desc: 'Skip to next track' },
    { key: 'Ctrl + ←', desc: 'Skip to previous track' },
    { key: 'M', desc: 'Mute / Unmute volume' },
    { key: 'S', desc: 'Toggle shuffle' },
    { key: 'R', desc: 'Cycle repeat mode' },
    { key: 'L', desc: 'Like / Unlike current track' },
    { key: 'F', desc: 'Toggle fullscreen theater view' },
    { key: 'C', desc: 'Open calendar year' },
    { key: '/', desc: 'Quick search songs' },
    { key: 'Esc', desc: 'Close open dialogs' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#181818] border border-white/10 rounded-xl w-full max-w-md shadow-2xl overflow-hidden text-white font-sans">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Command className="w-5 h-5 text-[#1db954]" />
            <h2 className="text-base font-bold text-white">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#a7a7a7] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-2.5 max-h-[70vh] overflow-y-auto">
          {shortcuts.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg bg-[#222] border border-white/5 text-xs"
            >
              <span className="text-[#a7a7a7]">{item.desc}</span>
              <kbd className="px-2 py-1 rounded bg-[#333] text-white font-mono font-bold border border-white/10 shadow-sm">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-white/10 flex justify-end bg-[#141414]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
