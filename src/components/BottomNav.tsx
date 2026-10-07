import React from 'react';
import { Calculator, BookOpen, MapPin, ScanLine, CalendarClock, BarChart3, MessageSquare } from 'lucide-react';

export type ActiveTab = 'calculator' | 'product_soil' | 'land_map' | 'forum' | 'disease_scan' | 'schedule_weather' | 'analytics';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  hasCriticalAlert?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  hasCriticalAlert
}) => {
  const navItems = [
    {
      id: 'calculator' as ActiveTab,
      label: 'Kalkulator',
      sublabel: '1-100 Are',
      icon: Calculator
    },
    {
      id: 'product_soil' as ActiveTab,
      label: 'Produk & pH',
      sublabel: 'Profil Tanah',
      icon: BookOpen
    },
    {
      id: 'land_map' as ActiveTab,
      label: 'Peta Lahan',
      sublabel: 'Garmin GPS',
      icon: MapPin,
      badge: 'Garmin'
    },
    {
      id: 'forum' as ActiveTab,
      label: 'Forum',
      sublabel: 'Diskusi Petani',
      icon: MessageSquare
    },
    {
      id: 'disease_scan' as ActiveTab,
      label: 'Scan AI',
      sublabel: 'Deteksi Dini',
      icon: ScanLine
    },
    {
      id: 'schedule_weather' as ActiveTab,
      label: 'Jadwal',
      sublabel: 'Cuaca Lahan',
      icon: CalendarClock,
      hasDot: hasCriticalAlert
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Analitik',
      sublabel: 'Histori Panen',
      icon: BarChart3
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg px-1 py-1.5 max-w-5xl mx-auto transition-colors">
      <div className="grid grid-cols-7 gap-0.5 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all relative ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50/80 dark:bg-emerald-950/60 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110 text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
                {item.hasDot && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-ping" />
                )}
                {item.badge && (
                  <span className="hidden sm:inline-block absolute -top-2 -right-4 px-1 py-0.2 bg-emerald-600 text-[7px] text-white font-extrabold rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] mt-1 leading-tight tracking-tight text-center truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

