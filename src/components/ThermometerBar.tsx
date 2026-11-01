import React from 'react';
import { Flame, AlertTriangle, Snowflake } from 'lucide-react';

interface ThermometerBarProps {
  temperature: number; // 0 to 100
  isGameOver?: boolean;
}

export const ThermometerBar: React.FC<ThermometerBarProps> = ({ temperature }) => {
  const percentage = Math.min(100, Math.max(0, temperature));
  const isHighAlert = percentage >= 80;
  const isWarning = percentage >= 60 && percentage < 80;

  // Temperature color badge
  const getTempColor = () => {
    if (percentage < 40) return 'text-emerald-700 bg-emerald-100 border-emerald-300';
    if (percentage < 70) return 'text-amber-800 bg-amber-100 border-amber-300';
    return 'text-rose-700 bg-rose-100 border-rose-400 animate-pulse';
  };

  return (
    <div className="flex flex-col gap-1.5 w-full max-w-4xl mx-auto px-1 select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs font-semibold px-1">
        <div className="flex items-center gap-1.5">
          {percentage < 40 ? (
            <Snowflake className="w-4 h-4 text-emerald-400" />
          ) : percentage < 75 ? (
            <Flame className="w-4 h-4 text-amber-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />
          )}
          <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
            Şehir Sıcaklığı Göstergesi
          </span>
          <span className="text-[10px] text-amber-400 font-mono font-bold">(+2°C / saniye)</span>
        </div>

        <div className={`px-2.5 py-0.5 rounded-full border text-xs font-extrabold tabular-nums shadow-sm ${getTempColor()}`}>
          {Math.round(percentage)}°C / 100°C
        </div>
      </div>

      {/* Thermometer graphic frame card */}
      <div className="relative w-full bg-slate-900 border border-slate-700/80 rounded-2xl p-2.5 sm:p-3 shadow-xl flex flex-col justify-center">
        <div className="relative w-full h-12 flex items-center justify-center">
          {/* Real uploaded thermometer graphic */}
          <img
            src="/assets/aistudio/Parlak_Renkli_Termometre__lerleme__ubu_u_cbd18830.png"
            alt="Termometre Barı"
            className="w-full h-full object-contain pointer-events-none drop-shadow-md rounded-xl"
          />

          {/* Dynamic Interactive indicator marker pin */}
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none"
            style={{
              left: `calc(13% + ${percentage * 0.77}%)`,
            }}
          >
            <div className="relative flex flex-col items-center">
              <div
                className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                  isHighAlert ? 'bg-rose-600 animate-ping' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
              <div
                className={`w-3.5 h-3.5 -mt-4 rounded-full border-2 border-slate-900 shadow-md ${
                  isHighAlert ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Threshold Markers below bar */}
        <div className="flex justify-between text-[10px] text-slate-400 px-3 sm:px-6 font-mono pt-1">
          <span className="text-emerald-400 font-semibold">0°C (Serin &amp; Ferah)</span>
          <span className="text-amber-400 font-semibold">50°C (Ilıman Seviye)</span>
          <span className="text-rose-400 font-bold">100°C (Kritik Tehlike / Game Over)</span>
        </div>
      </div>
    </div>
  );
};
