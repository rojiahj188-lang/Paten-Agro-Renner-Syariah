import { CommodityId, CropScheduleConfig, ScheduleItem } from '../types';

export const CROP_SCHEDULES: Record<string, CropScheduleConfig> = {
  padi: {
    commodityId: 'padi',
    name: 'Padi Sawah (GKG)',
    tips: [
      'Semprot stomata pagi hari pukul 06.00 - 08.30 saat stomata terbuka penuh.',
      'Pupuk kimia dasar cukup 30% dari dosis kebiasaan untuk menghemat modal.',
      'Campur Paten Imun untuk kekebalan terhadap wereng dan penyakit hawar daun kresek.'
    ],
    schedules: [
      {
        id: 'padi-1',
        dayAfterPlanting: 0,
        title: 'Perendaman Benih & Olah Tanah Dasar',
        actionType: 'Rendam Benih',
        products: ['Paten Hijau', 'Paten Imun'],
        dosage: '1 sachet Paten Hijau + 1 sachet Paten Imun per 10 liter air untuk 25 kg benih padi',
        waterVolume: '10 - 15 Liter',
        mixingInstruction: 'Rendam benih selama 12-24 jam sebelum tiris dan semai. Kocor air rendaman ke bedengan semai.',
        targetStomata: 'Embrio Benih & Akar Semai Awal'
      },
      {
        id: 'padi-2',
        dayAfterPlanting: 10,
        title: 'Fase Vegetatif Awal & Pembentukan Anakan',
        actionType: 'Semprot Halus',
        products: ['Paten Gold', 'Paten Imun'],
        dosage: '1 sachet Paten Gold + 1 sachet Paten Imun per tangki 16-20 Liter',
        waterVolume: '1 Tangki (16-20 L)',
        mixingInstruction: 'Larutkan merata, semprot kabut halus ke stomata bawah daun pagi hari pukul 06.00-09.00.',
        targetStomata: 'Permukaan Bawah Daun (Stomata Terbuka)'
      },
      {
        id: 'padi-3',
        dayAfterPlanting: 25,
        title: 'Fase Pemaksimalan Anakan Produktif',
        actionType: 'Semprot Halus',
        products: ['Paten Gold', 'Paten Hijau'],
        dosage: '1 sachet Paten Gold + 1 sachet Paten Hijau per tangki 16 Liter',
        waterVolume: '1 Tangki (16 L)',
        mixingInstruction: 'Semprot merata tajuk tanaman saat pagi berembun. Memacu anakan hingga 40-50 rumpun.',
        targetStomata: 'Seluruh Tajuk & Titik Tumbuh Rumpun'
      },
      {
        id: 'padi-4',
        dayAfterPlanting: 40,
        title: 'Fase Primordia / Bunting Muda',
        actionType: 'Semprot Kasar',
        products: ['Paten Gold', 'Paten Imun'],
        dosage: '1 sachet Paten Gold + 1 sachet Paten Imun per tangki 16 Liter',
        waterVolume: '1-2 Tangki',
        mixingInstruction: 'Semprot batang bawah dan daun bendera untuk memperkuat tangkai malai.',
        targetStomata: 'Pelepah Batang & Daun Bendera'
      },
      {
        id: 'padi-5',
        dayAfterPlanting: 60,
        title: 'Fase Pengisian Bulir Susu (Generatif Penuh)',
        actionType: 'Semprot Halus',
        products: ['Paten Gold'],
        dosage: '1 sachet Paten Gold per tangki 16 Liter air',
        waterVolume: '1-2 Tangki',
        mixingInstruction: 'Semprot kabut halus pagi hari. Mengisi bulir hingga pangkal malai tanpa hampa.',
        targetStomata: 'Bulir Muda & Daun Bendera Fotosintesis'
      }
    ]
  },
  jagung: {
    commodityId: 'jagung',
    name: 'Jagung Hibrida Pipil',
    tips: [
      'Aplikasi Paten Imun di HST 7 sangat ampuh mencegah virus bulai kerdil.',
      'Arahkan semprotan ke daun dan leher batang untuk memperkokoh pohon.',
      'Kurangi pupuk urea 70% karena Paten Gold sudah kaya asam amino siap serap.'
    ],
    schedules: [
      {
        id: 'jg-1',
        dayAfterPlanting: 7,
        title: 'Vegetatif Awal & Perakaran Jagung',
        actionType: 'Semprot Halus',
        products: ['Paten Hijau', 'Paten Imun'],
        dosage: '1 sachet Paten Hijau + 1 sachet Paten Imun per tangki 16 L',
        waterVolume: '16 Liter',
        mixingInstruction: 'Semprot halus merata pada helai daun muda pagi hari.',
        targetStomata: 'Daun Muda'
      },
      {
        id: 'jg-2',
        dayAfterPlanting: 21,
        title: 'Vegetatif Aktif & Batang Kokoh',
        actionType: 'Semprot Kasar',
        products: ['Paten Gold', 'Paten Hijau'],
        dosage: '1 sachet Paten Gold + 1 sachet Paten Hijau per tangki',
        waterVolume: '16-20 Liter',
        mixingInstruction: 'Arahkan ke daun dan leher batang untuk mempertebal jaringan sel.',
        targetStomata: 'Pangkal Batang & Pelepah Daun'
      },
      {
        id: 'jg-3',
        dayAfterPlanting: 45,
        title: 'Fase Muncul Bunga Jantan & Tongkol',
        actionType: 'Semprot Halus',
        products: ['Paten Gold', 'Paten Imun'],
        dosage: '1 sachet Paten Gold + 1 sachet Paten Imun per tangki',
        waterVolume: '20 Liter',
        mixingInstruction: 'Semprot seluruh tajuk untuk memicu terbentuknya 2 tongkol produktif.',
        targetStomata: 'Calon Tongkol & Daun Atas'
      },
      {
        id: 'jg-4',
        dayAfterPlanting: 65,
        title: 'Fase Pengisian Biji Jagung Padat',
        actionType: 'Semprot Halus',
        products: ['Paten Gold'],
        dosage: '1 sachet Paten Gold per tangki 16 L',
        waterVolume: '16 Liter',
        mixingInstruction: 'Semprot kabut pagi hari saat stomata terbuka penuh.',
        targetStomata: 'Tongkol & Daun Bendera'
      }
    ]
  },
  bawang_merah: {
    commodityId: 'bawang_merah',
    name: 'Bawang Merah Super',
    tips: [
      'Paten Imun mencegah rebah layu fusarium dan jamur trotol moler.',
      'Semprotkan pagi hari berembun untuk mempertebal daun dan mencegah telur ulat grayak.',
      'Umbi menjadi merah mengkilap padat dan memiliki bobot susut simpan sangat rendah.'
    ],
    schedules: [
      {
        id: 'bm-1',
        dayAfterPlanting: 10,
        title: 'Vegetatif & Anakan Bawang Merah',
        actionType: 'Semprot Halus',
        products: ['Paten Hijau', 'Paten Imun'],
        dosage: '1 sachet Paten Hijau + 1 sachet Paten Imun per tangki 16 L',
        waterVolume: '16 Liter',
        mixingInstruction: 'Semprot embun pagi hari, cegah serangan ulat grayak.',
        targetStomata: 'Daun Bawang'
      },
      {
        id: 'bm-2',
        dayAfterPlanting: 25,
        title: 'Pembentukan Umbi & Pencegahan Moler',
        actionType: 'Semprot Halus',
        products: ['Paten Gold', 'Paten Imun'],
        dosage: '1 sachet Paten Gold + 1 sachet Paten Imun per tangki 16 L',
        waterVolume: '16 Liter',
        mixingInstruction: 'Semprot daun dan pangkal umbi secara merata.',
        targetStomata: 'Pangkal Umbi & Daun'
      },
      {
        id: 'bm-3',
        dayAfterPlanting: 40,
        title: 'Pembesaran Umbi Merah Mengkilap',
        actionType: 'Semprot Kasar',
        products: ['Paten Gold'],
        dosage: '1 sachet Paten Gold per tangki',
        waterVolume: '16 Liter',
        mixingInstruction: 'Semprot merata 7 hari sekali hingga menjelang panen.',
        targetStomata: 'Tajuk & Umbi'
      }
    ]
  },
  cabai: {
    commodityId: 'cabai',
    name: 'Cabai Rawit / Merah',
    tips: [
      'Paten Imun membuat jaringan sel daun tebal dan pahit bagi hama thrips & kutu kebul.',
      'Bunga cabai tidak mudah rontok saat perubahan cuaca ekstrem hujan ke panas.',
      'Semprot rutin setiap interval 10 hari dan setelah petik panen untuk memacu bunga baru.'
    ],
    schedules: [
      {
        id: 'cb-1',
        dayAfterPlanting: 10,
        title: 'Adaptasi Bibit Pindah Tanam',
        actionType: 'Kocor Akar',
        products: ['Paten Hijau', 'Paten Imun'],
        dosage: '1 sachet Paten Hijau + 1 sachet Paten Imun per 20 L air (100 ml per pohon)',
        waterVolume: '20 Liter',
        mixingInstruction: 'Kocorkan langsung ke zona perakaran bibit.',
        targetStomata: 'Akar Serap'
      },
      {
        id: 'cb-2',
        dayAfterPlanting: 30,
        title: 'Percabangan V & Bunga Pertama',
        actionType: 'Semprot Halus',
        products: ['Paten Gold', 'Paten Imun'],
        dosage: '1 sachet Paten Gold + 1 sachet Paten Imun per tangki 16 L',
        waterVolume: '16 Liter',
        mixingInstruction: 'Semprot pagi hari, mencegah kerontokan bunga dan patek.',
        targetStomata: 'Pucuk Daun & Bunga'
      },
      {
        id: 'cb-3',
        dayAfterPlanting: 55,
        title: 'Pematangan Buah & Petikan Berkelanjutan',
        actionType: 'Semprot Halus',
        products: ['Paten Gold'],
        dosage: '1 sachet Paten Gold per tangki 16 L (interval 10 hari)',
        waterVolume: '16 Liter',
        mixingInstruction: 'Semprot rutin setelah setiap kali petik panen.',
        targetStomata: 'Daun & Buah'
      }
    ]
  },
  tembakau: {
    commodityId: 'tembakau',
    name: 'Tembakau Virginia Rajangan',
    tips: [
      'Paten Gold meningkatkan elastisitas lamina daun tembakau dan aroma rajangan khas.',
      'Warna daun krosok mengering kuning keemasan berkilap (Grade A super).',
      'Penghematan pupuk ZA/NPK kimia mencapai 65-70% tanpa mengurangi bobot timbangan.'
    ],
    schedules: [
      {
        id: 'tb-1',
        dayAfterPlanting: 12,
        title: 'Vegetatif & Pengakaran Tembakau',
        actionType: 'Semprot Halus',
        products: ['Paten Hijau', 'Paten Imun'],
        dosage: '1 sachet Paten Hijau + 1 sachet Paten Imun per tangki',
        waterVolume: '16 Liter',
        mixingInstruction: 'Semprot halus pada daun muda pagi hari.',
        targetStomata: 'Daun Muda'
      },
      {
        id: 'tb-2',
        dayAfterPlanting: 30,
        title: 'Perlebaran Daun & Ketebalan Lamina',
        actionType: 'Semprot Halus',
        products: ['Paten Gold', 'Paten Imun'],
        dosage: '1 sachet Paten Gold + 1 sachet Paten Imun per tangki',
        waterVolume: '16-20 Liter',
        mixingInstruction: 'Meningkatkan elastisitas dan rendemen daun krosok.',
        targetStomata: 'Bawah Daun'
      },
      {
        id: 'tb-3',
        dayAfterPlanting: 50,
        title: 'Pemasakan Daun Mahkota Emas',
        actionType: 'Semprot Halus',
        products: ['Paten Gold'],
        dosage: '1 sachet Paten Gold per tangki',
        waterVolume: '16 Liter',
        mixingInstruction: 'Semprot menjelang panen petikan bertahap.',
        targetStomata: 'Daun Atas'
      }
    ]
  }
};
