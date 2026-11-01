/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  LEVELS,
  INITIAL_CONFIG_V2,
  updateTemperatureV2,
  cleanRoofAndCool,
  evaluateGameStatusV2,
} from './game/rules';
import { ThermometerBar } from './components/ThermometerBar';
import { CityView, RoofBuilding } from './components/CityView';
import { RecyclingStation } from './components/RecyclingStation';
import { UnityScriptViewer } from './components/UnityScriptViewer';
import { UnitySetupGuide } from './components/UnitySetupGuide';
import { GameOverModal, VictoryModal } from './components/GameModals';
import { soundManager } from './utils/audio';
import {
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Code2,
  BookOpen,
  Gamepad2,
  Timer,
  Award,
  Leaf,
  Layers,
  Sparkles,
} from 'lucide-react';

const INITIAL_ROOF_BUILDINGS: RoofBuilding[] = [
  // Top row
  { id: 0, name: 'Bina 1 (Kuzeybatı)', xPercent: 27, yPercent: 21, isCleaned: false, wasteSpriteIndex: 0, activeInLevel1: false },
  { id: 1, name: 'Bina 2 (Kuzey)', xPercent: 50, yPercent: 15, isCleaned: false, wasteSpriteIndex: 1, activeInLevel1: true },
  { id: 2, name: 'Bina 3 (Kuzeydoğu)', xPercent: 71, yPercent: 21, isCleaned: false, wasteSpriteIndex: 2, activeInLevel1: false },
  // Mid row
  { id: 3, name: 'Bina 4 (Batı)', xPercent: 18, yPercent: 42, isCleaned: false, wasteSpriteIndex: 1, activeInLevel1: true },
  { id: 4, name: 'Bina 5 (Merkez Bostan)', xPercent: 50, yPercent: 45, isCleaned: false, wasteSpriteIndex: 3, activeInLevel1: true },
  { id: 5, name: 'Bina 6 (Doğu)', xPercent: 82, yPercent: 42, isCleaned: false, wasteSpriteIndex: 0, activeInLevel1: true },
  // Bottom row
  { id: 6, name: 'Bina 7 (Güneybatı)', xPercent: 34, yPercent: 60, isCleaned: false, wasteSpriteIndex: 2, activeInLevel1: false },
  { id: 7, name: 'Bina 8 (Güney)', xPercent: 50, yPercent: 74, isCleaned: false, wasteSpriteIndex: 0, activeInLevel1: true },
  { id: 8, name: 'Bina 9 (Güneydoğu)', xPercent: 66, yPercent: 60, isCleaned: false, wasteSpriteIndex: 1, activeInLevel1: false },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'game' | 'scripts' | 'guide'>('game');

  // Level & Game State
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(LEVELS[0].timeLimit);
  const [temperature, setTemperature] = useState<number>(INITIAL_CONFIG_V2.START_TEMPERATURE);
  const [score, setScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // In-place camera zoom & live cleanup target
  const [focusedBuildingId, setFocusedBuildingId] = useState<number | null>(null);

  // Buildings state
  const [buildings, setBuildings] = useState<RoofBuilding[]>(INITIAL_ROOF_BUILDINGS);

  // Animation frame loop refs
  const lastTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const isGameOverRef = useRef(isGameOver);
  isGameOverRef.current = isGameOver;
  const isVictoryRef = useRef(isVictory);
  isVictoryRef.current = isVictory;
  const isZoomingRef = useRef(isZooming);
  isZoomingRef.current = isZooming;
  const focusedBuildingIdRef = useRef(focusedBuildingId);
  focusedBuildingIdRef.current = focusedBuildingId;

  const currentLevelConfig = LEVELS[currentLevelIndex] || LEVELS[0];

  // Auto-start query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      startGame();
    }
  }, []);

  // Keyboard shortcut for start
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isPlaying && !isGameOver && !isVictory && focusedBuildingId === null) {
        e.preventDefault();
        startGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, isVictory, focusedBuildingId]);

  // Tab change handler
  const handleTabChange = (tab: 'game' | 'scripts' | 'guide') => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (tab !== 'game' && isPlaying) {
      setIsPlaying(false);
    }
  };

  // 60fps simulation loop
  useEffect(() => {
    if (!isPlaying || isGameOver || isVictory || isZooming || activeTab !== 'game') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (currentTime: number) => {
      const rawDt = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;
      const dt = Math.min(rawDt, 0.05);

      if (isPlayingRef.current && !isGameOverRef.current && !isVictoryRef.current && !isZoomingRef.current) {
        // Countdown timer (only ticks when not in focused cleanup animation)
        if (focusedBuildingIdRef.current === null) {
          setTimeRemaining((prevTime) => Math.max(0, prevTime - dt));

          // Temperature climb (+2°C/s)
          setTemperature((prevTemp) =>
            updateTemperatureV2(prevTemp, dt, currentLevelConfig.tempIncreaseRate)
          );
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, isGameOver, isVictory, isZooming, activeTab, currentLevelConfig]);

  // Check game over
  useEffect(() => {
    if (!isPlaying || isGameOver || isVictory) return;

    if (temperature >= INITIAL_CONFIG_V2.MAX_TEMPERATURE) {
      setIsGameOver(true);
      setIsPlaying(false);
      setFocusedBuildingId(null);
    } else if (timeRemaining <= 0) {
      setIsGameOver(true);
      setIsPlaying(false);
      setFocusedBuildingId(null);
    }
  }, [temperature, timeRemaining, isPlaying, isGameOver, isVictory]);

  // Start / Restart game
  const startGame = () => {
    setCurrentLevelIndex(0);
    setTimeRemaining(LEVELS[0].timeLimit);
    setTemperature(INITIAL_CONFIG_V2.START_TEMPERATURE);
    setScore(0);
    setIsGameOver(false);
    setIsVictory(false);
    setIsZooming(false);
    setFocusedBuildingId(null);
    setBuildings(
      INITIAL_ROOF_BUILDINGS.map((b) => ({
        ...b,
        isCleaned: false,
      }))
    );
    setIsPlaying(true);
    soundManager.playPickup();
  };

  // Triggered when in-place visible cleanup is completed
  const handleCompleteBuildingCleanup = (buildingId: number) => {
    // 1. Mark roof cleaned
    const updated = buildings.map((b) => (b.id === buildingId ? { ...b, isCleaned: true } : b));
    setBuildings(updated);

    // 2. Reduce temperature by 15°C
    setTemperature((prev) => cleanRoofAndCool(prev, currentLevelConfig.tempCoolingPerRoof));

    // 3. Add eco score
    setScore((prev) => prev + 250);

    // 4. Evaluate level progression
    const activeBuildings = updated.filter((b) =>
      currentLevelIndex === 0 ? b.activeInLevel1 : true
    );
    const cleanedCount = activeBuildings.filter((b) => b.isCleaned).length;

    const { isVictory: victory, shouldAdvanceLevel } = evaluateGameStatusV2(
      temperature,
      timeRemaining,
      currentLevelIndex,
      cleanedCount
    );

    if (victory) {
      setIsVictory(true);
      setIsPlaying(false);
    } else if (shouldAdvanceLevel) {
      setIsZooming(true);
      soundManager.playVictory();

      setTimeout(() => {
        setCurrentLevelIndex(1);
        setTimeRemaining(LEVELS[1].timeLimit);
        setBuildings(
          INITIAL_ROOF_BUILDINGS.map((b) => ({
            ...b,
            isCleaned: false,
          }))
        );
        setIsZooming(false);
      }, 2000);
    }
  };

  const toggleSound = () => {
    soundManager.isMuted = !isMuted;
    setIsMuted(!isMuted);
  };

  const currentLevelBuildings = buildings.filter((b) =>
    currentLevelIndex === 0 ? b.activeInLevel1 : true
  );
  const cleanedInLevel = currentLevelBuildings.filter((b) => b.isCleaned).length;

  return (
    <div
      data-testid="app-container"
      data-state={isPlaying ? 'playing' : isGameOver ? 'gameover' : isVictory ? 'victory' : 'menu'}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white"
    >
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>Çatı Çiftliği</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 hidden sm:inline">
                  Akıcı Zoom &amp; Canlı Temizlik (Modalsız)
                </span>
              </h1>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => handleTabChange('game')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'game'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Oyna &amp; Test Et</span>
            </button>

            <button
              onClick={() => handleTabChange('scripts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'scripts'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Unity C# Kodları</span>
            </button>

            <button
              onClick={() => handleTabChange('guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'guide'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kurulum Rehberi</span>
              <span className="sm:hidden">Rehber</span>
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-5 flex flex-col justify-start">
        {activeTab === 'game' && (
          <div className="flex flex-col gap-3.5">
            {/* Top Perimeter HUD */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-4xl w-full mx-auto">
              {/* Level Tracker */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Aktif Seviye
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-white truncate">
                    {currentLevelConfig.name.split(':')[0]}
                  </div>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Süre Sayacı
                  </div>
                  <div
                    data-testid="timer-display"
                    className={`text-lg sm:text-xl font-mono font-black tabular-nums ${
                      timeRemaining <= 10 ? 'text-rose-400 animate-pulse' : 'text-white'
                    }`}
                  >
                    {Math.ceil(timeRemaining)}s
                  </div>
                </div>
              </div>

              {/* Eco Score */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Eko Puan
                  </div>
                  <div className="text-lg sm:text-xl font-mono font-black text-amber-300 tabular-nums">
                    {score}
                  </div>
                </div>
              </div>

              {/* Start / Reset CTA */}
              <div className="flex items-center gap-2">
                {!isPlaying ? (
                  <button
                    onClick={startGame}
                    className="w-full h-full min-h-[50px] rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Oyunu Başlat</span>
                  </button>
                ) : (
                  <button
                    onClick={startGame}
                    className="w-full h-full min-h-[50px] rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-emerald-400" />
                    <span>Yeniden Başlat</span>
                  </button>
                )}
              </div>
            </div>

            {/* Real Thermometer Bar Indicator */}
            <ThermometerBar temperature={temperature} isGameOver={isGameOver} />

            {/* Isometric City View with In-Place Camera Zoom & Live Cleanup (No separate page!) */}
            <CityView
              buildings={buildings}
              onBuildingCleaned={handleCompleteBuildingCleanup}
              currentLevelNumber={currentLevelConfig.levelNumber}
              isLevelZooming={isZooming}
              focusedBuildingId={focusedBuildingId}
              onSetFocusedBuildingId={setFocusedBuildingId}
              isPlaying={isPlaying}
            />

            {/* Recycling Station & Level Status */}
            <RecyclingStation
              cleanedCount={cleanedInLevel}
              totalRequired={currentLevelConfig.requiredRoofs}
              currentLevelName={currentLevelConfig.name}
              totalScore={score}
              temperature={temperature}
            />

            {/* Action Bar Guide */}
            <div className="max-w-4xl w-full mx-auto bg-slate-900/60 rounded-xl p-3 border border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Akıcı Yerinde Zoom &amp; Canlı Temizlik:</strong> Bir çatıya tıkladığınızda kamera binaya yavaşça yaklaşır; atıkların toplanıp yeşil bostana ve güneş panellerine dönüşmesini canlı olarak izlersiniz!
                </span>
              </div>
              <button
                onClick={() => handleTabChange('scripts')}
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 shrink-0 underline underline-offset-2"
              >
                <span>C# Kodlarını İncele &amp; İndir</span>
                <span>➔</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'scripts' && <UnityScriptViewer />}
        {activeTab === 'guide' && <UnitySetupGuide />}
      </main>

      {/* Game Modals */}
      {isGameOver && (
        <GameOverModal
          score={score}
          convertedRoofs={buildings.filter((b) => b.isCleaned).length}
          timeRemaining={timeRemaining}
          onRestart={startGame}
          onOpenScripts={() => {
            setIsGameOver(false);
            handleTabChange('scripts');
          }}
        />
      )}

      {isVictory && (
        <VictoryModal
          score={score}
          convertedRoofs={buildings.filter((b) => b.isCleaned).length}
          timeRemaining={timeRemaining}
          temperature={temperature}
          onRestart={startGame}
          onOpenScripts={() => {
            setIsVictory(false);
            handleTabChange('scripts');
          }}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 py-3 text-center text-[11px] text-slate-500">
        Çatı Çiftliği (Rooftop Farm) · Sürdürülebilirlik &amp; Sıfır Atık Hackathon Paketi · Akıcı Zoom &amp; Canlı Temizlik
      </footer>
    </div>
  );
}
