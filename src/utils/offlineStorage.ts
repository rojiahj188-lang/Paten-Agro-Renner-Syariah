import { HarvestRecord, NotificationItem, DiseaseDiagnosis, SoilFertilityProfile, LandPlotLocation, ForumPost, ForumComment, FarmerDailyTask, CommodityId, PestOutbreakReport } from '../types';
import { CROP_SCHEDULES } from '../data/cropSchedules';

const STORAGE_KEYS = {
  HARVEST_RECORDS: 'paten_agro_harvest_records_v1',
  NOTIFICATIONS: 'paten_agro_notifications_v1',
  DIAGNOSIS_HISTORY: 'paten_agro_diagnosis_history_v1',
  SAVED_SIMULATIONS: 'paten_agro_saved_simulations_v1',
  OFFLINE_QUEUE: 'paten_agro_offline_queue_v1',
  LAST_SYNC: 'paten_agro_last_sync_v1',
  SOIL_PROFILES: 'paten_agro_soil_profiles_v1',
  LAND_PLOTS: 'paten_agro_land_plots_v2',
  FORUM_POSTS: 'paten_agro_forum_posts_v1',
  DAILY_TASKS: 'paten_agro_daily_tasks_v1',
  FERTILIZATION_REMINDERS: 'paten_agro_fertilization_reminders_v1',
  PEST_OUTBREAKS: 'paten_agro_pest_outbreaks_v1'
};

export const INITIAL_LAND_PLOTS: LandPlotLocation[] = [
  {
    id: 'plot-1',
    name: 'Lahan Padi Sawah Percontohan Renner',
    farmerName: 'H. Daeng Rahman',
    commodityId: 'padi',
    commodityName: 'Padi Sawah (GKG)',
    areaOrPopulation: 35,
    unit: 'Are',
    phValue: 5.4,
    soilCondition: 'asam',
    coordinates: { lat: -5.1477, lng: 119.4327 }, // Makassar / Sulsel
    addressName: 'Gowa - Panakukang, Sulawesi Selatan',
    notes: 'Pola Paten Gold 6 box/Ha, anakan produktif meningkat 60%.',
    registeredDate: '2026-03-12'
  },
  {
    id: 'plot-lombok-barat',
    name: 'Lahan Padi Sawah Organik Narmada',
    farmerName: "Lalu Mas'ud",
    commodityId: 'padi',
    commodityName: 'Padi Sawah (GKG)',
    areaOrPopulation: 30,
    unit: 'Are',
    phValue: 6.2,
    soilCondition: 'agak_asam',
    coordinates: { lat: -8.6833, lng: 116.1333 }, // Lombok Barat
    addressName: 'Narmada, Lombok Barat, NTB',
    notes: 'Pola tanam padi sawah dengan Paten Gold. Mata air Narmada jernih, serapan stomata nano optimal.',
    registeredDate: '2026-03-20'
  },
  {
    id: 'plot-lombok-tengah',
    name: 'Sentra Tembakau Virginia Praya',
    farmerName: 'H. Baiq Mulyani',
    commodityId: 'tembakau',
    commodityName: 'Tembakau (Rajangan Kering)',
    areaOrPopulation: 40,
    unit: 'Are',
    phValue: 5.7,
    soilCondition: 'asam',
    coordinates: { lat: -8.7000, lng: 116.2833 }, // Lombok Tengah
    addressName: 'Praya Timur, Lombok Tengah, NTB',
    notes: 'Kocor Paten Gold + ZA di HST 14 & 28. Daun rajangan tebal mengkilap, rendemen grade A.',
    registeredDate: '2026-03-21'
  },
  {
    id: 'plot-lombok-utara',
    name: 'Kebun Jagung Hibrida Lereng Rinjani',
    farmerName: 'Amaq Raden',
    commodityId: 'jagung',
    commodityName: 'Jagung Hibrida',
    areaOrPopulation: 45,
    unit: 'Are',
    phValue: 6.0,
    soilCondition: 'agak_asam',
    coordinates: { lat: -8.3500, lng: 116.1667 }, // Lombok Utara
    addressName: 'Bayan / Tanjung, Lombok Utara, NTB',
    notes: 'Paten Imun mencegah virus bulai di lereng gunung. Tongkol terisi padat 2 buah per batang.',
    registeredDate: '2026-03-22'
  },
  {
    id: 'plot-sumbawa-barat',
    name: 'Peternakan Kerbau Lumpur Taliwang',
    farmerName: 'Bpk. Dedi Hermansyah',
    commodityId: 'kerbau',
    commodityName: 'Kerbau (Lumpur & Pedaging)',
    areaOrPopulation: 30,
    unit: 'Ekor',
    phValue: 6.6,
    soilCondition: 'ideal',
    coordinates: { lat: -8.7333, lng: 116.8500 }, // Sumbawa Barat
    addressName: 'Taliwang, Sumbawa Barat (KSB), NTB',
    notes: 'Paten Hijau & Imun pada komboran air minum kerbau. Tubuh kekar padat, nafsu makan tinggi.',
    registeredDate: '2026-03-23'
  },
  {
    id: 'plot-sumbawa-besar',
    name: 'Penggemukan Sapi Sumbawa Moyo',
    farmerName: 'H. Burhanuddin',
    commodityId: 'sapi',
    commodityName: 'Sapi (Penggemukan & Perah)',
    areaOrPopulation: 50,
    unit: 'Ekor',
    phValue: 6.7,
    soilCondition: 'ideal',
    coordinates: { lat: -8.4947, lng: 117.4244 }, // Sumbawa Besar
    addressName: 'Moyo Hilir, Sumbawa Besar, NTB',
    notes: 'Penggemukan sapi lokal Sumbawa. Campuran Paten Hijau memacu ADG 1.2 kg/hari, kotoran tidak berbau.',
    registeredDate: '2026-03-24'
  },
  {
    id: 'plot-dompu',
    name: 'Lumbung Jagung Nasional Dompu',
    farmerName: 'Muhammad Syarif',
    commodityId: 'jagung',
    commodityName: 'Jagung Hibrida Pipil',
    areaOrPopulation: 80,
    unit: 'Are',
    phValue: 5.9,
    soilCondition: 'asam',
    coordinates: { lat: -8.5333, lng: 118.4667 }, // Dompu
    addressName: 'Manggelewa, Dompu, NTB',
    notes: 'Sentra jagung Dompu. Paten Gold menghemat pupuk kimia 60%, hasil panen 9.5 ton/Ha pipil kering.',
    registeredDate: '2026-03-25'
  },
  {
    id: 'plot-bima',
    name: 'Sentra Bawang Merah Super Sape',
    farmerName: 'Ibu Nurma Sape',
    commodityId: 'bawang_merah',
    commodityName: 'Bawang Merah (Umbi Basah)',
    areaOrPopulation: 25,
    unit: 'Are',
    phValue: 6.1,
    soilCondition: 'agak_asam',
    coordinates: { lat: -8.4583, lng: 118.7278 }, // Bima
    addressName: 'Sape / Woha, Bima, NTB',
    notes: 'Bawang merah Bima umbi padat merah menyala. Paten Imun menekan serangan ulat dan trotol moler.',
    registeredDate: '2026-03-26'
  },
  {
    id: 'plot-2',
    name: 'Perkebunan Kelapa Sawit Blok Sentosa',
    farmerName: 'Bpk. Suryanto',
    commodityId: 'sawit',
    commodityName: 'Kelapa Sawit (TBS)',
    areaOrPopulation: 100,
    unit: 'Are',
    phValue: 4.8,
    soilCondition: 'sangat_asam',
    coordinates: { lat: 0.5071, lng: 101.4478 }, // Riau / Pekanbaru
    addressName: 'Kampar, Riau',
    notes: 'Tanah gambut masam. Aplikasi Paten Gold 1 sachet per pohon tiap 4 bulan menormalkan produksi TBS.',
    registeredDate: '2026-02-18'
  },
  {
    id: 'plot-3',
    name: 'Lahan Jagung Hibrida Nusantara',
    farmerName: 'Pak Sukirno',
    commodityId: 'jagung',
    commodityName: 'Jagung Hibrida',
    areaOrPopulation: 50,
    unit: 'Are',
    phValue: 6.2,
    soilCondition: 'agak_asam',
    coordinates: { lat: -6.5595, lng: 107.7656 }, // Subang, Jawa Barat
    addressName: 'Subang, Jawa Barat',
    notes: 'Proteksi virus bule sukses di HST 5 dengan Paten Imun.',
    registeredDate: '2026-03-24'
  },
  {
    id: 'plot-4',
    name: 'Sentra Tembakau Rajangan Super Selong',
    farmerName: 'H. Mahsun Al-Bantani',
    commodityId: 'tembakau',
    commodityName: 'Tembakau (Rajangan Kering)',
    areaOrPopulation: 25,
    unit: 'Are',
    phValue: 5.8,
    soilCondition: 'asam',
    coordinates: { lat: -8.6500, lng: 116.3249 }, // Lombok Timur, NTB
    addressName: 'Selong, Lombok Timur, NTB',
    notes: 'Aplikasi Slide 28 PDF: kocor HST 14, 28, 30. Daun tebal lebar elastis.',
    registeredDate: '2026-03-05'
  },
  {
    id: 'plot-5',
    name: 'Hutan Budidaya Gaharu Wangi',
    farmerName: 'Ir. Hendra Wijaya',
    commodityId: 'gaharu',
    commodityName: 'Gaharu (Pohon Gubal)',
    areaOrPopulation: 20,
    unit: 'Are',
    phValue: 5.6,
    soilCondition: 'asam',
    coordinates: { lat: -0.5022, lng: 117.1536 }, // Samarinda, Kaltim
    addressName: 'Kutai Kartanegara, Kalimantan Timur',
    notes: 'Kocor drum 200L tiap 3 bulan untuk 200 pohon gaharu. Resin terbentuk wangi padat.',
    registeredDate: '2026-01-30'
  },
  {
    id: 'plot-6',
    name: 'Peternakan Sapi Potong Syariah Sejahtera',
    farmerName: 'Pak Haji Mustofa',
    commodityId: 'sapi',
    commodityName: 'Sapi (Penggemukan & Perah)',
    areaOrPopulation: 25,
    unit: 'Ekor',
    phValue: 6.8,
    soilCondition: 'ideal',
    coordinates: { lat: -7.8014, lng: 110.3647 }, // Bantul / Sleman Yogyakarta
    addressName: 'Sleman, D.I. Yogyakarta',
    notes: 'Paten Hijau & Imun dicampur 200L air minum. ADG tembus 1.3 kg/hari, kandang bebas bau amonia.',
    registeredDate: '2026-03-15'
  }
];

export const INITIAL_HARVEST_RECORDS: HarvestRecord[] = [
  {
    id: 'rec-0',
    date: '2024-11-18',
    seasonName: 'Musim Rendeng 2024',
    commodityName: 'Padi Sawah (Ciherang)',
    areaInAre: 25,
    method: 'Kimia Konvensional',
    yieldKg: 1280, // 5.12 ton/Ha eq.
    costRp: 1320000,
    revenueRp: 8704000,
    profitRp: 7384000,
    notes: 'Pola kimia konvensional murni. Biaya pupuk subsidi & nonsubsidi tinggi, tanah masam pH 5.2.'
  },
  {
    id: 'rec-2',
    date: '2025-06-15',
    seasonName: 'Musim Rendeng 2025',
    commodityName: 'Padi Sawah (Ciherang)',
    areaInAre: 25,
    method: 'Kimia Konvensional',
    yieldKg: 1350, // 5.4 ton/Ha eq.
    costRp: 1250000,
    revenueRp: 9180000,
    profitRp: 7930000,
    notes: 'Pakai Urea & NPK granul 150kg. Tanah mengeras dan sempat terserang kresek daun.'
  },
  {
    id: 'rec-3',
    date: '2025-09-10',
    seasonName: 'Musim Kemarau 2025',
    commodityName: 'Jagung Hibrida Bisi-18',
    areaInAre: 40,
    method: 'Paten Nano',
    yieldKg: 3640,
    costRp: 840000,
    revenueRp: 18928000,
    profitRp: 18088000,
    notes: 'Bebas virus bule berkat Paten Imun di HST 5. Tongkol terisi penuh 2 tongkol per pohon.'
  },
  {
    id: 'rec-1',
    date: '2025-11-20',
    seasonName: 'Musim Gadu 2025',
    commodityName: 'Padi Sawah (Ciherang)',
    areaInAre: 25,
    method: 'Paten Nano',
    yieldKg: 2050, // 8.2 ton/Ha eq.
    costRp: 510000,
    revenueRp: 13940000,
    profitRp: 13430000,
    notes: 'Aplikasi Paten Gold 5x semprot. Bulir kuning bernas sampai pangkal, hemat pupuk kimia 70%.'
  },
  {
    id: 'rec-4',
    date: '2026-03-25',
    seasonName: 'Musim Tanam 1 2026',
    commodityName: 'Padi Sawah (Ciherang)',
    areaInAre: 25,
    method: 'Paten Nano',
    yieldKg: 2280, // 9.12 ton/Ha eq.
    costRp: 480000,
    revenueRp: 15504000,
    profitRp: 15024000,
    notes: 'Pola Paten Gold + Paten Imun. Anakan produktif tembus 38 batang per rumpun, tanah kembali gembur pH 6.6.'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: '🌾 Jadwal Pemupukan Padi (HST 14)',
    message: 'Hari ini jadwal semprot kasar Paten Gold 3 sachet + Insektisida per tangki untuk memacu anakan produktif.',
    type: 'jadwal',
    date: 'Hari ini, 06:00',
    isRead: false,
    priority: 'normal'
  },
  {
    id: 'notif-2',
    title: '⚠️ Peringatan Sensor: Kelembapan Tanah Rendah',
    message: 'Sensor mendeteksi kelembapan tanah di Blok A turun ke 38%. Segera alirkan air irigasi macak-macak.',
    type: 'sensor',
    date: 'Hari ini, 05:30',
    isRead: false,
    priority: 'kritis'
  },
  {
    id: 'notif-3',
    title: '🛡️ Peringatan Dini Wilayah: Waspada Bulai Jagung',
    message: 'Kelembapan tinggi sepekan terakhir memicu spora jamur Peronosclerospora di sekitar lahan. Segera semprot Paten Imun 1 sachet per tangki.',
    type: 'penyakit',
    date: 'Kemarin, 14:20',
    isRead: true,
    priority: 'kritis'
  },
  {
    id: 'notif-4',
    title: '🌤️ Laporan Cuaca: Waktu Terbaik Semprot',
    message: 'Cuaca pagi ini cerah berawan dengan angin sepoi-sepoi. Stomata daun terbuka optimal pukul 06.00-09.00.',
    type: 'cuaca',
    date: 'Kemarin, 06:15',
    isRead: true,
    priority: 'normal'
  }
];

export function getHarvestRecords(): HarvestRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HARVEST_RECORDS);
    if (!data) {
      saveHarvestRecords(INITIAL_HARVEST_RECORDS);
      return INITIAL_HARVEST_RECORDS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_HARVEST_RECORDS;
  }
}

export function saveHarvestRecords(records: HarvestRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HARVEST_RECORDS, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save harvest records:', err);
  }
}

export function addHarvestRecord(record: Omit<HarvestRecord, 'id'>): HarvestRecord {
  const records = getHarvestRecords();
  const newRecord: HarvestRecord = {
    ...record,
    id: 'rec-' + Date.now()
  };
  const updated = [newRecord, ...records];
  saveHarvestRecords(updated);
  return newRecord;
}

export function getNotifications(): NotificationItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!data) {
      saveNotifications(INITIAL_NOTIFICATIONS);
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotifications(notifications: NotificationItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  } catch (err) {
    console.error('Failed to save notifications:', err);
  }
}

export function markNotificationAsRead(id: string): void {
  const notifs = getNotifications();
  const updated = notifs.map(n => n.id === id ? { ...n, isRead: true } : n);
  saveNotifications(updated);
}

export function addNotification(notif: Omit<NotificationItem, 'id' | 'date' | 'isRead'>): NotificationItem {
  const notifs = getNotifications();
  const newNotif: NotificationItem = {
    ...notif,
    id: 'notif-' + Date.now(),
    date: 'Baru saja',
    isRead: false
  };
  saveNotifications([newNotif, ...notifs]);
  return newNotif;
}

export function getDiagnosisHistory(): DiseaseDiagnosis[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DIAGNOSIS_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveDiagnosis(diagnosis: DiseaseDiagnosis): void {
  try {
    const history = getDiagnosisHistory();
    const updated = [diagnosis, ...history].slice(0, 20); // Simpan 20 riwayat terakhir
    localStorage.setItem(STORAGE_KEYS.DIAGNOSIS_HISTORY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save diagnosis:', err);
  }
}

export function getLastSyncTime(): string {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || new Date().toLocaleString('id-ID');
}

export function updateLastSyncTime(): void {
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toLocaleString('id-ID'));
}

// LAND PLOTS MANAGEMENT
export function getLandPlots(): LandPlotLocation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LAND_PLOTS);
    if (!data) {
      saveLandPlots(INITIAL_LAND_PLOTS);
      return INITIAL_LAND_PLOTS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_LAND_PLOTS;
  }
}

export function saveLandPlots(plots: LandPlotLocation[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAND_PLOTS, JSON.stringify(plots));
  } catch (err) {
    console.error('Failed to save land plots:', err);
  }
}

export function addLandPlot(plot: Omit<LandPlotLocation, 'id' | 'registeredDate'>): LandPlotLocation {
  const plots = getLandPlots();
  const newPlot: LandPlotLocation = {
    ...plot,
    id: 'plot-' + Date.now(),
    registeredDate: new Date().toISOString().split('T')[0]
  };
  const updated = [newPlot, ...plots];
  saveLandPlots(updated);
  return newPlot;
}

export function deleteLandPlot(id: string): void {
  const plots = getLandPlots();
  const updated = plots.filter(p => p.id !== id);
  saveLandPlots(updated);
}

// SOIL FERTILITY PROFILES MANAGEMENT
export function getSoilProfiles(): SoilFertilityProfile[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SOIL_PROFILES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSoilProfiles(profiles: SoilFertilityProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SOIL_PROFILES, JSON.stringify(profiles));
  } catch (err) {
    console.error('Failed to save soil profiles:', err);
  }
}

export function addSoilProfile(profile: Omit<SoilFertilityProfile, 'id' | 'createdAt'>): SoilFertilityProfile {
  const profiles = getSoilProfiles();
  const newProfile: SoilFertilityProfile = {
    ...profile,
    id: 'soil-' + Date.now(),
    createdAt: new Date().toISOString().split('T')[0]
  };
  const updated = [newProfile, ...profiles];
  saveSoilProfiles(updated);
  return newProfile;
}

// FARMER FORUM (FORUM PETANI) SEED DATA & MANAGEMENT
export const INITIAL_FORUM_POSTS: ForumPost[] = [
  {
    id: 'post-1',
    authorName: 'H. Baiq Mulyani',
    authorLocation: 'Praya, Lombok Tengah, NTB',
    authorRole: 'Ketua Gapoktan',
    avatarEmoji: '🍂',
    title: 'Aplikasi Paten Gold pada Tembakau di Lombok Tengah: Daun Rajangan Super Lebar & Berbobot',
    category: 'Testimoni & Panen',
    commodityTag: 'Tembakau',
    productsUsed: ['Paten Gold', 'Paten Imun'],
    content: 'Alhamdulillah musim tanam ini di Praya Timur kami terapkan petunjuk resmi: kocor Paten Gold umur 14 dan 28 HST ditambah 1 gelas ZA per 20 liter. Hasilnya daun tembakau sangat tebal, elastis, warna kuning keemasan, dan saat dirajang rendemennya naik hampir 35% dibandingkan pupuk kimia biasa. Pengeluaran kimia hemat lebih dari Rp 4 juta per hektar!',
    likesCount: 42,
    isLiked: false,
    commentsCount: 3,
    isVerified: true,
    isCommunityTip: true,
    harvestSuccessStory: {
      isPatenGoldSuccess: true,
      cropName: 'Tembakau Virginia Emas Praya',
      yieldBeforeKg: 1200,
      yieldAfterKg: 1620,
      increasePercent: 35,
      photoCaption: 'Daun tembakau rajangan kering warna kuning keemasan mengkilap dengan bobot rendemen grade A.'
    },
    ratings: {
      averageRating: 4.9,
      totalRatings: 42,
      userRating: 5
    },
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="480" height="280" viewBox="0 0 480 280"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%25" stop-color="%231e293b"/><stop offset="100%25" stop-color="%230f172a"/></linearGradient><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%25" stop-color="%23f59e0b"/><stop offset="100%25" stop-color="%23d97706"/></linearGradient></defs><rect width="480" height="280" fill="url(%23g1)"/><path d="M120 250 Q240 60 360 250" fill="url(%23gold)" opacity="0.85"/><path d="M160 250 Q240 100 320 250" fill="%23fbbf24" opacity="0.9"/><path d="M240 70 L240 260" stroke="%2378350f" stroke-width="4"/><rect x="24" y="24" width="180" height="32" rx="16" fill="%23059669" opacity="0.95"/><text x="40" y="45" font-family="sans-serif" font-size="12" font-weight="bold" fill="%23ffffff">✨ PANEN PATEN GOLD</text><text x="24" y="235" font-family="sans-serif" font-size="15" font-weight="bold" fill="%23fef08a">Tembakau Virginia Lombok Tengah</text><text x="24" y="258" font-family="sans-serif" font-size="12" fill="%23cbd5e1">Rendemen Naik +35% • Daun Tebal Mengkilap</text></svg>',
    createdAt: '2 jam yang lalu',
    comments: [
      {
        id: 'c-1',
        authorName: "Lalu Mas'ud",
        authorLocation: 'Lombok Barat',
        content: 'Mantap Pak Haji! Untuk penyemprotan halus daunnya berapa hari sekali Pak?',
        createdAt: '1 jam yang lalu'
      },
      {
        id: 'c-2',
        authorName: 'H. Baiq Mulyani',
        authorLocation: 'Praya, Lombok Tengah',
        content: 'Semprot halus rutin 7 hari sekali Pak Lalu, stomata daun tembakau cepat sekali menyerapnya.',
        createdAt: '45 menit yang lalu'
      },
      {
        id: 'c-3',
        authorName: 'Ir. Ahmad Fauzi',
        authorLocation: 'Agronomis Renner',
        content: 'Luar biasa! Konsistensi aplikasi pada HST 14 dan 28 memang kunci bobot kering rajangan super.',
        createdAt: '20 menit yang lalu'
      }
    ]
  },
  {
    id: 'post-2',
    authorName: 'Muhammad Syarif',
    authorLocation: 'Manggelewa, Dompu, NTB',
    authorRole: 'Petani Mitra',
    avatarEmoji: '🌽',
    title: 'Panen Jagung Hibrida di Dompu Tembus 9.5 Ton/Ha, Bebas Jamur & Bule!',
    category: 'Testimoni & Panen',
    commodityTag: 'Jagung',
    productsUsed: ['Paten Gold', 'Paten Imun'],
    content: 'Bagi rekan petani jagung di Dompu dan Sumbawa: kunci utama jangan terlambat semprot Paten Imun di HST 5. Dulu virus bule sering menghabisi 20% tanaman muda. Sekarang dengan teknologi nano stomata Paten, 100% pohon sehat dan tongkol terisi padat 2 buah per pohon sampai ujung!',
    likesCount: 38,
    isLiked: true,
    commentsCount: 2,
    isVerified: true,
    isCommunityTip: true,
    harvestSuccessStory: {
      isPatenGoldSuccess: true,
      cropName: 'Jagung Hibrida Super Dompu',
      yieldBeforeKg: 6200,
      yieldAfterKg: 9500,
      increasePercent: 53,
      photoCaption: '2 tongkol jagung raksasa per batang terisi biji penuh bernas sampai pucuk.'
    },
    ratings: {
      averageRating: 4.8,
      totalRatings: 36,
      userRating: 5
    },
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="480" height="280" viewBox="0 0 480 280"><defs><linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%25" stop-color="%231e293b"/><stop offset="100%25" stop-color="%230f172a"/></linearGradient><linearGradient id="corn" x1="0" y1="0" x2="1" y2="1"><stop offset="0%25" stop-color="%23facc15"/><stop offset="100%25" stop-color="%23ca8a04"/></linearGradient></defs><rect width="480" height="280" fill="url(%23bg2)"/><ellipse cx="210" cy="160" rx="45" ry="110" fill="url(%23corn)" transform="rotate(-15 210 160)"/><ellipse cx="290" cy="150" rx="45" ry="110" fill="url(%23corn)" transform="rotate(15 290 150)"/><path d="M140 260 Q180 180 200 120 M340 260 Q300 180 280 120" stroke="%2315803d" stroke-width="16" fill="none"/><rect x="24" y="24" width="180" height="32" rx="16" fill="%23059669" opacity="0.95"/><text x="40" y="45" font-family="sans-serif" font-size="12" font-weight="bold" fill="%23ffffff">✨ PANEN PATEN GOLD</text><text x="24" y="235" font-family="sans-serif" font-size="15" font-weight="bold" fill="%23fef08a">Jagung Pipil Dompu 9.5 Ton/Ha</text><text x="24" y="258" font-family="sans-serif" font-size="12" fill="%23cbd5e1">2 Tongkol Padat per Pohon • Bebas Bulai</text></svg>',
    createdAt: '5 jam yang lalu',
    comments: [
      {
        id: 'c-4',
        authorName: 'Amaq Raden',
        authorLocation: 'Lombok Utara',
        content: 'Sama Pak, di lereng Rinjani kami juga pakai pola ini. Tongkol tidak ada yang ompong.',
        createdAt: '3 jam yang lalu'
      },
      {
        id: 'c-5',
        authorName: 'Pak Sukirno',
        authorLocation: 'Subang, Jabar',
        content: 'Kombinasi Paten Gold + Imun memang solusi ampuh untuk hibrida.',
        createdAt: '1 jam yang lalu'
      }
    ]
  },
  {
    id: 'post-3',
    authorName: 'Ibu Nurma Sape',
    authorLocation: 'Sape, Bima, NTB',
    authorRole: 'Petani Mitra',
    avatarEmoji: '🧅',
    title: 'Bawang Merah Sape Bima: Bebas Moler Trotol & Warna Merah Menyala',
    category: 'Tips & Teknik',
    commodityTag: 'Bawang Merah',
    productsUsed: ['Paten Hijau', 'Paten Imun', 'Paten Gold'],
    content: 'Kunci bawang merah di cuaca ekstrem pesisir Bima: sterilisasi lahan pakai Paten Imun H-2 sebelum tanam bibit. Lalu kocor rutin tiap 10 hari umur 5, 15, 25, 35 HST. Daun bawang tegak kaku tidak mudah layu bakteri, dan umbi saat panen padat beraroma khas tanpa busuk akar.',
    likesCount: 29,
    isLiked: false,
    commentsCount: 1,
    isVerified: true,
    isCommunityTip: true,
    ratings: {
      averageRating: 4.9,
      totalRatings: 31,
      userRating: 5
    },
    createdAt: '1 hari yang lalu',
    comments: [
      {
        id: 'c-6',
        authorName: 'H. Daeng Rahman',
        authorLocation: 'Gowa, Sulsel',
        content: 'Terima kasih ilmunya Bu Nurma, sangat bermanfaat untuk musim hujan ini.',
        createdAt: '18 jam yang lalu'
      }
    ]
  },
  {
    id: 'post-4',
    authorName: 'H. Burhanuddin',
    authorLocation: 'Moyo Hilir, Sumbawa Besar, NTB',
    authorRole: 'Peternak',
    avatarEmoji: '🐂',
    title: 'Penggemukan Sapi Sumbawa: Pertambahan Bobot Harian (ADG) 1.3 Kg/Hari',
    category: 'Peternakan',
    commodityTag: 'Sapi',
    productsUsed: ['Paten Hijau', 'Paten Imun'],
    content: '1 sachet Paten Hijau kami campur ke tong 200 liter air minum ternak sapi dan komboran konsentrat. Hasilnya nafsu makan lahap luar biasa, kotoran feses kering dan tidak bau amonia lalat sama sekali. Saat timbang bulanan, rata-rata bobot naik 38-42 kg per ekor dalam 30 hari!',
    likesCount: 51,
    isLiked: false,
    commentsCount: 2,
    isVerified: true,
    isCommunityTip: true,
    ratings: {
      averageRating: 4.7,
      totalRatings: 28,
      userRating: 5
    },
    createdAt: '2 hari yang lalu',
    comments: [
      {
        id: 'c-7',
        authorName: 'Bpk. Dedi Hermansyah',
        authorLocation: 'Taliwang, Sumbawa Barat',
        content: 'Untuk kerbau di Taliwang juga cocok sekali Pak Haji, tenaga kuat dan tahan lumpur.',
        createdAt: '1 hari yang lalu'
      },
      {
        id: 'c-8',
        authorName: 'Pak Haji Mustofa',
        authorLocation: 'Sleman, DIY',
        content: 'Betul sekali, sapi potong dan perah sangat cepat merespons nano asam amino Paten.',
        createdAt: '20 jam yang lalu'
      }
    ]
  },
  {
    id: 'post-5',
    authorName: "Lalu Mas'ud",
    authorLocation: 'Narmada, Lombok Barat, NTB',
    authorRole: 'Petani Mitra',
    avatarEmoji: '🌾',
    title: 'Padi Sawah Organik Narmada Lombok Barat: Hemat Pupuk Kimia 65%',
    category: 'Tips & Teknik',
    commodityTag: 'Padi Sawah',
    productsUsed: ['Paten Gold', 'Paten Imun'],
    content: 'Bagi yang tanahnya sudah mengeras pejal akibat urea granul bertahun-tahun, semprotkan Paten Gold pagi hari (06.30 - 08.30) saat stomata terbuka. 1 Ha cukup 6 box saja. Anakan padi kami hitung rata-rata 38-45 rumpun per tancap, malai panjang terisi 280-320 bulir bernas.',
    likesCount: 56,
    isLiked: true,
    commentsCount: 2,
    isVerified: true,
    isCommunityTip: true,
    harvestSuccessStory: {
      isPatenGoldSuccess: true,
      cropName: 'Padi Sawah Organik Narmada',
      yieldBeforeKg: 5200,
      yieldAfterKg: 8400,
      increasePercent: 61,
      photoCaption: 'Malai padi bernas kuning emas menjuntai lebat dengan bobot gabah murni tanpa hampa.'
    },
    ratings: {
      averageRating: 5.0,
      totalRatings: 54,
      userRating: 5
    },
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="480" height="280" viewBox="0 0 480 280"><defs><linearGradient id="bg3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%25" stop-color="%231e293b"/><stop offset="100%25" stop-color="%230f172a"/></linearGradient><linearGradient id="rice" x1="0" y1="0" x2="1" y2="1"><stop offset="0%25" stop-color="%23fef08a"/><stop offset="100%25" stop-color="%23eab308"/></linearGradient></defs><rect width="480" height="280" fill="url(%23bg3)"/><path d="M120 280 Q200 80 340 100 Q400 120 370 200" stroke="url(%23rice)" stroke-width="26" fill="none" stroke-linecap="round"/><circle cx="280" cy="95" r="14" fill="%23f59e0b"/><circle cx="320" cy="100" r="14" fill="%23f59e0b"/><circle cx="360" cy="115" r="14" fill="%23f59e0b"/><circle cx="380" cy="150" r="14" fill="%23f59e0b"/><rect x="24" y="24" width="180" height="32" rx="16" fill="%23059669" opacity="0.95"/><text x="40" y="45" font-family="sans-serif" font-size="12" font-weight="bold" fill="%23ffffff">✨ PANEN PATEN GOLD</text><text x="24" y="235" font-family="sans-serif" font-size="15" font-weight="bold" fill="%23fef08a">Padi Sawah Organik Narmada NTB</text><text x="24" y="258" font-family="sans-serif" font-size="12" fill="%23cbd5e1">Hasil 8.4 Ton/Ha (+61%) • Anakan 45 Rumpun</text></svg>',
    createdAt: '3 hari yang lalu',
    comments: [
      {
        id: 'c-9',
        authorName: 'Ir. Hendra Wijaya',
        authorLocation: 'Kutai Kartanegara',
        content: 'Tanah yang sebelumnya asam memang cepat gembur kembali dengan pembenah tanah Paten.',
        createdAt: '2 hari yang lalu'
      }
    ]
  }
];

export function getForumPosts(): ForumPost[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FORUM_POSTS);
    if (!data) {
      saveForumPosts(INITIAL_FORUM_POSTS);
      return INITIAL_FORUM_POSTS;
    }
    const parsed: ForumPost[] = JSON.parse(data);
    let needsUpdate = false;
    const migrated = parsed.map(p => {
      if (!p.ratings || !p.harvestSuccessStory) {
        needsUpdate = true;
        const init = INITIAL_FORUM_POSTS.find(i => i.id === p.id);
        return {
          ...p,
          ratings: p.ratings || init?.ratings || { averageRating: 4.8, totalRatings: 18, userRating: 5 },
          isCommunityTip: p.isCommunityTip ?? init?.isCommunityTip ?? true,
          harvestSuccessStory: p.harvestSuccessStory || init?.harvestSuccessStory,
          imageUrl: p.imageUrl || init?.imageUrl
        };
      }
      return p;
    });
    if (needsUpdate) {
      saveForumPosts(migrated);
    }
    return migrated;
  } catch {
    return INITIAL_FORUM_POSTS;
  }
}

export function saveForumPosts(posts: ForumPost[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FORUM_POSTS, JSON.stringify(posts));
  } catch (err) {
    console.error('Failed to save forum posts:', err);
  }
}

export function addForumPost(post: Omit<ForumPost, 'id' | 'createdAt' | 'likesCount' | 'isLiked' | 'commentsCount' | 'comments'>): ForumPost {
  const posts = getForumPosts();
  const newPost: ForumPost = {
    ...post,
    id: 'post-' + Date.now(),
    createdAt: 'Baru saja',
    likesCount: 0,
    isLiked: false,
    commentsCount: 0,
    comments: []
  };
  const updated = [newPost, ...posts];
  saveForumPosts(updated);
  return newPost;
}

export function likeForumPost(id: string): ForumPost[] {
  const posts = getForumPosts();
  const updated = posts.map(p => {
    if (p.id === id) {
      const isLiked = !p.isLiked;
      return {
        ...p,
        isLiked,
        likesCount: isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1)
      };
    }
    return p;
  });
  saveForumPosts(updated);
  return updated;
}

export function rateForumPost(postId: string, rating: number): ForumPost[] {
  const posts = getForumPosts();
  const updated = posts.map(p => {
    if (p.id === postId) {
      const currentRatings = p.ratings || { averageRating: 5.0, totalRatings: 0 };
      const hadPreviousRating = currentRatings.userRating !== undefined;
      const prevRating = currentRatings.userRating || 0;
      
      let newTotal = currentRatings.totalRatings;
      let newSum = currentRatings.averageRating * currentRatings.totalRatings;
      
      if (hadPreviousRating) {
        newSum = newSum - prevRating + rating;
      } else {
        newTotal += 1;
        newSum += rating;
      }
      
      const newAverage = parseFloat((newSum / (newTotal || 1)).toFixed(1));
      
      return {
        ...p,
        ratings: {
          averageRating: newAverage,
          totalRatings: newTotal,
          userRating: rating
        }
      };
    }
    return p;
  });
  saveForumPosts(updated);
  return updated;
}

export function addForumComment(postId: string, comment: Omit<ForumComment, 'id' | 'createdAt'>): ForumPost[] {
  const posts = getForumPosts();
  const updated = posts.map(p => {
    if (p.id === postId) {
      const newComment: ForumComment = {
        ...comment,
        id: 'comm-' + Date.now(),
        createdAt: 'Baru saja'
      };
      const comments = [...p.comments, newComment];
      return {
        ...p,
        comments,
        commentsCount: comments.length
      };
    }
    return p;
  });
  saveForumPosts(updated);
  return updated;
}

// -------------------------------------------------------------
// PEST & DISEASE OUTBREAK STORAGE FUNCTIONS
// -------------------------------------------------------------
export const INITIAL_PEST_OUTBREAKS: PestOutbreakReport[] = [
  {
    id: 'pest-1',
    diseaseName: 'Hawar Daun Bakteri (Kresek / Xanthomonas)',
    cropName: 'Padi Sawah',
    severity: 'Kritis',
    confidence: 96,
    coordinates: { lat: -8.6750, lng: 116.1520 }, // Narmada, Lombok Barat
    regionName: 'Kec. Narmada, Lombok Barat, NTB',
    reportedAt: '1 hari yang lalu',
    anonymousReporter: 'Petani Anonim #LBR-09',
    symptoms: [
      'Garis basah kekuningan di tepi daun merambat ke pelepah',
      'Daun menggulung kering kelabu menyerupai terbakar',
      'Cairan eksudat bakteri kuning keluar saat pagi berembun'
    ],
    patenRecommendation: {
      products: ['Paten Imun', 'Paten Gold'],
      dosage: '1 sachet Paten Imun + 1 sachet Paten Gold per tangki 16-20 Liter',
      instructions: 'Semprot halus merata pada stomata pagi hari pukul 06.30 - 08.30. Ulangi interval 4 hari sekali sampai daun muda tumbuh hijau segar.'
    },
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="400" height="260" fill="%231e293b"/><path d="M50 220 Q200 40 350 200" stroke="%2316a34a" stroke-width="32" fill="none" stroke-linecap="round"/><path d="M110 160 Q170 100 290 160" stroke="%23eab308" stroke-width="14" fill="none"/><circle cx="210" cy="130" r="14" fill="%23dc2626"/><circle cx="160" cy="150" r="10" fill="%23ea580c"/><text x="25" y="35" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23f87171">Wabah Hawar Daun Kresek Padi (Lombok Barat)</text></svg>',
    notes: 'Terdeteksi pada rumpun padi fase anakan aktif. Menyebar searah hembusan angin lembap.'
  },
  {
    id: 'pest-2',
    diseaseName: 'Virus Bule (Bulai / Peronosclerospora maydis)',
    cropName: 'Jagung Hibrida',
    severity: 'Kritis',
    confidence: 94,
    coordinates: { lat: -8.5400, lng: 118.4500 }, // Manggelewa, Dompu
    regionName: 'Kec. Manggelewa, Dompu, NTB',
    reportedAt: '2 hari yang lalu',
    anonymousReporter: 'Petani Anonim #DMP-23',
    symptoms: [
      'Garis klorotik keputihan memanjang sejajar tulang daun',
      'Tanaman kerdil dan daun muda kaku tegak',
      'Lapisan spora putih mirip tepung di balik permukaan daun'
    ],
    patenRecommendation: {
      products: ['Paten Imun', 'Paten Hijau'],
      dosage: '1 sachet Paten Imun + 1 sachet Paten Hijau per tangki 20 Liter',
      instructions: 'Kocor pangkal batang dan semprot kabut ke daun muda segera untuk menghentikan replikasi jamur sistemik.'
    },
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="400" height="260" fill="%231e293b"/><path d="M70 230 Q160 30 330 220" stroke="%2316a34a" stroke-width="40" fill="none" stroke-linecap="round"/><path d="M120 180 Q160 70 250 160" stroke="%23fef08a" stroke-width="18" fill="none"/><path d="M140 170 Q170 90 230 150" stroke="%23ffffff" stroke-width="8" fill="none"/><text x="25" y="35" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23facc15">Gejala Bulai Jagung (Dompu)</text></svg>',
    notes: 'Menyerang petak jagung umur 18 HST. Waspadai bagi lahan sekitar radius 2 km.'
  },
  {
    id: 'pest-3',
    diseaseName: 'Antraknosa / Patek (Colletotrichum capsici)',
    cropName: 'Cabai Rawit',
    severity: 'Sedang',
    confidence: 91,
    coordinates: { lat: -8.6400, lng: 116.3400 }, // Selong, Lombok Timur
    regionName: 'Kec. Selong, Lombok Timur, NTB',
    reportedAt: '3 hari yang lalu',
    anonymousReporter: 'Petani Anonim #LOTIM-77',
    symptoms: [
      'Bercak cekung melekuk berpusar pada buah cabai matang',
      'Buah busuk basah dan rontok sebelum panen',
      'Terdapat lingkaran titik spora hitam di tengah lesi'
    ],
    patenRecommendation: {
      products: ['Paten Imun', 'Paten Gold'],
      dosage: '1 sachet Paten Imun + 1 sachet Paten Gold per tangki 16 Liter',
      instructions: 'Semprot seluruh tanaman termasuk bagian bawah buah. Hindari penggunaan fungisida kimia berlebih yang merusak pH tanah.'
    },
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="400" height="260" fill="%231e293b"/><path d="M90 70 Q170 15 270 110 Q310 230 250 250 Q190 230 170 170 Z" fill="%23dc2626"/><ellipse cx="220" cy="150" rx="26" ry="18" fill="%237f1d1d"/><circle cx="220" cy="150" r="10" fill="%23450a0a"/><text x="25" y="35" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23f87171">Patek Antraknosa Buah Cabai (Lotim)</text></svg>',
    notes: 'Intensitas meningkat setelah hujan sore hari berturut-turut.'
  },
  {
    id: 'pest-4',
    diseaseName: 'Ulat Penggerek Batang & Pucuk Tembakau (Helicoverpa)',
    cropName: 'Tembakau Virginia',
    severity: 'Sedang',
    confidence: 88,
    coordinates: { lat: -8.7120, lng: 116.2950 }, // Praya Timur, Lombok Tengah
    regionName: 'Kec. Praya Timur, Lombok Tengah, NTB',
    reportedAt: '12 jam yang lalu',
    anonymousReporter: 'Petani Anonim #LOTENG-52',
    symptoms: [
      'Titik lubang gerekan pada pucuk daun tembakau muda',
      'Kotoran ulat menumpuk di ketiak tangkai daun',
      'Pertumbuhan daun mahkota terhenti'
    ],
    patenRecommendation: {
      products: ['Paten Gold', 'Paten Imun'],
      dosage: '1 sachet Paten Gold + 1 sachet Paten Imun per 20 Liter air',
      instructions: 'Paten Imun memicu sel daun menebal dan pahit bagi larva serangga sehingga menekan nafsu makan hama secara alami tanpa residu racun.'
    },
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="400" height="260" fill="%231e293b"/><path d="M80 180 Q200 60 320 200" stroke="%2315803d" stroke-width="40" fill="none" stroke-linecap="round"/><circle cx="160" cy="120" r="16" fill="%2378350f"/><circle cx="230" cy="140" r="12" fill="%2378350f"/><text x="25" y="35" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23facc15">Penggerek Pucuk Tembakau (Praya)</text></svg>',
    notes: 'Terdeteksi pada areal tanaman tembakau umur 25 HST.'
  },
  {
    id: 'pest-5',
    diseaseName: 'Wereng Batang Coklat (Nilaparvata lugens)',
    cropName: 'Padi Sawah',
    severity: 'Kritis',
    confidence: 95,
    coordinates: { lat: -6.5650, lng: 107.7500 }, // Subang, Jabar
    regionName: 'Kec. Pagaden, Subang, Jawa Barat',
    reportedAt: '4 hari yang lalu',
    anonymousReporter: 'Petani Anonim #SBG-11',
    symptoms: [
      'Tanaman padi menguning seperti terbakar melingkar (hopperburn)',
      'Koloni wereng bergerombol di pangkal batang dekat genangan air'
    ],
    patenRecommendation: {
      products: ['Paten Imun', 'Paten Gold'],
      dosage: 'Dosis ganda 2 sachet Paten Imun + 1 sachet Paten Gold per tangki',
      instructions: 'Buka tajuk tanaman, arahkan nosel semprot tepat ke pangkal batang dekat permukaan tanah pagi hari.'
    },
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="400" height="260" fill="%231e293b"/><path d="M120 240 L120 80 M200 240 L200 70 M280 240 L280 90" stroke="%23ca8a04" stroke-width="14"/><ellipse cx="200" cy="180" rx="40" ry="25" fill="%2378350f"/><text x="25" y="35" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23ef4444">Hopperburn Wereng Batang Coklat (Subang)</text></svg>',
    notes: 'Pola melingkar di tengah hamparan sawah irigasi teknis.'
  }
];

export function getPestOutbreakReports(): PestOutbreakReport[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PEST_OUTBREAKS);
    if (!data) {
      savePestOutbreakReports(INITIAL_PEST_OUTBREAKS);
      return INITIAL_PEST_OUTBREAKS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_PEST_OUTBREAKS;
  }
}

export function savePestOutbreakReports(reports: PestOutbreakReport[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PEST_OUTBREAKS, JSON.stringify(reports));
  } catch (e) {
    console.error('Failed to save pest outbreak reports:', e);
  }
}

export function addPestOutbreakReport(report: Omit<PestOutbreakReport, 'id' | 'reportedAt'>): PestOutbreakReport {
  const list = getPestOutbreakReports();
  const newReport: PestOutbreakReport = {
    ...report,
    id: 'pest-' + Date.now(),
    reportedAt: 'Baru saja'
  };
  const updated = [newReport, ...list];
  savePestOutbreakReports(updated);
  return newReport;
}

export function deletePestOutbreakReport(id: string): PestOutbreakReport[] {
  const list = getPestOutbreakReports();
  const updated = list.filter(r => r.id !== id);
  savePestOutbreakReports(updated);
  return updated;
}

// -------------------------------------------------------------
// FARMER DAILY TASKS STORAGE & REMINDER FUNCTIONS
// -------------------------------------------------------------
export const INITIAL_DAILY_TASKS: FarmerDailyTask[] = [
  {
    id: 'task-1',
    title: 'Pengecekan Hama Ulat Grayak & Kutu Kebul',
    category: 'pengecekan_hama',
    commodityId: 'padi',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '06:30',
    priority: 'tinggi',
    isCompleted: false,
    notes: 'Periksa bagian bawah daun rumpun padi di blok timur. Jika ada tanda telur/ulat, siapkan semprot Paten Imun.',
    isAutoGenerated: false,
    createdAt: '2026-10-06'
  },
  {
    id: 'task-2',
    title: 'Penyiraman & Kontrol Pintu Air Irigasi',
    category: 'penyiraman',
    commodityId: 'padi',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '07:00',
    priority: 'sedang',
    isCompleted: true,
    completedAt: '07:15',
    notes: 'Pertahankan ketinggian air macak-macak 2-3 cm untuk persiapan serapan nano.',
    isAutoGenerated: false,
    createdAt: '2026-10-06'
  },
  {
    id: 'task-3',
    title: 'Aplikasi Kocor Paten Gold (HST 14)',
    category: 'pemupukan',
    commodityId: 'padi',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '07:30',
    priority: 'tinggi',
    isCompleted: false,
    notes: 'Jadwal Fase Vegetatif: Larutkan 1 sachet Paten Gold per tangki 17L. Semprot merata saat stomata daun membuka.',
    isAutoGenerated: true,
    sourceScheduleItemTitle: 'Pemupukan Pertama (HST 14)',
    createdAt: '2026-10-06'
  },
  {
    id: 'task-4',
    title: 'Pembersihan Gulma & Rumput Liar Pematang',
    category: 'pengolahan_tanah',
    commodityId: 'jagung',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    dueTime: '08:00',
    priority: 'sedang',
    isCompleted: false,
    notes: 'Cabut gulma liar agar nutrisi tanah terserap maksimal oleh tanaman utama.',
    isAutoGenerated: false,
    createdAt: '2026-10-06'
  },
  {
    id: 'task-5',
    title: 'Pemberian Komboran Paten Hijau pada Ternak Sapi',
    category: 'pakan_ternak',
    commodityId: 'sapi',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '16:00',
    priority: 'tinggi',
    isCompleted: false,
    notes: 'Campur 1 sachet Paten Hijau ke dalam tong 200L air minum sapi potong untuk pacu bobot dan nafsu makan.',
    isAutoGenerated: false,
    createdAt: '2026-10-06'
  }
];

export function getDailyTasks(): FarmerDailyTask[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_TASKS);
    if (!data) {
      saveDailyTasks(INITIAL_DAILY_TASKS);
      return INITIAL_DAILY_TASKS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_DAILY_TASKS;
  }
}

export function saveDailyTasks(tasks: FarmerDailyTask[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save daily tasks:', err);
  }
}

export function addDailyTask(task: Omit<FarmerDailyTask, 'id' | 'isCompleted' | 'createdAt'>): FarmerDailyTask {
  const tasks = getDailyTasks();
  const newTask: FarmerDailyTask = {
    ...task,
    id: 'task-' + Date.now(),
    isCompleted: false,
    createdAt: new Date().toISOString().split('T')[0]
  };
  const updated = [newTask, ...tasks];
  saveDailyTasks(updated);
  return newTask;
}

export function toggleDailyTask(id: string): FarmerDailyTask[] {
  const tasks = getDailyTasks();
  const updated = tasks.map(t => {
    if (t.id === id) {
      const isCompleted = !t.isCompleted;
      return {
        ...t,
        isCompleted,
        completedAt: isCompleted ? new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : undefined
      };
    }
    return t;
  });
  saveDailyTasks(updated);
  return updated;
}

export function deleteDailyTask(id: string): FarmerDailyTask[] {
  const tasks = getDailyTasks();
  const updated = tasks.filter(t => t.id !== id);
  saveDailyTasks(updated);
  return updated;
}

// -------------------------------------------------------------
// SISTEM PENGINGAT HARIAN PEMUPUKAN BERBASIS BROWSER & OFFLINE
// -------------------------------------------------------------
export interface FertilizationReminderSettings {
  isEnabled: boolean;
  preferredTime: string; // e.g., "06:30" (Jendela stomata pagi)
  activeCommodityId: CommodityId;
  plantingDate: string; // YYYY-MM-DD
  farmerName: string;
  farmLocation: string;
  lastNotifiedDate?: string;
  autoSoundAlert?: boolean;
}

export function getFertilizationReminderSettings(): FertilizationReminderSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FERTILIZATION_REMINDERS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse reminder settings:', e);
  }

  // Default: Padi Sawah di HST 10
  const defaultPlanting = new Date();
  defaultPlanting.setDate(defaultPlanting.getDate() - 10);

  return {
    isEnabled: true,
    preferredTime: '06:30',
    activeCommodityId: 'padi',
    plantingDate: defaultPlanting.toISOString().split('T')[0],
    farmerName: 'Petani Mitra Renner Syariah',
    farmLocation: 'Lahan Pertanian Indonesia',
    autoSoundAlert: true
  };
}

export function saveFertilizationReminderSettings(settings: FertilizationReminderSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FERTILIZATION_REMINDERS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save fertilization reminder settings:', err);
  }
}

export function triggerDailyFertilizationBrowserNotification(
  customMessage?: string,
  force: boolean = false
): { sent: boolean; title: string; message: string; reason?: string } {
  const settings = getFertilizationReminderSettings();
  if (!settings.isEnabled && !force) {
    return { sent: false, title: '', message: '', reason: 'Pengingat dinonaktifkan di pengaturan' };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  if (!force && settings.lastNotifiedDate === todayStr) {
    return { sent: false, title: '', message: '', reason: 'Pengingat untuk hari ini sudah terkirim' };
  }

  const plantDateObj = new Date(settings.plantingDate);
  const now = new Date();
  const currentHST = Math.max(0, Math.floor((now.getTime() - plantDateObj.getTime()) / (1000 * 60 * 60 * 24)));

  const crop = CROP_SCHEDULES[settings.activeCommodityId] || CROP_SCHEDULES.padi;
  const todaysSchedule = crop.schedules.find(s => s.dayAfterPlanting === currentHST);
  const nextSchedule = crop.schedules.find(s => s.dayAfterPlanting > currentHST);

  let title = `🌾 Pengingat Pemupukan Paten: ${crop.name}`;
  let message = '';

  if (customMessage) {
    message = customMessage;
  } else if (todaysSchedule) {
    title = `🚨 JADWAL PEMUPUKAN HARI INI: ${crop.name} (HST ${currentHST})`;
    message = `${todaysSchedule.title} • Dosis: ${todaysSchedule.dosage}. Waktu aplikasi terbaik pukul 06.00-09.00 saat stomata terbuka!`;
  } else if (nextSchedule) {
    const daysLeft = nextSchedule.dayAfterPlanting - currentHST;
    title = `🌿 Pengingat Pemupukan: ${crop.name} (HST ${currentHST})`;
    message = `Usia tanaman ${currentHST} HST. Jadwal pemupukan terdekat (${daysLeft} hari lagi): ${nextSchedule.title} (${nextSchedule.dosage}).`;
  } else {
    title = `✨ Perawatan Tanaman: ${crop.name} (HST ${currentHST})`;
    message = `Tanaman berada di fase pemasakan / panen. Tetap jaga kelembapan tanah dan siapkan pembenah tanah Paten pascapanen.`;
  }

  // 1. Simpan ke sistem notifikasi in-app
  addNotification({
    title,
    message,
    type: 'jadwal',
    priority: todaysSchedule ? 'kritis' : 'normal'
  });

  // 2. Tembakkan notifikasi lokal browser jika izin diberikan
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          tag: 'paten-daily-fertilization'
        });
      } catch (err) {
        console.warn('Browser Notification error:', err);
      }
    }
  }

  // Update tanggal terakhir notifikasi
  saveFertilizationReminderSettings({
    ...settings,
    lastNotifiedDate: todayStr
  });

  return { sent: true, title, message };
}



