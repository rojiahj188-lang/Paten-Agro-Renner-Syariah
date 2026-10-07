import React, { useState } from 'react';
import { X, Play, Sparkles, CheckCircle, ExternalLink, HelpCircle } from 'lucide-react';
import { CommodityId } from '../types';

interface VideoTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCommodityId?: CommodityId;
}

export const VideoTutorialModal: React.FC<VideoTutorialModalProps> = ({
  isOpen,
  onClose,
  initialCommodityId = 'padi'
}) => {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  if (!isOpen) return null;

  const tutorials = [
    {
      title: 'Aplikasi Paten Gold & Paten Imun pada Padi Sawah',
      duration: '4:15 Menit',
      crop: 'Padi Sawah',
      desc: 'Cara tepat melarutkan sachet Paten ke dalam tangki semprot dan waktu stomata terbaik (06.30 - 08.30) pagi.'
    },
    {
      title: 'Kombinasi Paten Hijau & Paten Gold untuk Jagung & Palawija',
      duration: '3:45 Menit',
      crop: 'Jagung & Sayuran',
      desc: 'Teknik kocor pangkal batang dan semprot kabut tajuk daun untuk memicu anakan produktif dan tongkol ganda.'
    },
    {
      title: 'Pemulihan Tanah Asam & Lahan Kritis dengan Pembenah Paten',
      duration: '5:20 Menit',
      crop: 'Semua Komoditas',
      desc: 'Mengembalikan porositas dan kegemburan tanah sawah yang mengeras akibat pupuk kimia sintesis berlebihan.'
    }
  ];

  const currentVideo = tutorials[activeVideoIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-5 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold">
              <Play className="w-4 h-4 fill-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit']">
                Video Panduan Aplikasi Paten
              </h3>
              <p className="text-[11px] text-slate-500">Tutorial Resmi Agronomis PT. Renner Inti Internasional</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Mockup Screen */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-slate-800 shadow-inner group">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
          <div className="text-center z-10 p-4 space-y-2">
            <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg ring-4 ring-emerald-400/30 group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 fill-white ml-1" />
            </div>
            <p className="text-sm font-bold text-white drop-shadow-md">{currentVideo.title}</p>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-emerald-200 backdrop-blur-md">
              Durasi: {currentVideo.duration} • {currentVideo.crop}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
          {currentVideo.desc}
        </p>

        {/* Video Selector Tabs */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Pilih Modul Pembelajaran:</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {tutorials.map((tut, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveVideoIndex(idx)}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  activeVideoIndex === idx
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Play className="w-3 h-3 text-emerald-600" />
                  <span className="font-extrabold">Modul #{idx + 1}</span>
                </div>
                <p className="text-[11px] truncate">{tut.crop}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
          >
            Tutup Video
          </button>
        </div>
      </div>
    </div>
  );
};
