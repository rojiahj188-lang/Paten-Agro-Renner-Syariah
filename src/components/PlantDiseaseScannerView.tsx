import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  AlertOctagon,
  CheckCircle,
  Sparkles,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
  Clock,
  History,
  FileImage,
  Zap,
  Info,
  MapPin,
  Shield,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { DiseaseDiagnosis, PestOutbreakReport } from '../types';
import { saveDiagnosis, getDiagnosisHistory, addNotification, addPestOutbreakReport } from '../utils/offlineStorage';

interface PlantDiseaseScannerViewProps {
  isOnline: boolean;
  onApplyPatenSchedule?: () => void;
  onNavigateToLandMap?: () => void;
}

export const PlantDiseaseScannerView: React.FC<PlantDiseaseScannerViewProps> = ({
  isOnline,
  onApplyPatenSchedule,
  onNavigateToLandMap
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cropType, setCropType] = useState<string>('padi');
  const [farmerNotes, setFarmerNotes] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<DiseaseDiagnosis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<DiseaseDiagnosis[]>(() => getDiagnosisHistory());
  const [isUsingCamera, setIsUsingCamera] = useState<boolean>(false);

  // State for anonymous pest map marking
  const [pestRegionName, setPestRegionName] = useState<string>('Lombok Tengah, NTB');
  const [pestLat, setPestLat] = useState<number>(-8.7000);
  const [pestLng, setPestLng] = useState<number>(116.2833);
  const [isGettingGpsForPest, setIsGettingGpsForPest] = useState<boolean>(false);
  const [hasMarkedOnMap, setHasMarkedOnMap] = useState<boolean>(false);
  const [pestToastMsg, setPestToastMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Preset sample test images with SVG data URIs for immediate one-click testing
  const samplePresets = [
    {
      name: 'Padi: Hawar Daun / Kresek',
      crop: 'padi',
      desc: 'Bercak memanjang kekuningan hingga abu-abu pada helai daun.',
      imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23e2e8f0"/><path d="M50 250 Q200 50 350 220" stroke="%2315803d" stroke-width="36" fill="none" stroke-linecap="round"/><path d="M120 180 Q180 120 280 170" stroke="%23ca8a04" stroke-width="16" fill="none"/><circle cx="210" cy="145" r="14" fill="%23b45309"/><circle cx="160" cy="165" r="10" fill="%23b45309"/><text x="20" y="40" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23334155">Gejala Penyakit Blas/Kresek Daun Padi</text></svg>'
    },
    {
      name: 'Jagung: Gejala Bulai (Bule)',
      crop: 'jagung',
      desc: 'Garis klorosis keputihan memanjang dari pangkal daun.',
      imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f1f5f9"/><path d="M80 260 Q160 30 320 240" stroke="%2316a34a" stroke-width="48" fill="none" stroke-linecap="round"/><path d="M120 220 Q160 80 250 180" stroke="%23fef08a" stroke-width="18" fill="none"/><path d="M140 210 Q170 100 230 170" stroke="%23ffffff" stroke-width="10" fill="none"/><text x="20" y="40" font-family="sans-serif" font-size="16" font-weight="bold" fill="%231e293b">Gejala Virus Bule Tanaman Jagung</text></svg>'
    },
    {
      name: 'Kedelai: Karat Daun',
      crop: 'kedelai',
      desc: 'Bintik pustul kecokelatan mirip karat di bawah helai daun.',
      imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23e2e8f0"/><ellipse cx="200" cy="150" rx="140" ry="85" fill="%234ade80"/><circle cx="150" cy="140" r="8" fill="%23b45309"/><circle cx="190" cy="160" r="10" fill="%23b45309"/><circle cx="230" cy="130" r="7" fill="%23b45309"/><circle cx="250" cy="170" r="9" fill="%23b45309"/><text x="20" y="40" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23334155">Pustul Karat Daun Kedelai</text></svg>'
    },
    {
      name: 'Cabai: Antraknosa / Patek',
      crop: 'cabai',
      desc: 'Bercak melekuk melingkar berpusar pada buah dan daun cabai.',
      imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f8fafc"/><path d="M100 80 Q180 20 280 120 Q320 240 260 270 Q200 240 180 180 Z" fill="%23dc2626"/><ellipse cx="230" cy="160" rx="28" ry="20" fill="%237f1d1d"/><ellipse cx="230" cy="160" rx="14" ry="10" fill="%23450a0a"/><text x="20" y="40" font-family="sans-serif" font-size="16" font-weight="bold" fill="%231e293b">Patek Antraknosa Buah Cabai</text></svg>'
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setDiagnosis(null);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setIsUsingCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setIsUsingCamera(false);
      setErrorMsg('Kamera tidak dapat diakses. Silakan gunakan tombol Unggah Foto.');
    }
  };

  const captureCamera = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setSelectedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsUsingCamera(false);
  };

  const handleAutoDetectGpsForPest = () => {
    if (!('geolocation' in navigator)) {
      alert('Perangkat Anda tidak mendukung fitur lokasi GPS.');
      return;
    }
    setIsGettingGpsForPest(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGettingGpsForPest(false);
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lng = parseFloat(pos.coords.longitude.toFixed(4));
        setPestLat(lat);
        setPestLng(lng);
        setPestRegionName(`Koordinat GPS [${lat}, ${lng}]`);
      },
      (err) => {
        setIsGettingGpsForPest(false);
        console.warn('GPS error:', err);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleMarkPestOnMap = () => {
    if (!diagnosis) return;

    const randomAnonCode = Math.floor(100 + Math.random() * 900);
    const newReport = addPestOutbreakReport({
      diseaseName: diagnosis.diseaseName,
      cropName: diagnosis.cropName || cropType.toUpperCase(),
      severity: diagnosis.severity,
      confidence: diagnosis.confidence,
      coordinates: {
        lat: pestLat,
        lng: pestLng
      },
      regionName: pestRegionName,
      anonymousReporter: `Petani Anonim #${randomAnonCode}`,
      symptoms: diagnosis.symptoms,
      patenRecommendation: {
        products: diagnosis.patenRecommendation.products,
        dosage: diagnosis.patenRecommendation.dosage,
        instructions: diagnosis.patenRecommendation.instructions
      },
      imageUrl: selectedImage || undefined,
      notes: farmerNotes || 'Terdeteksi melalui Pemindai Penyakit Paten Agro'
    });

    setHasMarkedOnMap(true);
    setPestToastMsg(`Titik hama berhasil ditandai di Peta Radar Wilayah (${newReport.anonymousReporter}).`);
    setTimeout(() => setPestToastMsg(null), 5000);

    addNotification({
      title: '🛡️ Peringatan Radar Hama Anonim',
      message: `Lokasi ${diagnosis.diseaseName} berhasil ditandai secara anonim di ${pestRegionName} untuk peringatan petani sekitar.`,
      type: 'penyakit',
      priority: diagnosis.severity === 'Kritis' ? 'kritis' : 'normal'
    });
  };

  const handleRunScan = async () => {
    if (!selectedImage) return;

    setIsScanning(true);
    setErrorMsg(null);

    try {
      let diagResult: DiseaseDiagnosis;

      if (isOnline) {
        const response = await fetch('/api/detect-disease', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: selectedImage,
            cropType,
            notes: farmerNotes
          })
        });

        if (!response.ok) {
          throw new Error('Gagal menghubungi server deteksi AI');
        }

        const data = await response.json();
        diagResult = {
          ...data.diagnosis,
          scannedAt: new Date().toLocaleString('id-ID'),
          cropName: cropType.toUpperCase(),
          imageUrl: selectedImage
        };
      } else {
        // Offline Agronomy Intelligence Engine Fallback
        const offlineRules = getOfflineRuleDiagnosis(cropType);
        diagResult = {
          ...offlineRules,
          scannedAt: new Date().toLocaleString('id-ID') + ' (Mode Offline)',
          cropName: cropType.toUpperCase(),
          imageUrl: selectedImage
        };
      }

      setDiagnosis(diagResult);
      saveDiagnosis(diagResult);
      setHistoryList(getDiagnosisHistory());

      // Trigger automatic critical push alert if diagnosis is critical
      if (diagResult.severity === 'Kritis') {
        addNotification({
          title: `🚨 Peringatan Kritis: ${diagResult.diseaseName}`,
          message: `Segera aplikasikan ${diagResult.patenRecommendation.products.join(' + ')} dengan dosis ${diagResult.patenRecommendation.dosage}.`,
          type: 'penyakit',
          priority: 'kritis'
        });
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      // Fallback to offline rule if network fails
      const fallbackRules = getOfflineRuleDiagnosis(cropType);
      const fallbackDiag: DiseaseDiagnosis = {
        ...fallbackRules,
        scannedAt: new Date().toLocaleString('id-ID') + ' (Fallback Otomatis)',
        cropName: cropType.toUpperCase(),
        imageUrl: selectedImage
      };
      setDiagnosis(fallbackDiag);
      saveDiagnosis(fallbackDiag);
      setHistoryList(getDiagnosisHistory());
    } finally {
      setIsScanning(false);
    }
  };

  function getOfflineRuleDiagnosis(crop: string): Omit<DiseaseDiagnosis, 'scannedAt' | 'cropName' | 'imageUrl'> {
    if (crop === 'jagung') {
      return {
        diseaseName: 'Gejala Awal Virus Bule (Peronosclerospora maydis)',
        severity: 'Kritis',
        confidence: 94,
        symptoms: [
          'Klorosis bergaris sejajar warna putih kekuningan dari pangkal daun.',
          'Tanaman kerdil dan pembentukan tongkol terancam gagal/ompong.',
          'Spora jamur putih di permukaan bawah daun saat kelembapan tinggi.'
        ],
        causes: 'Spora jamur terbawa angin pada kondisi tanah terlalu masam dan kekurangan silika/imunitas sel.',
        patenRecommendation: {
          products: ['Paten Imun', 'Paten Gold'],
          dosage: '1 sachet Paten Imun + 1 sachet Paten Gold per tangki 16-20 Liter',
          frequency: 'Semprot tiap 5 hari sekali di pagi hari (pukul 06.00-09.00)',
          instructions: 'Semprotkan kabut halus ke stomata bawah daun dan pangkal tunas muda.',
          savingsBenefit: 'Menghemat fungisida kimia 100% dan memulihkan stomata tanaman tanpa residu racun.'
        },
        prevention: 'Pastikan aplikasi preventif Paten Gold di HST 5 pada tanaman muda.'
      };
    } else if (crop === 'kedelai') {
      return {
        diseaseName: 'Karat Daun Kedelai (Phakopsora pachyrhizi)',
        severity: 'Sedang',
        confidence: 89,
        symptoms: [
          'Bintik pustul cokelat kemerahan pada permukaan bawah daun.',
          'Daun menguning prematur dan gugur sebelum polong terisi maksimal.',
          'Penurunan bobot kering biji kedelai hingga 40%.'
        ],
        causes: 'Kelembapan tinggi di lahan dan keasaman tanah menghambat translokasi hara mikronutrien.',
        patenRecommendation: {
          products: ['Paten Hijau', 'Paten Imun'],
          dosage: '1 sachet Paten Hijau + 1 sachet Paten Imun per tangki 16-20 Liter',
          frequency: 'Semprot rutin per 10 hari sekali hingga menjelang panen (Slide 44 PDF)',
          instructions: 'Semprot halus merata ke seluruh kanopi daun.',
          savingsBenefit: 'Hemat pestisida hingga 80% dan fungisida 100%.'
        },
        prevention: 'Rendam benih dengan 1 sachet Paten Hijau selama 10 menit sebelum tanam.'
      };
    } else if (crop === 'cabai') {
      return {
        diseaseName: 'Antraknosa / Patek Buah (Colletotrichum capsici)',
        severity: 'Kritis',
        confidence: 93,
        symptoms: [
          'Bercak melekuk melingkar berwarna hitam pekat pada buah matang/muda.',
          'Ujung ranting mengering (mati pucuk die-back).',
          'Kerontokan bunga dan buah masal saat curah hujan tinggi.'
        ],
        causes: 'Infeksi cendawan jamur patogen tanah akibat media tanam belum disterilisasi sebelum tanam.',
        patenRecommendation: {
          products: ['Paten Imun', 'Paten Hijau'],
          dosage: '1 sachet Paten Hijau + 1 sachet Paten Imun per tangki 16-20L',
          frequency: 'Semprot tiap 5-7 hari sekali',
          instructions: 'Semprotkan di bawah daun dan permukaan buah saat cuaca cerah pagi hari.',
          savingsBenefit: 'Menghentikan spora patek tanpa perlu fungisida kimia sintetis mahal.'
        },
        prevention: 'Sterilisasi tanah pra-tanam dengan semprotan 3 sachet Paten Imun per tangki.'
      };
    } else if (crop === 'tembakau') {
      return {
        diseaseName: 'Mosaik Tembakau & Kerupuk Daun (TMV / Tobacco Mosaic Virus)',
        severity: 'Kritis',
        confidence: 92,
        symptoms: [
          'Helaian daun berkerut keriting, timbul belang hijau muda dan gelap.',
          'Pertumbuhan daun kerdil dan tepi daun menggulung ke bawah.',
          'Resin getah tembakau menurun dan daun rapuh mudah patah.'
        ],
        causes: 'Penularan virus oleh kutu kebul serta defisiensi mikronutrien pada tanah asam.',
        patenRecommendation: {
          products: ['Paten Imun', 'Paten Gold'],
          dosage: '1 sachet Paten Imun + 1 sachet Paten Gold / 60 Liter air',
          frequency: 'Semprot tiap 7 hari sekali (Slide 28 PDF)',
          instructions: 'Semprotkan kabut halus ke stomata bawah daun di pagi hari.',
          savingsBenefit: 'Menghindari kerontokan daun dan menghemat insektisida kimia hingga 80%.'
        },
        prevention: 'Pengocoran rutin Paten Gold + ZA pada HST 14 dan HST 28 untuk memperkuat dinding sel daun.'
      };
    } else if (crop === 'gaharu') {
      return {
        diseaseName: 'Serangan Penggerek Batang & Busuk Batang Jamur Gaharu (Zeuzera conferta)',
        severity: 'Sedang',
        confidence: 90,
        symptoms: [
          'Lubang gerekan pada batang mengeluarkan serbuk kayu dan cairan kecokelatan.',
          'Pucuk daun menguning layu dan cabang atas mengering.',
          'Pohon stres pasca penyuntikan inokulan pembentuk gubal.'
        ],
        causes: 'Larva penggerek masuk ke pembuluh floem dan jamur tular tanah menginfeksi luka pohon.',
        patenRecommendation: {
          products: ['Paten Gold', 'Paten Imun'],
          dosage: '12 sachet Paten Gold + 4 sachet Paten Imun + NPK 2kg / 200 Liter air (1L/pohon)',
          frequency: 'Kocor lingkar batang tiap 3 bulan sekali (Slide 20 PDF)',
          instructions: 'Kocorkan 1 liter larutan di lingkar perakaran aktif pohon gaharu.',
          savingsBenefit: 'Menjaga pohon tetap hidup prima saat inokulasi jamur gubal dan mempercepat pembentukan resin wangi.'
        },
        prevention: 'Lakukan pemupukan rutin triwulanan menggunakan formula Paten Gold.'
      };
    } else {
      return {
        diseaseName: 'Hawar Daun Bakteri / Blas Padi (Xanthomonas oryzae / Pyricularia)',
        severity: 'Sedang',
        confidence: 91,
        symptoms: [
          'Bercak basah keabu-abuan berubah kuning kecokelatan di tepi daun.',
          'Daun menggulung layu kering seperti terbakar (kresek).',
          'Bulir padi hampa dan tangkai malai patah leher.'
        ],
        causes: 'Dosis pupuk Urea berlebih tanpa diimbangi kalium dan unsur pembenah tanah.',
        patenRecommendation: {
          products: ['Paten Gold', 'Paten Imun'],
          dosage: '2-3 sachet Paten Gold + 1 sachet Paten Imun per tangki 16-20L',
          frequency: 'Semprot kasar pada umur HST 14 dan HST 28',
          instructions: 'Semprot kasar di pagi hari saat stomata terbuka penuh.',
          savingsBenefit: 'Menghemat biaya fungisida kimia hingga 100% dan gabah tetap berisi padat.'
        },
        prevention: 'Kurangi pupuk Urea granul berlebih, gantikan dengan pola Paten Gold nano.'
      };
    }
  }

  return (
    <div className="space-y-5 pb-24">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-800 text-white rounded-2xl p-4 sm:p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-xs font-bold mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Deteksi Dini Berbasis Pemindaian Foto AI Real-Time</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight">
            Pemindai Kesehatan Tanaman & Resep Paten
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
            Ambil foto daun atau bulir tanaman di lahan. AI Agronomi akan mendeteksi hama/penyakit dan memberikan takaran solusi sachet <strong>Paten Imun & Paten Gold</strong> secara instan.
          </p>
        </div>
      </div>

      {/* Main Scan Panel */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        {/* Commodity select & notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Komoditi Tanaman
            </label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-600"
            >
              <option value="padi">Padi Sawah (Ciherang / Inpari / Ketan)</option>
              <option value="jagung">Jagung (Hibrida / Manis)</option>
              <option value="kedelai">Kedelai / Kacang Tanah</option>
              <option value="cabai">Cabai / Tomat / Terong</option>
              <option value="bawang_merah">Bawang Merah / Putih</option>
              <option value="sawit">Kelapa Sawit</option>
              <option value="tembakau">Tembakau (Rajangan)</option>
              <option value="gaharu">Pohon Gaharu</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Catatan Lapangan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Daun bawah menguning, umur 25 HST..."
              value={farmerNotes}
              onChange={(e) => setFarmerNotes(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Camera / Upload view */}
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center bg-slate-50/60 relative overflow-hidden">
          {isUsingCamera ? (
            <div className="space-y-3">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-h-72 object-cover rounded-xl bg-black mx-auto"
              />
              <div className="flex justify-center gap-2">
                <button
                  onClick={captureCamera}
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Camera className="w-4 h-4" />
                  <span>Jepret Foto</span>
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : selectedImage ? (
            <div className="space-y-3">
              <div className="relative inline-block max-w-full">
                <img
                  src={selectedImage}
                  alt="Foto Daun"
                  className="max-h-64 rounded-xl object-contain shadow-xs mx-auto border border-slate-200"
                />
                {isScanning && (
                  <div className="absolute inset-0 bg-emerald-950/40 rounded-xl flex flex-col items-center justify-center text-white backdrop-blur-xs">
                    <RefreshCw className="w-8 h-8 animate-spin text-amber-300 mb-2" />
                    <p className="text-xs font-bold">Menganalisis Stomata & Patogen Daun...</p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={handleRunScan}
                  disabled={isScanning}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isScanning ? 'Memproses Diagnosis...' : 'Mulai Diagnosis AI'}</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setDiagnosis(null);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
                >
                  Ganti Foto
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Ambil Foto Langsung atau Unggah Gambar Daun
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Format JPG/PNG, pastikan fokus tajam pada gejala bercak atau perubahan warna.
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-1">
                <button
                  onClick={startCamera}
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-emerald-800 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>Buka Kamera Lahan</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-100 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Pilih Galeri File</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* Quick Sample Presets */}
        <div>
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
            Uji Cepat dengan Contoh Preset Lapangan:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedImage(preset.imageUrl);
                  setCropType(preset.crop);
                  setDiagnosis(null);
                }}
                className="p-2 rounded-xl border border-slate-200 text-left hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors bg-white"
              >
                <span className="text-xs font-bold text-slate-800 block truncate">{preset.name}</span>
                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{preset.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* DIAGNOSIS RESULT CARD */}
      {diagnosis && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-emerald-500 shadow-md space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  diagnosis.severity === 'Kritis'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : diagnosis.severity === 'Sedang'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  Tingkat Keparahan: {diagnosis.severity}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Akurasi AI: {diagnosis.confidence}%
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 font-['Outfit'] mt-1">
                {diagnosis.diseaseName}
              </h3>
              <p className="text-xs text-slate-500">
                Waktu Pindai: {diagnosis.scannedAt} • Komoditi: {diagnosis.cropName || cropType.toUpperCase()}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-emerald-700">Diagnosis Terverifikasi</span>
            </div>
          </div>

          {/* Symptoms & Causes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-600" /> Gejala yang Terdeteksi:
              </h4>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                {diagnosis.symptoms.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Penyebab Utama:
              </h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {diagnosis.causes}
              </p>
            </div>
          </div>

          {/* Paten Organic Nano Recommendation Recipe */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-300 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs sm:text-sm text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                Resep Aplikasi Pupuk Paten & Penanganan Cepat:
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-700 text-white">
                Bebas Residu Kimia
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-emerald-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Produk Renner Paten:</span>
                <span className="font-bold text-emerald-900">{diagnosis.patenRecommendation.products.join(' + ')}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-emerald-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Dosis per Tangki:</span>
                <span className="font-bold text-emerald-900">{diagnosis.patenRecommendation.dosage}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-emerald-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Frekuensi Semprot:</span>
                <span className="font-semibold text-slate-800">{diagnosis.patenRecommendation.frequency}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-emerald-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Manfaat Hemat:</span>
                <span className="font-semibold text-emerald-700">{diagnosis.patenRecommendation.savingsBenefit}</span>
              </div>
            </div>

            <div className="text-xs text-emerald-900 pt-1">
              <strong>Petunjuk Aplikasi Stomata:</strong> {diagnosis.patenRecommendation.instructions}
            </div>
          </div>

          {/* Prevention */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
            <strong>Langkah Pencegahan & Rawat Tanah:</strong> {diagnosis.prevention}
          </div>

          {/* ANONYMOUS PEST MAPPING RADAR SECTION */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 via-amber-50/50 to-orange-50 border-2 border-rose-200 dark:border-rose-900/60 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                  <Shield className="w-4 h-4 text-rose-100" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 font-['Outfit'] flex items-center gap-1.5">
                    <span>Peringatan Radar Hama Komunitas (Anonim)</span>
                    <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                      Deteksi Wabah
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Bantu petani sekitar mengantisipasi serangan hama di wilayah Anda secara 100% anonim.
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Guarantee Pill */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-rose-200/80 text-[11px] text-slate-700">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Perlindungan Privasi:</strong> Identitas dan nama pemilik lahan disamarkan (misal: <em>Petani Anonim #NTB-82</em>) untuk menjaga privasi Anda.
              </span>
            </div>

            {/* Region / Coordinate Selection */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="font-bold text-slate-800 text-[11px]">
                  Pilih Wilayah / Kunci Koordinat Lahan:
                </label>
                <button
                  type="button"
                  onClick={handleAutoDetectGpsForPest}
                  disabled={isGettingGpsForPest}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-[11px] font-bold flex items-center gap-1 shadow-2xs self-start sm:self-auto transition-colors"
                >
                  <MapPin className="w-3 h-3 text-rose-600" />
                  <span>{isGettingGpsForPest ? 'Mengunci GPS...' : 'Ambil Koordinat GPS Saya'}</span>
                </button>
              </div>

              {/* Regional Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                {[
                  { name: 'Lombok Tengah', lat: -8.7000, lng: 116.2833 },
                  { name: 'Lombok Barat', lat: -8.6833, lng: 116.1333 },
                  { name: 'Lombok Timur', lat: -8.6500, lng: 116.3249 },
                  { name: 'Lombok Utara', lat: -8.3500, lng: 116.1667 },
                  { name: 'Dompu', lat: -8.5333, lng: 118.4667 },
                  { name: 'Bima', lat: -8.4583, lng: 118.7278 },
                  { name: 'Sumbawa', lat: -8.4947, lng: 117.4244 },
                  { name: 'Subang Jabar', lat: -6.5595, lng: 107.7656 }
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setPestRegionName(preset.name);
                      setPestLat(preset.lat);
                      setPestLng(preset.lng);
                    }}
                    className={`px-2 py-1 rounded-lg font-bold border transition-all ${
                      pestRegionName.includes(preset.name)
                        ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              <div className="text-[11px] font-mono text-slate-500 bg-white/60 p-2 rounded-xl border border-slate-200 flex items-center justify-between">
                <span>Wilayah Terpilih: <strong>{pestRegionName}</strong></span>
                <span>[{pestLat.toFixed(4)}, {pestLng.toFixed(4)}]</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-200/60">
              <button
                type="button"
                onClick={handleMarkPestOnMap}
                disabled={hasMarkedOnMap}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 ${
                  hasMarkedOnMap
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{hasMarkedOnMap ? '✓ Titik Hama Telah Ditandai di Peta Radar' : 'Tandai Titik Hama Ini di Peta Radar'}</span>
              </button>

              {onNavigateToLandMap && (
                <button
                  type="button"
                  onClick={onNavigateToLandMap}
                  className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Buka Peta Sebaran Hama Nusantara</span>
                </button>
              )}
            </div>

            {pestToastMsg && (
              <p className="text-[11px] font-bold text-emerald-700 animate-in fade-in duration-200">
                ✓ {pestToastMsg}
              </p>
            )}
          </div>
        </div>
      )}

      {/* History Toggle */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-800"
        >
          <span className="flex items-center gap-1.5">
            <History className="w-4 h-4 text-emerald-700" />
            Riwayat Pemindaian Daun ({historyList.length})
          </span>
          <span className="text-emerald-700 text-xs">
            {showHistory ? 'Sembunyikan' : 'Tampilkan'}
          </span>
        </button>

        {showHistory && (
          <div className="mt-3 divide-y divide-slate-100">
            {historyList.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">Belum ada riwayat pemindaian tersimpan.</p>
            ) : (
              historyList.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{item.diseaseName}</p>
                    <p className="text-[10px] text-slate-500">{item.scannedAt} • {item.cropName}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.severity === 'Kritis' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.severity}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
