/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { CalculatorView } from './components/CalculatorView';
import { ProductSoilAnalysisView } from './components/ProductSoilAnalysisView';
import { LandDistributionMapView } from './components/LandDistributionMapView';
import { PlantDiseaseScannerView } from './components/PlantDiseaseScannerView';
import { ScheduleWeatherView } from './components/ScheduleWeatherView';
import { AnalyticsDashboardView } from './components/AnalyticsDashboardView';
import { NotificationModal } from './components/NotificationModal';
import { VideoTutorialModal } from './components/VideoTutorialModal';
import { FarmerForumView } from './components/FarmerForumView';
import { AppWalkthroughModal } from './components/AppWalkthroughModal';
import { DeployPublishInstallGuideModal } from './components/DeployPublishInstallGuideModal';
import { AiConsultantModal } from './components/AiConsultantModal';
import { CommodityId, LandPlotLocation, SoilCondition } from './types';
import {
  getNotifications,
  getLastSyncTime,
  updateLastSyncTime,
  triggerDailyFertilizationBrowserNotification
} from './utils/offlineStorage';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
  const [showGlobalVideoTutorial, setShowGlobalVideoTutorial] = useState<boolean>(false);
  const [showGlobalDeployGuide, setShowGlobalDeployGuide] = useState<boolean>(false);
  const [showAiConsultantModal, setShowAiConsultantModal] = useState<boolean>(false);
  const [aiConsultantCropContext, setAiConsultantCropContext] = useState<string>('Padi Sawah');
  const [showWalkthroughModal, setShowWalkthroughModal] = useState<boolean>(() => {
    try {
      const completed = localStorage.getItem('paten_agro_walkthrough_completed_v1');
      return completed !== 'true';
    } catch {
      return false;
    }
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(getLastSyncTime());
  const [selectedCommodityForSchedule, setSelectedCommodityForSchedule] = useState<CommodityId>('padi');
  const [calculatorParams, setCalculatorParams] = useState<{
    commodityId?: CommodityId;
    areaInAre?: number;
    soilCondition?: SoilCondition;
    phValue?: number;
    notes?: string;
  } | null>(null);
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);

  // Dark Mode Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('paten_agro_theme_v1');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('paten_agro_theme_v1', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('paten_agro_theme_v1', 'light');
      }
    } catch (e) {
      console.error(e);
    }
  }, [isDarkMode]);

  // Monitor online / offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync('Koneksi internet kembali! Data tersimpan berhasil disinkronisasi.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncToastMessage('Mode Offline aktif: Anda tetap dapat melakukan kalkulasi dan membuka panduan dosis.');
      setTimeout(() => setSyncToastMessage(null), 4000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update unread count
  const refreshUnreadCount = () => {
    const notifs = getNotifications();
    const unread = notifs.filter(n => !n.isRead).length;
    setUnreadNotifsCount(unread);
  };

  useEffect(() => {
    // Check and trigger daily browser & offline fertilization reminder
    try {
      triggerDailyFertilizationBrowserNotification();
    } catch (e) {
      console.warn('Daily reminder check error:', e);
    }
    refreshUnreadCount();
  }, []);

  const triggerSync = (msg?: string) => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      updateLastSyncTime();
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      refreshUnreadCount();
      setSyncToastMessage(msg || 'Sinkronisasi data lokal & cloud berhasil!');
      setTimeout(() => setSyncToastMessage(null), 3000);
    }, 1200);
  };

  const handleNavigateToSchedule = (commodityId: CommodityId) => {
    setSelectedCommodityForSchedule(commodityId);
    setActiveTab('schedule_weather');
  };

  const handleNavigateToSoilGuide = () => {
    setActiveTab('product_soil');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] transition-colors">
      {/* Offline / Sync Notification Toast */}
      {syncToastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 dark:bg-slate-800/95 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 flex items-center gap-2 border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{syncToastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <HeaderBar
        isOnline={isOnline}
        unreadCount={unreadNotifsCount}
        onOpenNotifications={() => setShowNotificationModal(true)}
        onSyncData={() => triggerSync()}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        onOpenVideoTutorial={() => setShowGlobalVideoTutorial(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
        onOpenForum={() => setActiveTab('forum')}
        onOpenWalkthrough={() => setShowWalkthroughModal(true)}
        onOpenDeployGuide={() => setShowGlobalDeployGuide(true)}
        onOpenGarminFinder={() => setActiveTab('land_map')}
        onOpenAiConsultant={() => setShowAiConsultantModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-5">
        {activeTab === 'calculator' && (
          <CalculatorView
            initialParams={calculatorParams}
            onGoToSchedule={handleNavigateToSchedule}
            onGoToSoilGuide={handleNavigateToSoilGuide}
            onGoToFertilityProfiler={() => setActiveTab('product_soil')}
          />
        )}

        {activeTab === 'product_soil' && (
          <ProductSoilAnalysisView
            onApplyToCalculator={(params) => {
              setCalculatorParams(params);
              setSelectedCommodityForSchedule(params.commodityId);
              setActiveTab('calculator');
            }}
            onNavigateToLandMap={() => setActiveTab('land_map')}
          />
        )}

        {activeTab === 'land_map' && (
          <LandDistributionMapView
            onSelectPlotForCalculator={(plot) => {
              setCalculatorParams({
                commodityId: plot.commodityId,
                areaInAre: plot.unit === 'Are' ? plot.areaOrPopulation : 10,
                soilCondition: plot.soilCondition,
                phValue: plot.phValue,
                notes: `Plot ${plot.name} (${plot.addressName})`
              });
              setSelectedCommodityForSchedule(plot.commodityId);
              setActiveTab('calculator');
            }}
          />
        )}

        {activeTab === 'forum' && (
          <FarmerForumView />
        )}

        {activeTab === 'disease_scan' && (
          <PlantDiseaseScannerView
            isOnline={isOnline}
            onApplyPatenSchedule={() => setActiveTab('schedule_weather')}
            onNavigateToLandMap={() => setActiveTab('land_map')}
          />
        )}

        {activeTab === 'schedule_weather' && (
          <ScheduleWeatherView
            initialCommodityId={selectedCommodityForSchedule}
            onOpenAiConsultant={(crop) => {
              if (crop) setAiConsultantCropContext(crop);
              setShowAiConsultantModal(true);
            }}
            onApplyToCalculator={(comm) => {
              setCalculatorParams({ commodityId: comm });
              setActiveTab('calculator');
            }}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboardView />
        )}

        {/* App Credit Footer */}
        <footer className="mt-8 pb-16 text-center text-[11px] text-slate-500 dark:text-slate-400 space-y-1 border-t border-slate-200/60 dark:border-slate-800/80 pt-4">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            Paten Agro Renner Syariah • Teknologi Pupuk Organik Nano
          </p>
          <p className="font-bold text-emerald-800 dark:text-emerald-400">
            Pengembang Aplikasi: <span className="text-slate-900 dark:text-slate-100 font-extrabold">Husni, S. Kom. I.</span> (Member Renner Syariah)
          </p>
          <p className="text-[10px] text-slate-400">
            Sertifikasi DSN-MUI • Kementan RI • PT. Renner Inti Internasional
          </p>
        </footer>
      </main>

      {/* Floating Action Button: Konsultan Tani AI (Gemini API) */}
      <button
        type="button"
        onClick={() => setShowAiConsultantModal(true)}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white px-3.5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-300/40 active:scale-95 transition-all group"
        title="Buka Konsultan Tani AI (Tanya Masalah Hama & Rekomendasi Dosis Pupuk Paten)"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
        </span>
        <span className="text-xs font-black tracking-tight flex items-center gap-1.5 font-['Outfit']">
          <span>Konsultan AI</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md uppercase font-extrabold text-amber-200">
            Paten
          </span>
        </span>
      </button>

      {/* Bottom Mobile Navigation Dock */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasCriticalAlert={unreadNotifsCount > 0}
      />

      {/* Konsultan Tani AI Modal (Gemini API) */}
      <AiConsultantModal
        isOpen={showAiConsultantModal}
        onClose={() => setShowAiConsultantModal(false)}
        initialCropType={aiConsultantCropContext}
        onApplyToCalculator={(comm) => {
          setCalculatorParams({ commodityId: comm });
          setActiveTab('calculator');
          setShowAiConsultantModal(false);
        }}
        onGoToSchedule={() => {
          setActiveTab('schedule_weather');
          setShowAiConsultantModal(false);
        }}
      />

      {/* Notification Center Modal */}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onRefreshUnread={refreshUnreadCount}
      />

      {/* Global Video Tutorial Modal */}
      <VideoTutorialModal
        isOpen={showGlobalVideoTutorial}
        onClose={() => setShowGlobalVideoTutorial(false)}
        initialCommodityId={selectedCommodityForSchedule}
      />

      {/* App Onboarding Walkthrough Tour Modal */}
      <AppWalkthroughModal
        isOpen={showWalkthroughModal}
        onClose={() => setShowWalkthroughModal(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Deploy, Publish & Install Guide Modal */}
      <DeployPublishInstallGuideModal
        isOpen={showGlobalDeployGuide}
        onClose={() => setShowGlobalDeployGuide(false)}
        isOnline={isOnline}
        onSyncData={() => triggerSync()}
      />
    </div>
  );
}
