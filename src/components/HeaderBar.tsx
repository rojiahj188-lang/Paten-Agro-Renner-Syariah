import React from 'react';
import { Bell, Wifi, WifiOff, RefreshCw, Award, Play, Sun, Moon, MessageSquare, HelpCircle, Smartphone, Compass, Sparkles } from 'lucide-react';
import { RennerLogo } from './RennerLogo';

interface HeaderBarProps {
  isOnline: boolean;
  unreadCount: number;
  onOpenNotifications: () => void;
  onSyncData: () => void;
  isSyncing: boolean;
  lastSyncTime: string;
  onOpenVideoTutorial?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenForum?: () => void;
  onOpenWalkthrough?: () => void;
  onOpenDeployGuide?: () => void;
  onOpenGarminFinder?: () => void;
  onOpenAiConsultant?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  isOnline,
  unreadCount,
  onOpenNotifications,
  onSyncData,
  isSyncing,
  lastSyncTime,
  onOpenVideoTutorial,
  isDarkMode = false,
  onToggleDarkMode,
  onOpenForum,
  onOpenWalkthrough,
  onOpenDeployGuide,
  onOpenGarminFinder,
  onOpenAiConsultant
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-emerald-100 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
          <RennerLogo className="w-9 h-9 sm:w-10 sm:h-10 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 whitespace-nowrap">
              <h1 className="font-black text-sm sm:text-base tracking-tight text-slate-900 dark:text-slate-50 font-['Outfit'] whitespace-nowrap">
                PATEN <span className="text-emerald-700 dark:text-emerald-400">AGRO</span>
              </h1>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 whitespace-nowrap">
                RENNER SYARIAH
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 items-center gap-1 font-medium whitespace-nowrap hidden sm:flex">
              <Award className="w-3 h-3 text-amber-600 dark:text-amber-400 inline shrink-0" />
              <span>Teknologi Nano Organik • DSN-MUI • Kementan RI</span>
            </p>
            <p className="text-[9px] sm:text-[10px] font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1 whitespace-nowrap">
              <span className="text-slate-500 dark:text-slate-400 hidden xs:inline">Pengembang:</span>
              <span className="text-slate-800 dark:text-slate-200 font-extrabold whitespace-nowrap">Husni, S. Kom. I.</span>
              <span className="text-amber-600 dark:text-amber-400 font-extrabold whitespace-nowrap hidden sm:inline">(Member Renner Syariah)</span>
            </p>
          </div>
        </div>

        {/* Right actions: Konsultan AI, Garmin Finder, Tutorial, Forum, Dark Mode, Online, Sync, Notifications */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
          {/* Konsultan Tani AI (Gemini API) Button */}
          {onOpenAiConsultant && (
            <button
              onClick={onOpenAiConsultant}
              className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white transition-all flex items-center gap-1 text-xs font-black shadow-xs active:scale-95 border border-emerald-400/40 whitespace-nowrap"
              title="Konsultan Tani AI (Gemini API): Tanya masalah hama, penyakit & rekomendasi dosis Paten instan"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
              <span className="hidden xs:inline">Konsultan AI</span>
            </button>
          )}

          {/* Garmin Finder Shortcut Button */}
          {onOpenGarminFinder && (
            <button
              onClick={onOpenGarminFinder}
              className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1 text-xs font-bold shadow-2xs active:scale-95 whitespace-nowrap"
              title="Buka Fitur Garmin Finder (Kompas & Pelacak GPS Lahan)"
            >
              <Compass className="w-3.5 h-3.5 text-amber-300 animate-spin-slow shrink-0" />
              <span className="hidden md:inline">Garmin Finder</span>
            </button>
          )}

          {/* Video Tutorial Button */}
          {onOpenVideoTutorial && (
            <button
              onClick={onOpenVideoTutorial}
              className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 transition-colors flex items-center gap-1 text-xs font-bold shadow-2xs whitespace-nowrap"
              title="Buka Video Tutorial Teknik Aplikasi Pupuk"
            >
              <Play className="w-3.5 h-3.5 fill-emerald-700 dark:fill-emerald-400 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span className="hidden lg:inline">Tutorial</span>
            </button>
          )}

          {/* App Walkthrough Tour Button */}
          {onOpenWalkthrough && (
            <button
              onClick={onOpenWalkthrough}
              className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 transition-colors flex items-center gap-1 text-xs font-bold shadow-2xs whitespace-nowrap"
              title="Buka Tur Panduan Aplikasi (Walkthrough)"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="hidden xl:inline">Panduan</span>
            </button>
          )}

          {/* Deploy & Install Guide Button */}
          {onOpenDeployGuide && (
            <button
              onClick={onOpenDeployGuide}
              className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 transition-colors flex items-center gap-1 text-xs font-bold shadow-2xs whitespace-nowrap"
              title="Panduan Instal di Android/iOS & Deploy Cloud"
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="hidden xl:inline">Instal/Deploy</span>
            </button>
          )}

          {/* Forum Shortcut Button */}
          {onOpenForum && (
            <button
              onClick={onOpenForum}
              className="hidden md:flex px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors items-center gap-1.5 text-xs font-bold shadow-2xs"
              title="Buka Forum Petani Nusantara"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Forum</span>
            </button>
          )}

          {/* Dark Mode Toggle Button */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors relative flex items-center justify-center border border-slate-200 dark:border-slate-700"
              title={isDarkMode ? 'Beralih ke Mode Terang (Siang Hari)' : 'Beralih ke Mode Gelap (Malam Hari)'}
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-200" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 animate-in spin-in-180 duration-200" />
              )}
            </button>
          )}

          {/* Online/Offline indicator */}
          <div
            className={`hidden lg:flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
              isOnline
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            }`}
            title={isOnline ? 'Terhubung ke server' : 'Mode Offline aktif (data tersimpan di perangkat)'}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 mr-1 text-amber-600 dark:text-amber-400" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Sync Button */}
          <button
            onClick={onSyncData}
            disabled={isSyncing}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors relative flex items-center justify-center border border-slate-200 dark:border-slate-700"
            title={`Sinkronkan data offline (Terakhir: ${lastSyncTime})`}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors relative border border-slate-200 dark:border-slate-700"
            title="Pemberitahuan & Peringatan Kritis"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
