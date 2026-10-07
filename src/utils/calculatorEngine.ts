import { CommodityId, CommodityConfig, SoilCondition, CalculationResult } from '../types';
import { SOIL_CONDITIONS } from '../data/soilKnowledge';

export const COMMODITIES: Record<CommodityId, CommodityConfig> = {
  padi: {
    id: 'padi',
    name: 'Padi Sawah (GKG)',
    category: 'Pangan',
    unitName: 'Are',
    icon: '🌾',
    defaultPricePerKg: 7500,
    conventionalYieldPerHaTon: 5.5,
    patenYieldPerHaTon: 8.8,
    conventionalFertilizerCostPerHa: 5200000,
    conventionalPesticideCostPerHa: 2400000,
    patenBoxesPerHa: 6,
    patenImunBoxesPerHa: 4,
    complementaryChemicalCostPerHa: 1560000, // 30% kimia awal
    harvestDurationDays: 105,
    description: 'Padi sawah irigasi & tadah hujan. Paten Gold memacu anakan produktif hingga 40-50 rumpun dan bulir terisi penuh tanpa hampa.'
  },
  jagung: {
    id: 'jagung',
    name: 'Jagung Hibrida Pipil',
    category: 'Pangan',
    unitName: 'Are',
    icon: '🌽',
    defaultPricePerKg: 5800,
    conventionalYieldPerHaTon: 6.2,
    patenYieldPerHaTon: 9.6,
    conventionalFertilizerCostPerHa: 4800000,
    conventionalPesticideCostPerHa: 2000000,
    patenBoxesPerHa: 5,
    patenImunBoxesPerHa: 3,
    complementaryChemicalCostPerHa: 1440000,
    harvestDurationDays: 100,
    description: 'Sentra jagung Dompu & NTB. 2 tongkol raksasa per batang, rendemen pipil kering padat berbobot tinggi.'
  },
  kedelai: {
    id: 'kedelai',
    name: 'Kedelai Biji Kering',
    category: 'Pangan',
    unitName: 'Are',
    icon: '🫘',
    defaultPricePerKg: 11500,
    conventionalYieldPerHaTon: 1.6,
    patenYieldPerHaTon: 2.8,
    conventionalFertilizerCostPerHa: 3400000,
    conventionalPesticideCostPerHa: 1800000,
    patenBoxesPerHa: 4,
    patenImunBoxesPerHa: 3,
    complementaryChemicalCostPerHa: 1020000,
    harvestDurationDays: 85,
    description: 'Polong isi 3-4 bernas rapat, bintil akar rhizobium aktif mengikat nitrogen alami.'
  },
  sawit: {
    id: 'sawit',
    name: 'Kelapa Sawit (TBS)',
    category: 'Perkebunan',
    unitName: 'Are',
    icon: '🌴',
    defaultPricePerKg: 2800,
    conventionalYieldPerHaTon: 22.0,
    patenYieldPerHaTon: 34.0,
    conventionalFertilizerCostPerHa: 8500000,
    conventionalPesticideCostPerHa: 2500000,
    patenBoxesPerHa: 8,
    patenImunBoxesPerHa: 4,
    complementaryChemicalCostPerHa: 2550000,
    harvestDurationDays: 365,
    description: 'Aplikasi kocor/semprot pelepah Paten Gold. Bobot janjang TBS naik 30-50%, brondolan rapat kadar CPO tinggi.'
  },
  bawang_merah: {
    id: 'bawang_merah',
    name: 'Bawang Merah Super',
    category: 'Hortikultura',
    unitName: 'Are',
    icon: '🧅',
    defaultPricePerKg: 28000,
    conventionalYieldPerHaTon: 8.5,
    patenYieldPerHaTon: 13.5,
    conventionalFertilizerCostPerHa: 9800000,
    conventionalPesticideCostPerHa: 5500000,
    patenBoxesPerHa: 8,
    patenImunBoxesPerHa: 6,
    complementaryChemicalCostPerHa: 2940000,
    harvestDurationDays: 60,
    description: 'Sentra Bima & Brebes. Umbi padat warna merah menyala mengkilap, tahan simpan dan bebas moler.'
  },
  cabai: {
    id: 'cabai',
    name: 'Cabai Rawit / Merah',
    category: 'Hortikultura',
    unitName: 'Are',
    icon: '🌶️',
    defaultPricePerKg: 35000,
    conventionalYieldPerHaTon: 7.0,
    patenYieldPerHaTon: 12.0,
    conventionalFertilizerCostPerHa: 11000000,
    conventionalPesticideCostPerHa: 6500000,
    patenBoxesPerHa: 9,
    patenImunBoxesPerHa: 6,
    complementaryChemicalCostPerHa: 3300000,
    harvestDurationDays: 120,
    description: 'Bunga tidak mudah rontok, buah berbobot pedas keras, kebal antraknosa (patek) dan keriting virus kuning.'
  },
  tembakau: {
    id: 'tembakau',
    name: 'Tembakau Virginia Rajangan',
    category: 'Komoditas Khusus',
    unitName: 'Are',
    icon: '🍂',
    defaultPricePerKg: 45000,
    conventionalYieldPerHaTon: 1.4,
    patenYieldPerHaTon: 2.2,
    conventionalFertilizerCostPerHa: 6200000,
    conventionalPesticideCostPerHa: 3200000,
    patenBoxesPerHa: 6,
    patenImunBoxesPerHa: 4,
    complementaryChemicalCostPerHa: 1860000,
    harvestDurationDays: 85,
    description: 'Sentra Lombok & Madura. Daun lebar tebal elastis, aroma kuat, warna krosok kuning emas grade A harga puncak.'
  },
  gaharu: {
    id: 'gaharu',
    name: 'Pohon Gaharu / Kayu Hutan',
    category: 'Komoditas Khusus',
    unitName: 'Are',
    icon: '🪵',
    defaultPricePerKg: 150000,
    conventionalYieldPerHaTon: 0.8,
    patenYieldPerHaTon: 1.5,
    conventionalFertilizerCostPerHa: 7500000,
    conventionalPesticideCostPerHa: 2000000,
    patenBoxesPerHa: 6,
    patenImunBoxesPerHa: 4,
    complementaryChemicalCostPerHa: 2250000,
    harvestDurationDays: 365,
    description: 'Mempercepat translokasi gubal inokulasi resin wangi dan mempertebal kambium lingkar pohon.'
  },
  sapi: {
    id: 'sapi',
    name: 'Sapi Potong & Penggemukan',
    category: 'Peternakan',
    unitName: 'Ekor',
    icon: '🐂',
    defaultPricePerKg: 52000,
    conventionalYieldPerHaTon: 0.7, // Rata-rata bobot akhir per ekor (700 kg)
    patenYieldPerHaTon: 0.95, // 950 kg dengan ADG tinggi
    conventionalFertilizerCostPerHa: 1800000, // Biaya vitamin/suplemen kimia per ekor
    conventionalPesticideCostPerHa: 900000, // Obat antibiotik/cacing sintetis per ekor
    patenBoxesPerHa: 2, // 2 box per ekor selama periode penggemukan
    patenImunBoxesPerHa: 1,
    complementaryChemicalCostPerHa: 540000,
    harvestDurationDays: 90,
    description: 'Dicampur air minum/komboran. Nafsu makan luar biasa, feses tidak bau amonia lalat, bobot naik 1.2-1.5 kg/hari.'
  },
  kerbau: {
    id: 'kerbau',
    name: 'Kerbau Pekerja & Daging',
    category: 'Peternakan',
    unitName: 'Ekor',
    icon: '🐃',
    defaultPricePerKg: 48000,
    conventionalYieldPerHaTon: 0.65,
    patenYieldPerHaTon: 0.88,
    conventionalFertilizerCostPerHa: 1600000,
    conventionalPesticideCostPerHa: 800000,
    patenBoxesPerHa: 2,
    patenImunBoxesPerHa: 1,
    complementaryChemicalCostPerHa: 480000,
    harvestDurationDays: 90,
    description: 'Tenaga kuat tahan cuaca ekstrem, daging padat serat berkualitas, kotoran cepat terurai jadi pupuk organik super.'
  },
  kambing: {
    id: 'kambing',
    name: 'Kambing / Domba Penggemukan',
    category: 'Peternakan',
    unitName: 'Ekor',
    icon: '🐐',
    defaultPricePerKg: 75000,
    conventionalYieldPerHaTon: 0.035, // 35 kg
    patenYieldPerHaTon: 0.052, // 52 kg
    conventionalFertilizerCostPerHa: 350000,
    conventionalPesticideCostPerHa: 180000,
    patenBoxesPerHa: 0.5,
    patenImunBoxesPerHa: 0.25,
    complementaryChemicalCostPerHa: 105000,
    harvestDurationDays: 75,
    description: 'Pertumbuhan bulu mengkilap halus, terhindar kembung dan diare, karkas daging padat tanpa lemak berlebih.'
  },
  ayam_itik: {
    id: 'ayam_itik',
    name: 'Unggas (Ayam Broiler / Itik)',
    category: 'Peternakan',
    unitName: 'Ekor',
    icon: '🐓',
    defaultPricePerKg: 24000,
    conventionalYieldPerHaTon: 0.002, // 2 kg
    patenYieldPerHaTon: 0.0026, // 2.6 kg
    conventionalFertilizerCostPerHa: 15000,
    conventionalPesticideCostPerHa: 8000,
    patenBoxesPerHa: 0.02,
    patenImunBoxesPerHa: 0.01,
    complementaryChemicalCostPerHa: 4500,
    harvestDurationDays: 35,
    description: 'Mortalitas turun drastis di bawah 2%, FCR pakan sangat hemat, bau kotoran kandang berkurang 90%.'
  }
};

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 1
  }).format(num);
}

export const PATEN_BOX_PRICE = 200000; // Rp 200.000 per box
export const PATEN_IMUN_BOX_PRICE = 200000; // Rp 200.000 per box

export function calculateFarmAnalysis(
  areaInAre: number,
  commodityId: CommodityId,
  soilCondition: SoilCondition = 'asam',
  customPricePerKg?: number
): CalculationResult {
  const comm = COMMODITIES[commodityId] || COMMODITIES.padi;
  const soil = SOIL_CONDITIONS[soilCondition] || SOIL_CONDITIONS.asam;
  const isLivestock = comm.category === 'Peternakan';

  // Rasio skala: 100 are = 1 Ha. Untuk ternak: areaInAre = populasi ekor
  const areaScale = isLivestock ? areaInAre : (areaInAre / 100);
  const areaInM2 = isLivestock ? areaInAre : (areaInAre * 100);
  const areaInHa = isLivestock ? (areaInAre / 100) : (areaInAre / 100);

  const pricePerKg = typeof customPricePerKg === 'number' && customPricePerKg > 0
    ? customPricePerKg
    : comm.defaultPricePerKg;

  // 1. Perhitungan Konvensional (Kimia)
  const convFertCost = Math.round(comm.conventionalFertilizerCostPerHa * areaScale);
  const convPestCost = Math.round(comm.conventionalPesticideCostPerHa * areaScale);
  const convTotalCost = convFertCost + convPestCost;

  // Efektivitas serapan hara tanah untuk pola konvensional
  const absorptionPenalty = isLivestock ? 1.0 : (soil.nutrientAbsorptionRate / 0.85); // normalisasi terhadap kondisi ideal
  const convYieldPerHa = comm.conventionalYieldPerHaTon * absorptionPenalty;
  const convYieldTon = parseFloat((convYieldPerHa * areaScale).toFixed(2));
  const convYieldKg = Math.round(convYieldTon * 1000);
  const convRevenue = Math.round(convYieldKg * pricePerKg);
  const convNetProfit = convRevenue - convTotalCost;
  const effectiveAbsorptionKg = Math.round(convYieldKg * soil.nutrientAbsorptionRate);

  // 2. Perhitungan Paten Gold Nano
  // Kebutuhan box Paten Gold & Paten Imun (dibulatkan minimal 1 jika area > 0)
  const exactPatenBoxes = comm.patenBoxesPerHa * areaScale;
  const exactImunBoxes = comm.patenImunBoxesPerHa * areaScale;
  const patenBoxes = Math.max(1, Math.ceil(exactPatenBoxes));
  const patenImunBoxes = Math.max(1, Math.ceil(exactImunBoxes));

  const patenCost = patenBoxes * PATEN_BOX_PRICE;
  const patenImunCost = patenImunBoxes * PATEN_IMUN_BOX_PRICE;

  // Pupuk kimia pelengkap: hemat 70% (hanya sisa 30%)
  const complementaryChemicalCost = Math.round(comm.complementaryChemicalCostPerHa * areaScale);
  // Pestisida: hemat 80% (hanya 20%) karena Paten Imun
  const reducedPesticideCost = Math.round((comm.conventionalPesticideCostPerHa * 0.20) * areaScale);

  const patenTotalCost = patenCost + patenImunCost + complementaryChemicalCost + reducedPesticideCost;

  // Hasil panen Paten Nano: tidak terhambat pH tanah karena diserap via stomata mulut daun
  const patenYieldTon = parseFloat((comm.patenYieldPerHaTon * areaScale).toFixed(2));
  const patenYieldKg = Math.round(patenYieldTon * 1000);
  const patenRevenue = Math.round(patenYieldKg * pricePerKg);
  const patenNetProfit = patenRevenue - patenTotalCost;

  const sachetCount = patenBoxes * 12; // 1 box Paten Gold = 12 sachet
  const tanksNeeded = Math.max(1, Math.ceil(sachetCount));

  // 3. Perbandingan & Penghematan
  const operationalSavingsRp = convTotalCost - patenTotalCost;
  const operationalSavingsPercent = convTotalCost > 0
    ? Math.round(((convTotalCost - patenTotalCost) / convTotalCost) * 100)
    : 45;

  const yieldIncreaseKg = patenYieldKg - convYieldKg;
  const yieldIncreasePercent = convYieldKg > 0
    ? Math.round(((patenYieldKg - convYieldKg) / convYieldKg) * 100)
    : 40;

  const additionalProfitRp = patenNetProfit - convNetProfit;
  const profitIncreasePercent = convNetProfit > 0
    ? Math.round(((patenNetProfit - convNetProfit) / Math.abs(convNetProfit)) * 100)
    : 65;

  const roiPercent = patenTotalCost > 0
    ? Math.round((patenNetProfit / patenTotalCost) * 100)
    : 350;

  return {
    areaInAre,
    areaInM2,
    areaInHa,
    commodity: comm,
    soil,
    conventional: {
      fertilizerCost: convFertCost,
      pesticideCost: convPestCost,
      totalCost: convTotalCost,
      yieldTon: convYieldTon,
      yieldKg: convYieldKg,
      revenue: convRevenue,
      netProfit: convNetProfit,
      effectiveAbsorptionKg
    },
    paten: {
      patenBoxes,
      patenCost,
      patenImunBoxes,
      patenImunCost,
      complementaryChemicalCost,
      reducedPesticideCost,
      totalCost: patenTotalCost,
      yieldTon: patenYieldTon,
      yieldKg: patenYieldKg,
      revenue: patenRevenue,
      netProfit: patenNetProfit,
      sachetCount,
      tanksNeeded
    },
    savings: {
      operationalSavingsRp,
      operationalSavingsPercent,
      pesticideSavingsPercent: 80,
      yieldIncreaseKg,
      yieldIncreasePercent,
      additionalProfitRp,
      profitIncreasePercent,
      roiPercent
    }
  };
}
