import React, { useState } from 'react';
import { CSHARP_SCRIPTS, CSharpScriptFile } from '../data/csharpScripts';
import { Copy, Check, Download, FileCode, Info, Cpu, CheckCircle } from 'lucide-react';

export const UnityScriptViewer: React.FC = () => {
  const [activeScriptIndex, setActiveScriptIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeScript: CSharpScriptFile = CSHARP_SCRIPTS[activeScriptIndex];

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(activeScript.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([activeScript.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeScript.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    CSHARP_SCRIPTS.forEach((script, idx) => {
      setTimeout(() => {
        const blob = new Blob([script.code], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = script.filename;
        link.click();
        URL.revokeObjectURL(url);
      }, idx * 250);
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Header & Tabs */}
      <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Unity C# Kod Merkezi (Hackathon Paketi)
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95"
            title="Tüm C# scriptlerini ayrı dosyalar olarak indir"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tüm .cs Dosyalarını İndir (4 Dosya)</span>
          </button>
        </div>
      </div>

      {/* Script Selector Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 overflow-x-auto scrollbar-thin">
        {CSHARP_SCRIPTS.map((script, index) => {
          const isActive = index === activeScriptIndex;
          return (
            <button
              key={script.filename}
              onClick={() => setActiveScriptIndex(index)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? 'border-emerald-400 text-emerald-300 bg-slate-800/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <Cpu className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>{script.filename}</span>
            </button>
          );
        })}
      </div>

      {/* Active Script Details & Inspector Advice */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>{activeScript.title}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                {activeScript.filename}
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">{activeScript.description}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyCode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopyalandı!' : 'Kodu Kopyala'}</span>
            </button>

            <button
              onClick={handleDownloadSingle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.cs İndir</span>
            </button>
          </div>
        </div>

        {/* Unity Components Required */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
          <span className="text-slate-400 font-semibold">Gerekli Unity Kütüphaneleri & Bileşenler:</span>
          {activeScript.unityComponentsUsed.map((comp) => (
            <span
              key={comp}
              className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 font-mono text-[11px]"
            >
              {comp}
            </span>
          ))}
        </div>

        {/* Inspector Setup Quick Notes */}
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>Unity Inspector Kurulum İpuçları:</span>
          </div>
          <ul className="space-y-1 text-slate-300 list-disc list-inside">
            {activeScript.inspectorNotes.map((note, nIdx) => (
              <li key={nIdx}>{note}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Code Container with syntax formatting */}
      <div className="relative bg-slate-950 p-4 font-mono text-xs leading-relaxed overflow-x-auto text-slate-200 max-h-[500px] scrollbar-thin">
        <pre className="selection:bg-emerald-500/30">
          <code>{activeScript.code}</code>
        </pre>
      </div>
    </div>
  );
};
