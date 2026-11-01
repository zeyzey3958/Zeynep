import React, { useState, useEffect, useRef } from 'react';
import {
  RooftopTrashItem,
  RECYCLING_BINS,
  DECORATION_STEPS,
  DecorationStepId,
  WasteCategory,
  generateBuildingTrashItems,
  validateWasteSorting,
} from '../game/rules';
import { WasteIcon } from './WasteIcon';
import { soundManager } from '../utils/audio';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ZoomOut,
  Sun,
  Leaf,
  Droplets,
  Layers,
  FastForward,
  Check,
  Recycle,
  Play,
  Hammer,
} from 'lucide-react';

interface RooftopWorkspaceProps {
  buildingId: number;
  buildingName: string;
  onComplete: (buildingId: number) => void;
  onCancel: () => void;
}

export const RooftopWorkspace: React.FC<RooftopWorkspaceProps> = ({
  buildingId,
  buildingName,
  onComplete,
  onCancel,
}) => {
  // Phase 1: Trash Sorting
  const [trashItems, setTrashItems] = useState<RooftopTrashItem[]>(() =>
    generateBuildingTrashItems(buildingId)
  );
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [activeBinCategory, setActiveBinCategory] = useState<WasteCategory | null>(null);
  const [shakeMessage, setShakeMessage] = useState<string | null>(null);

  // Phase 2: Staged Construction & Animation State
  const [completedSteps, setCompletedSteps] = useState<DecorationStepId[]>([]);
  const [isBuildingAnimActive, setIsBuildingAnimActive] = useState(false);
  const [animStage, setAnimStage] = useState<'idle' | 'soil' | 'crops' | 'solar' | 'water' | 'complete'>('idle');
  const [visibleSolarCount, setVisibleSolarCount] = useState(0);
  const [floatingFeedback, setFloatingFeedback] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const isTrashCleaned = trashItems.length === 0;
  const isDecorationComplete = completedSteps.length === DECORATION_STEPS.length;

  const timerTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      timerTimeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  // Selected item
  const selectedItem = trashItems.find((i) => i.id === (draggedItemId || selectedItemId)) || null;

  // Handle Drag Start
  const handleDragStart = (e: React.DragEvent, item: RooftopTrashItem) => {
    setDraggedItemId(item.id);
    setSelectedItemId(item.id);
    e.dataTransfer.setData('text/plain', item.id);
    soundManager.playPickup();
  };

  // Handle Drag End
  const handleDragEnd = () => {
    setDraggedItemId(null);
    setActiveBinCategory(null);
  };

  // Process Sorting on a Category Bin
  const handleProcessSort = (targetCategory: WasteCategory) => {
    if (!selectedItem) {
      setShakeMessage('Önce çatıdaki bir atığa tıklayın veya onu kutuya sürükleyin!');
      setTimeout(() => setShakeMessage(null), 2000);
      return;
    }

    const isValid = validateWasteSorting(selectedItem.category, targetCategory);

    if (isValid) {
      // Correct sorting!
      soundManager.playTrashSorted();
      setFloatingFeedback(`+50 Puan! Doğru ${selectedItem.name} Geri Dönüştürüldü 🌱`);
      setTimeout(() => setFloatingFeedback(null), 1800);

      // Remove item cleanly from rooftop
      setTrashItems((prev) => prev.filter((i) => i.id !== selectedItem.id));
      setSelectedItemId(null);
      setDraggedItemId(null);
      setShakeMessage(null);
    } else {
      // Incorrect category!
      soundManager.playSnapBack();
      const correctBin = RECYCLING_BINS.find((b) => b.category === selectedItem.category);
      setShakeMessage(`Hatalı Kutu! "${selectedItem.name}" ${correctBin?.name || ''} kutusuna atılmalıdır!`);
      setTimeout(() => setShakeMessage(null), 2500);
    }
  };

  // Handle Drop on Bin
  const handleDropOnBin = (e: React.DragEvent, category: WasteCategory) => {
    e.preventDefault();
    setActiveBinCategory(null);
    handleProcessSort(category);
  };

  /**
   * Kademeli (Yavaş) İnşa Animasyonu (1.8s - 2.0s tatmin edici animasyon akışı):
   * 1. Önce yeşil çim ve organik toprak katmanı yavaşça belirir (fade-in & spread).
   * 2. Ardından sebzeler ve bostan filizlenip yerleşir (crops sprout).
   * 3. En son güneş panelleri kademeli olarak (sırayla) çatıya dizilir.
   * 4. Su deposu ve sulama devreye girer, çatı muhteşem 3D bostana dönüşür.
   */
  const triggerGradualBuildSequence = () => {
    if (isBuildingAnimActive || isDecorationComplete) return;

    setIsBuildingAnimActive(true);
    setCompletedSteps(['soil-and-plants']);
    setAnimStage('soil');
    soundManager.playBuildStep();
    setFloatingFeedback('1/3: Organik Toprak & Çim Seriliyor... 🌱');

    // 0.6s: Sebzeler filizlenir
    const t1 = setTimeout(() => {
      setAnimStage('crops');
      soundManager.playBuildStep();
      setFloatingFeedback('Sebzeler ve Bostan Yerleşiyor! 🍅🥕🥬');
    }, 600);

    // 1.1s: Güneş panelleri sırayla dizilmeye başlar
    const t2 = setTimeout(() => {
      setAnimStage('solar');
      setCompletedSteps(['soil-and-plants', 'solar-panels']);
      setFloatingFeedback('2/3: Güneş Panelleri Sırayla Diziliyor... ☀️');

      // Staggered solar panels (1 by 1)
      setVisibleSolarCount(1);
      soundManager.playBuildStep();

      const tSolar2 = setTimeout(() => {
        setVisibleSolarCount(2);
      }, 200);

      const tSolar3 = setTimeout(() => {
        setVisibleSolarCount(3);
      }, 400);

      const tSolar4 = setTimeout(() => {
        setVisibleSolarCount(4);
        soundManager.playBuildStep();
      }, 600);

      timerTimeoutsRef.current.push(tSolar2, tSolar3, tSolar4);
    }, 1100);

    // 1.8s: Yağmur hasadı ve su deposu kurulur
    const t3 = setTimeout(() => {
      setAnimStage('water');
      setCompletedSteps(['soil-and-plants', 'solar-panels', 'water-irrigation']);
      soundManager.playBuildStep();
      setFloatingFeedback('3/3: Yağmur Deposu & Sulama Hattı Aktif! 💧');
    }, 1800);

    // 2.4s: Tamamlama zaferi ve soğuma
    const t4 = setTimeout(() => {
      setAnimStage('complete');
      setIsFinishing(true);
      soundManager.playCoolDownSuccess();
      setFloatingFeedback('❄️ -15°C ŞEHİR SOĞUTULDU! +300 EKO PUAN 🎉');

      const t5 = setTimeout(() => {
        onComplete(buildingId);
      }, 1600);
      timerTimeoutsRef.current.push(t5);
    }, 2400);

    timerTimeoutsRef.current.push(t1, t2, t3, t4);
  };

  // Step-by-step click handler with mini gradual animation
  const handleApplyDecorationStep = (stepId: DecorationStepId) => {
    if (completedSteps.includes(stepId) || isBuildingAnimActive) return;

    // Sequential enforcement
    const stepDef = DECORATION_STEPS.find((s) => s.id === stepId);
    if (!stepDef) return;

    const previousStepOrder = stepDef.order - 1;
    if (previousStepOrder > 0) {
      const prevStepDef = DECORATION_STEPS.find((s) => s.order === previousStepOrder);
      if (prevStepDef && !completedSteps.includes(prevStepDef.id)) {
        setShakeMessage(`Önce ${prevStepDef.title} adımını kurmalısınız!`);
        setTimeout(() => setShakeMessage(null), 2000);
        soundManager.playSnapBack();
        return;
      }
    }

    if (stepId === 'soil-and-plants') {
      soundManager.playBuildStep();
      setAnimStage('soil');
      setFloatingFeedback('Toprak & Çim Seriliyor... 🌱');
      setTimeout(() => {
        setAnimStage('crops');
        setCompletedSteps((prev) => [...prev, 'soil-and-plants']);
        setFloatingFeedback('Bostan Yatakları ve Sebzeler Yerleşti! 🥕');
      }, 700);
    } else if (stepId === 'solar-panels') {
      soundManager.playBuildStep();
      setAnimStage('solar');
      setFloatingFeedback('Güneş Panelleri Diziliyor... ☀️');

      // Staggered panels
      setVisibleSolarCount(1);
      setTimeout(() => setVisibleSolarCount(2), 200);
      setTimeout(() => setVisibleSolarCount(3), 400);
      setTimeout(() => {
        setVisibleSolarCount(4);
        setCompletedSteps((prev) => [...prev, 'solar-panels']);
        soundManager.playBuildStep();
        setFloatingFeedback('4 Fotovoltaik Panel Monte Edildi! ☀️');
      }, 600);
    } else if (stepId === 'water-irrigation') {
      soundManager.playBuildStep();
      setAnimStage('water');
      setFloatingFeedback('Yağmur Deposu ve Damla Sulama Kuruluyor... 💧');

      setTimeout(() => {
        const nextSteps: DecorationStepId[] = [...completedSteps, 'water-irrigation'];
        setCompletedSteps(nextSteps);
        setAnimStage('complete');
        setIsFinishing(true);
        soundManager.playCoolDownSuccess();
        setFloatingFeedback('-15°C ŞEHİR SOĞUDU! ❄️ +300 EKO PUAN 🌱');

        setTimeout(() => {
          onComplete(buildingId);
        }, 1600);
      }, 700);
    }
  };

  // Instant fast forward
  const handleFastFinish = () => {
    soundManager.playCoolDownSuccess();
    setTrashItems([]);
    setCompletedSteps(['soil-and-plants', 'solar-panels', 'water-irrigation']);
    setAnimStage('complete');
    setIsFinishing(true);
    setFloatingFeedback('-15°C ŞEHİR SOĞUDU! ❄️ +300 EKO PUAN 🌱');
    setTimeout(() => {
      onComplete(buildingId);
    }, 600);
  };

  return (
    <div
      data-testid="rooftop-workspace"
      className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5 select-none animate-in fade-in zoom-in-95 duration-500 overflow-hidden"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-lg shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md">
            {isTrashCleaned ? <Leaf className="w-5 h-5" /> : <Recycle className="w-5 h-5 animate-spin-slow" />}
          </div>
          <div>
            <div className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
              <span>{buildingName}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                Yakın Çekim Çatı
              </span>
            </div>
            <div className="text-[11px] text-slate-300">
              {!isTrashCleaned ? (
                <span className="text-amber-300 font-semibold flex items-center gap-1.5">
                  <span>1. Aşama: Dağınık atıklara tıklayın veya kutulara sürükleyin</span>
                  <span className="text-[10px] bg-amber-950 px-2 py-0.5 rounded-full border border-amber-800 text-amber-300 font-mono">
                    Kalan: {trashItems.length}/5
                  </span>
                </span>
              ) : !isDecorationComplete ? (
                <span className="text-emerald-400 font-semibold">
                  2. Aşama: Çatıyı adım adım veya kademeli inşaat butonuyla yeşillendirin!
                </span>
              ) : (
                <span className="text-emerald-300 font-bold animate-pulse">
                  🎉 Çatı Bostanı Tamamlandı! Şehir Soğutuluyor...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleFastFinish}
            title="Hızlı Tamamla"
            className="px-2.5 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hızlı Bitir</span>
          </button>
          <button
            onClick={onCancel}
            title="Şehir Haritasına Dön"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 active:scale-95 flex items-center gap-1 text-xs px-2 cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Haritaya Dön</span>
          </button>
        </div>
      </div>

      {/* Floating Notifications / Error Toast */}
      {floatingFeedback && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-emerald-500 text-slate-950 font-black px-4 py-1.5 rounded-xl shadow-2xl text-xs sm:text-sm tracking-wide flex items-center gap-1.5 border-2 border-white animate-in zoom-in-90 duration-300 pointer-events-none">
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>{floatingFeedback}</span>
        </div>
      )}

      {shakeMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-rose-600 text-white font-bold px-4 py-1.5 rounded-xl shadow-2xl text-xs tracking-wide flex items-center gap-1.5 border border-rose-400 animate-bounce pointer-events-none">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{shakeMessage}</span>
        </div>
      )}

      {/* CENTER ROOFTOP STAGE & SORTING RECYCLING BINS */}
      <div className="relative flex-1 flex flex-col md:flex-row items-center justify-center gap-4 my-2 overflow-hidden min-h-0">
        {/* THE ISOMETRIC ROOFTOP SURFACE */}
        <div className="relative w-full max-w-lg aspect-square max-h-[62vh] rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-2xl bg-slate-900 flex items-center justify-center">
          {/* Base Concrete Flat Rooftop Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-800 via-stone-700 to-stone-900 flex items-center justify-center">
            {/* Concrete texture lines & rooftop ledge */}
            <div className="absolute inset-4 rounded-xl border-4 border-stone-600 bg-stone-700/90 shadow-inner flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
            </div>
          </div>

          {/* Finished High-Res Rooftop Farm Artwork Cross-Fade */}
          <img
            src="/assets/aistudio/single_rooftop_farm.jpg"
            alt="Çatı Bostanı"
            className={`absolute inset-0 w-full h-full object-contain transition-all duration-1000 ${
              animStage === 'complete' || isDecorationComplete
                ? 'opacity-100 scale-100'
                : animStage === 'water'
                ? 'opacity-85 scale-100'
                : 'opacity-0 scale-95 pointer-events-none'
            }`}
          />

          {/* KADEMELİ (YAVAŞ) İNŞAAT KATMANLARI (GRADUAL ANIMATION STAGES) */}
          <div className="absolute inset-0 pointer-events-none">
            {/* 1. Aşama: Organik Toprak & Çim Katmanı (Fade-in & Expand) */}
            {(animStage === 'soil' ||
              animStage === 'crops' ||
              animStage === 'solar' ||
              animStage === 'water' ||
              completedSteps.includes('soil-and-plants')) && (
              <div className="absolute inset-8 rounded-2xl bg-gradient-to-tr from-emerald-800 via-green-600 to-emerald-700 border-4 border-emerald-400 shadow-2xl flex flex-col items-center justify-center transition-all duration-700 ease-out animate-in zoom-in-75 fade-in">
                {/* Grass texture pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#15803d_2px,transparent_2px)] [background-size:12px_12px] opacity-40" />

                {/* Soil Beds & Sprouting Vegetables */}
                {(animStage === 'crops' ||
                  animStage === 'solar' ||
                  animStage === 'water' ||
                  completedSteps.includes('soil-and-plants')) && (
                  <div className="relative z-10 flex flex-col items-center gap-2 p-3 bg-stone-900/40 rounded-xl backdrop-blur-xs border border-emerald-300/40 animate-in zoom-in-90 duration-500">
                    <div className="text-xs font-black text-amber-200 flex items-center gap-1.5 drop-shadow">
                      <Leaf className="w-4 h-4 text-emerald-300 animate-bounce" />
                      <span>🌱 Organik Bostan &amp; Sebze Yatakları</span>
                    </div>
                    {/* Sprouting garden crops with staggered pop-up animation */}
                    <div className="flex items-center gap-3 text-2xl drop-shadow-md">
                      <span className="animate-in zoom-in duration-300 delay-100 hover:scale-125 transition-transform">
                        🍅
                      </span>
                      <span className="animate-in zoom-in duration-300 delay-200 hover:scale-125 transition-transform">
                        🥕
                      </span>
                      <span className="animate-in zoom-in duration-300 delay-300 hover:scale-125 transition-transform">
                        🥬
                      </span>
                      <span className="animate-in zoom-in duration-300 delay-400 hover:scale-125 transition-transform">
                        🌿
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Aşama: Güneş Panelleri (Staggered Sequential Deployment) */}
            {(animStage === 'solar' ||
              animStage === 'water' ||
              completedSteps.includes('solar-panels')) && (
              <div className="absolute top-6 left-10 right-10 flex items-center justify-between p-2 rounded-xl bg-blue-950/90 border border-blue-400 text-blue-100 shadow-2xl animate-in slide-in-from-top-6 duration-600">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  <span className="text-[11px]">Fotovoltaik Paneller ({visibleSolarCount || 4}/4)</span>
                </div>
                {/* 4 sequential solar panel units */}
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((panelIdx) => {
                    const isVisible = visibleSolarCount >= panelIdx || completedSteps.includes('solar-panels');
                    return (
                      <div
                        key={panelIdx}
                        className={`w-7 h-5 rounded border border-blue-200 transition-all duration-300 shadow-md ${
                          isVisible
                            ? 'bg-gradient-to-b from-sky-400 via-blue-600 to-blue-900 opacity-100 scale-100'
                            : 'opacity-0 scale-50'
                        }`}
                      >
                        <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-[1px] p-[1px]">
                          <div className="bg-sky-300/40 rounded-xs" />
                          <div className="bg-sky-300/40 rounded-xs" />
                          <div className="bg-sky-300/40 rounded-xs" />
                          <div className="bg-sky-300/40 rounded-xs" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Aşama: Yağmur Deposu & Damla Sulama */}
            {(animStage === 'water' || completedSteps.includes('water-irrigation')) && (
              <div className="absolute bottom-6 right-10 p-2.5 rounded-xl bg-cyan-950/90 border border-cyan-400 text-cyan-200 flex items-center gap-2 shadow-2xl animate-in zoom-in-75 duration-500">
                <Droplets className="w-5 h-5 text-cyan-400 animate-bounce" />
                <div>
                  <div className="text-[11px] font-black text-cyan-100">💧 Yağmur Hasat Deposu</div>
                  <div className="text-[9px] text-cyan-300 font-mono">Damla Sulama Devrede</div>
                </div>
              </div>
            )}
          </div>

          {/* 
            Phase 1: SCATTERED ROOFTOP TRASH (NO BOXES, NO SQUARE FRAMES!)
            Rendered directly on the concrete rooftop with natural ground shadows
          */}
          {!isTrashCleaned && (
            <div className="absolute inset-0">
              {trashItems.map((item) => {
                const isSelected = selectedItemId === item.id;
                const isDragging = draggedItemId === item.id;
                const isHovered = hoveredItemId === item.id;

                return (
                  <div
                    key={item.id}
                    data-testid={`trash-item-${item.id}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragEnd={handleDragEnd}
                    onMouseEnter={() => setHoveredItemId(item.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                    onClick={() => {
                      setSelectedItemId(item.id);
                      soundManager.playPickup();
                    }}
                    style={{
                      left: `${item.xPercent}%`,
                      top: `${item.yPercent}%`,
                      transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${
                        isDragging ? 1.3 : isSelected ? 1.2 : isHovered ? 1.15 : 1.0
                      })`,
                      transition: isDragging
                        ? 'none'
                        : 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.25s ease',
                      filter: isSelected
                        ? 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.95)) drop-shadow(0 8px 6px rgba(0,0,0,0.6))'
                        : isHovered
                        ? 'drop-shadow(0 0 8px rgba(52, 211, 153, 0.9)) drop-shadow(0 6px 4px rgba(0,0,0,0.5))'
                        : 'drop-shadow(0 6px 5px rgba(0,0,0,0.45))',
                    }}
                    className="absolute cursor-grab active:cursor-grabbing flex flex-col items-center justify-center select-none z-20"
                  >
                    {/* Natural Vector Sprite lying directly on ground */}
                    <WasteIcon spriteIndex={item.spriteIndex} size={54} />

                    {/* Subtle sleek floating tag shown only on hover/select, not boxed */}
                    {(isSelected || isHovered) && (
                      <div className="absolute -top-7 px-2 py-0.5 rounded-full bg-slate-950/90 text-amber-300 font-extrabold text-[10px] whitespace-nowrap shadow-xl border border-amber-400/80 animate-in fade-in zoom-in-75 duration-200 pointer-events-none flex items-center gap-1">
                        <span>{item.name}</span>
                        <span className="text-slate-400 font-normal">({item.category})</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Phase 1 Completion Prompt: Ready to Build */}
          {isTrashCleaned && completedSteps.length === 0 && !isBuildingAnimActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-950/75 backdrop-blur-[2px] z-10 animate-in fade-in duration-500">
              <div className="p-4 rounded-2xl bg-emerald-950/95 border-2 border-emerald-400 shadow-2xl text-center max-w-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 animate-bounce" />
                <h4 className="text-base font-extrabold text-white">Çatı Tertemiz Oldu!</h4>
                <p className="text-xs text-emerald-200 mt-1 mb-3">
                  Tüm atıklar başarıyla ayrıştırıldı. Şimdi çatıyı kademeli olarak yeşillendirebilirsiniz!
                </p>
                <button
                  onClick={triggerGradualBuildSequence}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Kademeli İnşaatı Başlat (2sn)</span>
                </button>
              </div>
            </div>
          )}

          {/* Active Construction Animation Overlay Indicator */}
          {isBuildingAnimActive && !isDecorationComplete && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-slate-950/90 border border-emerald-400/80 px-3.5 py-1.5 rounded-full text-xs text-emerald-300 font-black flex items-center gap-2 shadow-2xl animate-pulse">
              <Hammer className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
              <span>Kademeli Çatı İnşa Ediliyor...</span>
            </div>
          )}
        </div>

        {/* 4 COLOR-CODED RECYCLING BINS (DROP TARGETS) */}
        {!isTrashCleaned ? (
          <div className="w-full md:w-56 flex md:flex-col gap-2 shrink-0">
            <div className="text-[11px] font-extrabold text-slate-300 hidden md:flex items-center gap-1.5 px-1">
              <Recycle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Geri Dönüşüm Kutuları</span>
            </div>

            {RECYCLING_BINS.map((bin) => {
              const isHovered = activeBinCategory === bin.category;

              return (
                <div
                  key={bin.category}
                  data-testid={`bin-${bin.category}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setActiveBinCategory(bin.category);
                  }}
                  onDragLeave={() => setActiveBinCategory(null)}
                  onDrop={(e) => handleDropOnBin(e, bin.category)}
                  onClick={() => handleProcessSort(bin.category)}
                  className={`flex-1 md:flex-none p-2 sm:p-2.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2 bg-slate-900/90 ${
                    bin.borderColor
                  } ${
                    isHovered
                      ? 'scale-105 ring-4 ring-white shadow-2xl bg-slate-800'
                      : 'hover:border-white shadow-md active:scale-98'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">{bin.iconChar}</span>
                    <div>
                      <div className={`text-xs font-black ${bin.textColor}`}>{bin.name}</div>
                      <div className="text-[9px] text-slate-400">{bin.subName}</div>
                    </div>
                  </div>

                  <div className="hidden sm:flex text-[9px] font-bold text-slate-300 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                    Bırak ⬇
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* BOTTOM DECORATION & CONSTRUCTION TOOLBAR (PHASE 2) */}
      <div className="shrink-0 bg-slate-900/95 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-extrabold text-white">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Kademeli Çatı İnşası:</span>
          </div>

          <div className="flex items-center gap-2">
            {isTrashCleaned && !isDecorationComplete && (
              <button
                onClick={triggerGradualBuildSequence}
                disabled={isBuildingAnimActive}
                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[11px] flex items-center gap-1 shadow transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3 h-3 fill-slate-950" />
                <span>Otomatik Kademeli İnşa</span>
              </button>
            )}
            <div className="text-[10px] text-emerald-400 font-mono">
              İlerleme: {completedSteps.length} / {DECORATION_STEPS.length} Adım
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {DECORATION_STEPS.map((step) => {
            const isDone = completedSteps.includes(step.id);
            const isUnlocked =
              isTrashCleaned &&
              (step.order === 1 ||
                completedSteps.includes(
                  DECORATION_STEPS.find((s) => s.order === step.order - 1)?.id || 'soil-and-plants'
                ));

            return (
              <button
                key={step.id}
                data-testid={`decor-btn-${step.id}`}
                disabled={!isUnlocked || isDone || isFinishing || isBuildingAnimActive}
                onClick={() => handleApplyDecorationStep(step.id)}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                  isDone
                    ? 'bg-emerald-950/80 border-emerald-400 text-white shadow-md'
                    : isUnlocked
                    ? 'bg-slate-800/90 border-slate-600 hover:border-emerald-400 hover:bg-slate-700 text-slate-100 shadow-md cursor-pointer active:scale-98'
                    : 'bg-slate-950/50 border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{step.icon}</span>
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1">
                      <span>{step.title}</span>
                      {isDone && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </div>
                    <div className="text-[10px] text-slate-400">{step.benefit}</div>
                  </div>
                </div>

                <div className="text-[10px] font-bold shrink-0">
                  {isDone ? (
                    <span className="text-emerald-400 font-mono">Hazır ✔</span>
                  ) : isUnlocked ? (
                    <span className="text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      Uygula
                    </span>
                  ) : (
                    <span className="text-slate-500 font-mono">Kilitli</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
