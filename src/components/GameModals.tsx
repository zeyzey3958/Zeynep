import React, { useEffect } from 'react';
import { RotateCcw, Award, AlertOctagon, Sparkles, Play, Code, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

interface GameOverModalProps {
  score: number;
  convertedRoofs: number;
  timeRemaining: number;
  onRestart: () => void;
  onOpenScripts: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  convertedRoofs,
  timeRemaining,
  onRestart,
  onOpenScripts,
}) => {
  useEffect(() => {
    soundManager.playGameOver();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border-2 border-rose-500/80 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-500 border border-rose-500/40 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <AlertOctagon className="w-10 h-10" />
        </div>

        <h3 className="text-2xl font-black text-white mb-1">Şehir Aşırı Isındı!</h3>
        <p className="text-rose-400 font-semibold text-sm mb-4">
          Şehir Sıcaklığı 100°C Kritik Seviyeye Ulaştı (Sera Gazı Krizi)
        </p>

        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-2 mb-6 text-xs text-slate-300">
          <div className="flex justify-between items-center">
            <span>Dönüştürülen Yeşil Çatılar:</span>
            <strong className="text-white font-mono text-sm">{convertedRoofs} / 9</strong>
          </div>
          <div className="flex justify-between items-center">
            <span>Kalan Süre:</span>
            <strong className="text-white font-mono text-sm">{Math.ceil(timeRemaining)}s</strong>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-800">
            <span className="font-bold text-emerald-400">Toplam Ekolojik Puan:</span>
            <strong className="text-emerald-400 font-mono text-base font-extrabold">{score}</strong>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onRestart}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Yeniden Başlat (Tekrar Dene)</span>
          </button>

          <button
            onClick={onOpenScripts}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <Code className="w-4 h-4 text-emerald-400" />
            <span>Unity C# Kodlarını İncele</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface VictoryModalProps {
  score: number;
  convertedRoofs: number;
  timeRemaining: number;
  temperature: number;
  onRestart: () => void;
  onOpenScripts: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  convertedRoofs,
  timeRemaining,
  temperature,
  onRestart,
  onOpenScripts,
}) => {
  useEffect(() => {
    soundManager.playVictory();
    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#f59e0b', '#38bdf8'],
      });
    } catch {}
  }, []);

  const totalFinalScore = score + Math.round(timeRemaining * 10);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 animate-bounce">
          <Award className="w-10 h-10" />
        </div>

        <h3 className="text-2xl font-black text-white mb-1">Tebrikler! Şehir Kurtarıldı!</h3>
        <p className="text-emerald-400 font-semibold text-sm mb-4">
          Sıfır Atık & Çatı Bostanları ile Kentsel Isı Adası Etkisi Kırıldı
        </p>

        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-2 mb-6 text-xs text-slate-300">
          <div className="flex justify-between items-center">
            <span>Yeşil Çatı Bostanları:</span>
            <strong className="text-emerald-400 font-mono text-sm">{convertedRoofs} / 9 Dönüştü</strong>
          </div>
          <div className="flex justify-between items-center">
            <span>Son Şehir Sıcaklığı:</span>
            <strong className="text-sky-300 font-mono text-sm">{Math.round(temperature)}°C (Güvenli)</strong>
          </div>
          <div className="flex justify-between items-center">
            <span>Kalan Süre Bonusu:</span>
            <strong className="text-amber-400 font-mono text-sm">+{Math.round(timeRemaining * 10)} Puan</strong>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-800">
            <span className="font-bold text-white text-sm">Toplam Skor:</span>
            <strong className="text-emerald-400 font-mono text-lg font-black">{totalFinalScore}</strong>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onRestart}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Tekrar Oyna</span>
          </button>

          <button
            onClick={onOpenScripts}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <Code className="w-4 h-4 text-emerald-400" />
            <span>Unity C# Kodlarını & Rehberi İncele</span>
          </button>
        </div>
      </div>
    </div>
  );
};
