export type CommodityId =
  | 'padi'
  | 'jagung'
  | 'kedelai'
  | 'sawit'
  | 'bawang_merah'
  | 'cabai'
  | 'tembakau'
  | 'gaharu'
  | 'sapi'
  | 'kerbau'
  | 'kambing'
  | 'ayam_itik';

export type SoilCondition = 'sangat_asam' | 'asam' | 'agak_asam' | 'ideal';

export interface CommodityConfig {
  id: CommodityId;
  name: string;
  category: 'Pangan' | 'Perkebunan' | 'Hortikultura' | 'Komoditas Khusus' | 'Peternakan';
  unitName?: 'Are' | 'Ekor';
  icon: string;
  defaultPricePerKg: number; // Untuk ternak: harga per ekor atau per kg bobot hidup
  conventionalYieldPerHaTon: number; // Ton per Hektar / Pertambahan bobot
  patenYieldPerHaTon: number;
  conventionalFertilizerCostPerHa: number; // Untuk ternak: biaya suplemen / vitamin kimia
  conventionalPesticideCostPerHa: number; // Untuk ternak: obat obatan sintetis / antibiotik
  patenBoxesPerHa: number; // Kebutuhan box Paten Gold / Hijau / Ternak
  patenImunBoxesPerHa: number; // Kebutuhan box Paten Imun
  complementaryChemicalCostPerHa: number;
  harvestDurationDays: number;
  description: string;
}

export type SoilTextureType =
  | 'lempung_berat'
  | 'lempung_berpasir'
  | 'gambut'
  | 'pasir'
  | 'aluvial'
  | 'kapur';

export interface SoilFertilityProfile {
  id: string;
  farmerName: string;
  locationName: string;
  phValue: number;
  texture: SoilTextureType;
  organicMatter: 'Rendah (<1%)' | 'Sedang (1-3%)' | 'Tinggi (>3%)';
  drainage: 'Cepat / Porus' | 'Baik / Ideal' | 'Terhambat / Becek';
  currentCrop: string;
  fertilityScore: number; // 0 - 100
  healthCategory: 'Sangat Buruk (Kritis)' | 'Kurang Subur' | 'Cukup Baik' | 'Sangat Subur';
  limitingFactors: string[];
  nutrientAvailability: {
    macro: { n: string; p: string; k: string; mg: string; ca: string };
    micro: { zn: string; fe: string; b: string; cu: string };
  };
  rennerProductRecommendation: {
    primaryProduct: string;
    supportProduct: string;
    dosageGuide: string;
    applicationMethod: string;
    targetBenefits: string[];
    recoverySchedule: string[];
  };
  createdAt: string;
}

export interface LandPlotLocation {
  id: string;
  name: string;
  farmerName: string;
  commodityId: CommodityId;
  commodityName: string;
  areaOrPopulation: number;
  unit: 'Are' | 'Ekor';
  phValue: number;
  soilCondition: SoilCondition;
  coordinates: {
    lat: number;
    lng: number;
  };
  addressName: string;
  notes?: string;
  registeredDate: string;
}

export interface SoilInfo {
  condition: SoilCondition;
  phRange: string;
  phValue: number;
  label: string;
  description: string;
  nutrientAbsorptionRate: number; // 0.3 to 1.0 (serapan pupuk kimia konvensional)
  patenAbsorptionRate: number; // 0.95 - 1.0 (nano stomata tetap terserap tinggi)
  color: string;
}

export interface CalculationResult {
  areaInAre: number;
  areaInM2: number;
  areaInHa: number;
  commodity: CommodityConfig;
  soil: SoilInfo;
  // Biaya Konvensional (Kimia)
  conventional: {
    fertilizerCost: number;
    pesticideCost: number;
    totalCost: number;
    yieldTon: number;
    yieldKg: number;
    revenue: number;
    netProfit: number;
    effectiveAbsorptionKg: number;
  };
  // Biaya Paten Gold / Hijau / Imun
  paten: {
    patenBoxes: number;
    patenCost: number;
    patenImunBoxes: number;
    patenImunCost: number;
    complementaryChemicalCost: number;
    reducedPesticideCost: number;
    totalCost: number;
    yieldTon: number;
    yieldKg: number;
    revenue: number;
    netProfit: number;
    sachetCount: number;
    tanksNeeded: number;
  };
  // Perbandingan & Penghematan
  savings: {
    operationalSavingsRp: number;
    operationalSavingsPercent: number;
    pesticideSavingsPercent: number;
    yieldIncreaseKg: number;
    yieldIncreasePercent: number;
    additionalProfitRp: number;
    profitIncreasePercent: number;
    roiPercent: number;
  };
}

export interface ScheduleItem {
  id: string;
  dayAfterPlanting: number; // HST
  title: string;
  actionType: 'Rendam Benih' | 'Semprot Kasar' | 'Semprot Halus' | 'Kocor Akar' | 'Tabur';
  products: string[];
  dosage: string;
  waterVolume: string;
  mixingInstruction: string;
  targetStomata: string;
  completed?: boolean;
}

export interface CropScheduleConfig {
  commodityId: CommodityId;
  name: string;
  schedules: ScheduleItem[];
  tips: string[];
}

export interface DiseaseDiagnosis {
  diseaseName: string;
  severity: 'Ringan' | 'Sedang' | 'Kritis';
  confidence: number;
  symptoms: string[];
  causes: string;
  patenRecommendation: {
    products: string[];
    dosage: string;
    frequency: string;
    instructions: string;
    savingsBenefit: string;
  };
  prevention: string;
  scannedAt: string;
  imageUrl?: string;
  cropName?: string;
}

export interface SensorData {
  timestamp: string;
  soilMoisture: number; // %
  soilTemperature: number; // C
  soilPh: number;
  conductivityEc: number; // mS/cm
  stomataStatus: string;
  batteryLevel: number;
  status: string;
}

export interface WeatherDay {
  dayName: string;
  date: string;
  tempMin: number;
  tempMax: number;
  condition: 'Cerah' | 'Cerah Berawan' | 'Hujan Ringan' | 'Hujan Lebat' | 'Berawan';
  humidity: number;
  rainProbability: number;
  sprayingRecommendation: 'Sangat Baik' | 'Baik' | 'Hindari (Potensi Hujan)' | 'Hati-hati';
  rainfallMm?: number; // Curah hujan harian terukur / terprediksi (mm)
  uvIndex?: number;
}

export interface HarvestRecord {
  id: string;
  date: string;
  seasonName: string;
  commodityName: string;
  areaInAre: number;
  method: 'Paten Nano' | 'Kimia Konvensional';
  yieldKg: number;
  revenueRp: number;
  costRp: number;
  profitRp: number;
  notes: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'jadwal' | 'sensor' | 'penyakit' | 'cuaca';
  date: string;
  isRead: boolean;
  priority: 'normal' | 'kritis';
}

export interface ForumComment {
  id: string;
  authorName: string;
  authorLocation: string;
  content: string;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  authorName: string;
  authorLocation: string;
  authorRole: 'Petani Mitra' | 'Agronomis Renner' | 'Ketua Gapoktan' | 'Peternak';
  avatarEmoji: string;
  title: string;
  content: string;
  category: 'Semua Topik' | 'Tips & Teknik' | 'Testimoni & Panen' | 'Tanya Hama & Solusi' | 'Peternakan';
  commodityTag?: string;
  productsUsed: string[];
  imageUrl?: string;
  likesCount: number;
  isLiked?: boolean;
  commentsCount: number;
  comments: ForumComment[];
  createdAt: string;
  isVerified?: boolean;
  // Community Tips & Trik and Paten Gold Harvest Success features
  isCommunityTip?: boolean;
  harvestSuccessStory?: {
    isPatenGoldSuccess: boolean;
    cropName: string;
    yieldBeforeKg?: number;
    yieldAfterKg?: number;
    increasePercent?: number;
    photoCaption?: string;
  };
  ratings?: {
    averageRating: number; // e.g. 4.9
    totalRatings: number; // e.g. 38
    userRating?: number; // 1-5 stars from current user
  };
}

export interface PestOutbreakReport {
  id: string;
  diseaseName: string;
  cropName: string;
  severity: 'Ringan' | 'Sedang' | 'Kritis';
  confidence: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  regionName: string;
  reportedAt: string;
  anonymousReporter: string;
  symptoms: string[];
  patenRecommendation: {
    products: string[];
    dosage: string;
    instructions: string;
  };
  imageUrl?: string;
  notes?: string;
}

// Daily Farmer Task Types
export type TaskCategory =
  | 'penyiraman'
  | 'pengecekan_hama'
  | 'pemupukan'
  | 'pengolahan_tanah'
  | 'panen'
  | 'pakan_ternak'
  | 'lainnya';

export type TaskPriority = 'tinggi' | 'sedang' | 'rendah';

export interface FarmerDailyTask {
  id: string;
  title: string;
  category: TaskCategory;
  commodityId: CommodityId;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: TaskPriority;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
  isAutoGenerated?: boolean; // Dari jadwal tanam HST
  sourceScheduleItemTitle?: string;
  createdAt: string;
}

// Plant Nutrient Demand Calculator Types
export type GrowthStage =
  | 'olah_tanah'
  | 'vegetatif_awal'
  | 'vegetatif_aktif'
  | 'generatif_bunga'
  | 'pengisian_buah'
  | 'pematangan';

export interface NutrientDemandResult {
  commodityName: string;
  growthStage: GrowthStage;
  stageName: string;
  areaInAre: number;
  macroNutrients: {
    nitrogenKg: number;
    phosphorusKg: number;
    potassiumKg: number;
    calciumKg: number;
    magnesiumKg: number;
  };
  microNutrients: {
    zincPpm: number;
    ironPpm: number;
    boronPpm: number;
    copperPpm: number;
  };
  nutrientFocus: string;
  recommendedRennerProducts: {
    productName: 'Paten Hijau' | 'Paten Gold' | 'Paten Imun';
    role: string;
    sachetCount: number;
    mixingWaterLiters: number;
    applicationMethod: 'Semprot Daun' | 'Kocor Tanah' | 'Campur Air Minum/Pakan';
    bestTime: string;
    whyEffective: string;
  }[];
  chemicalComparisonSavings: {
    conventionalFertilizerNeededKg: number;
    conventionalCostRp: number;
    patenCostRp: number;
    savingsRp: number;
    savingsPercent: number;
  };
}


