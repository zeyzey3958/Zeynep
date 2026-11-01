/**
 * Pure game rules for Çatı Çiftliği (Rooftop Farm) - V2 Tap & Clean Mechanic
 * Level 1: Mahalle (5 buildings) -> Camera Zoom -> Level 2: Metropol (9 buildings)
 */

export interface LevelConfig {
  levelNumber: number;
  name: string;
  description: string;
  requiredRoofs: number;
  timeLimit: number;
  tempIncreaseRate: number; // °C per second
  tempCoolingPerRoof: number; // °C reduction per clean roof
}

export const LEVELS: LevelConfig[] = [
  {
    levelNumber: 1,
    name: 'Seviye 1: Konut Mahallesi',
    description: 'Mahalledeki 5 binanın çatısındaki çöpleri toplayıp bostanlara dönüştürün.',
    requiredRoofs: 5,
    timeLimit: 60,
    tempIncreaseRate: 2.0,
    tempCoolingPerRoof: 15.0,
  },
  {
    levelNumber: 2,
    name: 'Seviye 2: Büyük Metropol & Sanayi',
    description: 'Genişleyen şehirdeki 9 binanın tamamını yeşillendirerek iklim krizini durdurun!',
    requiredRoofs: 9,
    timeLimit: 60,
    tempIncreaseRate: 2.8,
    tempCoolingPerRoof: 15.0,
  },
];

export const INITIAL_CONFIG_V2 = {
  MAX_TEMPERATURE: 100,
  MIN_TEMPERATURE: 0,
  START_TEMPERATURE: 25,
  SCORE_PER_CLEANUP: 150,
} as const;

/**
 * Calculates updated temperature based on delta time and level heat rate
 */
export function updateTemperatureV2(
  currentTemp: number,
  dtSeconds: number,
  ratePerSecond: number,
  maxTemp: number = INITIAL_CONFIG_V2.MAX_TEMPERATURE
): number {
  const next = currentTemp + ratePerSecond * dtSeconds;
  return Math.min(maxTemp, Math.max(INITIAL_CONFIG_V2.MIN_TEMPERATURE, next));
}

/**
 * Reduces temperature when a dirty roof is cleaned and transformed into a green garden
 */
export function cleanRoofAndCool(
  currentTemp: number,
  coolingAmount: number = 15.0,
  minTemp: number = INITIAL_CONFIG_V2.MIN_TEMPERATURE
): number {
  return Math.max(minTemp, currentTemp - coolingAmount);
}

/**
 * Evaluates whether current level is completed
 */
export function isLevelCompleted(cleanedRoofsCount: number, requiredRoofsCount: number): boolean {
  return cleanedRoofsCount >= requiredRoofsCount;
}

/**
 * Checks overall game status (Game Over if temperature hits 100, or Victory if final level cleared)
 */
export function evaluateGameStatusV2(
  temperature: number,
  timeRemaining: number,
  currentLevelIndex: number,
  cleanedInCurrentLevel: number
): { isGameOver: boolean; isVictory: boolean; shouldAdvanceLevel: boolean } {
  // If temperature hits 100, game over
  if (temperature >= INITIAL_CONFIG_V2.MAX_TEMPERATURE) {
    return { isGameOver: true, isVictory: false, shouldAdvanceLevel: false };
  }

  // If time runs out
  if (timeRemaining <= 0) {
    return { isGameOver: true, isVictory: false, shouldAdvanceLevel: false };
  }

  const currentLevelConfig = LEVELS[currentLevelIndex] || LEVELS[0];
  const levelDone = cleanedInCurrentLevel >= currentLevelConfig.requiredRoofs;

  if (levelDone) {
    if (currentLevelIndex >= LEVELS.length - 1) {
      // Last level cleared = Complete Grand Victory!
      return { isGameOver: false, isVictory: true, shouldAdvanceLevel: false };
    } else {
      // Advance to next level!
      return { isGameOver: false, isVictory: false, shouldAdvanceLevel: true };
    }
  }

  return { isGameOver: false, isVictory: false, shouldAdvanceLevel: false };
}

export type WasteCategory = 'plastic' | 'paper' | 'organic' | 'metal';

export interface RooftopTrashItem {
  id: string;
  name: string;
  category: WasteCategory;
  spriteIndex: number; // index for WasteIcon or sprite sheet (0: apple, 1: paper, 2: bottle, 3: liquid/metal)
  xPercent: number; // position on zoomed rooftop surface (20% - 80%)
  yPercent: number; // position on zoomed rooftop surface (25% - 75%)
  rotation: number;
}

export interface WasteCategoryBin {
  category: WasteCategory;
  name: string;
  subName: string;
  colorName: string;
  badgeBg: string;
  borderColor: string;
  textColor: string;
  iconChar: string;
}

export const RECYCLING_BINS: WasteCategoryBin[] = [
  {
    category: 'organic',
    name: 'Organik',
    subName: 'Kompost Gübre',
    colorName: 'emerald',
    badgeBg: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-400',
    iconChar: '🍏',
  },
  {
    category: 'paper',
    name: 'Kağıt & Karton',
    subName: 'Geri Dönüşüm',
    colorName: 'blue',
    badgeBg: 'bg-blue-500/20',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-400',
    iconChar: '📄',
  },
  {
    category: 'plastic',
    name: 'Plastik',
    subName: 'Geri Dönüşüm',
    colorName: 'amber',
    badgeBg: 'bg-amber-500/20',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-400',
    iconChar: '🧴',
  },
  {
    category: 'metal',
    name: 'Metal & Sıvı',
    subName: 'Geri Dönüşüm',
    colorName: 'purple',
    badgeBg: 'bg-purple-500/20',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-400',
    iconChar: '🥫',
  },
];

export type DecorationStepId = 'soil-and-plants' | 'solar-panels' | 'water-irrigation';

export interface RooftopDecorationStep {
  id: DecorationStepId;
  order: number;
  title: string;
  shortLabel: string;
  description: string;
  icon: string;
  benefit: string;
}

export const DECORATION_STEPS: RooftopDecorationStep[] = [
  {
    id: 'soil-and-plants',
    order: 1,
    title: '1. Toprak & Yeşillendir',
    shortLabel: 'Organik Bostan',
    description: 'Kompost toprağı serin ve domates, havuç, marul sebze tarhları oluşturun.',
    icon: '🌱',
    benefit: 'Kentsel Isıyı Azaltır & Gıda Üretir',
  },
  {
    id: 'solar-panels',
    order: 2,
    title: '2. Güneş Panelleri Yerleştir',
    shortLabel: 'Güneş Paneli',
    description: 'Çatının kenarlarına fotovoltaik temiz enerji panelleri monte edin.',
    icon: '☀️',
    benefit: 'Sıfır Karbon Temiz Enerji',
  },
  {
    id: 'water-irrigation',
    order: 3,
    title: '3. Yağmur Deposu & Sulama',
    shortLabel: 'Yağmur Deposu',
    description: 'Yağmur suyu hasat tankı ve akıllı damla sulama hattı kurun.',
    icon: '🌧️',
    benefit: 'Su Tasarrufu & Otomatik Bakım',
  },
];

/**
 * Validates if the waste item matches the drop target category bin
 */
export function validateWasteSorting(itemCategory: WasteCategory, targetCategory: WasteCategory): boolean {
  return itemCategory === targetCategory;
}

/**
 * Generates an engaging scattered set of 4-5 trash items for a given building
 */
export function generateBuildingTrashItems(buildingId: number): RooftopTrashItem[] {
  const templates: Array<{ name: string; category: WasteCategory; spriteIndex: number }> = [
    { name: 'Plastik Su Şişesi', category: 'plastic', spriteIndex: 2 },
    { name: 'Buruşuk Gazete & Kağıt', category: 'paper', spriteIndex: 1 },
    { name: 'Elma Çöpü & Meyve Artığı', category: 'organic', spriteIndex: 0 },
    { name: 'Plastik Meşrubat Bardağı', category: 'plastic', spriteIndex: 2 },
    { name: 'Metal Meşrubat Kutusu', category: 'metal', spriteIndex: 3 },
  ];

  // Scatter them across the rooftop surface with fixed or seeded deterministic coordinates
  const positions = [
    { x: 30, y: 35, rot: -12 },
    { x: 65, y: 32, rot: 18 },
    { x: 48, y: 52, rot: 8 },
    { x: 26, y: 68, rot: -22 },
    { x: 72, y: 64, rot: 15 },
  ];

  return templates.map((tmpl, idx) => ({
    id: `trash-b${buildingId}-${idx}`,
    name: tmpl.name,
    category: tmpl.category,
    spriteIndex: tmpl.spriteIndex,
    xPercent: positions[idx].x,
    yPercent: positions[idx].y,
    rotation: positions[idx].rot,
  }));
}
