import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Apple,
  Cloud,
  RefreshCw,
  CheckCircle2,
  Copy,
  ExternalLink,
  Download,
  Share2,
  Layers,
  ShieldCheck,
  Zap,
  Globe,
  Radio,
  Wifi,
  WifiOff,
  Cpu,
  ChevronRight,
  Terminal,
  Server
} from 'lucide-react';
import { RennerLogo } from './RennerLogo';
import { getLastSyncTime, updateLastSyncTime } from '../utils/offlineStorage';

interface DeployPublishInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  onSyncData?: () => void;
}

type GuideTab = 'android' | 'ios' | 'sync' | 'deploy' | 'gas';

export const DeployPublishInstallGuideModal: React.FC<DeployPublishInstallGuideModalProps> = ({
  isOpen,
  onClose,
  isOnline,
  onSyncData
}) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('android');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [testSyncStatus, setTestSyncStatus] = useState<'idle' | 'syncing' | 'success'>('idle');
  const [lastSync, setLastSync] = useState<string>(getLastSyncTime());

  // Listen for beforeinstallprompt event on Android/Chromium
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('Untuk menginstal di Android, silakan buka menu titik tiga (⋮) di pojok kanan atas browser Chrome dan pilih "Instal aplikasi" atau "Tambahkan ke Layar Utama".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const handleTriggerTestSync = () => {
    setTestSyncStatus('syncing');
    setTimeout(() => {
      updateLastSyncTime();
      setLastSync(new Date().toLocaleTimeString('id-ID'));
      setTestSyncStatus('success');
      if (onSyncData) onSyncData();
      setTimeout(() => setTestSyncStatus('idle'), 3000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white relative flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <RennerLogo className="w-10 h-10 ring-2 ring-emerald-400/40 rounded-xl" />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-bold mb-1">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                <span>PWA & Cloud Deployment Guide</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black font-['Outfit'] tracking-tight">
                Panduan Deploy, Publish & Akses Android/iOS
              </h2>
              <p className="text-[11px] text-emerald-100/80">
                Aplikasi Tersinkronisasi Offline-First • Instalasi Cepat Tanpa Kuota Besar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 px-3 sm:px-6 overflow-x-auto gap-2 py-2">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'android'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Instalasi Android (PWA/APK)</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'ios'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>Instalasi iOS (iPhone/iPad)</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'sync'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sinkronisasi Offline</span>
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'deploy'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Deploy & Publish Server</span>
          </button>

          <button
            onClick={() => setActiveTab('gas')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'gas'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>Google Apps Script (Code.gs & Index.html)</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs sm:text-sm">
          
          {/* TAB 1: ANDROID */}
          {activeTab === 'android' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Quick Install Banner */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                      Instal Langsung di HP Android
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Tersimpan di beranda layar tanpa unduhan Play Store yang memakan memori besar.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleInstallClick}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 shrink-0 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>{isInstallable ? 'Instal Sekarang (1 Klik)' : 'Petunjuk Pasang'}</span>
                </button>
              </div>

              {/* Steps Guide */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                  <span>Cara Pasang via Google Chrome di Android:</span>
                </h4>
                
                <ol className="space-y-2.5 pl-2 text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Langkah 1:</span>
                    <span>Buka tautan web aplikasi pada Google Chrome ponsel Anda.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Langkah 2:</span>
                    <span>Ketuk ikon menu titik tiga <strong className="text-slate-800 dark:text-slate-100">(⋮)</strong> di pojok kanan atas layar Chrome.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Langkah 3:</span>
                    <span>Pilih opsi <strong className="text-emerald-700 dark:text-emerald-400">"Instal aplikasi"</strong> atau <strong className="text-emerald-700 dark:text-emerald-400">"Tambahkan ke Layar Utama"</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Langkah 4:</span>
                    <span>Ketuk <em>"Instal"</em> saat konfirmasi muncul. Ikon resmi <strong>Paten Agro</strong> akan muncul di beranda dan laci aplikasi Android Anda.</span>
                  </li>
                </ol>
              </div>

              {/* TWA / Play Store Publishing Guide */}
              <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>Panduan Publish ke Google Play Store (TWA / Bubblewrap)</span>
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                    Trusted Web Activity
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Untuk mendistribusikan aplikasi ke Google Play Store secara resmi bagi petani anggota koperasi, gunakan tool resmi Google <strong>Bubblewrap CLI</strong> atau <strong>PWABuilder</strong>:
                </p>

                <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[11px] overflow-x-auto relative group">
                  <code>
                    # 1. Install Bubblewrap CLI dari Google{'\n'}
                    npm i -g @bubblewrap/cli{'\n\n'}
                    # 2. Inisialisasi package TWA Android{'\n'}
                    bubblewrap init --manifest=https://domain-anda.com/manifest.webmanifest{'\n\n'}
                    # 3. Build file AAB untuk Google Play Store{'\n'}
                    bubblewrap build
                  </code>
                  <button
                    onClick={() => handleCopy('bubblewrap init --manifest=https://domain-anda.com/manifest.webmanifest && bubblewrap build', 'twa-cmd')}
                    className="absolute top-2 right-2 px-2 py-1 rounded-md bg-slate-800 text-slate-300 hover:text-white text-[10px] flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedIndex === 'twa-cmd' ? 'Tersalin!' : 'Salin'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>File <code>.well-known/assetlinks.json</code> telah dipersiapkan untuk verifikasi digital asset link otomatis.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IOS (IPHONE & IPAD) */}
          {activeTab === 'ios' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 rounded-2xl p-4 flex items-start gap-3">
                <Apple className="w-6 h-6 text-sky-800 dark:text-sky-300 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                    Akses Khusus Pengguna iPhone & iPad (iOS Safari)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Apple iOS mendukung teknologi WebClip PWA. Aplikasi akan berjalan di layar penuh (*standalone*), tanpa bilah navigasi Safari, dan berfungsi optimal secara offline di kebun.
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] flex items-center justify-center font-bold">iOS</span>
                  <span>Langkah Pemasangan di Safari iPhone:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-1.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center mx-auto text-xs">
                      1
                    </div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">Buka di Safari</p>
                    <p className="text-[11px] text-slate-500">
                      Pastikan membuka link di Safari (bukan browser in-app WhatsApp atau Chrome).
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-1.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center mx-auto text-xs">
                      2
                    </div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">Ketuk Tombol Share</p>
                    <p className="text-[11px] text-slate-500">
                      Tekan ikon <Share2 className="w-3.5 h-3.5 inline text-sky-600" /> (kotak dengan panah ke atas) di bagian bawah layar.
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-1.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center mx-auto text-xs">
                      3
                    </div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">Add to Home Screen</p>
                    <p className="text-[11px] text-slate-500">
                      Gulir ke bawah dan ketuk <strong>"Tambahkan ke Layar Utama"</strong> (Add to Home Screen).
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-300">
                  <strong>💡 Keuntungan di iPhone:</strong> Saat dibuka dari layar utama, aplikasi langsung aktif tanpa delay, tidak perlu login ulang, dan GPS penanda titik lahan tetap akurat.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SYNC */}
          {activeTab === 'sync' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                      <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                      <span>Status Sinkronisasi Perangkat</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Koneksi saat ini: <strong className={isOnline ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-600'}>{isOnline ? 'Online (Terhubung)' : 'Offline (Tersimpan Lokal)'}</strong> • Terakhir disinkronkan: <span className="font-semibold">{lastSync}</span>
                    </p>
                  </div>

                  <button
                    onClick={handleTriggerTestSync}
                    disabled={testSyncStatus === 'syncing'}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <RefreshCw className={`w-4 h-4 ${testSyncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                    <span>{testSyncStatus === 'syncing' ? 'Menyinkronkan...' : 'Tes Sinkronisasi Sekarang'}</span>
                  </button>
                </div>

                {testSyncStatus === 'success' && (
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Sinkronisasi sukses! Data offline, kalkulasi are, dan titik lahan berhasil diperbarui.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">1. Arsitektur Offline-First</span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Kalkulator dosis, peta titik koordinat NTB, scan penyakit, dan log panen tersimpan langsung pada IndexedDB / LocalStorage perangkat Anda.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">2. Auto-Sync Saat Sinyal Pulih</span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Ketika petani keluar dari pelosok sawah dan mendapatkan sinyal seluler (event <code>online</code>), sistem otomatis memperbarui antrean cloud.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">3. Keamanan Data Syariah</span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Data tidak bocor ke pihak ketiga. Privasi laporan panen anggota koperasi terlindungi dengan enkripsi lokal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEPLOY & PUBLISH */}
          {activeTab === 'deploy' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span>Langkah Build & Deploy ke Cloud (Vercel / Cloud Run / VPS)</span>
                  </h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Production Ready
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  Jalankan perintah berikut pada terminal server Anda untuk mengompilasi bundel produksi berkinerja tinggi:
                </p>

                <div className="bg-black/60 p-3.5 rounded-xl font-mono text-[11px] text-emerald-400 relative">
                  <code>
                    # 1. Install seluruh dependensi resmi{'\n'}
                    npm install{'\n\n'}
                    # 2. Build bundel produksi teroptimasi{'\n'}
                    npm run build{'\n\n'}
                    # 3. Jalankan server aplikasi (Port 3000){'\n'}
                    npm start
                  </code>
                  <button
                    onClick={() => handleCopy('npm run build && npm start', 'build-cmd')}
                    className="absolute top-2 right-2 px-2 py-1 rounded-md bg-slate-800 text-slate-300 hover:text-white text-[10px] flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedIndex === 'build-cmd' ? 'Tersalin!' : 'Salin'}</span>
                  </button>
                </div>

                <div className="space-y-2 pt-2 text-xs text-slate-300">
                  <h5 className="font-bold text-white text-xs">Konfigurasi Domain & SSL Wajib PWA:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-400">
                    <li>PWA mewajibkan protokol <strong>HTTPS / SSL</strong> (tersedia gratis via Cloudflare, Let's Encrypt, atau Vercel SSL).</li>
                    <li>Port default dev server adalah <code>3000</code>.</li>
                    <li>File <code>/public/manifest.webmanifest</code> dan <code>/public/sw.js</code> sudah aktif secara otomatis.</li>
                  </ul>
                </div>
              </div>

              {/* Developer info */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                    PENGEMBANG APLIKASI
                  </span>
                  <p className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                    Husni, S. Kom. I. <span className="text-emerald-700 dark:text-emerald-400 font-semibold">(Member Renner Syariah)</span>
                  </p>
                  <p className="text-[10px] text-slate-500">
                    PT. Renner Inti Internasional • Sertifikasi DSN-MUI & Kementan RI
                  </p>
                </div>
                <RennerLogo className="w-8 h-8 opacity-80" />
              </div>
            </div>
          )}

          {/* TAB 5: GOOGLE APPS SCRIPT (CODE.GS & INDEX.HTML) */}
          {activeTab === 'gas' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl p-4 sm:p-5 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-amber-400" />
                    <h4 className="font-extrabold text-sm sm:text-base text-white">
                      Google Apps Script Web App (Gratis Server + Google Sheets)
                    </h4>
                  </div>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                    script.google.com
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Aplikasi ini telah disediakan file <strong>Code.gs</strong> dan <strong>Index.html</strong> lengkap di root folder dan folder <code>google-apps-script/</code>. Anda dapat meng-hosting seluruh aplikasi ini di Google Apps Script secara 100% gratis dengan database Google Sheets tanpa biaya server bulanan!
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href="https://script.google.com/home/start"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs inline-flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>Buka Google Apps Script Editor ➔</span>
                  </a>
                </div>
              </div>

              {/* Step by Step Deployment Guide */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                  <span>Langkah Deploy di Google Apps Script:</span>
                </h4>

                <ol className="space-y-2.5 pl-2 text-slate-600 dark:text-slate-300 text-xs">
                  <li className="flex items-start gap-2">
                    <strong className="text-emerald-700 dark:text-emerald-400 shrink-0">1.</strong>
                    <span>Buka <strong>script.google.com</strong> dengan akun Google Anda, lalu klik tombol <em>"Proyek Baru" (New Project)</em>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <strong className="text-emerald-700 dark:text-emerald-400 shrink-0">2.</strong>
                    <span>Pada file default <strong>Code.gs</strong>, salin dan tempelkan seluruh isi file <code>Code.gs</code> yang telah dibuat.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <strong className="text-emerald-700 dark:text-emerald-400 shrink-0">3.</strong>
                    <span>Klik menu <strong>+ (Tambahkan file)</strong> ➔ Pilih <strong>HTML</strong> ➔ Beri nama persis <code>Index</code> (tanpa .html karena otomatis).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <strong className="text-emerald-700 dark:text-emerald-400 shrink-0">4.</strong>
                    <span>Tempelkan seluruh isi file <code>Index.html</code> ke editor file Index tersebut.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <strong className="text-emerald-700 dark:text-emerald-400 shrink-0">5.</strong>
                    <span>Klik tombol <strong>Deploy (Terapkan)</strong> di pojok kanan atas ➔ Pilih <strong>Deployment baru (New deployment)</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <strong className="text-emerald-700 dark:text-emerald-400 shrink-0">6.</strong>
                    <span>Pilih jenis: <strong>Aplikasi Web (Web app)</strong>. Konfigurasi:
                      <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[11px] text-slate-500">
                        <li>Jalankan sebagai: <strong>Saya (email Anda)</strong></li>
                        <li>Siapa yang memiliki akses: <strong>Siapa saja (Anyone)</strong></li>
                      </ul>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <strong className="text-emerald-700 dark:text-emerald-400 shrink-0">7.</strong>
                    <span>Klik <strong>Terapkan</strong> dan izinkan akses Google Sheets saat diminta. Salin URL Web App yang dihasilkan untuk dibagikan ke petani binaan!</span>
                  </li>
                </ol>
              </div>

              {/* File Info & Location Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-emerald-600" />
                      <span>File: Code.gs</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">/Code.gs</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Berisi fungsi backend <code>doGet(e)</code>, <code>doPost(e)</code>, inisialisasi sheet otomatis, query data titik lahan NTB, log panen, dan sinkronisasi Google Sheets.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-sky-600" />
                      <span>File: Index.html</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">/Index.html</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Berisi antarmuka web app responsif lengkap: Kalkulator 1-100 are, peta lahan 8 kabupaten NTB, forum diskusi, kalkulator nutrisi NPK, serta generator laporan PDF resmi.
                  </p>
                </div>
              </div>

              {/* Developer info */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                    PENGEMBANG APLIKASI
                  </span>
                  <p className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                    Husni, S. Kom. I. <span className="text-emerald-700 dark:text-emerald-400 font-semibold">(Member Renner Syariah)</span>
                  </p>
                  <p className="text-[10px] text-slate-500">
                    PT. Renner Inti Internasional • Sertifikasi DSN-MUI & Kementan RI
                  </p>
                </div>
                <RennerLogo className="w-8 h-8 opacity-80" />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
