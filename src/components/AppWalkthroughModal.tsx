import React, { useState } from 'react';
import {
  Sparkles,
  Calculator,
  MapPin,
  ScanLine,
  MessageSquare,
  Calendar,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  X,
  Compass,
  Award,
  Zap,
  ArrowRight
} from 'lucide-react';
import { ActiveTab } from './BottomNav';
import { RennerLogo } from './RennerLogo';

interface AppWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

interface WalkthroughStep {
  title: string;
  subtitle: string;
  badge: string;
  targetTab?: ActiveTab;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgGradient: string;
  points: { title: string; desc: string; icon: string }[];
  actionLabel?: string;
}

export const AppWalkthroughModal: React.FC<AppWalkthroughModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  if (!isOpen) return null;

  const steps: WalkthroughStep[] = [
    {
      title: 'Selamat Datang di Paten Agro',
      subtitle: 'Aplikasi Pertanian Pintar & Efisiensi Pupuk Berteknologi Nano Organik dari PT. Renner Inti Internasional. Dikembangkan oleh Husni, S. Kom. I. (Member Renner Syariah).',
      badge: 'PENGANTAR RESMI',
      icon: Award,
      accentColor: 'text-emerald-600 dark:text-emerald-400',
      bgGradient: 'from-emerald-900 via-teal-900 to-emerald-950',
      points: [
        {
          title: 'Pengembang Aplikasi Mitra Renner',
          desc: 'Aplikasi dirancang oleh Husni, S. Kom. I. (Member Renner Syariah) untuk kemudahan operasional seluruh petani Nusantara.',
          icon: '👨‍💻'
        },
        {
          title: 'Teknologi Nano Organik Terakreditasi',
          desc: 'Nutrisi langsung diserap stomata daun dalam 15 menit tanpa tergantung proses fotosintesis akar semata.',
          icon: '🔬'
        },
        {
          title: 'Sertifikasi Syariah & Halal MUI',
          desc: 'Sesuai prinsip syariah DSN-MUI dan izin resmi Kementerian Pertanian Republik Indonesia.',
          icon: '📜'
        },
        {
          title: 'Solusi Terpadu Petani & Peternak',
          desc: 'Mencakup tanaman pangan, perkebunan, hingga peternakan sapi, kerbau, kambing, dan unggas.',
          icon: '🌾'
        }
      ]
    },
    {
      title: 'Kalkulator Dosis & Hemat Biaya',
      subtitle: 'Simulasikan kebutuhan sachet Paten Gold & Imun untuk skala 1 s/d 100 Are (1 Hektar) sesuai pH tanah Anda.',
      badge: 'MODUL 1: KALKULATOR',
      targetTab: 'calculator',
      icon: Calculator,
      accentColor: 'text-amber-500 dark:text-amber-400',
      bgGradient: 'from-teal-900 via-emerald-900 to-slate-900',
      points: [
        {
          title: 'Komparasi Efisiensi Pupuk Nyata',
          desc: 'Bandingkan langsung biaya pupuk kimia konvensional dengan Paten. Hemat biaya 40% - 70% per musim!',
          icon: '💰'
        },
        {
          title: 'Penyesuaian Otomatis Kondisi Tanah',
          desc: 'Tersedia input nilai pH tanah (Sangat Asam, Asam, Agak Asam, Ideal) untuk menentukan takaran kocor/semprot.',
          icon: '🧪'
        },
        {
          title: 'Unduh Hasil Laporan PDF Resmi',
          desc: 'Hasil kalkulasi dapat langsung diekspor ke format PDF rapi untuk arsip kelompok tani (Gapoktan).',
          icon: '📄'
        }
      ],
      actionLabel: 'Buka Kalkulator'
    },
    {
      title: 'Peta Sebaran Lahan & GPS',
      subtitle: 'Pantau titik lokasi lahan petani di NTB (Lombok, Sumbawa, Dompu, Bima) dan seluruh pelosok Nusantara.',
      badge: 'MODUL 2: PEMETAAN LAHAN',
      targetTab: 'land_map',
      icon: MapPin,
      accentColor: 'text-blue-500 dark:text-blue-400',
      bgGradient: 'from-blue-950 via-slate-900 to-emerald-950',
      points: [
        {
          title: 'Indikator Warna Pin Sesuai pH',
          desc: 'Warna pin merah (sangat masam), oranye (masam), kuning (agak masam), hijau (optimal), dan ungu (peternakan).',
          icon: '📍'
        },
        {
          title: 'Peta Satelit GPS & Jalan Terkini',
          desc: 'Beralih bebas antara citra satelit nyata, peta jalan OpenStreetMap, atau skematik kepulauan.',
          icon: '🛰️'
        },
        {
          title: 'Navigasi Langsung ke Google Maps',
          desc: 'Klik pada titik lahan untuk membuka navigasi GPS langsung di HP saat menuju ke lokasi sawah.',
          icon: '🧭'
        }
      ],
      actionLabel: 'Lihat Peta Lahan'
    },
    {
      title: 'Scan Deteksi Penyakit AI',
      subtitle: 'Foto daun atau tanaman bergejala hama/penyakit langsung di sawah untuk diagnosis instan.',
      badge: 'MODUL 3: DIAGNOSIS AI',
      targetTab: 'disease_scan',
      icon: ScanLine,
      accentColor: 'text-rose-500 dark:text-rose-400',
      bgGradient: 'from-rose-950 via-slate-900 to-emerald-950',
      points: [
        {
          title: 'Deteksi Cepat Melalui Kamera HP',
          desc: 'Identifikasi penyakit bulai jagung, kresek/blas padi, bercak daun tembakau, busuk batang, dan ulat grayak.',
          icon: '📷'
        },
        {
          title: 'Tingkat Keyakinan & Bahaya',
          desc: 'Menampilkan indikator keparahan (rendah, sedang, darurat) serta bagian tanaman yang terinfeksi.',
          icon: '⚠️'
        },
        {
          title: 'Protokol Penanganan Paten Imun',
          desc: 'Dapatkan takaran semprot vaksin organik Paten Imun untuk membasmi jamur/bakteri serta memulihkan daun.',
          icon: '🛡️'
        }
      ],
      actionLabel: 'Coba Scan AI'
    },
    {
      title: 'Forum Komunitas & Wawasan Musiman',
      subtitle: 'Saling bertukar tips bertani, hasil timbangan panen, dan pantau kalender musim tanam real-time.',
      badge: 'MODUL 4: KOMUNITAS & CUACA',
      targetTab: 'forum',
      icon: MessageSquare,
      accentColor: 'text-purple-500 dark:text-purple-400',
      bgGradient: 'from-purple-950 via-slate-900 to-emerald-950',
      points: [
        {
          title: 'Forum Petani Nusantara',
          desc: 'Tulis cerita pengalaman panen Anda, diskusikan dosis tangki, dan beri komentar antar sesama petani.',
          icon: '💬'
        },
        {
          title: 'Wawasan Musiman Berbasis Kalender',
          desc: 'Rekomendasi persiapan olah tanah sebelum musim hujan (Rendeng) dan tips irigasi saat kemarau (Gadu).',
          icon: '🌦️'
        },
        {
          title: 'Mode Gelap untuk Kerja Malam Hari',
          desc: 'Beralih ke mode malam yang sejuk di mata petani saat menginput catatan panen di lapangan.',
          icon: '🌙'
        }
      ],
      actionLabel: 'Kunjungi Forum'
    }
  ];

  const currentStep = steps[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === steps.length - 1;

  const handleFinish = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('paten_agro_walkthrough_completed_v1', 'true');
      } catch (e) {
        console.error(e);
      }
    }
    onClose();
  };

  const handleNext = () => {
    if (isLast) {
      handleFinish();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleJumpToFeature = (tab?: ActiveTab) => {
    handleFinish();
    if (tab && onNavigateTab) {
      onNavigateTab(tab);
    }
  };

  const StepIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Modal Top Visual Header */}
        <div className={`p-5 sm:p-6 bg-gradient-to-br ${currentStep.bgGradient} text-white relative overflow-hidden transition-all duration-300`}>
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-md">
                <StepIcon className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white font-extrabold text-[10px] tracking-wider mb-1 uppercase">
                  {currentStep.badge} • LANGKAH {currentStepIndex + 1} DARI {steps.length}
                </span>
                <h3 className="text-lg sm:text-xl font-black font-['Outfit'] tracking-tight leading-tight">
                  {currentStep.title}
                </h3>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="p-1.5 rounded-xl bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors"
              title="Tutup panduan"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs sm:text-sm text-emerald-100 dark:text-slate-200 mt-2.5 leading-relaxed relative z-10">
            {currentStep.subtitle}
          </p>

          {/* Step Progress Dots */}
          <div className="flex items-center gap-1.5 mt-4 pt-1">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? 'w-8 bg-amber-400 shadow-xs'
                    : idx < currentStepIndex
                    ? 'w-3 bg-white/70'
                    : 'w-2 bg-white/25'
                }`}
                title={`Menuju langkah ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Modal Body: Feature Highlights */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="space-y-2.5">
            {currentStep.points.map((pt, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-2xs flex items-start gap-3 transition-transform hover:scale-[1.01]"
              >
                <div className="text-2xl shrink-0 p-1 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  {pt.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit']">
                    {pt.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {pt.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Optional Action to Jump Direct to Feature */}
          {currentStep.targetTab && currentStep.actionLabel && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => handleJumpToFeature(currentStep.targetTab)}
                className="w-full py-2.5 px-3 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
              >
                <span>{currentStep.actionLabel} Sekarang</span>
                <ArrowRight className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Checkbox Don't show again */}
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <span>Jangan tampilkan otomatis lagi</span>
          </label>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {!isFirst && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleFinish}
              className="px-3.5 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold transition-colors"
            >
              Lewati Tur
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>{isLast ? 'Mulai Gunakan Aplikasi' : 'Lanjut'}</span>
              {isLast ? <CheckCircle2 className="w-4 h-4 text-emerald-200" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
