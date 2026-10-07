import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Droplets,
  CheckCircle2,
  Circle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Sprout,
  Sun,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Check,
  RotateCcw,
  Layers,
  ArrowRight,
  Calculator,
  CalendarCheck,
  Download,
  ExternalLink,
  Bell,
  Smartphone,
  Share2
} from 'lucide-react';
import { CommodityId, CropScheduleConfig, ScheduleItem } from '../types';
import { CROP_SCHEDULES } from '../data/cropSchedules';
import { addNotification } from '../utils/offlineStorage';

interface InteractivePlantingCalendarProps {
  initialCommodityId?: CommodityId;
  initialPlantingDate?: string;
  onApplyToCalculator?: (commodityId: CommodityId, areaInAre?: number) => void;
  onOpenAiConsultant?: (cropName: string, phaseName: string) => void;
}

interface CropCycleMetadata {
  id: CommodityId;
  name: string;
  totalDurationDays: number;
  stages: {
    name: string;
    dayStart: number;
    dayEnd: number;
    description: string;
    icon: string;
    color: string;
  }[];
}

const CROP_CYCLE_METADATA: Record<string, CropCycleMetadata> = {
  padi: {
    id: 'padi',
    name: 'Padi Sawah (GKG)',
    totalDurationDays: 110,
    stages: [
      { name: 'Olah Lahan & Benih', dayStart: 0, dayEnd: 5, description: 'Perendaman benih & olah tanah dasar dengan mikroba Paten', icon: '🌾', color: 'emerald' },
      { name: 'Vegetatif Awal', dayStart: 6, dayEnd: 20, description: 'Pembentukan anakan primer & perakaran kokoh', icon: '🌱', color: 'teal' },
      { name: 'Vegetatif Aktif', dayStart: 21, dayEnd: 35, description: 'Pemaksimalan 40-50 anakan produktif per rumpun', icon: '🌿', color: 'green' },
      { name: 'Primordia / Bunting', dayStart: 36, dayEnd: 55, description: 'Pembentukan malai & tangkai sari bunga padi', icon: '🌾', color: 'amber' },
      { name: 'Pengisian Bulir', dayStart: 56, dayEnd: 85, description: 'Pengisian bulir susu sampai pangkal bernas', icon: '✨', color: 'yellow' },
      { name: 'Pematangan & Panen', dayStart: 86, dayEnd: 110, description: 'Pengeringan sawah & persiapan panen raya', icon: '🚜', color: 'orange' }
    ]
  },
  jagung: {
    id: 'jagung',
    name: 'Jagung Hibrida Pipil',
    totalDurationDays: 100,
    stages: [
      { name: 'Olah Tanah & Tanam', dayStart: 0, dayEnd: 5, description: 'Persiapan bedengan & penanaman benih per lubang', icon: '🌽', color: 'emerald' },
      { name: 'Vegetatif Awal', dayStart: 6, dayEnd: 20, description: 'Pertumbuhan daun ke-3 hingga ke-5, cegah bulai', icon: '🌱', color: 'teal' },
      { name: 'Vegetatif Cepat', dayStart: 21, dayEnd: 40, description: 'Pembesaran batang & penyerapan hara nano aktif', icon: '🌿', color: 'green' },
      { name: 'Fase Berbunga (Tasseling)', dayStart: 41, dayEnd: 60, description: 'Muncul bunga jantan & rambut tongkol jagung', icon: '🌽', color: 'amber' },
      { name: 'Pengisian Biji', dayStart: 61, dayEnd: 85, description: 'Pembobotan biji jagung penuh sampai ujung tongkol', icon: '✨', color: 'yellow' },
      { name: 'Panen Tongkol Kering', dayStart: 86, dayEnd: 100, description: 'Klobot cokelat kering, kadar air panen optimal', icon: '🚜', color: 'orange' }
    ]
  },
  kedelai: {
    id: 'kedelai',
    name: 'Kedelai',
    totalDurationDays: 85,
    stages: [
      { name: 'Olah Lahan & Tanam', dayStart: 0, dayEnd: 5, description: 'Perlakuan benih & penanaman baris teratur', icon: '🫘', color: 'emerald' },
      { name: 'Vegetatif Awal', dayStart: 6, dayEnd: 20, description: 'Pembentukan bintil akar penyerap nitrogen', icon: '🌱', color: 'teal' },
      { name: 'Fase Berbunga (R1)', dayStart: 21, dayEnd: 40, description: 'Inisiasi bunga & perlindungan dari hama ulat', icon: '🌸', color: 'green' },
      { name: 'Pembentukan Polong', dayStart: 41, dayEnd: 65, description: 'Pengisian biji polong kedelai padat berisi', icon: '🫛', color: 'amber' },
      { name: 'Panen Polong Matang', dayStart: 66, dayEnd: 85, description: 'Daun rontok alami & polong kuning kecokelatan', icon: '🚜', color: 'orange' }
    ]
  },
  bawang_merah: {
    id: 'bawang_merah',
    name: 'Bawang Merah',
    totalDurationDays: 70,
    stages: [
      { name: 'Olah Lahan & Umbi Bibit', dayStart: 0, dayEnd: 5, description: 'Potong pucuk bibit & sterilisasi lahan Paten Imun', icon: '🧅', color: 'emerald' },
      { name: 'Pertunasan Awal', dayStart: 6, dayEnd: 18, description: 'Muncul tunas anakan & perakaran dangkal', icon: '🌱', color: 'teal' },
      { name: 'Vegetatif Aktif', dayStart: 19, dayEnd: 35, description: 'Pemaksimalan jumlah anakan umbi dan daun tegak', icon: '🌿', color: 'green' },
      { name: 'Pembesaran Umbi', dayStart: 36, dayEnd: 55, description: 'Fase kritis pembentukan warna merah & bobot umbi', icon: '🧅', color: 'amber' },
      { name: 'Panen Umbi Bernas', dayStart: 56, dayEnd: 70, description: 'Leher batang layu 70%, umbi padat siap panen', icon: '🚜', color: 'orange' }
    ]
  },
  cabai: {
    id: 'cabai',
    name: 'Cabai Merah / Rawit',
    totalDurationDays: 120,
    stages: [
      { name: 'Persemaian & Pindah Tanam', dayStart: 0, dayEnd: 15, description: 'Bibit masuk mulsa bedengan & kocor perakaran', icon: '🌶️', color: 'emerald' },
      { name: 'Vegetatif & Cabang Y', dayStart: 16, dayEnd: 35, description: 'Pembentukan percabangan produktif', icon: '🌱', color: 'teal' },
      { name: 'Pembungaan & Pentil Buah', dayStart: 36, dayEnd: 60, description: 'Cegah rontok bunga dengan nutrisi nano Paten Gold', icon: '🌸', color: 'green' },
      { name: 'Pembesaran Buah & Petik 1', dayStart: 61, dayEnd: 90, description: 'Buah padat mengkilap & panen bertahap', icon: '🌶️', color: 'amber' },
      { name: 'Panen Puncak & Perawatan', dayStart: 91, dayEnd: 120, description: 'Perpanjang umur produktif pohon hingga 20+ kali petik', icon: '🚜', color: 'orange' }
    ]
  },
  sawit: {
    id: 'sawit',
    name: 'Kelapa Sawit (Perkebunan)',
    totalDurationDays: 90,
    stages: [
      { name: 'Bulan ke-1 (Aplikasi Rutin)', dayStart: 0, dayEnd: 30, description: 'Kocor 1 sachet Paten Gold per pohon lingkar piringan', icon: '🌴', color: 'emerald' },
      { name: 'Bulan ke-2 (Pemberian Booster)', dayStart: 31, dayEnd: 60, description: 'Aplikasi Paten Imun untuk cegah jamur Ganoderma', icon: '🛡️', color: 'teal' },
      { name: 'Bulan ke-3 (Evaluasi Tandan TBS)', dayStart: 61, dayEnd: 90, description: 'Panen Tandan Buah Segar (TBS) rendemen minyak naik', icon: '⚖️', color: 'amber' }
    ]
  }
};

export const InteractivePlantingCalendar: React.FC<InteractivePlantingCalendarProps> = ({
  initialCommodityId = 'padi',
  initialPlantingDate,
  onApplyToCalculator,
  onOpenAiConsultant
}) => {
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityId>(initialCommodityId);
  const [plantingDate, setPlantingDate] = useState<string>(() => {
    if (initialPlantingDate) return initialPlantingDate;
    // Default 15 days ago so the farmer immediately sees an active in-progress cycle
    const d = new Date();
    d.setDate(d.getDate() - 15);
    return d.toISOString().split('T')[0];
  });

  // Calendar month navigation
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [selectedDayDetail, setSelectedDayDetail] = useState<{
    dateStr: string;
    dayNumber: number;
    hst: number;
    scheduleItems: ScheduleItem[];
    stageName?: string;
  } | null>(null);

  // Completed checklist storage
  const [completedSchedules, setCompletedSchedules] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('paten_agro_completed_schedules_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const saveCompletedSchedule = (scheduleId: string, status: boolean) => {
    const updated = { ...completedSchedules, [scheduleId]: status };
    setCompletedSchedules(updated);
    try {
      localStorage.setItem('paten_agro_completed_schedules_v1', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save schedule status:', e);
    }
  };

  // Metadata for current crop
  const cropMeta = CROP_CYCLE_METADATA[selectedCommodity] || CROP_CYCLE_METADATA.padi;
  const cropScheduleConfig: CropScheduleConfig = CROP_SCHEDULES[selectedCommodity] || CROP_SCHEDULES.padi;

  // Calculate current HST (Hari Setelah Tanam)
  const currentHST = useMemo(() => {
    const pDate = new Date(plantingDate);
    const today = new Date();
    const diffTime = today.getTime() - pDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, [plantingDate]);

  // Projected Harvest Date
  const projectedHarvestDate = useMemo(() => {
    const pDate = new Date(plantingDate);
    pDate.setDate(pDate.getDate() + cropMeta.totalDurationDays);
    return pDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }, [plantingDate, cropMeta.totalDurationDays]);

  // Tanggal Panen & Tanggal H-7 (Objek Date)
  const harvestDateObj = useMemo(() => {
    const d = new Date(plantingDate);
    d.setDate(d.getDate() + cropMeta.totalDurationDays);
    return d;
  }, [plantingDate, cropMeta.totalDurationDays]);

  const hMinus7DateObj = useMemo(() => {
    const d = new Date(harvestDateObj);
    d.setDate(d.getDate() - 7);
    return d;
  }, [harvestDateObj]);

  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);

  // Helper formatting for iCalendar
  const formatIcsDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const formatIcsDateOnly = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  };

  // 1. Sinkronisasi ke Google Calendar (Buka Web / App Google Calendar)
  const handleSyncToGoogleCalendar = () => {
    const title = `🚨 [H-7 Pengingat] Persiapan Panen Raya ${cropMeta.name} - Paten Agro`;
    const details = `PENGINGAT H-7 MENJELANG PANEN RAYA ${cropMeta.name.toUpperCase()}!\n\n` +
      `• Tanggal Perkiraan Panen: ${projectedHarvestDate} (HST ${cropMeta.totalDurationDays})\n` +
      `• Panduan Operasional H-7: Keringkan lahan (stop genangan air), siapkan karung, terpal jemur, dan mesin perontok/timbangan.\n` +
      `• Nutrisi Paten: Gabah/buah bernas padat hingga pangkal dengan aplikasi Pupuk Paten Organik Nano PT Renner Inti Internasional.\n` +
      `• Aplikasi: Paten Agro Renner Syariah (Husni, S. Kom. I.)`;

    const startStr = formatIcsDateOnly(hMinus7DateObj);
    const dayAfter = new Date(harvestDateObj);
    dayAfter.setDate(dayAfter.getDate() + 1);
    const endStr = formatIcsDateOnly(dayAfter);

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(details)}&location=${encodeURIComponent('Lahan Pertanian Petani Mitra Renner')}`;
    
    window.open(googleUrl, '_blank', 'noopener,noreferrer');
    setSyncToastMessage('Membuka Google Calendar... Pengingat H-7 siap ditambahkan!');
    setTimeout(() => setSyncToastMessage(null), 4000);

    addNotification({
      title: '📅 Sinkronisasi Kalender Berhasil',
      message: `Jadwal Pengingat H-7 Panen ${cropMeta.name} (${projectedHarvestDate}) siap dicatat di Google Calendar.`,
      type: 'jadwal',
      priority: 'normal'
    });
  };

  // 2. Download File .ICS untuk Aplikasi Kalender Perangkat (Android / iPhone / Mac / Windows)
  const handleDownloadIcsFile = () => {
    const dayAfter = new Date(harvestDateObj);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Paten Agro Renner Syariah//Kalender Tanam//ID',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:paten-harvest-${Date.now()}@renner-syariah.com`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART;VALUE=DATE:${formatIcsDateOnly(harvestDateObj)}`,
      `DTEND;VALUE=DATE:${formatIcsDateOnly(dayAfter)}`,
      `SUMMARY:🌾 Panen Raya: ${cropMeta.name} (Paten Agro)`,
      `DESCRIPTION:Masa Panen Raya Komoditi ${cropMeta.name}. Pengingat H-7: Keringkan petak sawah dan siapkan peralatan panen. Nutrisi Paten Organik Nano menghasilkan rendemen maksimal.`,
      'LOCATION:Lahan Pertanian Petani',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:🚨 Peringatan H-7 Persiapan Panen Raya ${cropMeta.name}!`,
      'TRIGGER:-P7D',
      'END:VALARM',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:🌾 Peringatan H-1 Panen Raya ${cropMeta.name} Besok!`,
      'TRIGGER:-P1D',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Jadwal_Panen_${cropMeta.name.replace(/[^a-zA-Z0-9]/g, '_')}_PatenAgro.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setSyncToastMessage('File kalender (.ics) berhasil diunduh! Buka file untuk menyinkronkan ke kalender perangkat Anda.');
    setTimeout(() => setSyncToastMessage(null), 4500);

    addNotification({
      title: '📥 Kalender Perangkat Diunduh',
      message: `File jadwal panen .ics dengan alarm otomatis H-7 berhasil disimpan di perangkat.`,
      type: 'jadwal',
      priority: 'normal'
    });
  };

  // 3. Set Pengingat Lokal In-App
  const handleSetInAppReminder = () => {
    addNotification({
      title: `🚨 Pengingat H-7 Panen Raya: ${cropMeta.name}`,
      message: `Waktu panen raya diproyeksikan pada ${projectedHarvestDate}. Lakukan pengeringan petak lahan dan siapkan terpal penjemuran.`,
      type: 'jadwal',
      priority: 'tinggi'
    });
    setSyncToastMessage(`Pengingat H-7 aktif di aplikasi! Perkiraan H-7: ${hMinus7DateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.`);
    setTimeout(() => setSyncToastMessage(null), 4500);
  };

  // Current active stage
  const currentStage = useMemo(() => {
    return cropMeta.stages.find(s => currentHST >= s.dayStart && currentHST <= s.dayEnd) || cropMeta.stages[cropMeta.stages.length - 1];
  }, [cropMeta, currentHST]);

  // Progress percentage
  const cycleProgressPercent = Math.min(100, Math.round((currentHST / cropMeta.totalDurationDays) * 100));

  // Next upcoming fertilization schedule
  const nextSchedule = useMemo(() => {
    return cropScheduleConfig.schedules.find(s => s.dayAfterPlanting >= currentHST) || null;
  }, [cropScheduleConfig, currentHST]);

  // Month grid generator for real calendar view
  const calendarGrid = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Day of week index (0=Sunday, 1=Monday... 6=Saturday)
    // Convert to Monday start: 0=Mon, 6=Sun
    let startingDay = firstDayOfMonth.getDay() - 1;
    if (startingDay < 0) startingDay = 6;

    const totalDays = lastDayOfMonth.getDate();
    const daysArray = [];

    // Empty cells before first day
    for (let i = 0; i < startingDay; i++) {
      daysArray.push(null);
    }

    // Days of current month
    const pDate = new Date(plantingDate);

    for (let day = 1; day <= totalDays; day++) {
      const thisDate = new Date(year, month, day);
      const diffTime = thisDate.getTime() - pDate.getTime();
      const thisHST = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Check if any schedule items fall on this HST
      const matchingSchedules = cropScheduleConfig.schedules.filter(s => s.dayAfterPlanting === thisHST);

      // Check stage
      const stage = cropMeta.stages.find(st => thisHST >= st.dayStart && thisHST <= st.dayEnd);

      const isToday = thisDate.toDateString() === new Date().toDateString();
      const isHarvestDay = thisHST === cropMeta.totalDurationDays;
      const isPast = thisDate < new Date(new Date().setHours(0,0,0,0));

      daysArray.push({
        dayNumber: day,
        dateObj: thisDate,
        dateStr: thisDate.toISOString().split('T')[0],
        hst: thisHST,
        isToday,
        isHarvestDay,
        isPast,
        schedules: matchingSchedules,
        stage
      });
    }

    return daysArray;
  }, [viewDate, plantingDate, cropScheduleConfig, cropMeta]);

  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleResetToCurrentMonth = () => {
    setViewDate(new Date());
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white rounded-2xl p-4 sm:p-5 border border-emerald-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-black uppercase tracking-wider mb-1.5 border border-emerald-400/30">
            <CalendarCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>Kalender Tanam & Siklus Pemupukan Paten</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight">
            Kalender Tanam Interaktif
          </h2>
          <p className="text-xs text-emerald-200 mt-1 max-w-xl">
            Kelola siklus budidaya visual dari awal pengolahan lahan hingga panen raya. Terhubung langsung dengan takaran dan jadwal aplikasi Paten Organik Nano.
          </p>
        </div>

        {/* Commodity Selector Dropdown */}
        <div className="bg-black/30 backdrop-blur-md p-3 rounded-2xl border border-emerald-700/60 flex flex-col sm:flex-row gap-2 shrink-0">
          <div>
            <label className="text-[10px] font-black text-emerald-300 uppercase tracking-wider block mb-1">
              Komoditas Budidaya:
            </label>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value as CommodityId)}
              className="bg-emerald-900/90 text-white text-xs font-bold rounded-xl px-3 py-2 border border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {Object.keys(CROP_CYCLE_METADATA).map(k => (
                <option key={k} value={k}>
                  {CROP_CYCLE_METADATA[k].name} ({CROP_CYCLE_METADATA[k].totalDurationDays} Hari)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-emerald-300 uppercase tracking-wider block mb-1">
              Mulai Olah Lahan / Tanam:
            </label>
            <input
              type="date"
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
              className="bg-emerald-900/90 text-white text-xs font-bold rounded-xl px-3 py-2 border border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
          <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <Sprout className="w-3.5 h-3.5" />
            <span>Usia Tanaman (HST)</span>
          </div>
          <p className="text-2xl font-black text-emerald-950 dark:text-emerald-100 font-['Outfit'] mt-1">
            {currentHST} <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">HST</span>
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
            Dari total {cropMeta.totalDurationDays} hari siklus
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
          <div className="text-[10px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Fase Aktif Tanaman</span>
          </div>
          <p className="text-base font-extrabold text-teal-950 dark:text-teal-100 font-['Outfit'] mt-1 truncate" title={currentStage.name}>
            {currentStage.name}
          </p>
          <span className="text-[10px] text-teal-700 dark:text-teal-300 font-semibold truncate block">
            {currentStage.description.slice(0, 32)}...
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
          <div className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Jadwal Semprot Terdekat</span>
          </div>
          <p className="text-base font-extrabold text-amber-950 dark:text-amber-100 font-['Outfit'] mt-1 truncate">
            {nextSchedule ? `HST ${nextSchedule.dayAfterPlanting}` : 'Semua Tuntas'}
          </p>
          <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold truncate block">
            {nextSchedule ? nextSchedule.products.join(' + ') : 'Menjelang Panen'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
          <div className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Proyeksi Panen Raya</span>
          </div>
          <p className="text-sm sm:text-base font-black text-purple-950 dark:text-purple-100 font-['Outfit'] mt-1 truncate">
            {projectedHarvestDate}
          </p>
          <span className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold">
            {Math.max(0, cropMeta.totalDurationDays - currentHST)} hari lagi menuju panen
          </span>
        </div>
      </div>

      {/* Progress Bar Siklus Tanam */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Perjalanan Siklus Tanam: {cropMeta.name}</span>
          </span>
          <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{cycleProgressPercent}% Selesai</span>
        </div>

        <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden flex">
          <div
            className="bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${cycleProgressPercent}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-1">
          <span>Olah Lahan (HST 0)</span>
          <span>Vegetatif (HST 25)</span>
          <span>Bunting / Bunga (HST 50)</span>
          <span>Pengisian Bulir (HST 75)</span>
          <span>Panen Raya (HST {cropMeta.totalDurationDays})</span>
        </div>
      </div>

      {/* FITUR BARU: SINKRONISASI OTOMATIS DATA PANEN KE GOOGLE CALENDAR / KALENDER HP (PENGINGAT H-7) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-emerald-50 dark:from-purple-950/40 dark:via-indigo-950/40 dark:to-emerald-950/40 border border-purple-200 dark:border-purple-800/60 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/80 text-purple-800 dark:text-purple-300 text-[10px] font-black uppercase tracking-wider border border-purple-200 dark:border-purple-800">
              <Calendar className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <span>Sinkronisasi Kalender & Alarm Otomatis H-7</span>
            </div>
            <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 font-['Outfit']">
              Sinkronkan Tanggal Panen ke Google Calendar & Kalender HP
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Dapatkan pengingat otomatis <strong>H-7 sebelum panen ({hMinus7DateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})</strong> untuk persiapan pengeringan lahan, karung panen, dan terpal jemur sebelum panen raya pada <strong>{projectedHarvestDate}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
            {/* Tombol 1: Google Calendar Web / App */}
            <button
              type="button"
              onClick={handleSyncToGoogleCalendar}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              title="Buka Google Calendar untuk menyimpan pengingat panen H-7"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Google Calendar</span>
            </button>

            {/* Tombol 2: Unduh File .ICS untuk Kalender Android / iOS */}
            <button
              type="button"
              onClick={handleDownloadIcsFile}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              title="Unduh file kalender .ics dengan alarm bawaan H-7 untuk HP Android / iPhone"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Kalender HP (.ICS)</span>
            </button>

            {/* Tombol 3: Pengingat di Aplikasi */}
            <button
              type="button"
              onClick={handleSetInAppReminder}
              className="px-3 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-200 font-bold text-xs flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-700 transition-all active:scale-95"
              title="Aktifkan pengingat H-7 di dalam notifikasi aplikasi"
            >
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              <span>Alarm Aplikasi</span>
            </button>
          </div>
        </div>

        {/* Sync Toast Feedback */}
        {syncToastMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <Check className="w-4 h-4 shrink-0" />
            <span>{syncToastMessage}</span>
          </div>
        )}
      </div>

      {/* TIMELINE VISUAL SIKLUS TANAM: DARI OLAH LAHAN S.D PANEN */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Tahapan Siklus Tanam & Protokol Pupuk Paten</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {cropScheduleConfig.schedules.length} Titik Aplikasi Utama
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {cropScheduleConfig.schedules.map((schedule) => {
            const isCompleted = !!completedSchedules[schedule.id];
            const isCurrent = currentHST >= schedule.dayAfterPlanting - 3 && currentHST <= schedule.dayAfterPlanting + 4;
            const isPast = currentHST > schedule.dayAfterPlanting + 4;

            // Target Date
            const targetDate = new Date(plantingDate);
            targetDate.setDate(targetDate.getDate() + schedule.dayAfterPlanting);
            const targetDateStr = targetDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

            return (
              <div
                key={schedule.id}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                  isCurrent
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-500/30 shadow-md'
                    : isCompleted
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-90'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        isCurrent
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        HST {schedule.dayAfterPlanting}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {targetDateStr}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => saveCompletedSchedule(schedule.id, !isCompleted)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                      }`}
                      title={isCompleted ? 'Batalkan status selesai' : 'Tandai sudah diaplikasikan'}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                      <span>{isCompleted ? 'Sudah Semprot' : 'Tandai'}</span>
                    </button>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                      {schedule.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {schedule.targetStomata}
                    </p>
                  </div>

                  {/* Formula Produk Paten */}
                  <div className="bg-emerald-100/60 dark:bg-emerald-950/80 p-2.5 rounded-xl border border-emerald-300/60 dark:border-emerald-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Formula & Dosis:</span>
                    </div>
                    <p className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                      {schedule.dosage}
                    </p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300">
                      💧 Air: {schedule.waterVolume} • {schedule.actionType}
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sun className="w-3 h-3 text-amber-500" />
                    <span>06.00 - 09.00 (Stomata Buka)</span>
                  </span>

                  {onOpenAiConsultant && (
                    <button
                      type="button"
                      onClick={() => onOpenAiConsultant(cropMeta.name, schedule.title)}
                      className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold flex items-center gap-0.5"
                    >
                      <span>Tanya AI</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KALENDER BULANAN TANGGAL RIIL DENGAN NAVIGASI */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Kalender Tanggal Riil Siklus Tanam</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Lihat tanggal riil penyemprotan pupuk Paten bulan per bulan. Klik tanggal untuk melihat instruksi lengkap.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleResetToCurrentMonth}
              className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              Bulan Ini
            </button>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="Bulan sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-black font-['Outfit'] text-slate-800 dark:text-slate-100">
                {viewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="Bulan berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
          <span>Sen</span>
          <span>Sel</span>
          <span>Rab</span>
          <span>Kam</span>
          <span>Jum</span>
          <span className="text-emerald-700 dark:text-emerald-400">Sab</span>
          <span className="text-rose-600 dark:text-rose-400">Min</span>
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarGrid.map((dayItem, idx) => {
            if (!dayItem) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[68px] sm:min-h-[84px] rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-transparent"
                />
              );
            }

            const hasSchedule = dayItem.schedules.length > 0;
            const isSelected = selectedDayDetail?.dateStr === dayItem.dateStr;

            return (
              <div
                key={dayItem.dateStr}
                onClick={() => setSelectedDayDetail({
                  dateStr: dayItem.dateStr,
                  dayNumber: dayItem.dayNumber,
                  hst: dayItem.hst,
                  scheduleItems: dayItem.schedules,
                  stageName: dayItem.stage?.name
                })}
                className={`min-h-[68px] sm:min-h-[84px] p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400'
                    : dayItem.isToday
                    ? 'bg-amber-50/80 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700'
                    : hasSchedule
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100/50'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black ${
                    dayItem.isToday
                      ? 'w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[10px]'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {dayItem.dayNumber}
                  </span>

                  {dayItem.hst >= 0 && dayItem.hst <= cropMeta.totalDurationDays && (
                    <span className="text-[9px] font-bold text-slate-400 font-mono">
                      H{dayItem.hst}
                    </span>
                  )}
                </div>

                {/* Badges on this day */}
                <div className="space-y-0.5 mt-1">
                  {hasSchedule && (
                    <div className="bg-emerald-600 text-white rounded-md px-1 py-0.5 text-[9px] font-bold truncate flex items-center gap-1 shadow-2xs">
                      <span>🌱</span>
                      <span className="truncate">{dayItem.schedules[0].products[0]}</span>
                    </div>
                  )}

                  {dayItem.isHarvestDay && (
                    <div className="bg-purple-600 text-white rounded-md px-1 py-0.5 text-[9px] font-bold truncate flex items-center gap-1 shadow-2xs">
                      <span>🌾 Panen</span>
                    </div>
                  )}

                  {!hasSchedule && dayItem.isToday && (
                    <span className="text-[9px] font-extrabold text-amber-700 dark:text-amber-400 block truncate">
                      Hari Ini
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Date Detail Drawer / Box */}
        {selectedDayDetail && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 shadow-md animate-in fade-in duration-200 space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                  {selectedDayDetail.dayNumber}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    Tanggal: {new Date(selectedDayDetail.dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                    Usia Tanaman: {selectedDayDetail.hst >= 0 ? `HST ${selectedDayDetail.hst}` : `H-${Math.abs(selectedDayDetail.hst)} Pra-Tanam`} • Fase: {selectedDayDetail.stageName || '-'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDayDetail(null)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold"
              >
                Tutup ✕
              </button>
            </div>

            {selectedDayDetail.scheduleItems.length > 0 ? (
              <div className="space-y-3">
                {selectedDayDetail.scheduleItems.map((sc) => (
                  <div key={sc.id} className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>{sc.title}</span>
                      </span>
                      <span className="text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                        {sc.actionType}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="font-bold text-slate-800 dark:text-slate-100">
                        📦 Formula: <span className="text-emerald-700 dark:text-emerald-400">{sc.dosage}</span>
                      </p>
                      <p className="text-slate-600 dark:text-slate-300">
                        💧 Volume Air: {sc.waterVolume} (Semprot kabut halus pagi 06.00-09.00)
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                        Petunjuk: {sc.mixingInstruction}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => saveCompletedSchedule(sc.id, !completedSchedules[sc.id])}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${
                          completedSchedules[sc.id]
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {completedSchedules[sc.id] ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                        <span>{completedSchedules[sc.id] ? 'Telah Disemprot (Tuntas)' : 'Tandai Selesai Semprot'}</span>
                      </button>

                      {onOpenAiConsultant && (
                        <button
                          type="button"
                          onClick={() => onOpenAiConsultant(cropMeta.name, sc.title)}
                          className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Konsultasi AI untuk Fase Ini</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-300 py-1">
                Tidak ada agenda penyemprotan pupuk terjadwal di hari ini. Jaga kondisi kelembapan tanah dan lakukan pengamatan rutin terhadap serangan hama atau penyakit.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>SOP Resmi Aplikasi Pupuk Paten Organik Berteknologi Nano • PT. Renner Inti Internasional</span>
        </div>

        {onApplyToCalculator && (
          <button
            type="button"
            onClick={() => onApplyToCalculator(selectedCommodity)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all flex items-center gap-1.5 shadow-xs shrink-0 active:scale-95"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-300" />
            <span>Hitung Kebutuhan Pupuk di Kalkulator</span>
          </button>
        )}
      </div>
    </div>
  );
};
