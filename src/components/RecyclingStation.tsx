import React from 'react';
import { Recycle, Sparkles, CheckCircle2, MapPin, Zap } from 'lucide-react';

interface RecyclingStationProps {
  cleanedCount: number;
  totalRequired: number;
  currentLevelName: string;
  totalScore: number;
  temperature: number;
}

export const RecyclingStation: React.FC<RecyclingStationProps> = ({
  cleanedCount,
  totalRequired,
  currentLevelName,
  totalScore,
  temperature,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Recycle className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
              <span>{currentLevelName}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                Görev: Çatıya Yaklaş, Atıkları Ayrıştır &amp; Dekore Et
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Çatıya tıklandığında kamera yavaşça yaklaşır. Çatıdaki plastik, kağıt, organik ve metal atıkları uygun kutulara sürükleyin, ardından çatıyı yeşillendirip güneş panelleriyle inşa edin!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs shrink-0">
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300 font-semibold">İlerleme:</span>
            <strong className="text-emerald-400 font-mono text-sm">
              {cleanedCount} / {totalRequired}
            </strong>
          </div>
        </div>
      </div>

      {/* Recycled Value Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
        <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
            🍏
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Kompost Gübre</div>
            <div className="text-xs font-bold text-slate-200">Organik Toprak</div>
          </div>
        </div>

        <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm">
            📄
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Kağıt Yalıtım</div>
            <div className="text-xs font-bold text-slate-200">Isı Koruma</div>
          </div>
        </div>

        <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm">
            🧴
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Plastik Şişe</div>
            <div className="text-xs font-bold text-slate-200">Damla Sulama</div>
          </div>
        </div>

        <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm">
            💧
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Yağmur Hasadı</div>
            <div className="text-xs font-bold text-slate-200">Sıfır Şebeke Suyu</div>
          </div>
        </div>
      </div>
    </div>
  );
};
