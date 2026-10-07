import React from 'react';
import { Calendar, Sun, CloudRain, Clock, ArrowRight, Sparkles } from 'lucide-react';

interface SeasonalInsightsModuleProps {
  onGoToSchedule?: () => void;
}

export const SeasonalInsightsModule: React.FC<SeasonalInsightsModuleProps> = ({
  onGoToSchedule
}) => {
  const currentMonth = new Date().toLocaleDateString('id-ID', { month: 'long' });

  return (
    <div className="bg-gradient-to-r from-emerald-900/10 via-teal-900/10 to-amber-900/10 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-amber-950/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Wawasan Musim & Cuaca ({currentMonth})
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Kondisi kelembapan tanah optimal untuk penyerapan nano pupuk Paten Gold
            </p>
          </div>
        </div>

        {onGoToSchedule && (
          <button
            type="button"
            onClick={onGoToSchedule}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
          >
            <span>Buka Kalender Pemupukan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Bukaan Stomata Pagi:</span>
          <p className="font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">06.30 – 08.30 WITA</p>
          <span className="text-[10px] text-slate-500">Efisiensi serapan 100%</span>
        </div>
        <div className="p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Fase Tanaman Terbanyak:</span>
          <p className="font-extrabold text-amber-700 dark:text-amber-400 mt-0.5">Vegetatif / Anakan</p>
          <span className="text-[10px] text-slate-500">Paten Gold + Paten Imun</span>
        </div>
        <div className="p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Pencegahan Hama Musiman:</span>
          <p className="font-extrabold text-rose-700 dark:text-rose-400 mt-0.5">Ulat Grayak & Kresek</p>
          <span className="text-[10px] text-slate-500">Imunisasi sel daun alami</span>
        </div>
      </div>
    </div>
  );
};
