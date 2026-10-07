import React, { useState } from 'react';
import { Zap, Sprout, ArrowRight, CheckCircle, Scale, ShieldCheck } from 'lucide-react';
import { CommodityId } from '../types';

interface PlantNutrientDemandCalculatorViewProps {
  onGoToSchedule?: (commodityId: CommodityId) => void;
}

export const PlantNutrientDemandCalculatorView: React.FC<PlantNutrientDemandCalculatorViewProps> = ({
  onGoToSchedule
}) => {
  const [selectedCrop, setSelectedCrop] = useState<CommodityId>('padi');
  const [areaAre, setAreaAre] = useState<number>(10); // 10 are

  // Kebutuhan kg N, P2O5, K2O per Ha untuk target hasil optimal
  const nutrientDemands: Record<string, { n: number; p: number; k: number; sachetPaten: number; sachetImun: number }> = {
    padi: { n: 120, p: 45, k: 60, sachetPaten: 6, sachetImun: 4 },
    jagung: { n: 140, p: 55, k: 70, sachetPaten: 5, sachetImun: 3 },
    bawang_merah: { n: 100, p: 60, k: 120, sachetPaten: 8, sachetImun: 6 },
    cabai: { n: 130, p: 70, k: 140, sachetPaten: 9, sachetImun: 6 },
    tembakau: { n: 70, p: 40, k: 110, sachetPaten: 6, sachetImun: 4 }
  };

  const currentDemand = nutrientDemands[selectedCrop] || nutrientDemands.padi;
  const scale = areaAre / 100; // ha

  const reqN = (currentDemand.n * scale).toFixed(1);
  const reqP = (currentDemand.p * scale).toFixed(1);
  const reqK = (currentDemand.k * scale).toFixed(1);
  const boxesPaten = Math.max(1, Math.ceil(currentDemand.sachetPaten * scale));
  const boxesImun = Math.max(1, Math.ceil(currentDemand.sachetImun * scale));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit'] flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Kalkulator Kebutuhan Fisiologis Nutrisi Tanaman (N, P, K)
          </h3>
          <p className="text-xs text-slate-500">
            Perhitungan serapan hara makro primer serta pemenuhannya melalui teknologi nano asam amino Paten
          </p>
        </div>

        {onGoToSchedule && (
          <button
            type="button"
            onClick={() => onGoToSchedule(selectedCrop)}
            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
          >
            <span>Jadwal Aplikasi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Pilih Tanaman Budidaya:
          </label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value as CommodityId)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100"
          >
            <option value="padi">🌾 Padi Sawah</option>
            <option value="jagung">🌽 Jagung Hibrida</option>
            <option value="bawang_merah">🧅 Bawang Merah</option>
            <option value="cabai">🌶️ Cabai Rawit / Merah</option>
            <option value="tembakau">🍂 Tembakau Virginia</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Luas Lahan ({areaAre} Are / {(areaAre * 100)} m²):
          </label>
          <input
            type="range"
            min={1}
            max={100}
            value={areaAre}
            onChange={(e) => setAreaAre(parseInt(e.target.value) || 1)}
            className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>
      </div>

      {/* Nutrisi Breakdown Cards */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
          <span className="text-[10px] font-bold text-blue-600 uppercase block">Kebutuhan Nitrogen (N)</span>
          <p className="text-lg font-black text-blue-900 dark:text-blue-200 mt-0.5">{reqN} kg</p>
          <span className="text-[10px] text-slate-500">Pertumbuhan Daun & Anakan</span>
        </div>
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
          <span className="text-[10px] font-bold text-amber-600 uppercase block">Kebutuhan Fosfat (P₂O₅)</span>
          <p className="text-lg font-black text-amber-900 dark:text-amber-200 mt-0.5">{reqP} kg</p>
          <span className="text-[10px] text-slate-500">Perakaran & Pembungaan</span>
        </div>
        <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
          <span className="text-[10px] font-bold text-purple-600 uppercase block">Kebutuhan Kalium (K₂O)</span>
          <p className="text-lg font-black text-purple-900 dark:text-purple-200 mt-0.5">{reqK} kg</p>
          <span className="text-[10px] text-slate-500">Bobot & Kualitas Buah</span>
        </div>
      </div>

      {/* Rekomendasi Solusi Paten */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-300 dark:border-emerald-800 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Paket Nutrisi Organik Nano Paten
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold">
            Hemat Pupuk Kimia 70%
          </span>
        </div>
        <p className="text-slate-700 dark:text-slate-300">
          Untuk lahan <strong>{areaAre} Are</strong>, kebutuhan Anda adalah <strong>{boxesPaten} Box Paten Gold</strong> dan <strong>{boxesImun} Box Paten Imun</strong>.
          Molekul nano organik langsung masuk ke stomata daun tanpa energi fotosintesis berlebih, sehingga tanaman tetap subur di segala kondisi tanah.
        </p>
      </div>
    </div>
  );
};
