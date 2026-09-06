import React, { useState } from 'react';
import { X, FolderOpen, CheckCircle2, FileAudio } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface LocalFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesLoaded: (count: number) => void;
}

export const LocalFolderModal: React.FC<LocalFolderModalProps> = ({
  isOpen,
  onClose,
  onFilesLoaded,
}) => {
  const [statusMessage, setStatusMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    audioEngine.registerMultipleFiles(files);
    setStatusMessage(`Loaded ${files.length} audio file(s)`);
    onFilesLoaded(files.length);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-[#181818] border border-white/10 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden text-white font-sans">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">Local Audio Files</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#a7a7a7] hover:text-white hover:bg-white/10 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 flex flex-col gap-4">
          <label
            htmlFor="local-audio-input"
            className="border-2 border-dashed border-emerald-500/30 hover:border-[#1db954] rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-2.5 cursor-pointer bg-[#202020] hover:bg-[#252525] transition-all"
          >
            <FileAudio className="w-8 h-8 sm:w-10 sm:h-10 text-[#1db954]" />
            <span className="font-bold text-xs sm:text-sm text-white">
              Select Audio Files (.mp3, .wav)
            </span>
            <span className="text-[11px] text-[#888]">
              Match filenames like 230.mp3 or Day230.mp3
            </span>
            <input
              id="local-audio-input"
              type="file"
              multiple
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {statusMessage && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-lg text-xs text-emerald-300 flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-white/10 flex justify-end bg-[#141414]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black text-xs font-bold transition-all shadow-md cursor-pointer min-h-[44px]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
