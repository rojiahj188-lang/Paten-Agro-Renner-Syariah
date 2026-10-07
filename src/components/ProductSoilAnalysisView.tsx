import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sliders,
  Layers,
  ShieldCheck,
  Package,
  Droplets,
  Zap,
  Info,
  Save,
  Check,
  TrendingDown,
  Scale,
  Award,
  ChevronRight,
  FlaskConical,
  Sprout
} from 'lucide-react';
import { CommodityId, SoilCondition, SoilTextureType, SoilFertilityProfile } from '../types';
import { COMMODITIES, formatRupiah, formatNumber } from '../utils/calculatorEngine';
import { SOIL_CONDITIONS } from '../data/soilKnowledge';
import { addSoilProfile, addNotification } from '../utils/offlineStorage';

interface ProductSoilAnalysisViewProps {
  onApplyToCalculator?: (params: {
    commodityId: CommodityId;
    areaInAre: number;
    soilCondition: SoilCondition;
    phValue: number;
    notes?: string;
  }) => void;
  onNavigateToLandMap?: () => void;
}

export const ProductSoilAnalysisView: React.FC<ProductSoilAnalysisViewProps> = ({
  onApplyToCalculator,
  onNavigateToLandMap
}) => {
  const [activeTab, setActiveTab] = useState<'analisis_tanah' | 'produk_paten'>('analisis_tanah');

  // Input Parameter Kondisi Tanah
  const [phValue, setPhValue] = useState<number>(5.4); // default 5.4 masam
  const [commodityId, setCommodityId] = useState<CommodityId>('padi');
  const [areaInAre, setAreaInAre] = useState<number>(10); // 10 are (1000 m2)
  const [texture, setTexture] = useState<SoilTextureType>('lempung_berat');
  const [organicMatter, setOrganicMatter] = useState<'Rendah (<1%)' | 'Sedang (1-3%)' | 'Tinggi (>3%)'>('Rendah (<1%)');
  const [drainage, setDrainage] = useState<'Cepat / Porus' | 'Baik / Ideal' | 'Terhambat / Becek'>('Terhambat / Becek');
  const [farmerName, setFarmerName] = useState<string>('Pak Tani Binaan');
  const [locationName, setLocationName] = useState<string>('Lombok Tengah, NTB');
  const [savedSuccessToast, setSavedSuccessToast] = useState<string | null>(null);

  // Logika Evaluasi Kondisi Tanah berdasarkan Nilai pH
  const evaluatedSoilCondition: SoilCondition = useMemo(() => {
    if (phValue < 5.3) return 'sangat_asam';
    if (phValue < 6.0) return 'asam';
    if (phValue < 6.5) return 'agak_asam';
    return 'ideal';
  }, [phValue]);

  const soilInfo = SOIL_CONDITIONS[evaluatedSoilCondition];
  const currentCommodity = COMMODITIES[commodityId] || COMMODITIES.padi;
  const isLivestock = currentCommodity.category === 'Peternakan';

  // LOGIKA PERHITUNGAN DOSIS OTOMATIS BERDASARKAN KONDISI TANAH
  const dosageCalculation = useMemo(() => {
    const scale = isLivestock ? areaInAre : (areaInAre / 100); // Rasio Ha (100 are = 1 Ha)

    // Base box kebutuhan per Ha
    let baseGoldBoxes = currentCommodity.patenBoxesPerHa;
    let baseImunBoxes = currentCommodity.patenImunBoxesPerHa;

    // Multiplier berdasarkan kondisi keasaman tanah
    let dosageAdjustmentNotes = '';
    let soilMultiplier = 1.0;

    if (evaluatedSoilCondition === 'sangat_asam') {
      // pH < 5.3: Tanah kritis butuh pembenah intensif
      soilMultiplier = 1.3;
      dosageAdjustmentNotes = 'Dosis intensif (+30% Paten Gold & Imun) untuk kocor olah tanah dasar guna memecah fiksasi Al/Fe dan mengaktifkan mikroba tanah.';
    } else if (evaluatedSoilCondition === 'asam') {
      // pH 5.3 - 5.9: Tanah masam butuh aplikasi rutin
      soilMultiplier = 1.15;
      dosageAdjustmentNotes = 'Dosis optimal (+15%) dengan semprot stomata pagi hari dan kocor perakaran pada 10 & 25 HST.';
    } else if (evaluatedSoilCondition === 'agak_asam') {
      // pH 6.0 - 6.4: Cukup toleran
      soilMultiplier = 1.0;
      dosageAdjustmentNotes = 'Dosis standar pemeliharaan; pupuk kimia granul dapat langsung dipangkas 70%.';
    } else {
      // pH >= 6.5: Subur ideal
      soilMultiplier = 0.95;
      dosageAdjustmentNotes = 'Dosis efisiensi tinggi; tanaman cepat menyerap nutrisi nano untuk memacu anakan dan bobot maksimal.';
    }

    // Penyesuaian tekstur tanah
    let textureBonus = '';
    if (texture === 'lempung_berat') {
      textureBonus = 'Tanah liat pejal: aplikasikan Paten saat pagi berembun untuk membantu aerasi tanah.';
    } else if (texture === 'gambut') {
      textureBonus = 'Lahan gambut: tambahkan 1 sachet Paten Imun per tangki untuk menetralkan asam organik.';
    } else if (texture === 'pasir') {
      textureBonus = 'Tanah berpasir: aplikasi semprot daun (foliar) lebih utama daripada kocor tanah agar nutrisi tidak tercuci.';
    }

    // Hitung box & sachet final
    const calculatedGoldBoxes = Math.max(1, Math.ceil(baseGoldBoxes * scale * soilMultiplier));
    const calculatedImunBoxes = Math.max(1, Math.ceil(baseImunBoxes * scale * soilMultiplier));
    const totalSachetsGold = calculatedGoldBoxes * 12;
    const totalSachetsImun = calculatedImunBoxes * 24;

    // Estimasi biaya Paten
    const estPatenCost = (calculatedGoldBoxes * 200000) + (calculatedImunBoxes * 200000);
    // Pupuk kimia konvensional ekuivalen
    const convCostEquiv = Math.round((currentCommodity.conventionalFertilizerCostPerHa + currentCommodity.conventionalPesticideCostPerHa) * scale);
    const estSavingsRp = Math.max(0, convCostEquiv - (estPatenCost + (convCostEquiv * 0.25)));
    const estSavingsPercent = convCostEquiv > 0 ? Math.round((estSavingsRp / convCostEquiv) * 100) : 55;

    // Takaran per tangki 16-20 Liter
    const sprayDoseGuide = evaluatedSoilCondition === 'sangat_asam'
      ? '1-2 sachet Paten Gold + 1 sachet Paten Imun per tangki 16 L'
      : '1 sachet Paten Gold + 1 sachet Paten Imun per tangki 16-20 L';

    const sprayIntervalDays = evaluatedSoilCondition === 'sangat_asam' ? 'Interval 10-12 hari' : 'Interval 14-15 hari';

    return {
      goldBoxes: calculatedGoldBoxes,
      imunBoxes: calculatedImunBoxes,
      totalSachetsGold,
      totalSachetsImun,
      estPatenCost,
      estSavingsRp,
      estSavingsPercent,
      sprayDoseGuide,
      sprayIntervalDays,
      dosageAdjustmentNotes,
      textureBonus,
      chemicalReductionPct: 70,
      pesticideReductionPct: 80
    };
  }, [areaInAre, commodityId, evaluatedSoilCondition, texture, isLivestock, currentCommodity]);

  // Handler: Terapkan Dosis ke Kalkulator Pupuk secara Langsung
  const handleApplyToCalculator = () => {
    // 1. Simpan Profil ke Local Storage
    const newProfile = addSoilProfile({
      farmerName: farmerName || 'Petani Mitra Renner',
      locationName: locationName || 'Lahan Pertanian',
      phValue,
      texture,
      organicMatter,
      drainage,
      currentCrop: currentCommodity.name,
      fertilityScore: Math.round((phValue / 7.0) * 85),
      healthCategory: evaluatedSoilCondition === 'sangat_asam' ? 'Sangat Buruk (Kritis)' : evaluatedSoilCondition === 'asam' ? 'Kurang Subur' : evaluatedSoilCondition === 'agak_asam' ? 'Cukup Baik' : 'Sangat Subur',
      limitingFactors: [
        `Keasaman tanah ${soilInfo.phRange} membatasi serapan pupuk kimia hingga ${(soilInfo.nutrientAbsorptionRate * 100).toFixed(0)}%`,
        `Tekstur ${texture.replace('_', ' ')} membutuhkan pembenah porositas`,
        `Bahan organik ${organicMatter}`
      ],
      nutrientAvailability: {
        macro: { n: 'Cukup Tersedia via Paten', p: 'Terkunci Fosfat Tanah', k: 'Optimal', mg: 'Baik', ca: 'Baik' },
        micro: { zn: 'Tinggi', fe: 'Tinggi (Kaya)', b: 'Sedang', cu: 'Baik' }
      },
      rennerProductRecommendation: {
        primaryProduct: 'Paten Gold Nano',
        supportProduct: 'Paten Imun',
        dosageGuide: `${dosageCalculation.goldBoxes} Box Paten Gold + ${dosageCalculation.imunBoxes} Box Paten Imun`,
        applicationMethod: dosageCalculation.sprayDoseGuide,
        targetBenefits: [
          'Memperbaiki pH tanah secara biologis',
          'Nutrisi nano langsung diserap stomata mulut daun',
          'Menghemat biaya pupuk kimia hingga 70%'
        ],
        recoverySchedule: [
          'HST -3 s.d 0: Olah tanah dasar kocor Paten',
          'HST 10: Semprot stomata anakan',
          'HST 25: Semprot vegetatif aktif',
          'HST 40: Pemaksimalan malai'
        ]
      }
    });

    addNotification({
      title: '🧪 Analisis Tanah Berhasil Diterapkan',
      message: `Dosis tanah pH ${phValue} (${soilInfo.label}) berhasil dikirim ke Kalkulator Pupuk untuk ${currentCommodity.name}.`,
      type: 'jadwal',
      priority: 'normal'
    });

    setSavedSuccessToast(`Dosis otomatis berhasil dihitung dan diterapkan ke Kalkulator Pupuk!`);
    setTimeout(() => setSavedSuccessToast(null), 3000);

    // 2. Kirim parameter langsung ke Kalkulator Pupuk
    if (onApplyToCalculator) {
      onApplyToCalculator({
        commodityId,
        areaInAre,
        soilCondition: evaluatedSoilCondition,
        phValue,
        notes: `Rekomendasi Analisis Tanah: pH ${phValue} (${soilInfo.label}). Dosis otomatis: ${dosageCalculation.goldBoxes} Box Paten Gold + ${dosageCalculation.imunBoxes} Box Paten Imun. ${dosageCalculation.dosageAdjustmentNotes}`
      });
    }
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-200 text-xs font-semibold backdrop-blur-md">
            <FlaskConical className="w-3.5 h-3.5 text-amber-300" />
            <span>Laboratorium Agronomi & Analisis Tanah Paten Agro</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight">
            Analisis Tanah & Logika Perhitungan Dosis Otomatis
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
            Input parameter pH, tekstur, dan luas lahan Anda. Sistem secara otomatis menghitung dosis pupuk <strong>Paten Gold</strong> & <strong>Paten Imun</strong> yang tepat dan langsung mengisi input di Kalkulator Finansial.
          </p>
        </div>
      </div>

      {/* Switcher Tab: Analisis Tanah & Dosis vs Katalog Produk Paten */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('analisis_tanah')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'analisis_tanah'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Analisis Tanah & Dosis Otomatis</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('produk_paten')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'produk_paten'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Katalog Produk Teknologi Nano Renner</span>
        </button>
      </div>

      {savedSuccessToast && (
        <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 rounded-2xl text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {savedSuccessToast}
          </span>
          <span className="text-[11px] underline cursor-pointer" onClick={() => setSavedSuccessToast(null)}>Tutup</span>
        </div>
      )}

      {activeTab === 'analisis_tanah' ? (
        <div className="space-y-5">
          {/* Section 1: Form Input Parameter Tanah */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit']">
                  1. Parameter Karakteristik Lahan & Tanah Petani
                </h3>
                <p className="text-xs text-slate-500">
                  Masukkan data keasaman dan tekstur untuk mengkalkulasi kebutuhan nutrisi tanaman
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Langkah 1 dari 2
              </span>
            </div>

            {/* Identitas Petani & Lahan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Petani / Kelompok Tani:</label>
                <input
                  type="text"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  placeholder="Contoh: Pak Daeng Rahman"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-medium"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Lokasi Lahan / Blok:</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Contoh: Panakukang / Narmada Lombok Barat"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-medium"
                />
              </div>
            </div>

            {/* Slider Interaktif pH Tanah */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-emerald-600" />
                    Tingkat Keasaman Tanah (Nilai pH):
                  </label>
                  <span className="text-[11px] text-slate-500">Gunakan pH meter tanah atau kertas lakmus</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-['Outfit'] text-slate-900 dark:text-slate-100">
                    pH {phValue.toFixed(1)}
                  </span>
                  <span
                    className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-extrabold text-white shadow-2xs"
                    style={{ backgroundColor: soilInfo.color }}
                  >
                    {soilInfo.label}
                  </span>
                </div>
              </div>

              {/* Slider 3.5 s/d 8.5 */}
              <input
                type="range"
                min={3.5}
                max={8.5}
                step={0.1}
                value={phValue}
                onChange={(e) => setPhValue(parseFloat(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 rounded-lg appearance-none cursor-pointer focus:outline-none"
              />

              {/* Skala pH Presets */}
              <div className="flex justify-between text-[10px] font-bold text-slate-400 px-1">
                <span>3.5 (Ekstrem Asam)</span>
                <span>5.0 (Kritis)</span>
                <span>6.0 (Agak Asam)</span>
                <span>6.8 (Netral Subur)</span>
                <span>8.5 (Basa/Alkalin)</span>
              </div>

              {/* Penjelasan Serapan Hara Berdasarkan Nilai pH */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <p className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-600" />
                  Kondisi Serapan Hara pada pH {phValue.toFixed(1)} ({soilInfo.label}):
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {soilInfo.description}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-500">Serapan Pupuk Kimia Granul:</span>
                    <strong className="block text-rose-600 dark:text-rose-400">
                      {(soilInfo.nutrientAbsorptionRate * 100).toFixed(0)}% (Limbah/Mengendap {(100 - soilInfo.nutrientAbsorptionRate * 100).toFixed(0)}%)
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Serapan Paten Organik Nano:</span>
                    <strong className="block text-emerald-700 dark:text-emerald-400">
                      {(soilInfo.patenAbsorptionRate * 100).toFixed(0)}% (Langsung Diserap Stomata Daun)
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Komoditas & Luas Lahan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Komoditas Tanaman Budidaya:
                </label>
                <select
                  value={commodityId}
                  onChange={(e) => setCommodityId(e.target.value as CommodityId)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100"
                >
                  {Object.values(COMMODITIES).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Luas Lahan ({areaInAre} Are / {(areaInAre * 100)} m²):
                  </label>
                  <span className="font-bold text-emerald-700">{(areaInAre / 100).toFixed(2)} Ha</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={areaInAre}
                  onChange={(e) => setAreaInAre(parseInt(e.target.value) || 1)}
                  className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex gap-1.5 mt-1.5">
                  {[5, 10, 25, 50, 100].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAreaInAre(preset)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        areaInAre === preset
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {preset} Are
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tekstur & Bahan Organik */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tekstur Fisik Tanah:</label>
                <select
                  value={texture}
                  onChange={(e) => setTexture(e.target.value as SoilTextureType)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-800 dark:text-slate-100 font-semibold"
                >
                  <option value="lempung_berat">Lempung Berat (Liat Keras)</option>
                  <option value="lempung_berpasir">Lempung Berpasir (Gembur)</option>
                  <option value="gambut">Gambut Masam</option>
                  <option value="aluvial">Aluvial Endapan Sungai</option>
                  <option value="pasir">Pasir Pantai / Porus</option>
                  <option value="kapur">Kapur / Karst Kering</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kandungan Bahan Organik:</label>
                <select
                  value={organicMatter}
                  onChange={(e) => setOrganicMatter(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-800 dark:text-slate-100 font-semibold"
                >
                  <option value="Rendah (<1%)">Rendah (&lt;1%) • Tanah Lelah</option>
                  <option value="Sedang (1-3%)">Sedang (1-3%) • Rata-rata</option>
                  <option value="Tinggi (>3%)">Tinggi (&gt;3%) • Kaya Humus</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Drainase / Porositas Air:</label>
                <select
                  value={drainage}
                  onChange={(e) => setDrainage(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-800 dark:text-slate-100 font-semibold"
                >
                  <option value="Terhambat / Becek">Terhambat / Genangan Becek</option>
                  <option value="Baik / Ideal">Baik / Ideal Berongga</option>
                  <option value="Cepat / Porus">Cepat Porus / Air Cepat Kering</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Hasil Logika Perhitungan Dosis Otomatis */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 rounded-3xl p-5 sm:p-6 border-2 border-emerald-500 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 dark:border-emerald-800/60 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                  Hasil Perhitungan Dosis Presisi
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 font-['Outfit']">
                  Rekomendasi Kebutuhan Pupuk Paten untuk Lahan {areaInAre} Are ({currentCommodity.name})
                </h3>
              </div>
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <span className="px-2.5 py-1 rounded-full bg-emerald-700 text-white text-[11px] font-black shadow-xs">
                  Hemat Kimia {dosageCalculation.chemicalReductionPct}%
                </span>
              </div>
            </div>

            {/* Dosis Box Output Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 block uppercase">Paten Gold (Nutrisi)</span>
                <p className="text-2xl font-black text-emerald-800 dark:text-emerald-300 font-['Outfit'] mt-1">
                  {dosageCalculation.goldBoxes} <span className="text-xs font-semibold">Box</span>
                </p>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  ({dosageCalculation.totalSachetsGold} Sachet Nano)
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-800 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 block uppercase">Paten Imun (Proteksi)</span>
                <p className="text-2xl font-black text-teal-800 dark:text-teal-300 font-['Outfit'] mt-1">
                  {dosageCalculation.imunBoxes} <span className="text-xs font-semibold">Box</span>
                </p>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  ({dosageCalculation.totalSachetsImun} Sachet Vaksin)
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 block uppercase">Takaran per Tangki</span>
                <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-2 leading-tight">
                  {dosageCalculation.sprayDoseGuide}
                </p>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                  {dosageCalculation.sprayIntervalDays}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 block uppercase">Estimasi Hemat Finansial</span>
                <p className="text-lg font-black text-amber-700 dark:text-amber-400 font-['Outfit'] mt-1">
                  {formatRupiah(dosageCalculation.estSavingsRp)}
                </p>
                <span className="text-[10px] font-extrabold text-emerald-600">
                  Turun {dosageCalculation.estSavingsPercent}% dari Pola Kimia
                </span>
              </div>
            </div>

            {/* Catatan Penyesuaian Berdasarkan Kondisi Tanah */}
            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-emerald-200 dark:border-emerald-800/80 text-xs space-y-1.5">
              <p className="font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Penjelasan Formula Agronomis Berdasarkan Analisis Tanah:
              </p>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                • <strong>Penyesuaian pH ({soilInfo.label}):</strong> {dosageCalculation.dosageAdjustmentNotes}
              </p>
              {dosageCalculation.textureBonus && (
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  • <strong>Karakteristik Tekstur:</strong> {dosageCalculation.textureBonus}
                </p>
              )}
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                • <strong>Waktu Aplikasi Terbaik:</strong> Pukul 06.30 – 08.30 pagi saat stomata daun terbuka sempurna untuk menyerap partikel nano Paten tanpa kehilangan fotosintesis.
              </p>
            </div>

            {/* ACTION CTA: TERAPKAN KE KALKULATOR PUPUK SECARA LANGSUNG */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-emerald-200 dark:border-emerald-800/60">
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Data komoditas, luas lahan, dan kondisi pH akan otomatis diteruskan ke Kalkulator Finansial.
              </div>

              <button
                type="button"
                onClick={handleApplyToCalculator}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                <span>🚀 Terapkan Dosis ke Kalkulator Pupuk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Section 4: Showcase Produk Teknologi Nano Renner */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Paten Gold */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-emerald-300 dark:border-emerald-800/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
                    ✨
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-slate-100 font-['Outfit']">
                      Paten Gold (Pupuk Organik Nano)
                    </h3>
                    <p className="text-[11px] text-slate-500">Isi: 12 Sachet @ 25 ml • Kemasan Emas</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                  Rp 200.000 / Box
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Diformulasikan khusus untuk tanaman pangan (padi, jagung), hortikultura (bawang, cabai), dan perkebunan (sawit, tembakau). Mengandung asam amino esensial, unsur hara makro mikro lengkap berukuran nano molekul yang langsung diserap tanaman tanpa bergantung kesuburan tanah.
              </p>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 bg-amber-50/60 dark:bg-slate-800/60 p-3 rounded-2xl border border-amber-200/60">
                <li className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Meningkatkan anakan produktif padi hingga 40-50 rumpun
                </li>
                <li className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Menghemat penggunaan pupuk kimia granul 70-80%
                </li>
                <li className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Berfungsi ganda sebagai bio-pembenah tanah (soil conditioner)
                </li>
              </ul>
            </div>

            {/* Paten Imun */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-teal-300 dark:border-teal-800/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-lg">
                    🛡️
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-slate-100 font-['Outfit']">
                      Paten Imun (Vaksin Tanaman)
                    </h3>
                    <p className="text-[11px] text-slate-500">Isi: 24 Sachet • Pelindung Imunitas Seluler</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 text-[10px] font-black">
                  Rp 200.000 / Box
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Meningkatkan kekebalan alami tanaman terhadap virus, jamur patogen (bulai, kresek, antraknosa), dan hama ulat/wereng. Mengaktifkan sistem pertahanan SAR (*Systemic Acquired Resistance*) sehingga penggunaan pestisida kimia sintetis hemat hingga 80%.
              </p>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 bg-teal-50/60 dark:bg-slate-800/60 p-3 rounded-2xl border border-teal-200/60">
                <li className="flex items-center gap-1.5 font-semibold text-teal-800 dark:text-teal-400">
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                  Mencegah busuk buah patek & virus bule jagung
                </li>
                <li className="flex items-center gap-1.5 font-semibold text-teal-800 dark:text-teal-400">
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                  Mengurangi residu racun kimia pada hasil panen
                </li>
                <li className="flex items-center gap-1.5 font-semibold text-teal-800 dark:text-teal-400">
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                  Dapat dicampur langsung bersama Paten Gold dalam satu tangki
                </li>
              </ul>
            </div>

            {/* Paten Hijau */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-emerald-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                    🌿
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-slate-100 font-['Outfit']">
                      Paten Hijau (Vegetatif & Ternak)
                    </h3>
                    <p className="text-[11px] text-slate-500">Isi: 24 Sachet • Booster Tunas & Peternakan</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                  Rp 200.000 / Box
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Merangsang perakaran bibit, percepatan pertumbuhan vegetatif awal, dan suplemen organik campuran air minum ternak (sapi, kerbau, kambing, unggas). Menghilangkan bau amonia kotoran kandang dan memacu bobot harian (ADG).
              </p>
            </div>

            {/* Legalitas & Sertifikasi Syariah */}
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-3xl p-5 border border-emerald-500/40 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5">
                <Award className="w-7 h-7 text-amber-300 shrink-0" />
                <div>
                  <h3 className="font-black text-base font-['Outfit']">
                    Legalitas & Standarisasi Resmi
                  </h3>
                  <p className="text-[11px] text-emerald-300">PT. Renner Inti Internasional</p>
                </div>
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Seluruh produk Paten telah terdaftar resmi di Kementerian Pertanian Republik Indonesia (Kementan RI) dan memiliki sertifikasi Halal Syariah dari DSN-MUI, menjamin keberkahan usaha tani bagi seluruh mitra.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
