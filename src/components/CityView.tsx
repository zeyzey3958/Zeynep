import React, { useState } from 'react';
import {
  Sparkles,
  Sun,
  CheckCircle2,
  Trash2,
  ArrowUpRight,
  Leaf,
  Layers,
} from 'lucide-react';
import { WasteIcon } from './WasteIcon';
import { soundManager } from '../utils/audio';
import { RooftopWorkspace } from './RooftopWorkspace';

export interface RoofBuilding {
  id: number;
  name: string;
  xPercent: number;
  yPercent: number;
  isCleaned: boolean;
  wasteSpriteIndex: number; // 0: Apple, 1: Paper, 2: Bottle, 3: Crushed Can, 4: Cup
  activeInLevel1: boolean;
}

interface CityViewProps {
  buildings: RoofBuilding[];
  onBuildingCleaned: (buildingId: number) => void;
  currentLevelNumber: number;
  isLevelZooming: boolean;
  focusedBuildingId: number | null;
  onSetFocusedBuildingId: (id: number | null) => void;
  isPlaying: boolean;
}

export const CityView: React.FC<CityViewProps> = ({
  buildings,
  onBuildingCleaned,
  currentLevelNumber,
  isLevelZooming,
  focusedBuildingId,
  onSetFocusedBuildingId,
  isPlaying,
}) => {
  const [hoveredRoofId, setHoveredRoofId] = useState<number | null>(null);

  const focusedBuilding = buildings.find((b) => b.id === focusedBuildingId) || null;

  // Visible buildings according to current level
  const visibleBuildings = buildings.filter((b) =>
    currentLevelNumber === 1 ? b.activeInLevel1 : true
  );

  // Click on a building roof in city view
  const handleRoofClick = (b: RoofBuilding) => {
    if (!isPlaying || b.isCleaned || focusedBuildingId !== null) return;
    soundManager.playPickup();
    onSetFocusedBuildingId(b.id);
  };

  // Called when player finishes sorting trash and decorating the roof
  const handleWorkspaceComplete = (buildingId: number) => {
    onBuildingCleaned(buildingId);
    // Smooth zoom out back to city
    setTimeout(() => {
      onSetFocusedBuildingId(null);
    }, 600);
  };

  // Cancel / return to overview
  const handleWorkspaceCancel = () => {
    soundManager.playPickup();
    onSetFocusedBuildingId(null);
  };

  return (
    <div
      data-testid="city-container"
      className="relative w-full max-w-4xl mx-auto rounded-3xl overflow-hidden border-2 border-slate-700/80 shadow-2xl bg-slate-950 aspect-[16/10] sm:aspect-[16/9] select-none"
    >
      {/* 
        CAMERA TRANSFORM WRAPPER 
        Smoothly and slowly pans & zooms into the clicked building without opening a separate page!
      */}
      <div
        style={{
          transformOrigin: focusedBuilding
            ? `${focusedBuilding.xPercent}% ${focusedBuilding.yPercent}%`
            : 'center center',
          transform: focusedBuilding
            ? 'scale(2.3)'
            : isLevelZooming
            ? 'scale(1.25)'
            : currentLevelNumber === 1
            ? 'scale(1.12)'
            : 'scale(1.0)',
          transition: 'transform 1.1s cubic-bezier(0.25, 1, 0.4, 1)',
        }}
        className="w-full h-full relative"
      >
        {/* Base 3x3 Isometric City Image with Scattered Rooftop Items */}
        <img
          src="/assets/aistudio/Gemini_Generated_Image_6yj3tv6yj3tv6yj3_66252448.jpg"
          alt="3x3 İzometrik Şehir Çatıları"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Roof Interactive Click & Cleaned Overlays */}
        {visibleBuildings.map((building) => {
          const isFocused = focusedBuildingId === building.id;
          const isHovered = hoveredRoofId === building.id && !focusedBuildingId;

          return (
            <div
              key={building.id}
              data-testid={`roof-${building.id}`}
              onClick={() => handleRoofClick(building)}
              onMouseEnter={() => setHoveredRoofId(building.id)}
              onMouseLeave={() => setHoveredRoofId(null)}
              style={{
                left: `${building.xPercent}%`,
                top: `${building.yPercent}%`,
                transform: 'translate(-50%, -50%)',
                width: '18%',
                height: '14%',
              }}
              className={`absolute cursor-pointer rounded-2xl flex flex-col items-center justify-center z-10 transition-all ${
                building.isCleaned
                  ? 'pointer-events-none'
                  : isFocused
                  ? 'ring-4 ring-emerald-400 ring-offset-2 ring-offset-slate-950 shadow-2xl z-20'
                  : 'hover:scale-105 active:scale-95'
              }`}
            >
              {building.isCleaned ? (
                /* Transformed Green Rooftop Farm in place! */
                <div className="w-full h-full rounded-2xl bg-emerald-600/90 backdrop-blur-[1px] border-2 border-emerald-300 shadow-xl p-1 flex flex-col items-center justify-center text-white text-[10px] sm:text-xs font-bold animate-in fade-in zoom-in duration-500">
                  <div className="flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-amber-100">
                      Çatı Bostanı
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[8px] sm:text-[9px] text-emerald-100 mt-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-200" />
                    <span>Yeşil Çatı Aktif</span>
                  </div>
                  {/* Solar panel & crops indicator */}
                  <div className="w-4/5 h-1.5 bg-emerald-300/60 rounded-full mt-1 overflow-hidden">
                    <div className="w-full h-full bg-amber-300 animate-pulse" />
                  </div>
                </div>
              ) : (
                /* Unfocused Dirty Roof with clean transparent hover target */
                <div
                  className={`w-full h-full rounded-2xl p-1 flex flex-col items-center justify-between border-2 transition-all ${
                    isHovered
                      ? 'bg-rose-600/25 border-rose-400 shadow-xl shadow-rose-500/40 ring-4 ring-rose-400/50 scale-105'
                      : 'bg-black/15 border-amber-400/60 hover:border-emerald-400 shadow-md ring-1 ring-amber-400/20'
                  }`}
                >
                  {/* Minimal indicator without blocking view of roof debris */}
                  <div className="w-full flex items-center justify-between px-1">
                    <div className="p-0.5 rounded-full bg-rose-600 text-white shadow animate-pulse">
                      <Trash2 className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-[9px] font-black text-amber-200 bg-slate-950/80 px-1 rounded border border-amber-500/40">
                      Kirli Çatı
                    </span>
                  </div>

                  {/* Action prompt */}
                  <div
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full transition-all flex items-center gap-1 ${
                      isHovered
                        ? 'bg-emerald-500 text-slate-950 shadow-lg scale-110'
                        : 'bg-slate-900/90 text-amber-300 border border-amber-400/50'
                    }`}
                  >
                    <span>{isHovered ? 'Yakınlaş & İnşa Et' : 'Tıkla & Temizle'}</span>
                    <ArrowUpRight className="w-2.5 h-2.5" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 
        SEAMLESS IN-PLACE ROOFTOP WORKSPACE
        Mounts directly when player selects a roof to clean and decorate!
      */}
      {focusedBuilding && (
        <RooftopWorkspace
          buildingId={focusedBuilding.id}
          buildingName={focusedBuilding.name}
          onComplete={handleWorkspaceComplete}
          onCancel={handleWorkspaceCancel}
        />
      )}

      {/* Top Status Badge in City View */}
      {!focusedBuilding && (
        <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-700 text-xs text-white shadow-lg pointer-events-none">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>
            Temizlenen Çatılar:{' '}
            <strong className="text-emerald-400 font-mono text-sm">
              {visibleBuildings.filter((b) => b.isCleaned).length} / {visibleBuildings.length}
            </strong>
          </span>
        </div>
      )}

      {/* Level Zoom Transition Banner */}
      {isLevelZooming && (
        <div className="absolute inset-0 z-30 bg-emerald-950/60 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-300">
          <div className="px-5 py-3 rounded-2xl bg-slate-900 border-2 border-emerald-400 shadow-2xl">
            <div className="text-base sm:text-lg font-black text-emerald-400 animate-pulse">
              1. Mahalle Kurtarıldı!
            </div>
            <div className="text-xs text-slate-200 mt-1">
              Kamera Büyüyor ve Geniş Şehir Haritası Açılıyor...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
