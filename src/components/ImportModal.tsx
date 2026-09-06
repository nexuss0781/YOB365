import React, { useState } from 'react';
import {
  X,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  FileText,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';
import { Song, PlaylistSchema } from '../types';
import {
  validateAndParseJSON,
  parseRawTextToSongs,
  JSON_SCHEMA_EXAMPLE,
  ValidationResult,
} from '../utils/schemaValidator';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSongs: (songs: Song[]) => void;
  onResetDefault: () => void;
  currentSongs: Song[];
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportSongs,
  onResetDefault,
  currentSongs,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'json' | 'text' | 'schema'>('upload');
  const [jsonInput, setJsonInput] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
      const res = validateAndParseJSON(content);
      setValidationResult(res);
      setActiveTab('json');
    };
    reader.readAsText(file);
  };

  const handleValidateJson = (text: string) => {
    setJsonInput(text);
    if (!text.trim()) {
      setValidationResult(null);
      return;
    }
    const res = validateAndParseJSON(text);
    setValidationResult(res);
  };

  const handleParseRawText = () => {
    if (!textInput.trim()) return;
    const parsed = parseRawTextToSongs(textInput);
    if (parsed.length > 0) {
      const schemaObj: PlaylistSchema = {
        version: '1.0',
        name: 'YOB 365 Playlist',
        songs: parsed,
      };
      const jsonStr = JSON.stringify(schemaObj, null, 2);
      setJsonInput(jsonStr);
      setValidationResult(validateAndParseJSON(jsonStr));
      setActiveTab('json');
    }
  };

  const handleApplyImport = () => {
    if (validationResult && validationResult.isValid && validationResult.songs.length > 0) {
      onImportSongs(validationResult.songs);
      onClose();
    }
  };

  const handleExportJson = () => {
    const data: PlaylistSchema = {
      version: '1.0',
      name: 'YOB 365 Playlist',
      songs: currentSongs,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yob_365_playlist_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(JSON.stringify(JSON_SCHEMA_EXAMPLE, null, 2));
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 select-none">
      <div className="bg-[#181818] border border-white/10 rounded-xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white font-sans">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1db954]/20 flex items-center justify-center text-[#1db954]">
              <FileJson className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">JSON Playlist Schema</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#a7a7a7] hover:text-white hover:bg-white/10 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (Responsive scrollable) */}
        <div className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 pt-2 sm:pt-3 border-b border-white/5 bg-[#141414] text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-2 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 min-h-[40px] ${
              activeTab === 'upload'
                ? 'border-[#1db954] text-white'
                : 'border-transparent text-[#a7a7a7] hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload JSON</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-2 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 min-h-[40px] ${
              activeTab === 'json'
                ? 'border-[#1db954] text-white'
                : 'border-transparent text-[#a7a7a7] hover:text-white'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>JSON Editor</span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`px-3 py-2 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 min-h-[40px] ${
              activeTab === 'text'
                ? 'border-[#1db954] text-white'
                : 'border-transparent text-[#a7a7a7] hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Raw Text</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-2 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 min-h-[40px] ${
              activeTab === 'schema'
                ? 'border-[#1db954] text-white'
                : 'border-transparent text-[#a7a7a7] hover:text-white'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Schema</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* UPLOAD TAB */}
          {activeTab === 'upload' && (
            <div className="flex flex-col gap-4">
              <label
                htmlFor="json-file-input"
                className="border-2 border-dashed border-white/20 hover:border-[#1db954] rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-3 cursor-pointer bg-[#202020] hover:bg-[#242424] transition-all"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1db954]/20 flex items-center justify-center text-[#1db954]">
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="font-bold text-xs sm:text-sm text-white">Select JSON file</p>
                </div>
                <input
                  id="json-file-input"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="bg-[#222] p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border border-white/5">
                <div>
                  <h4 className="text-xs font-bold text-white">Export Current Catalog</h4>
                </div>
                <button
                  onClick={handleExportJson}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer min-h-[40px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .json</span>
                </button>
              </div>
            </div>
          )}

          {/* JSON EDITOR TAB */}
          {activeTab === 'json' && (
            <div className="flex flex-col gap-3 flex-1 min-h-[260px]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#a7a7a7]">JSON Content:</span>
                {validationResult && (
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      validationResult.isValid ? 'text-[#1db954]' : 'text-rose-400'
                    }`}
                  >
                    {validationResult.isValid ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Valid ({validationResult.songs.length} songs)</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Invalid JSON</span>
                      </>
                    )}
                  </span>
                )}
              </div>

              <textarea
                value={jsonInput}
                onChange={(e) => handleValidateJson(e.target.value)}
                placeholder='{\n  "version": "1.0",\n  "songs": [\n    {\n      "id": 230,\n      "day": 230,\n      "title": "When I’m Gone",\n      "artist": "Eminem",\n      "season": "Autumn"\n    }\n  ]\n}'
                className="w-full h-56 sm:h-64 p-3 rounded-lg bg-[#111] border border-white/10 font-mono text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#1db954] resize-none"
              />

              {validationResult && (
                <div className="bg-[#1e1e1e] p-3 rounded-lg border border-white/10 text-xs flex flex-col gap-2">
                  {validationResult.errors.length > 0 && (
                    <div className="text-rose-400 flex flex-col gap-1">
                      {validationResult.errors.map((e, idx) => (
                        <p key={idx} className="text-[11px]">
                          • {e}
                        </p>
                      ))}
                    </div>
                  )}

                  {validationResult.metadata && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div>Spring: {validationResult.metadata.seasonBreakdown.Spring}</div>
                      <div>Summer: {validationResult.metadata.seasonBreakdown.Summer}</div>
                      <div>Autumn: {validationResult.metadata.seasonBreakdown.Autumn}</div>
                      <div>Winter: {validationResult.metadata.seasonBreakdown.Winter}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* RAW TEXT PARSER TAB */}
          {activeTab === 'text' && (
            <div className="flex flex-col gap-3">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="230. When I’m Gone – Eminem&#10;231. Hailie’s Song – Eminem&#10;271. Hurt – Johnny Cash&#10;272. The Sound of Silence – Disturbed"
                className="w-full h-48 sm:h-56 p-3 rounded-lg bg-[#111] border border-white/10 font-mono text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#1db954] resize-none"
              />
              <button
                onClick={handleParseRawText}
                className="self-end px-4 py-2.5 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#1db954]/20 cursor-pointer min-h-[44px]"
              >
                Convert to JSON
              </button>
            </div>
          )}

          {/* SCHEMA REFERENCE TAB */}
          {activeTab === 'schema' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1db954]">JSON Schema</span>
                <button
                  onClick={handleCopySchema}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer min-h-[40px]"
                >
                  {copiedSchema ? (
                    <Check className="w-3.5 h-3.5 text-[#1db954]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedSchema ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="bg-[#111] p-3 sm:p-4 rounded-lg font-mono text-xs text-emerald-300 border border-white/10 overflow-x-auto">
                {JSON.stringify(JSON_SCHEMA_EXAMPLE, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#141414]">
          <button
            onClick={onResetDefault}
            className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium text-[#888] hover:text-white transition-colors cursor-pointer min-h-[40px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Catalog</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-xs font-bold text-[#b3b3b3] hover:text-white transition-colors cursor-pointer min-h-[44px]"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyImport}
              disabled={
                !validationResult ||
                !validationResult.isValid ||
                validationResult.songs.length === 0
              }
              className="px-5 py-2.5 rounded-full bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-40 disabled:pointer-events-none text-black text-xs font-extrabold transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#1db954]/20 cursor-pointer min-h-[44px]"
            >
              Apply ({validationResult?.songs.length || 0} Songs)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
