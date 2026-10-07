import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Droplets,
  CloudSun,
  Thermometer,
  Wind,
  CheckCircle2,
  Circle,
  Bell,
  Cpu,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Sun,
  CloudRain,
  FileDown,
  Printer,
  CheckSquare,
  Volume2,
  ShieldCheck,
  Send,
  HelpCircle,
  Waves,
  Timer,
  Gauge,
  Zap,
  Sprout,
  CalendarCheck,
  MapPin,
  ArrowRight,
  CloudLightning
} from 'lucide-react';
import { CommodityId, ScheduleItem, SensorData, WeatherDay, LandPlotLocation } from '../types';
import { CROP_SCHEDULES } from '../data/cropSchedules';
import {
  addNotification,
  getFertilizationReminderSettings,
  saveFertilizationReminderSettings,
  triggerDailyFertilizationBrowserNotification,
  FertilizationReminderSettings,
  getLandPlots
} from '../utils/offlineStorage';
import { exportFertilizationScheduleToPDF } from '../utils/pdfExport';
import { FarmerDailyTasksModule } from './FarmerDailyTasksModule';
import { InteractivePlantingCalendar } from './InteractivePlantingCalendar';

interface ScheduleWeatherViewProps {
  initialCommodityId?: CommodityId;
  onOpenAiConsultant?: (cropName?: string, phaseName?: string) => void;
  onApplyToCalculator?: (commodityId: CommodityId, areaInAre?: number) => void;
}

export const ScheduleWeatherView: React.FC<ScheduleWeatherViewProps> = ({
  initialCommodityId = 'padi',
  onOpenAiConsultant,
  onApplyToCalculator
}) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'schedule' | 'tasks'>('calendar');
  const [commodityId, setCommodityId] = useState<CommodityId>(initialCommodityId);
  const [plantingDate, setPlantingDate] = useState<string>(() => {
    // Default 10 hari yang lalu agar tanaman sedang di fase HST 10
    const d = new Date();
    d.setDate(d.getDate() - 10);
    return d.toISOString().split('T')[0];
  });
  const [completedScheduleIds, setCompletedScheduleIds] = useState<Record<string, boolean>>({});
  const [sensorData, setSensorData] = useState<SensorData>({
    timestamp: new Date().toLocaleTimeString('id-ID'),
    soilMoisture: 68,
    soilTemperature: 28.4,
    soilPh: 6.5,
    conductivityEc: 1.25,
    stomataStatus: 'Terbuka Optimal (Waktu Ideal Penyemprotan)',
    batteryLevel: 94,
    status: 'Optimal Subur'
  });
  const [isFetchingSensor, setIsFetchingSensor] = useState<boolean>(false);
  const [notifScheduled, setNotifScheduled] = useState<boolean>(false);

  // PDF Export Modal State
  const [showSchedulePdfModal, setShowSchedulePdfModal] = useState<boolean>(false);
  const [farmerNameForPdf, setFarmerNameForPdf] = useState<string>('Petani Mitra Renner Syariah');
  const [farmLocationForPdf, setFarmLocationForPdf] = useState<string>('Lombok, NTB');
  const [areaForPdf, setAreaForPdf] = useState<number>(20);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [pdfSuccessToast, setPdfSuccessToast] = useState<string | null>(null);

  // Daily browser notification settings state
  const [reminderSettings, setReminderSettings] = useState<FertilizationReminderSettings>(() => getFertilizationReminderSettings());
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const [testNotifFeedback, setTestNotifFeedback] = useState<string | null>(null);

  // 7-day weather forecast data
  const weatherForecast: WeatherDay[] = [
    { dayName: 'Hari Ini', date: '6 Okt', tempMin: 24, tempMax: 32, condition: 'Cerah Berawan', humidity: 72, rainProbability: 20, sprayingRecommendation: 'Sangat Baik' },
    { dayName: 'Besok', date: '7 Okt', tempMin: 25, tempMax: 33, condition: 'Cerah', humidity: 68, rainProbability: 10, sprayingRecommendation: 'Sangat Baik' },
    { dayName: 'Rabu', date: '8 Okt', tempMin: 24, tempMax: 31, condition: 'Berawan', humidity: 75, rainProbability: 35, sprayingRecommendation: 'Baik' },
    { dayName: 'Kamis', date: '9 Okt', tempMin: 23, tempMax: 29, condition: 'Hujan Ringan', humidity: 85, rainProbability: 65, sprayingRecommendation: 'Hati-hati' },
    { dayName: 'Jumat', date: '10 Okt', tempMin: 23, tempMax: 28, condition: 'Hujan Lebat', humidity: 90, rainProbability: 80, sprayingRecommendation: 'Hindari (Potensi Hujan)' },
    { dayName: 'Sabtu', date: '11 Okt', tempMin: 24, tempMax: 30, condition: 'Cerah Berawan', humidity: 74, rainProbability: 25, sprayingRecommendation: 'Sangat Baik' },
    { dayName: 'Minggu', date: '12 Okt', tempMin: 25, tempMax: 32, condition: 'Cerah', humidity: 70, rainProbability: 15, sprayingRecommendation: 'Sangat Baik' }
  ];

  // Calculate current Day After Planting (HST)
  const currentHST = Math.max(0, Math.floor((new Date().getTime() - new Date(plantingDate).getTime()) / (1000 * 60 * 60 * 24)));

  const currentCropSchedule = CROP_SCHEDULES[commodityId] || CROP_SCHEDULES.padi;

  // Luas Lahan untuk Estimasi Kebutuhan Air Irigasi (Default 10 Are = 1.000 m2)
  const [irrigationAreaAre, setIrrigationAreaAre] = useState<number>(10);

  // 1. Koefisien Tanaman (Crop Coefficient - Kc) dan Fase berdasarkan HST
  const cropKcInfo = useMemo(() => {
    if (commodityId === 'padi') {
      if (currentHST <= 15) return { stage: 'Vegetatif Awal & Persemaian', kc: 1.05, waterDepth: '2-3 cm (Macak-macak)', tips: 'Pertahankan tanah becek/macak-macak agar akar cepat berkembang.' };
      if (currentHST <= 45) return { stage: 'Vegetatif Aktif / Anakan Maksimal', kc: 1.20, waterDepth: '3-5 cm (Genangan Tipis)', tips: 'Genangan tipis 3-5 cm merangsang anakan produktif dan menekan gulma.' };
      if (currentHST <= 75) return { stage: 'Fase Primordia / Pembungaan (Kritis)', kc: 1.35, waterDepth: '5 cm (Jaga Ketersediaan Air)', tips: 'Jangan sampai kekeringan! Fase kritis pembentukan malai dan sari bulir.' };
      if (currentHST <= 95) return { stage: 'Pengisian Bulir Susu', kc: 1.10, waterDepth: '2-3 cm (Irigasi Berselang)', tips: 'Terapkan irigasi berselang (intermittent) 3 hari berair, 2 hari kering.' };
      return { stage: 'Pemasakan Bulir & Pra-Panen', kc: 0.70, waterDepth: '0 cm (Keringkan Sawah)', tips: 'Keringkan lahan 10-12 hari sebelum panen agar malai masak serempak.' };
    } else if (commodityId === 'jagung' || commodityId === 'kedelai') {
      if (currentHST <= 20) return { stage: 'Perkecambahan & Vegetatif Awal', kc: 0.45, waterDepth: 'Kapasitas Lapang (Lembap)', tips: 'Hindari genangan, cukup jaga tanah lembap gembur.' };
      if (currentHST <= 50) return { stage: 'Vegetatif Cepat (Pertumbuhan Batang)', kc: 0.85, waterDepth: 'Siram Lembap Merata', tips: 'Kebutuhan air meningkat, siram pada pagi/sore hari.' };
      if (currentHST <= 80) return { stage: 'Fase Pembungaan & Pengisian Biji', kc: 1.15, waterDepth: 'Puncak Kebutuhan Air', tips: 'Jaga kelembapan tanah, hindari tanaman layu saat berbunga.' };
      return { stage: 'Pemasakan Biji / Pengeringan', kc: 0.55, waterDepth: 'Kurangi Pengairan', tips: 'Hentikan pengairan saat kelobot mulai mengering kecokelatan.' };
    } else if (commodityId === 'bawang_merah' || commodityId === 'cabai') {
      if (currentHST <= 15) return { stage: 'Adaptasi Bibit Baru Tanam', kc: 0.50, waterDepth: 'Siram Halus Pagi/Sore', tips: 'Siram kabut halus agar bibit tidak rebah.' };
      if (currentHST <= 40) return { stage: 'Pembentukan Tajuk & Anakan Umbi', kc: 0.95, waterDepth: 'Lembap Teratur Parit', tips: 'Alirkan air pada parit bedengan tanpa merendam umbi.' };
      if (currentHST <= 65) return { stage: 'Pembesaran Umbi / Buah Aktif', kc: 1.10, waterDepth: 'Kebutuhan Air Stabil', tips: 'Jaga suplai air konsisten agar buah/umbi tidak pecah.' };
      return { stage: 'Penuaan Umbi / Menjelang Panen', kc: 0.65, waterDepth: 'Keringkan Parit', tips: 'Hentikan pengairan 7 hari sebelum panen agar umbi padat dan tahan simpan.' };
    } else {
      return { stage: 'Fase Pemeliharaan Tanaman', kc: 1.00, waterDepth: 'Kelembapan Lapang Stabil', tips: 'Jaga aerasi dan kelembapan optimal perakaran.' };
    }
  }, [commodityId, currentHST]);

  // 2. Perhitungan Estimasi Kebutuhan Air Mingguan & Rekomendasi Irigasi
  const weeklyIrrigationAnalysis = useMemo(() => {
    let totalEtcMm = 0;
    let totalRainMm = 0;
    let totalEffectiveRainMm = 0;
    let totalNetIrrigationMm = 0;

    const dailyBreakdown = weatherForecast.map((day) => {
      const tempAvg = (day.tempMin + day.tempMax) / 2;
      const deltaT = Math.max(4, day.tempMax - day.tempMin);
      // Evapotranspirasi Acuan ETo (mm/hari)
      const eto = parseFloat((0.0023 * (tempAvg + 17.8) * Math.sqrt(deltaT) * 3.4).toFixed(1));
      // Kebutuhan Air Tanaman ETc (mm/hari) = ETo * Kc
      const etc = parseFloat((eto * cropKcInfo.kc).toFixed(1));

      // Estimasi Curah Hujan Berdasarkan Data Cuaca
      let rainMm = 0;
      if (day.condition.includes('Hujan Lebat')) {
        rainMm = 35;
      } else if (day.condition.includes('Hujan Ringan') || day.condition.includes('Hujan')) {
        rainMm = 12;
      } else if (day.rainProbability >= 40) {
        rainMm = 3;
      }

      // Curah Hujan Efektif (Peff) yang tersimpan di zona perakaran
      const peff = parseFloat((rainMm > 0 ? Math.min(rainMm * 0.75, etc + 12) : 0).toFixed(1));

      // Kebutuhan Irigasi Bersih (Net Irrigation Needed mm/hari)
      const netIrrigationMm = parseFloat(Math.max(0, etc - peff).toFixed(1));

      // Volume air dalam Liter untuk luas lahan (1 mm = 1 L/m2, 1 Are = 100 m2)
      const litersForArea = Math.round(netIrrigationMm * irrigationAreaAre * 100);

      totalEtcMm += etc;
      totalRainMm += rainMm;
      totalEffectiveRainMm += peff;
      totalNetIrrigationMm += netIrrigationMm;

      // Status Rekomendasi Operasional Irigasi
      let actionTitle = '💧 Irigasi Normal';
      let actionBadge = 'Normal';
      let actionColor = 'emerald';
      let actionDetail = `Jaga kelembapan tanah setara ±${litersForArea.toLocaleString('id-ID')} Liter. Waktu terbaik pengairan: Pukul 06.00 - 08.00 pagi.`;

      if (rainMm >= 25) {
        actionTitle = '⛔ Tutup Pintu Air / Matikan Pompa';
        actionBadge = 'Hujan Lebat';
        actionColor = 'rose';
        actionDetail = `Hujan lebat diprediksi mencukupi kebutuhan air (${rainMm} mm). Matikan pompa air untuk hemat BBM & biaya listrik. Buka saluran pembuang agar tidak banjir.`;
      } else if (rainMm >= 8) {
        actionTitle = '⚠️ Irigasi Minimal (Cek Parit)';
        actionBadge = 'Hujan Ringan';
        actionColor = 'blue';
        actionDetail = `Hujan ringan memasok ±${peff} mm air. Cukup lakukan pengontrolan tinggi muka air tanpa perlu pompa tambahan.`;
      } else if (netIrrigationMm > 4.5) {
        actionTitle = '⚡ Alirkan Air Pagi (Defisit Terik)';
        actionBadge = 'Butuh Air';
        actionColor = 'amber';
        actionDetail = `Cuaca terik & penguapan tinggi (${etc} mm). Alirkan ±${litersForArea.toLocaleString('id-ID')} Liter air pagi hari sebelum matahari menyengat.`;
      }

      return {
        ...day,
        eto,
        etc,
        rainMm,
        peff,
        netIrrigationMm,
        litersForArea,
        actionTitle,
        actionBadge,
        actionColor,
        actionDetail
      };
    });

    // Total Akumulasi 7 Hari
    const totalWeeklyLiters = Math.round(totalNetIrrigationMm * irrigationAreaAre * 100);
    const totalWeeklyM3 = (totalWeeklyLiters / 1000).toFixed(1);
    const totalRainSavedM3 = ((totalEffectiveRainMm * irrigationAreaAre * 100) / 1000).toFixed(1);
    
    // Estimasi Penghematan BBM Pompa
    const savedPumpHours = Math.max(0, Math.round(parseFloat(totalRainSavedM3) / 8)); // pompa diesel 8 m3/jam
    const savedBbmRp = savedPumpHours * 15000; // Rp 15.000 / jam

    let weeklySummary = 'Kebutuhan Irigasi Stabil';
    let weeklyBadge = 'Terkendali';
    if (totalEffectiveRainMm >= totalEtcMm * 0.7) {
      weeklySummary = 'Musim Hujan Membantu: Sebagian besar kebutuhan air tercukupi alami dari langit.';
      weeklyBadge = 'Hemat Air & Biaya';
    } else if (totalNetIrrigationMm > 25) {
      weeklySummary = 'Cuaca Cenderung Kering: Jadwalkan irigasi rutin bergiliran agar tanaman tidak stres air.';
      weeklyBadge = 'Perlu Perhatian';
    }

    return {
      dailyBreakdown,
      totalEtcMm: parseFloat(totalEtcMm.toFixed(1)),
      totalRainMm: parseFloat(totalRainMm.toFixed(1)),
      totalEffectiveRainMm: parseFloat(totalEffectiveRainMm.toFixed(1)),
      totalNetIrrigationMm: parseFloat(totalNetIrrigationMm.toFixed(1)),
      totalWeeklyLiters,
      totalWeeklyM3,
      totalRainSavedM3,
      savedPumpHours,
      savedBbmRp,
      weeklySummary,
      weeklyBadge
    };
  }, [weatherForecast, cropKcInfo, irrigationAreaAre]);

  // Daftar Petak Lahan Pengguna untuk Rekomendasi Irigasi per Petak
  const userLandPlots: LandPlotLocation[] = useMemo(() => getLandPlots(), []);

  // Kalkulasi Rekomendasi Volume Irigasi (Liter) untuk Setiap Petak Lahan Pengguna Berdasarkan Cuaca
  const userPlotsIrrigationEstimates = useMemo(() => {
    return userLandPlots.map((plot) => {
      const plotArea = plot.unit === 'Are' ? plot.areaOrPopulation : 10;
      
      // Koefisien tanaman (Kc) spesifik untuk komoditas petak lahan
      let kc = 1.15;
      if (plot.commodityId === 'padi') kc = 1.20;
      else if (plot.commodityId === 'jagung' || plot.commodityId === 'kedelai') kc = 0.95;
      else if (plot.commodityId === 'bawang_merah' || plot.commodityId === 'cabai') kc = 1.05;
      else if (plot.commodityId === 'sawit') kc = 0.85;
      else if (plot.commodityId === 'tembakau') kc = 0.80;

      // Akumulasi kebutuhan air tanaman vs hujan 7 hari untuk plot ini
      let totalPlotEtcMm = 0;
      let totalPlotPeffMm = 0;
      let totalPlotNetMm = 0;

      weatherForecast.forEach((day) => {
        const tempAvg = (day.tempMin + day.tempMax) / 2;
        const deltaT = Math.max(4, day.tempMax - day.tempMin);
        const eto = 0.0023 * (tempAvg + 17.8) * Math.sqrt(deltaT) * 3.4;
        const etc = eto * kc;

        let rainMm = 0;
        if (day.condition.includes('Hujan Lebat')) rainMm = 35;
        else if (day.condition.includes('Hujan')) rainMm = 12;
        else if (day.rainProbability >= 40) rainMm = 3;

        const peff = rainMm > 0 ? Math.min(rainMm * 0.75, etc + 12) : 0;
        const netIrrigationMm = Math.max(0, etc - peff);

        totalPlotEtcMm += etc;
        totalPlotPeffMm += peff;
        totalPlotNetMm += netIrrigationMm;
      });

      // Volume air dalam Liter = Net Irrigation (mm) * Luas (Are) * 100 (1 mm = 1 L/m2, 1 Are = 100 m2)
      const weeklyLiters = Math.round(totalPlotNetMm * plotArea * 100);
      const dailyAverageLiters = Math.round(weeklyLiters / 7);
      const weeklyM3 = parseFloat((weeklyLiters / 1000).toFixed(1));
      const rainSuppliedM3 = parseFloat(((totalPlotPeffMm * plotArea * 100) / 1000).toFixed(1));

      let recommendationStatus = 'Irigasi Rutin Pagi';
      let statusBadge = 'Normal';
      let statusColor = 'emerald';

      if (totalPlotNetMm <= 5) {
        recommendationStatus = 'Hujan Cukup (Matikan Pompa BBM)';
        statusBadge = 'Cukup Hujan';
        statusColor = 'sky';
      } else if (totalPlotNetMm >= 25) {
        recommendationStatus = 'Defisit Air Tinggi (Alirkan Segera)';
        statusBadge = 'Butuh Air';
        statusColor = 'amber';
      }

      return {
        plot,
        plotArea,
        kc,
        totalPlotEtcMm: parseFloat(totalPlotEtcMm.toFixed(1)),
        totalPlotPeffMm: parseFloat(totalPlotPeffMm.toFixed(1)),
        totalPlotNetMm: parseFloat(totalPlotNetMm.toFixed(1)),
        weeklyLiters,
        dailyAverageLiters,
        weeklyM3,
        rainSuppliedM3,
        recommendationStatus,
        statusBadge,
        statusColor
      };
    });
  }, [userLandPlots, weatherForecast]);

  const totalAllPlotsWeeklyLiters = useMemo(() => {
    return userPlotsIrrigationEstimates.reduce((acc, item) => acc + item.weeklyLiters, 0);
  }, [userPlotsIrrigationEstimates]);

  const fetchSensorTelemetry = async () => {
    setIsFetchingSensor(true);
    try {
      const res = await fetch('/api/sensor-data');
      if (res.ok) {
        const data = await res.json();
        setSensorData(data);
      } else {
        throw new Error('Fallback simulated sensor');
      }
    } catch {
      // Offline / fallback telemetry jitter
      setSensorData(prev => ({
        ...prev,
        timestamp: new Date().toLocaleTimeString('id-ID'),
        soilMoisture: Math.min(85, Math.max(45, prev.soilMoisture + Math.round((Math.random() * 6 - 3)))),
        soilTemperature: parseFloat((28.0 + Math.random() * 1.5).toFixed(1)),
        soilPh: parseFloat((6.4 + Math.random() * 0.3).toFixed(2))
      }));
    } finally {
      setIsFetchingSensor(false);
    }
  };

  useEffect(() => {
    fetchSensorTelemetry();
  }, []);

  // Synchronize reminder settings with current selected crop & planting date
  useEffect(() => {
    const currentSettings = getFertilizationReminderSettings();
    saveFertilizationReminderSettings({
      ...currentSettings,
      activeCommodityId: commodityId,
      plantingDate: plantingDate
    });
    setReminderSettings(prev => ({
      ...prev,
      activeCommodityId: commodityId,
      plantingDate: plantingDate
    }));
  }, [commodityId, plantingDate]);

  // Check and trigger daily reminder automatically when view is opened
  useEffect(() => {
    const settings = getFertilizationReminderSettings();
    if (settings.isEnabled) {
      triggerDailyFertilizationBrowserNotification();
    }
  }, []);

  const handleExportSchedulePdf = (action: 'save' | 'print' = 'save') => {
    setIsExportingPdf(true);
    try {
      exportFertilizationScheduleToPDF({
        cropSchedule: currentCropSchedule,
        plantingDate,
        farmerName: farmerNameForPdf,
        farmLocation: farmLocationForPdf,
        areaInAre: areaForPdf,
        completedScheduleIds,
        action
      });

      const msg = action === 'print' ? 'Perintah cetak jadwal pemupukan dikirim ke printer!' : 'Jadwal pemupukan berhasil diunduh dalam format PDF!';
      setPdfSuccessToast(msg);
      setTimeout(() => setPdfSuccessToast(null), 4000);
      setShowSchedulePdfModal(false);

      addNotification({
        title: action === 'print' ? '🖨️ Cetak Jadwal Pemupukan' : '📄 Jadwal Pemupukan PDF Diunduh',
        message: `Dokumen jadwal ${currentCropSchedule.name} (${areaForPdf} Are) berhasil ${action === 'print' ? 'dicetak' : 'diekspor ke format PDF'}.`,
        type: 'jadwal',
        priority: 'normal'
      });
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengekspor PDF: ' + err.message);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleToggleDailyReminder = async () => {
    const newEnabled = !reminderSettings.isEnabled;
    if (newEnabled && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission();
        setBrowserPermission(perm);
      }
    }

    const updated = {
      ...reminderSettings,
      isEnabled: newEnabled,
      activeCommodityId: commodityId,
      plantingDate
    };
    saveFertilizationReminderSettings(updated);
    setReminderSettings(updated);

    if (newEnabled) {
      setTestNotifFeedback('Pengingat harian aktif! Notifikasi otomatis muncul setiap pagi di jendela stomata terbuka (06.30).');
    } else {
      setTestNotifFeedback('Pengingat harian dinonaktifkan.');
    }
    setTimeout(() => setTestNotifFeedback(null), 4000);
  };

  const handleTestBrowserNotification = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted') {
        const perm = await Notification.requestPermission();
        setBrowserPermission(perm);
        if (perm !== 'granted') {
          alert('Izin notifikasi belum diizinkan di browser Anda. Harap berikan izin notifikasi pada bilah browser.');
          return;
        }
      }
    }

    const res = triggerDailyFertilizationBrowserNotification(undefined, true);
    if (res.sent) {
      setTestNotifFeedback(`Notifikasi berhasil dikirim: "${res.title}"`);
    } else {
      setTestNotifFeedback(res.reason || 'Notifikasi gagal dikirim.');
    }
    setTimeout(() => setTestNotifFeedback(null), 4500);
  };

  const toggleScheduleComplete = (id: string, title: string) => {
    setCompletedScheduleIds(prev => {
      const nextState = !prev[id];
      if (nextState) {
        addNotification({
          title: '✅ Pemupukan Selesai',
          message: `${title} untuk tanaman ${currentCropSchedule.name} berhasil dicatat.`,
          type: 'jadwal',
          priority: 'normal'
        });
      }
      return { ...prev, [id]: nextState };
    });
  };

  const handleRequestPushNotification = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('🌾 Paten Agro: Pengingat Pemupukan Aktif', {
          body: `Jadwal pemupukan ${currentCropSchedule.name} akan dikirim sesuai usia tanaman (HST).`,
          icon: '/favicon.ico'
        });
      }
    }

    addNotification({
      title: '🔔 Notifikasi Pemupukan Aktif',
      message: `Alarm & pengingat jadwal aplikasi Paten untuk ${currentCropSchedule.name} telah diatur otomatis sesuai HST tanaman.`,
      type: 'jadwal',
      priority: 'normal'
    });

    setNotifScheduled(true);
    setTimeout(() => setNotifScheduled(false), 4000);
  };

  return (
    <div className="space-y-5 pb-24">
      {/* WIDGET CUACA RINGKAS 3 HARI KE DEPAN (PANDUAN KEPUTUSAN IRIGASI & PENYEMPROTAN) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-4 sm:p-5 border border-slate-700/80 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xs">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black font-['Outfit'] tracking-tight text-white flex items-center gap-1.5">
                  Prakiraan Cuaca 3 Hari & Rekomendasi Lapangan
                </h3>
                <span className="hidden xs:inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Radar
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Lombok NTB • Keputusan cepat irigasi harian & jendela aman aplikasi pupuk nano
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeTab !== 'schedule' && (
              <button
                type="button"
                onClick={() => setActiveTab('schedule')}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 px-2.5 py-1.5 rounded-xl border border-emerald-800/80 transition-all flex items-center gap-1"
              >
                <span>Lihat Detail 7 Hari & Irigasi</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* 3 Day Weather Forecast Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {weatherForecast.slice(0, 3).map((day, idx) => {
            const isRain = day.condition.toLowerCase().includes('hujan');
            const isCloudy = day.condition.toLowerCase().includes('awan');
            const isHeavyRain = day.condition.toLowerCase().includes('lebat');

            return (
              <div
                key={idx}
                className={`relative rounded-2xl p-3 sm:p-3.5 border transition-all ${
                  idx === 0
                    ? 'bg-white/10 border-emerald-400/50 ring-1 ring-emerald-400/30 backdrop-blur-xs'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                {/* Badge Tag: Hari Ini / Besok */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-black ${idx === 0 ? 'text-amber-300' : 'text-slate-200'}`}>
                      {day.dayName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">({day.date})</span>
                  </div>
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      day.sprayingRecommendation === 'Sangat Baik'
                        ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                        : day.sprayingRecommendation === 'Baik'
                        ? 'bg-blue-500/25 text-blue-300 border border-blue-500/40'
                        : day.sprayingRecommendation === 'Hati-hati'
                        ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/25 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {day.sprayingRecommendation === 'Sangat Baik' ? '🟢 Ideal Semprot' : day.sprayingRecommendation === 'Baik' ? '🔵 Baik Semprot' : day.sprayingRecommendation === 'Hati-hati' ? '🟡 Hati-hati' : '🔴 Tunda Semprot'}
                  </span>
                </div>

                {/* Main Temperature & Weather Icon */}
                <div className="flex items-center justify-between my-1">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white/10">
                      {isHeavyRain ? (
                        <CloudLightning className="w-6 h-6 text-indigo-400" />
                      ) : isRain ? (
                        <CloudRain className="w-6 h-6 text-blue-400" />
                      ) : isCloudy ? (
                        <CloudSun className="w-6 h-6 text-teal-300" />
                      ) : (
                        <Sun className="w-6 h-6 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight text-white leading-none">
                        {day.tempMax}°C
                        <span className="text-xs text-slate-400 font-normal ml-1">/ {day.tempMin}°C</span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-200 mt-0.5">
                        {day.condition}
                      </p>
                    </div>
                  </div>

                  {/* Rain Probability Gauge */}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-semibold block">Peluang Hujan</span>
                    <span className={`text-xs font-black font-['Outfit'] ${
                      day.rainProbability >= 60 ? 'text-rose-400' : day.rainProbability >= 30 ? 'text-amber-300' : 'text-emerald-400'
                    }`}>
                      {day.rainProbability}%
                    </span>
                  </div>
                </div>

                {/* Direct Irrigation Decision Guidance */}
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                  <span className="text-slate-300 font-medium">
                    {day.rainProbability >= 60
                      ? '🌧️ Kurangi/matikan pompa irigasi (tanah tersiram hujan)'
                      : day.rainProbability >= 30
                      ? '⛅ Irigasi sedang secukupnya (cek kelembapan tanah)'
                      : '☀️ Wajib irigasi penuh pagi/sore hari'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Switcher Tab: Kalender Tanam Interaktif vs Jadwal Pemupukan & Cuaca vs Tugas Harian */}
      <div className="flex flex-wrap sm:flex-nowrap items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeTab === 'calendar'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CalendarCheck className="w-4 h-4 text-amber-300" />
          <span>Kalender Tanam Interaktif</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeTab === 'schedule'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Jadwal Dosis & Cuaca</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeTab === 'tasks'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4 text-teal-300" />
          <span>Tugas Harian Petani</span>
        </button>
      </div>

      {activeTab === 'calendar' ? (
        <InteractivePlantingCalendar
          initialCommodityId={commodityId}
          initialPlantingDate={plantingDate}
          onApplyToCalculator={onApplyToCalculator}
          onOpenAiConsultant={onOpenAiConsultant}
        />
      ) : activeTab === 'tasks' ? (
        <FarmerDailyTasksModule initialCommodityId={commodityId} />
      ) : (
        <>
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 text-white rounded-2xl p-4 sm:p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold mb-2">
            <Cpu className="w-3.5 h-3.5 text-amber-300" />
            <span>Telemetri Lahan & Kalender Aplikasi Paten Sesuai Usia</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight">
            Jadwal Pemupukan & Sensor Tanah Terhubung
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
            Pantau kondisi kelembapan tanah lahan secara langsung, cek rekomendasi jendela semprot cuaca, dan ikuti panduan dosis usia tanaman dari panduan resmi.
          </p>
        </div>
      </div>

      {/* SENSOR TELEMETRY LIVE MONITOR */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                Sensor Kelembapan & Tanah Lahan (IoT Telemetri)
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h3>
              <p className="text-[11px] text-slate-500">
                Probe Sensor Blok A • Update Terakhir: {sensorData.timestamp}
              </p>
            </div>
          </div>

          <button
            onClick={fetchSensorTelemetry}
            disabled={isFetchingSensor}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetchingSensor ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Segarkan Sensor</span>
          </button>
        </div>

        {/* 4 Sensor Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Kelembapan Tanah */}
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200">
            <div className="flex items-center justify-between text-blue-700 text-xs font-bold">
              <span>Kelembapan Tanah</span>
              <Droplets className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-blue-950 font-['Outfit'] mt-1">
              {sensorData.soilMoisture}%
            </p>
            <p className="text-[10px] text-blue-800 font-medium mt-0.5">
              Status: {sensorData.status}
            </p>
          </div>

          {/* Suhu Tanah */}
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
            <div className="flex items-center justify-between text-amber-700 text-xs font-bold">
              <span>Suhu Tanah</span>
              <Thermometer className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-amber-950 font-['Outfit'] mt-1">
              {sensorData.soilTemperature}°C
            </p>
            <p className="text-[10px] text-amber-800 font-medium mt-0.5">
              Ideal perakaran
            </p>
          </div>

          {/* pH Tanah Aktual */}
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-center justify-between text-emerald-700 text-xs font-bold">
              <span>pH Tanah Aktual</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-emerald-950 font-['Outfit'] mt-1">
              {sensorData.soilPh}
            </p>
            <p className="text-[10px] text-emerald-800 font-medium mt-0.5">
              Mendekati zona optimum
            </p>
          </div>

          {/* Konduktivitas Hara (EC) */}
          <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200">
            <div className="flex items-center justify-between text-purple-700 text-xs font-bold">
              <span>Kadar Hara (EC)</span>
              <Cpu className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-purple-950 font-['Outfit'] mt-1">
              {sensorData.conductivityEc} <span className="text-xs font-normal">mS/cm</span>
            </p>
            <p className="text-[10px] text-purple-800 font-medium mt-0.5">
              Ketersediaan nutrisi baik
            </p>
          </div>
        </div>

        {/* Rekomendasi Jendela Semprot Berdasarkan Stomata */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Clock className="w-4 h-4" />
              <span>JENDELA WAKTU TERBAIK PENYEMPROTAN HARI INI</span>
            </div>
            <p className="text-xs text-emerald-100 mt-0.5">
              Stomata Daun Terbuka Maksimal: <strong>Pukul 06.00 - 09.00 Pagi</strong>. Hindari semprot saat terik matahari siang (11.00-14.00) karena stomata menutup.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-white text-emerald-800 text-xs font-extrabold shrink-0 self-start sm:self-auto">
            Waktu Semprot Aman
          </span>
        </div>
      </div>

      {/* 7-DAY WEATHER FORECAST */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <CloudSun className="w-4 h-4 text-emerald-700" />
            Laporan Cuaca Mingguan & Panduan Semprot
          </h3>
          <span className="text-[11px] text-slate-500">Prakiraan 7 Hari</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
          {weatherForecast.map((day, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border text-center flex flex-col justify-between ${
                idx === 0
                  ? 'bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-500/20'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <p className="text-xs font-bold text-slate-800">{day.dayName}</p>
                <p className="text-[10px] text-slate-400">{day.date}</p>
              </div>

              <div className="my-2">
                {day.condition.includes('Hujan') ? (
                  <CloudRain className="w-6 h-6 text-blue-500 mx-auto" />
                ) : (
                  <Sun className="w-6 h-6 text-amber-500 mx-auto" />
                )}
                <p className="text-xs font-black text-slate-800 font-['Outfit'] mt-1">
                  {day.tempMax}°C
                </p>
                <p className="text-[10px] text-slate-500">Hujan: {day.rainProbability}%</p>
              </div>

              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md truncate ${
                day.sprayingRecommendation === 'Sangat Baik'
                  ? 'bg-emerald-100 text-emerald-800'
                  : day.sprayingRecommendation === 'Baik'
                  ? 'bg-blue-100 text-blue-800'
                  : day.sprayingRecommendation === 'Hati-hati'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {day.sprayingRecommendation}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* FITUR: ESTIMASI KEBUTUHAN AIR MINGGUAN & OPTIMASI JADWAL IRIGASI */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
              <Waves className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Optimasi Irigasi & Kebutuhan Air Tanaman (ETc)</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 font-['Outfit']">
              Estimasi Kebutuhan Air Mingguan & Jadwal Irigasi Presisi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Kalkulasi ilmiah kebutuhan air tanaman berdasarkan data cuaca 7 hari, evapotranspirasi (ETo), koefisien fase tanam (Kc), dan curah hujan efektif untuk mengoptimalkan buka-tutup saluran irigasi serta menghemat biaya BBM pompa.
            </p>
          </div>

          {/* Area Selector Presets */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider pl-1">
              Luas Lahan:
            </span>
            <div className="flex items-center gap-1">
              {[5, 10, 20, 50, 100].map((areVal) => (
                <button
                  key={areVal}
                  type="button"
                  onClick={() => setIrrigationAreaAre(areVal)}
                  className={`px-2.5 py-1 text-xs font-extrabold rounded-xl transition-all border ${
                    irrigationAreaAre === areVal
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {areVal} {areVal === 100 ? 'Are (1 Ha)' : 'Are'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Summary Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Kebutuhan Air Tanaman (ETc) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <span>Kebutuhan Tanaman (ETc)</span>
                <Droplets className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 font-['Outfit'] mt-1">
                {weeklyIrrigationAnalysis.totalEtcMm} <span className="text-xs font-bold text-slate-500">mm/mgg</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Fase: <strong className="text-slate-700 dark:text-slate-300">{cropKcInfo.stage}</strong>
              </p>
            </div>
            <div className="text-[10px] text-blue-700 dark:text-blue-400 pt-2 mt-2 border-t border-slate-200/60 dark:border-slate-700">
              Kc Tanaman: <strong>{cropKcInfo.kc}</strong> (HST {currentHST})
            </div>
          </div>

          {/* Card 2: Pasokan Air Hujan Alami (Peff) */}
          <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-sky-800 dark:text-sky-300 text-[11px] font-bold uppercase tracking-wider">
                <span>Pasokan Hujan Efektif</span>
                <CloudRain className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              </div>
              <p className="text-2xl font-black text-sky-950 dark:text-sky-200 font-['Outfit'] mt-1">
                {weeklyIrrigationAnalysis.totalEffectiveRainMm} <span className="text-xs font-bold text-sky-700 dark:text-sky-400">mm/mgg</span>
              </p>
              <p className="text-[11px] text-sky-700 dark:text-sky-300 mt-0.5">
                Total curah hujan: <strong>{weeklyIrrigationAnalysis.totalRainMm} mm</strong>
              </p>
            </div>
            <div className="text-[10px] text-sky-800 dark:text-sky-300 pt-2 mt-2 border-t border-sky-200/60 dark:border-sky-800/60">
              Air alami gratis terserap tanah
            </div>
          </div>

          {/* Card 3: Defisit Air / Air Irigasi Tambahan yang Wajib Dialirkan */}
          <div className="p-3.5 rounded-2xl bg-blue-50/90 dark:bg-blue-950/40 border-2 border-blue-500/80 dark:border-blue-600/70 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between text-blue-800 dark:text-blue-300 text-[11px] font-bold uppercase tracking-wider">
                <span>Defisit Air Irigasi (NIR)</span>
                <Gauge className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-black text-blue-950 dark:text-blue-100 font-['Outfit'] mt-1">
                {weeklyIrrigationAnalysis.totalNetIrrigationMm} <span className="text-xs font-bold text-blue-700 dark:text-blue-300">mm/mgg</span>
              </p>
              <p className="text-xs font-extrabold text-blue-800 dark:text-blue-300 mt-0.5">
                ±{weeklyIrrigationAnalysis.totalWeeklyLiters.toLocaleString('id-ID')} Liter ({weeklyIrrigationAnalysis.totalWeeklyM3} m³)
              </p>
            </div>
            <div className="text-[10px] text-blue-900 dark:text-blue-200 pt-2 mt-2 border-t border-blue-200/60 dark:border-blue-800 font-semibold">
              Kebutuhan untuk lahan {irrigationAreaAre} Are
            </div>
          </div>

          {/* Card 4: Penghematan Bahan Bakar Pompa */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
                <span>Efisiensi Biaya Pompa</span>
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-200 font-['Outfit'] mt-1">
                Hemat Rp {weeklyIrrigationAnalysis.savedBbmRp.toLocaleString('id-ID')}
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                Hemat ~{weeklyIrrigationAnalysis.savedPumpHours} jam operasional pompa
              </p>
            </div>
            <div className="text-[10px] text-emerald-800 dark:text-emerald-300 pt-2 mt-2 border-t border-emerald-200/60 dark:border-emerald-800">
              Memanfaatkan ~{weeklyIrrigationAnalysis.totalRainSavedM3} m³ pasokan hujan
            </div>
          </div>
        </div>

        {/* Status Indikator & Rekomendasi Tinggi Genangan Air */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shrink-0" />
            <div>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">
                Status Kecukupan Air Mingguan: <span className="text-blue-600 dark:text-blue-400">{weeklyIrrigationAnalysis.weeklySummary}</span>
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Rekomendasi genangan: <strong>{cropKcInfo.waterDepth}</strong> • {cropKcInfo.tips}
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-extrabold text-xs shrink-0 self-start sm:self-auto border border-blue-200 dark:border-blue-800">
            <Waves className="w-3.5 h-3.5" />
            <span>Tinggi Air: {cropKcInfo.waterDepth}</span>
          </div>
        </div>

        {/* FITUR: REKOMENDASI VOLUME IRIGASI DALAM LITER UNTUK SETIAP PETAK LAHAN PENGGUNA */}
        <div className="bg-slate-50 dark:bg-slate-950/70 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 font-['Outfit']">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Rekomendasi Volume Irigasi (Liter) Setiap Petak Lahan Pengguna</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kalkulasi volume air bersih yang perlu dialirkan selama 7 hari ke depan untuk masing-masing petak lahan terdaftar berdasarkan data ramalan cuaca.
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-950/80 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 text-right shrink-0">
              <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase block">Total Seluruh Lahan:</span>
              <span className="text-xs font-black text-blue-900 dark:text-blue-100 font-['Outfit']">
                ±{totalAllPlotsWeeklyLiters.toLocaleString('id-ID')} Liter ({(totalAllPlotsWeeklyLiters / 1000).toFixed(1)} m³)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userPlotsIrrigationEstimates.map(({ plot, plotArea, weeklyLiters, dailyAverageLiters, weeklyM3, recommendationStatus, statusBadge, statusColor }) => (
              <div
                key={plot.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 transition-all space-y-2.5 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>{plot.name}</span>
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Petani: <strong>{plot.farmerName}</strong> • {plot.addressName}
                    </p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                    statusColor === 'sky'
                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                      : statusColor === 'amber'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {statusBadge}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Komoditas & Luas</span>
                    <span className="font-black text-slate-800 dark:text-slate-200 truncate block">
                      {plot.commodityName.split(' ')[0]} ({plotArea} Are)
                    </span>
                  </div>
                  <div className="border-x border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 block font-bold">Volume Mingguan</span>
                    <span className="font-black text-blue-900 dark:text-blue-200 font-['Outfit'] text-sm">
                      {weeklyLiters.toLocaleString('id-ID')} <span className="text-[10px]">Liter</span>
                    </span>
                    <span className="text-[9px] text-slate-400 block">({weeklyM3} m³)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Rata-rata/Hari</span>
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 font-['Outfit'] text-xs">
                      ±{dailyAverageLiters.toLocaleString('id-ID')} <span className="text-[9px]">L/hari</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-600 dark:text-slate-300">
                    💡 Anjuran: <strong className="text-slate-800 dark:text-slate-100">{recommendationStatus}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIrrigationAreaAre(plotArea);
                      setCommodityId(plot.commodityId);
                    }}
                    className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>Fokus Lahan Ini</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabel Rincian Jadwal Irigasi Harian (7 Hari) */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Rekomendasi Jadwal Irigasi 7 Hari Ke Depan:</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2.5">
            {weeklyIrrigationAnalysis.dailyBreakdown.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border flex flex-col justify-between transition-all ${
                  item.actionColor === 'rose'
                    ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/60'
                    : item.actionColor === 'amber'
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/60'
                    : item.actionColor === 'blue'
                    ? 'bg-sky-50/70 dark:bg-sky-950/30 border-sky-300 dark:border-sky-800/60'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">{item.dayName}</span>
                    <span className="text-[10px] text-slate-400">{item.date}</span>
                  </div>

                  <div className="flex items-center gap-1.5 my-2">
                    {item.condition.includes('Hujan') ? (
                      <CloudRain className="w-4 h-4 text-blue-500 shrink-0" />
                    ) : (
                      <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                      {item.condition}
                    </span>
                  </div>

                  {/* Water numbers */}
                  <div className="text-[11px] space-y-0.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-700">
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Kebutuhan (ETc):</span>
                      <strong className="text-slate-700 dark:text-slate-300">{item.etc} mm</strong>
                    </div>
                    <div className="flex justify-between text-sky-700 dark:text-sky-400">
                      <span>Hujan (Peff):</span>
                      <strong>{item.peff} mm</strong>
                    </div>
                    <div className="flex justify-between text-blue-800 dark:text-blue-300 font-extrabold pt-1 border-t border-dashed border-slate-200 dark:border-slate-700">
                      <span>Irigasi Bersih:</span>
                      <span>{item.netIrrigationMm} mm</span>
                    </div>
                    <div className="text-right text-[10px] font-extrabold text-blue-600 dark:text-blue-400">
                      (±{item.litersForArea.toLocaleString('id-ID')} Liter)
                    </div>
                  </div>
                </div>

                {/* Action Badge */}
                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700">
                  <span className={`block text-center text-[10px] font-black py-1 px-1.5 rounded-lg truncate ${
                    item.actionColor === 'rose'
                      ? 'bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100'
                      : item.actionColor === 'amber'
                      ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
                      : item.actionColor === 'blue'
                      ? 'bg-sky-200 dark:bg-sky-900 text-sky-900 dark:text-sky-100'
                      : 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100'
                  }`}>
                    {item.actionBadge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sinergi Irigasi dengan Aplikasi Pupuk Paten Nano */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-teal-950/20 to-blue-950/20 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-blue-950/40 border border-emerald-300/80 dark:border-emerald-800/80 space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-black text-xs">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Sinergi Pengairan dengan Aplikasi Pupuk Paten Nano (Aturan Emas):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs text-slate-700 dark:text-slate-300">
            <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-emerald-200/60 dark:border-emerald-800/60">
              <span className="font-extrabold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                1. Irigasi Berselang (Macak-Macak)
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Jangan menggenangi sawah terus-menerus. Sistem pengairan berselang (intermittent) memberi kesempatan akar bernapas dan memaksimalkan serapan hara organik Paten.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-emerald-200/60 dark:border-emerald-800/60">
              <span className="font-extrabold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                2. Hindari Semprot Saat Daun Basah
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Semprot Paten Gold/Imun di pagi hari (06.00-09.00) saat stomata terbuka dan embun telah menguap. Hindari penyemprotan jika diprediksi hujan lebat dalam 2 jam ke depan.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-emerald-200/60 dark:border-emerald-800/60">
              <span className="font-extrabold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                3. Buka Saluran Buang Saat Hujan
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Saat diprediksi hujan lebat (seperti hari Jumat), tutup pintu pemasukan air dan buka saluran pembuang agar lapisan humus dan unsur hara tanah tidak terbawa arus banjir.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PLANTING DATE & TIMELINE PEMUPUKAN */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              Jadwal Pemupukan Sesuai Usia Tanaman ({currentCropSchedule.name})
            </h3>
            <p className="text-xs text-slate-500">
              Disusun langsung berdasarkan petunjuk aplikasi brosur Paten Resmi
            </p>
          </div>

          {/* Commodity & Planting Date Pickers */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={commodityId}
              onChange={(e) => setCommodityId(e.target.value as CommodityId)}
              className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-800"
            >
              <option value="padi">Padi Sawah</option>
              <option value="jagung">Jagung Hibrida</option>
              <option value="kedelai">Kacang Kedelai</option>
              <option value="sawit">Kelapa Sawit</option>
              <option value="bawang_merah">Bawang Merah</option>
              <option value="cabai">Cabai</option>
              <option value="tembakau">Tembakau (Slide 28)</option>
              <option value="gaharu">Gaharu (Slide 20)</option>
            </select>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2 py-1">
              <span className="text-[11px] text-slate-500 font-medium">Tgl Tanam:</span>
              <input
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Current Age Banner & Action Buttons */}
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="px-3 py-1 rounded-xl bg-emerald-700 text-white font-black text-base sm:text-lg font-['Outfit'] shadow-xs">
              HST {currentHST}
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
                Hari Setelah Tanam Aktif ({currentCropSchedule.name})
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                Tanam: {new Date(plantingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Action Buttons: Ekspor PDF & Cetak */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSchedulePdfModal(true)}
              className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              title="Ekspor Jadwal Pemupukan ke Dokumen PDF Resmi"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-300" />
              <span>Ekspor PDF</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowSchedulePdfModal(true);
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              title="Cetak Jadwal Pemupukan ke Printer"
            >
              <Printer className="w-3.5 h-3.5 text-sky-300" />
              <span>Cetak Jadwal</span>
            </button>
          </div>
        </div>

        {/* BROWSER-BASED DAILY FERTILIZATION REMINDER CARD */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 dark:from-slate-800 dark:via-slate-800/90 dark:to-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/60 dark:border-slate-700 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 font-['Outfit']">
                    Pengingat Harian Pemupukan (Browser & Offline)
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    reminderSettings.isEnabled
                      ? 'bg-emerald-200/70 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {reminderSettings.isEnabled ? 'Aktif Tiap Pagi' : 'Nonaktif'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Notifikasi lokal otomatis dikirimkan ke layar browser Anda setiap pukul {reminderSettings.preferredTime} pagi saat jendela stomata daun terbuka.
                </p>
              </div>
            </div>

            {/* Toggle Button */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleToggleDailyReminder}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                  reminderSettings.isEnabled
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${reminderSettings.isEnabled ? 'bg-amber-300 animate-ping' : 'bg-slate-400'}`} />
                <span>{reminderSettings.isEnabled ? 'Pengingat Aktif' : 'Aktifkan Pengingat'}</span>
              </button>
            </div>
          </div>

          {/* Info grid & Test Button */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Status Izin Browser:</span>
              <div className="flex items-center gap-1.5 mt-0.5 font-bold">
                {browserPermission === 'granted' ? (
                  <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Diizinkan (Siap Muncul)
                  </span>
                ) : browserPermission === 'denied' ? (
                  <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Diblokir di Browser
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" /> Memerlukan Izin
                  </span>
                )}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Waktu Pengingat Pagi:</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">
                Pukul {reminderSettings.preferredTime} Pagi (Jendela Stomata)
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Uji Notifikasi:</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">Tes kirim ke browser</span>
              </div>
              <button
                type="button"
                onClick={handleTestBrowserNotification}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition-all active:scale-95 shadow-2xs"
                title="Uji notifikasi browser sekarang"
              >
                <Send className="w-3 h-3" />
                <span>Uji Sekarang</span>
              </button>
            </div>
          </div>

          {/* Feedback toast */}
          {testNotifFeedback && (
            <div className="p-2.5 rounded-xl bg-emerald-800 text-white text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{testNotifFeedback}</span>
            </div>
          )}

          {pdfSuccessToast && (
            <div className="p-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{pdfSuccessToast}</span>
            </div>
          )}
        </div>

        {/* Timeline Items */}
        <div className="space-y-3 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200">
          {currentCropSchedule.schedules.map((item) => {
            const isCompleted = !!completedScheduleIds[item.id];
            const isDueOrPast = currentHST >= item.dayAfterPlanting;
            const isToday = currentHST === item.dayAfterPlanting;

            return (
              <div
                key={item.id}
                className={`relative pl-12 pr-4 py-3 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-50 border-slate-200 opacity-75'
                    : isToday
                    ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : isDueOrPast
                    ? 'bg-amber-50/50 border-amber-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Checkbox indicator */}
                <button
                  onClick={() => toggleScheduleComplete(item.id, item.title)}
                  className="absolute left-3 top-3.5 p-1 text-slate-400 hover:text-emerald-700"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-emerald-900 font-['Outfit']">
                        {item.title}
                      </span>
                      {isToday && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white animate-pulse">
                          Jatuh Tempo Hari Ini!
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 font-semibold">
                      Tindakan: <span className="text-emerald-700">{item.actionType}</span> • Produk: {item.products.join(', ')}
                    </p>
                  </div>

                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg self-start sm:self-auto">
                    {item.waterVolume}
                  </span>
                </div>

                <div className="mt-2 text-xs text-slate-600 bg-white/80 p-2.5 rounded-xl border border-slate-100 space-y-1">
                  <p><strong>Takaran Dosis:</strong> {item.dosage}</p>
                  <p><strong>Cara Campur:</strong> {item.mixingInstruction}</p>
                  <p className="text-[11px] text-emerald-700"><strong>Sasaran:</strong> {item.targetStomata}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tips agronomi praktis */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-100">Tips Penting Pemupukan Berkelanjutan:</p>
          <ul className="list-disc list-inside space-y-0.5 text-[11px]">
            {currentCropSchedule.tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>
        </>
      )}

      {/* MODAL EKSPOR & CETAK JADWAL PEMUPUKAN PDF */}
      {showSchedulePdfModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                  <FileDown className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit']">
                    Ekspor & Cetak Jadwal Pemupukan (PDF)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Dokumen resmi kalender aplikasi pupuk Paten Nano siap unduh dan cetak
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSchedulePdfModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Komoditi:</span>
                <strong className="text-emerald-900 dark:text-emerald-200 font-extrabold">{currentCropSchedule.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Tanggal Tanam:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {new Date(plantingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} (HST {currentHST})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Jumlah Tahapan:</span>
                <span className="font-bold text-emerald-800 dark:text-emerald-400">{currentCropSchedule.schedules.length} Tahapan Aplikasi</span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExportSchedulePdf('save');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Petani / Kelompok Tani / Mitra
                </label>
                <input
                  type="text"
                  required
                  value={farmerNameForPdf}
                  onChange={(e) => setFarmerNameForPdf(e.target.value)}
                  placeholder="Contoh: Bpk. Lalu Mas'ud / Gapoktan Sasak"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Lokasi Lahan
                  </label>
                  <input
                    type="text"
                    required
                    value={farmLocationForPdf}
                    onChange={(e) => setFarmLocationForPdf(e.target.value)}
                    placeholder="Contoh: Narmada, Lombok Barat"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Luas Lahan (Are)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={areaForPdf}
                    onChange={(e) => setAreaForPdf(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Isi Dokumen yang Dihasilkan:</span>
                <p>• Surat Rekomendasi Resmi berlogo PT Renner Inti Internasional.</p>
                <p>• Kalender tanggal riil penyemprotan per fase HST.</p>
                <p>• Dosis akurat tangki 16-20L & waktu terbaik buka stomata.</p>
                <p>• Lembar validasi tanda tangan petani & pengurus Gapoktan.</p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSchedulePdfModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>

                <button
                  type="button"
                  disabled={isExportingPdf}
                  onClick={() => handleExportSchedulePdf('print')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <Printer className="w-4 h-4 text-sky-300" />
                  <span>Cetak Langsung</span>
                </button>

                <button
                  type="submit"
                  disabled={isExportingPdf}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <FileDown className="w-4 h-4 text-amber-300" />
                  <span>{isExportingPdf ? 'Mengompilasi PDF...' : 'Unduh Dokumen PDF'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
