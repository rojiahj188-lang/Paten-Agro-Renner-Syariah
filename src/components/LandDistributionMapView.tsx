import React, { useState, useMemo, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Trash2,
  Navigation,
  Layers,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Building,
  User,
  Sliders,
  Sparkles,
  ExternalLink,
  FileSpreadsheet,
  Shield,
  ShieldAlert,
  X
} from 'lucide-react';
import { LandPlotLocation, CommodityId, SoilCondition, PestOutbreakReport } from '../types';
import { COMMODITIES, formatNumber } from '../utils/calculatorEngine';
import { getLandPlots, addLandPlot, deleteLandPlot, addNotification, getPestOutbreakReports, addPestOutbreakReport } from '../utils/offlineStorage';
import { exportSoilTelemetryToCSV, exportSinglePlotTelemetryToCSV } from '../utils/csvExport';
import { GpsLeafletMap } from './GpsLeafletMap';
import { GarminFinderView } from './GarminFinderView';

interface LandDistributionMapViewProps {
  onSelectPlotForCalculator?: (plot: LandPlotLocation) => void;
}

const REGION_PRESETS = [
  { name: 'Lombok Barat, NTB (Padi Organik Narmada)', lat: -8.6833, lng: 116.1333 },
  { name: 'Lombok Tengah, NTB (Sentra Tembakau Praya)', lat: -8.7000, lng: 116.2833 },
  { name: 'Lombok Utara, NTB (Jagung Lereng Rinjani)', lat: -8.3500, lng: 116.1667 },
  { name: 'Lombok Timur, NTB (Sentra Tembakau Selong)', lat: -8.6500, lng: 116.3249 },
  { name: 'Sumbawa Barat, NTB (Peternakan Kerbau Taliwang)', lat: -8.7333, lng: 116.8500 },
  { name: 'Sumbawa Besar, NTB (Penggemukan Sapi Moyo)', lat: -8.4947, lng: 117.4244 },
  { name: 'Dompu, NTB (Sentra Jagung Nasional Manggelewa)', lat: -8.5333, lng: 118.4667 },
  { name: 'Bima, NTB (Sentra Bawang Merah Super Sape)', lat: -8.4583, lng: 118.7278 },
  { name: 'Sulawesi Selatan (Kantor Pusat Renner Makassar)', lat: -5.1477, lng: 119.4327 },
  { name: 'Subang, Jawa Barat (Lumbung Padi Pantura)', lat: -6.5595, lng: 107.7656 },
  { name: 'Riau, Sumatera (Sentra Kelapa Sawit Kampar)', lat: 0.5071, lng: 101.4478 },
  { name: 'Kutai Kartanegara, Kaltim (Budidaya Gaharu)', lat: -0.5022, lng: 117.1536 },
  { name: 'Sleman / Bantul, DIY (Peternakan Sapi)', lat: -7.8014, lng: 110.3647 },
  { name: 'Banyuwangi, Jawa Timur (Hortikultura & Padi)', lat: -8.2192, lng: 114.3692 }
];

export const LandDistributionMapView: React.FC<LandDistributionMapViewProps> = ({
  onSelectPlotForCalculator
}) => {
  const [plots, setPlots] = useState<LandPlotLocation[]>(() => getLandPlots());
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(plots[0]?.id || null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Pangan' | 'Perkebunan' | 'Peternakan'>('all');
  const [phFilter, setPhFilter] = useState<'all' | 'kritis' | 'masam' | 'ideal'>('all');

  // Display Mode: Garmin Finder, Real GPS Satelit, Real GPS Jalan, or Skematik Indonesia
  const [displayMode, setDisplayMode] = useState<'garmin_finder' | 'gps_satellite' | 'gps_streets' | 'schematic_svg'>('garmin_finder');
  const [isClickToAddActive, setIsClickToAddActive] = useState<boolean>(false);

  // Zoom & Pan state for SVG Map
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Add Plot Form State
  const [formName, setFormName] = useState<string>('');
  const [formFarmer, setFormFarmer] = useState<string>('Petani Mitra Renner');
  const [formCommodity, setFormCommodity] = useState<CommodityId>('padi');
  const [formArea, setFormArea] = useState<number>(20);
  const [formPh, setFormPh] = useState<number>(5.5);
  const [formLat, setFormLat] = useState<number>(-5.1477);
  const [formLng, setFormLng] = useState<number>(119.4327);
  const [formAddress, setFormAddress] = useState<string>('Sulawesi Selatan');
  const [formNotes, setFormNotes] = useState<string>('');
  const [isGettingGps, setIsGettingGps] = useState<boolean>(false);

  // Filtered plots
  const filteredPlots = useMemo(() => {
    return plots.filter((p) => {
      const comm = COMMODITIES[p.commodityId];
      if (categoryFilter !== 'all') {
        if (categoryFilter === 'Peternakan' && comm.category !== 'Peternakan') return false;
        if (categoryFilter === 'Pangan' && comm.category !== 'Pangan') return false;
        if (categoryFilter === 'Perkebunan' && comm.category !== 'Perkebunan' && comm.category !== 'Komoditas Khusus') return false;
      }

      if (phFilter === 'kritis' && p.phValue >= 5.3) return false;
      if (phFilter === 'masam' && (p.phValue < 5.3 || p.phValue >= 6.5)) return false;
      if (phFilter === 'ideal' && p.phValue < 6.5) return false;

      return true;
    });
  }, [plots, categoryFilter, phFilter]);

  // Anonymous Pest Radar State
  const [pestReports, setPestReports] = useState<PestOutbreakReport[]>(() => getPestOutbreakReports());
  const [showPestRadar, setShowPestRadar] = useState<boolean>(true);
  const [selectedPestReport, setSelectedPestReport] = useState<PestOutbreakReport | null>(null);
  const [pestSeverityFilter, setPestSeverityFilter] = useState<'all' | 'Kritis' | 'Sedang' | 'Ringan'>('all');

  const filteredPestReports = useMemo(() => {
    if (!showPestRadar) return [];
    return pestReports.filter((p) => {
      if (pestSeverityFilter !== 'all' && p.severity !== pestSeverityFilter) return false;
      return true;
    });
  }, [pestReports, showPestRadar, pestSeverityFilter]);

  // Sync pest reports on mount
  useEffect(() => {
    setPestReports(getPestOutbreakReports());
  }, []);

  const selectedPlot = useMemo(() => {
    return plots.find((p) => p.id === selectedPlotId) || filteredPlots[0] || null;
  }, [plots, selectedPlotId, filteredPlots]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalPlots = plots.length;
    const totalAre = plots.reduce((acc, p) => p.unit === 'Are' ? acc + p.areaOrPopulation : acc, 0);
    const totalTernak = plots.reduce((acc, p) => p.unit === 'Ekor' ? acc + p.areaOrPopulation : acc, 0);
    const avgPh = totalPlots > 0 ? (plots.reduce((acc, p) => acc + p.phValue, 0) / totalPlots) : 6.0;
    const criticalCount = plots.filter(p => p.phValue < 5.3).length;

    return { totalPlots, totalAre, totalTernak, avgPh, criticalCount };
  }, [plots]);

  // Map coordinate conversion function:
  // Indonesia bounds roughly: Longitude 95°E to 141°E (width 46°), Latitude 6°N to -11°S (height 17°)
  const projectCoordsToMap = (lat: number, lng: number) => {
    const minLng = 95.0;
    const maxLng = 141.0;
    const minLat = -11.0;
    const maxLat = 6.0;

    const mapWidth = 900;
    const mapHeight = 380;

    const x = ((lng - minLng) / (maxLng - minLng)) * (mapWidth - 80) + 40;
    // Invert Y because latitude goes north (positive up), SVG Y goes down
    const y = ((maxLat - lat) / (maxLat - minLat)) * (mapHeight - 80) + 40;

    return {
      x: Math.max(30, Math.min(mapWidth - 30, x)),
      y: Math.max(30, Math.min(mapHeight - 30, y))
    };
  };

  const getPinColor = (p: LandPlotLocation) => {
    const comm = COMMODITIES[p.commodityId];
    if (comm?.category === 'Peternakan') return '#8b5cf6'; // Violet for livestock
    if (p.phValue < 5.3) return '#ef4444'; // Red
    if (p.phValue < 6.0) return '#f97316'; // Orange
    if (p.phValue < 6.5) return '#eab308'; // Yellow
    return '#10b981'; // Emerald
  };

  const handleGetCurrentGps = () => {
    if (!navigator.geolocation) {
      alert('Perangkat Anda tidak mendukung geolokasi GPS.');
      return;
    }

    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormLat(parseFloat(pos.coords.latitude.toFixed(4)));
        setFormLng(parseFloat(pos.coords.longitude.toFixed(4)));
        setFormAddress(`Koordinat GPS Terdeteksi (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`);
        setIsGettingGps(false);
      },
      (err) => {
        setIsGettingGps(false);
        alert('Gagal mengambil koordinat GPS: ' + err.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleAddPlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    let soilCond: SoilCondition = 'ideal';
    if (formPh < 5.3) soilCond = 'sangat_asam';
    else if (formPh < 6.0) soilCond = 'asam';
    else if (formPh < 6.5) soilCond = 'agak_asam';

    const comm = COMMODITIES[formCommodity];
    const newPlot = addLandPlot({
      name: formName,
      farmerName: formFarmer,
      commodityId: formCommodity,
      commodityName: comm.name,
      areaOrPopulation: formArea,
      unit: comm.unitName || 'Are',
      phValue: formPh,
      soilCondition: soilCond,
      coordinates: { lat: formLat, lng: formLng },
      addressName: formAddress,
      notes: formNotes || `Terdaftar di sistem Paten Agro (${formPh < 5.8 ? 'Butuh Paten Gold' : 'Kondisi Baik'})`
    });

    const updatedPlots = getLandPlots();
    setPlots(updatedPlots);
    setSelectedPlotId(newPlot.id);
    setShowAddModal(false);

    // Reset
    setFormName('');
    setFormNotes('');

    addNotification({
      title: '🗺️ Titik Lahan Baru Terdaftar',
      message: `${newPlot.name} (${newPlot.areaOrPopulation} ${newPlot.unit}) berhasil dipetakan di koordinat [${newPlot.coordinates.lat}, ${newPlot.coordinates.lng}].`,
      type: 'jadwal',
      priority: 'normal'
    });
  };

  const handleDeletePlot = (id: string) => {
    if (confirm('Hapus titik lokasi lahan ini dari dasbor peta?')) {
      deleteLandPlot(id);
      const updated = getLandPlots();
      setPlots(updated);
      if (selectedPlotId === id) {
        setSelectedPlotId(updated[0]?.id || null);
      }
    }
  };

  const handleExportAllTelemetryCsv = () => {
    if (filteredPlots.length === 0) {
      alert('Tidak ada data lahan untuk diekspor ke CSV.');
      return;
    }
    exportSoilTelemetryToCSV(filteredPlots);
    addNotification({
      title: '📊 Data Telemetri Tanah Diekspor ke CSV',
      message: `${filteredPlots.length} data telemetri titik lahan berhasil diunduh dalam format CSV untuk diolah secara offline di spreadsheet/Excel.`,
      type: 'jadwal',
      priority: 'normal'
    });
  };

  const handleExportSelectedPlotCsv = () => {
    if (!selectedPlot) return;
    exportSinglePlotTelemetryToCSV(selectedPlot);
    addNotification({
      title: '📊 Telemetri Lahan Diekspor ke CSV',
      message: `Profil telemetri tanah untuk ${selectedPlot.name} berhasil diunduh ke format CSV.`,
      type: 'jadwal',
      priority: 'normal'
    });
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-800 text-white rounded-2xl p-4 sm:p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-xs font-bold mb-2">
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            <span>Pemetaan Geografis Lahan Pertanian & Peternakan</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight">
            Peta Sebaran Lahan Petani Nusantara
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
            Visualisasi titik sebaran lahan binaan Renner Syariah di berbagai wilayah Indonesia dengan indikator warna status keasaman tanah (pH).
          </p>
        </div>
      </div>

      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Titik Lahan:</span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 font-['Outfit'] mt-1">{stats.totalPlots}</p>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">Tersebar di Nusantara</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Akumulasi Luas Lahan:</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-400 font-['Outfit'] mt-1">
            {stats.totalAre} Are
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">({(stats.totalAre / 100).toFixed(1)} Hektar)</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Populasi Ternak Binaan:</span>
          <p className="text-xl sm:text-2xl font-black text-purple-700 dark:text-purple-400 font-['Outfit'] mt-1">
            {stats.totalTernak} Ekor
          </p>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">Sapi, Kambing & Unggas</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Rata-rata pH Tanah:</span>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400 font-['Outfit']">pH {stats.avgPh.toFixed(1)}</p>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">({stats.criticalCount} kritis)</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Butuh intervensi Paten</span>
        </div>
      </div>

      {/* Map Canvas Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        {/* Map Top Bar: Filter, Display Mode & Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          {/* Commodity Category Filter */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
              Kategori:
            </span>
            {[
              { id: 'all' as const, label: 'Semua Lahan' },
              { id: 'Pangan' as const, label: '🌾 Pangan' },
              { id: 'Perkebunan' as const, label: '🌴 Perkebunan' },
              { id: 'Peternakan' as const, label: '🐂 Ternak' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setCategoryFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                  categoryFilter === f.id
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Right Controls: Mode Peta (GPS vs Skematik), Zoom (SVG only), & Tambah Titik */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Map Mode Selector (Garmin Finder, Satelit GPS, Jalan GPS, Skematik RI) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setDisplayMode('garmin_finder')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  displayMode === 'garmin_finder'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Garmin Finder: Kompas Real-time, Navigasi Headings & GPS Sawah/Kebun"
              >
                <span>🧭 Garmin Finder</span>
              </button>
              <button
                onClick={() => setDisplayMode('gps_satellite')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  displayMode === 'gps_satellite'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Peta Citra Satelit Nyata dengan Koordinat GPS Lahan"
              >
                <span>🛰️ Satelit</span>
              </button>
              <button
                onClick={() => setDisplayMode('gps_streets')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  displayMode === 'gps_streets'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Peta Jalan & Topografi OpenStreetMap"
              >
                <span>🗺️ Jalan</span>
              </button>
              <button
                onClick={() => setDisplayMode('schematic_svg')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  displayMode === 'schematic_svg'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Peta Ikhtisar Kepulauan Nusantara (Sesuai Desain Screenshot)"
              >
                <span>🇮🇩 Skematik</span>
              </button>
            </div>

            {/* Click to add toggle on GPS Map */}
            {displayMode !== 'schematic_svg' && (
              <button
                type="button"
                onClick={() => setIsClickToAddActive(prev => !prev)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                  isClickToAddActive
                    ? 'bg-amber-500 text-white border-amber-500 ring-2 ring-amber-300 animate-pulse'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title="Aktifkan mode klik pada peta untuk menentukan koordinat"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isClickToAddActive ? 'Mode Pin Aktif' : 'Klik Peta'}</span>
              </button>
            )}

            {/* SVG Zoom Controls (only shown in schematic mode) */}
            {displayMode === 'schematic_svg' && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5">
                <button
                  onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.2))}
                  className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200"
                  title="Perbesar Peta"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.2))}
                  className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200"
                  title="Perkecil Peta"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }}
                  className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200"
                  title="Reset Posisi Peta"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Export Soil Telemetry to CSV */}
            <button
              type="button"
              onClick={handleExportAllTelemetryCsv}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 shrink-0"
              title="Unduh seluruh data telemetri tanah ke format CSV Spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Ekspor CSV</span>
            </button>

            {/* Add Location Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Titik Lahan</span>
            </button>
          </div>
        </div>

        {/* Quick Location Jump Pills for NTB & Region Sentra */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          <span className="font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap uppercase tracking-wider text-[10px] mr-0.5">
            📍 Lompat Titik NTB:
          </span>
          {[
            { id: 'plot-lombok-barat', label: 'Lombok Barat' },
            { id: 'plot-lombok-tengah', label: 'Lombok Tengah' },
            { id: 'plot-lombok-utara', label: 'Lombok Utara' },
            { id: 'plot-4', label: 'Lombok Timur' },
            { id: 'plot-sumbawa-barat', label: 'Sumbawa Barat' },
            { id: 'plot-sumbawa-besar', label: 'Sumbawa Besar' },
            { id: 'plot-dompu', label: 'Dompu' },
            { id: 'plot-bima', label: 'Bima' },
            { id: 'plot-1', label: 'Sulsel' },
            { id: 'plot-3', label: 'Subang' },
            { id: 'plot-2', label: 'Riau' }
          ].map(quick => {
            const isMatch = selectedPlotId === quick.id;
            return (
              <button
                key={quick.id}
                type="button"
                onClick={() => setSelectedPlotId(quick.id)}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all border ${
                  isMatch
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700'
                }`}
              >
                {quick.label}
              </button>
            );
          })}
        </div>

        {/* RADAR SEBARAN HAMA (ANONIM) SUB-BAR */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-950/20 via-amber-950/20 to-emerald-950/20 dark:from-rose-950/40 dark:via-amber-950/40 dark:to-emerald-950/40 border border-rose-200/80 dark:border-rose-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
              showPestRadar 
                ? 'bg-rose-600 text-white border-rose-500 shadow-sm animate-pulse' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
            }`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Radar Sebaran Hama & Penyakit (Anonim)
                </span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                  {filteredPestReports.length} Titik Aktif
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Pola penyebaran penyakit tanaman sekitar tanpa identitas pribadi untuk perlindungan petani kolektif
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Severity */}
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 text-[11px]">
              {[
                { id: 'all' as const, label: 'Semua' },
                { id: 'Kritis' as const, label: '🚨 Kritis' },
                { id: 'Sedang' as const, label: '⚠️ Sedang' }
              ].map((sev) => (
                <button
                  key={sev.id}
                  type="button"
                  onClick={() => setPestSeverityFilter(sev.id)}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                    pestSeverityFilter === sev.id
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {sev.label}
                </button>
              ))}
            </div>

            {/* Radar Toggle Button */}
            <button
              type="button"
              onClick={() => setShowPestRadar(!showPestRadar)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-2xs ${
                showPestRadar
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 border border-slate-300 dark:border-slate-700'
              }`}
            >
              <span>{showPestRadar ? '✓ Radar Hama Aktif' : 'Aktifkan Radar'}</span>
            </button>
          </div>
        </div>

        {/* MAP DISPLAY AREA */}
        {displayMode === 'garmin_finder' ? (
          /* GARMIN FINDER HUD REALTIME (JELAJAH • TEMUKAN • MANFAATKAN) */
          <GarminFinderView
            isEmbedded={true}
            existingPlots={filteredPlots}
            onSelectPlot={setSelectedPlotId}
            pestOutbreaks={filteredPestReports}
            showPestOutbreaks={showPestRadar}
            onSelectPestOutbreak={(pest) => setSelectedPestReport(pest)}
            onRegisterPlotFromGps={(coords) => {
              setFormLat(parseFloat(coords.lat.toFixed(5)));
              setFormLng(parseFloat(coords.lng.toFixed(5)));
              setFormAddress(`Koordinat Garmin Finder [${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}]`);
              setShowAddModal(true);
            }}
          />
        ) : displayMode !== 'schematic_svg' ? (
          /* REAL GPS MAP LEAFLET (SATELLITE OR STREETS) */
          <GpsLeafletMap
            plots={filteredPlots}
            selectedPlotId={selectedPlotId}
            onSelectPlot={setSelectedPlotId}
            mapType={displayMode === 'gps_satellite' ? 'satellite' : 'streets'}
            pestOutbreaks={filteredPestReports}
            showPestOutbreaks={showPestRadar}
            onSelectPestOutbreak={(pest) => setSelectedPestReport(pest)}
            onMapClick={(coords) => {
              setFormLat(coords.lat);
              setFormLng(coords.lng);
              setFormAddress(`Koordinat Terpilih [${coords.lat}, ${coords.lng}]`);
              setShowAddModal(true);
              setIsClickToAddActive(false);
            }}
            isClickToAddActive={isClickToAddActive}
            onOpenCalculator={onSelectPlotForCalculator}
          />
        ) : (
          /* Visual Vector SVG Map (Sesuai Desain Screenshot) */
          <div className="w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 relative shadow-inner">
            {/* Legend Overlay at Top Left matching Screenshot */}
            <div className="absolute top-3 left-3 z-20 bg-slate-900/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-700/80 text-[10px] text-slate-200 space-y-1 shadow-lg pointer-events-none">
              <span className="font-bold text-white block uppercase tracking-wider text-[9px] text-emerald-400">
                LEGENDA STATUS PH LAHAN:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span>pH &lt; 5.3 (Sangat Masam - Kritis)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                <span>pH 5.3 – 5.9 (Masam - Butuh Paten)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <span>pH 6.0 – 6.4 (Agak Masam)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span>pH 6.5 – 7.0 (Subur / Optimal)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                <span>Peternakan (Sapi, Kambing, Unggas)</span>
              </div>
              {showPestRadar && (
                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-700/80 text-rose-300 font-bold">
                  <span className="w-2.5 h-2.5 rounded-xs bg-rose-600 rotate-45 shrink-0" />
                  <span>Radar Hama Anonim ({filteredPestReports.length} Terdeteksi)</span>
                </div>
              )}
            </div>

            {/* SVG Map Container */}
            <div className="w-full overflow-hidden flex items-center justify-center p-2 min-h-[340px] sm:min-h-[400px]">
              <svg
                viewBox="0 0 900 380"
                className="w-full h-auto transition-transform duration-300"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                  transformOrigin: 'center center'
                }}
              >
                {/* Ocean Background Grid */}
                <defs>
                  <radialGradient id="oceanGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#064e3b" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#022c22" stopOpacity="0.8" />
                  </radialGradient>
                </defs>
                <rect width="900" height="380" fill="url(#oceanGlow)" />
                <path
                  d="M 0 0 L 900 0 M 0 100 L 900 100 M 0 200 L 900 200 M 0 300 L 900 300 M 0 380 L 900 380 M 150 0 L 150 380 M 300 0 L 300 380 M 450 0 L 450 380 M 600 0 L 600 380 M 750 0 L 750 380"
                  stroke="#065f46"
                  strokeWidth="0.5"
                  strokeDasharray="3 3"
                  opacity="0.3"
                />

                {/* Simplified Stylized Archipelago Silhouettes */}
                {/* 1. Sumatera */}
                <path
                  d="M 80 120 Q 140 180 200 240 Q 220 265 240 280 L 220 300 Q 180 280 140 220 Q 90 160 70 130 Z"
                  fill="#047857"
                  opacity="0.45"
                  stroke="#10b981"
                  strokeWidth="1.2"
                />
                <text x="130" y="210" fill="#a7f3d0" fontSize="10" opacity="0.6" fontWeight="bold">SUMATERA</text>

                {/* 2. Jawa */}
                <path
                  d="M 230 305 Q 310 310 390 315 Q 430 320 470 325 L 470 338 Q 380 330 290 325 Q 230 320 225 315 Z"
                  fill="#047857"
                  opacity="0.45"
                  stroke="#10b981"
                  strokeWidth="1.2"
                />
                <text x="320" y="325" fill="#a7f3d0" fontSize="10" opacity="0.6" fontWeight="bold">JAWA</text>

                {/* 3. Kalimantan */}
                <path
                  d="M 290 130 Q 350 110 400 130 Q 430 170 420 230 Q 360 250 300 220 Q 270 170 290 130 Z"
                  fill="#047857"
                  opacity="0.45"
                  stroke="#10b981"
                  strokeWidth="1.2"
                />
                <text x="330" y="180" fill="#a7f3d0" fontSize="10" opacity="0.6" fontWeight="bold">KALIMANTAN</text>

                {/* 4. Sulawesi (Home of Renner Syariah Makassar) */}
                <path
                  d="M 470 140 Q 510 130 520 160 Q 490 180 480 210 Q 520 240 500 280 L 480 280 Q 470 240 450 200 Q 450 160 470 140 Z"
                  fill="#047857"
                  opacity="0.55"
                  stroke="#34d399"
                  strokeWidth="1.5"
                />
                <text x="475" y="210" fill="#6ee7b7" fontSize="10" opacity="0.8" fontWeight="bold">SULAWESI</text>

                {/* 5. Bali & Nusa Tenggara */}
                <path
                  d="M 485 330 L 515 332 L 550 335 L 600 340 L 630 345 L 600 350 L 530 342 L 485 335 Z"
                  fill="#047857"
                  opacity="0.45"
                  stroke="#10b981"
                  strokeWidth="1.2"
                />
                <text x="540" y="355" fill="#a7f3d0" fontSize="9" opacity="0.6" fontWeight="bold">NUSA TENGGARA</text>

                {/* 6. Maluku */}
                <circle cx="610" cy="180" r="16" fill="#047857" opacity="0.4" stroke="#10b981" />
                <circle cx="630" cy="220" r="14" fill="#047857" opacity="0.4" stroke="#10b981" />
                <text x="605" y="195" fill="#a7f3d0" fontSize="9" opacity="0.6">MALUKU</text>

                {/* 7. Papua */}
                <path
                  d="M 690 180 Q 770 160 840 180 L 850 260 Q 780 270 710 250 Q 670 220 690 180 Z"
                  fill="#047857"
                  opacity="0.45"
                  stroke="#10b981"
                  strokeWidth="1.2"
                />
                <text x="750" y="220" fill="#a7f3d0" fontSize="10" opacity="0.6" fontWeight="bold">PAPUA</text>

                {/* Plotted Land Markers */}
                {filteredPlots.map((plot) => {
                  const coords = projectCoordsToMap(plot.coordinates.lat, plot.coordinates.lng);
                  const isSelected = plot.id === selectedPlotId;
                  const pinColor = getPinColor(plot);
                  const comm = COMMODITIES[plot.commodityId];

                  return (
                    <g
                      key={plot.id}
                      className="cursor-pointer transition-transform hover:scale-125"
                      onClick={() => setSelectedPlotId(plot.id)}
                    >
                      {/* Pulsing ring for selected marker */}
                      {isSelected && (
                        <circle
                          cx={coords.x}
                          cy={coords.y}
                          r="18"
                          fill="none"
                          stroke={pinColor}
                          strokeWidth="2"
                          className="animate-ping opacity-75"
                        />
                      )}

                      {/* Outer glow ring */}
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r={isSelected ? "14" : "10"}
                        fill={pinColor}
                        opacity={isSelected ? "0.4" : "0.25"}
                      />

                      {/* Main Pin Body */}
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r={isSelected ? "9" : "7"}
                        fill={pinColor}
                        stroke="#ffffff"
                        strokeWidth={isSelected ? "2.5" : "1.8"}
                        className="shadow-md"
                      />

                      {/* Mini Center Dot */}
                      <circle cx={coords.x} cy={coords.y} r="2" fill="#ffffff" />

                      {/* Pin Label Tag */}
                      <g transform={`translate(${coords.x + 12}, ${coords.y - 10})`}>
                        <rect
                          width={plot.name.length * 6.5 + 24}
                          height="18"
                          rx="5"
                          fill="#0f172a"
                          opacity={isSelected ? "0.95" : "0.75"}
                          stroke={isSelected ? pinColor : "#334155"}
                          strokeWidth={isSelected ? "1.5" : "0.8"}
                        />
                        <text x="5" y="12" fill="#ffffff" fontSize="9" fontWeight="bold">
                          {comm?.icon} {plot.name.split('(')[0].trim().slice(0, 18)}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Anonymous Pest Outbreak Pins on Schematic SVG Map */}
                {showPestRadar && filteredPestReports.map((pest) => {
                  const coords = projectCoordsToMap(pest.coordinates.lat, pest.coordinates.lng);
                  const isCrit = pest.severity === 'Kritis';
                  const hazardColor = isCrit ? '#ef4444' : '#f59e0b';
                  return (
                    <g
                      key={pest.id}
                      className="cursor-pointer transition-transform hover:scale-125"
                      onClick={() => setSelectedPestReport(pest)}
                    >
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r="14"
                        fill="none"
                        stroke={hazardColor}
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                        opacity="0.8"
                      />
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r="9"
                        fill={hazardColor}
                        opacity="0.25"
                      />
                      <polygon
                        points={`${coords.x},${coords.y - 10} ${coords.x + 8},${coords.y + 6} ${coords.x - 8},${coords.y + 6}`}
                        fill={hazardColor}
                        stroke="#ffffff"
                        strokeWidth="1.2"
                      />
                      <text
                        x={coords.x}
                        y={coords.y + 3}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="8"
                        fontWeight="black"
                      >
                        !
                      </text>
                      {/* Pest Tag */}
                      <g transform={`translate(${coords.x + 10}, ${coords.y - 14})`}>
                        <rect
                          width={pest.diseaseName.slice(0, 16).length * 6 + 26}
                          height="16"
                          rx="4"
                          fill="#7f1d1d"
                          stroke={hazardColor}
                          strokeWidth="1"
                          opacity="0.95"
                        />
                        <text x="5" y="11" fill="#ffffff" fontSize="8" fontWeight="bold">
                          ⚠️ {pest.cropName}: {pest.diseaseName.slice(0, 14)}..
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* Selected Plot Info Card Overlay */}
        {selectedPlot && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-xs text-white"
                  style={{ backgroundColor: getPinColor(selectedPlot) }}
                >
                  {COMMODITIES[selectedPlot.commodityId]?.icon || '🌱'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit']">
                      {selectedPlot.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                      {COMMODITIES[selectedPlot.commodityId]?.category || 'Pertanian'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Petani: <strong className="text-slate-700 dark:text-slate-200">{selectedPlot.farmerName}</strong> • {selectedPlot.addressName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-2xs"
                  style={{ backgroundColor: getPinColor(selectedPlot) }}
                >
                  pH {selectedPlot.phValue.toFixed(1)} • {selectedPlot.soilCondition.replace('_', ' ').toUpperCase()}
                </span>
                <button
                  onClick={() => handleDeletePlot(selectedPlot.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700"
                  title="Hapus titik lahan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Plot Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Luas / Populasi:</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mt-0.5 block">
                  {selectedPlot.areaOrPopulation} {selectedPlot.unit}
                </span>
              </div>

              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Koordinat GPS:</span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                  [{selectedPlot.coordinates.lat}, {selectedPlot.coordinates.lng}]
                </span>
              </div>

              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Rekomendasi Paten:</span>
                <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400 mt-0.5 block truncate">
                  {selectedPlot.phValue < 5.8 ? 'Paten Gold + Imun' : 'Paten Hijau / Gold'}
                </span>
              </div>

              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Terdaftar Pada:</span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5 block">
                  {selectedPlot.registeredDate}
                </span>
              </div>
            </div>

            {selectedPlot.notes && (
              <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <strong className="text-slate-800 dark:text-slate-200">Catatan Kondisi Lapangan:</strong> {selectedPlot.notes}
              </p>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/50 dark:border-slate-700 mt-2">
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedPlot.coordinates.lat},${selectedPlot.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="Buka titik koordinat GPS di aplikasi Google Maps"
                >
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Navigasi Google Maps (GPS)</span>
                </a>

                <button
                  type="button"
                  onClick={handleExportSelectedPlotCsv}
                  className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="Unduh data telemetri tanah lahan ini ke format CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Ekspor CSV Lahan Ini</span>
                </button>
              </div>

              {onSelectPlotForCalculator && (
                <button
                  onClick={() => onSelectPlotForCalculator(selectedPlot)}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>Buka Simulasi Lahan Ini</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Plot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit']">
                  Tambah Titik Lokasi Lahan Petani
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Daftarkan lokasi lahan baru untuk dipetakan pada dasbor sebaran
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPlotSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lahan / Blok</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Lahan Padi Sawah Blok Barat"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Petani / Mitra</label>
                  <input
                    type="text"
                    required
                    value={formFarmer}
                    onChange={(e) => setFormFarmer(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Komoditi</label>
                  <select
                    value={formCommodity}
                    onChange={(e) => setFormCommodity(e.target.value as CommodityId)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-800 dark:text-slate-100"
                  >
                    {Object.values(COMMODITIES).map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Luas ({COMMODITIES[formCommodity]?.unitName || 'Are'})
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formArea}
                    onChange={(e) => setFormArea(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nilai pH Tanah</label>
                  <input
                    type="number"
                    step={0.1}
                    min={3.5}
                    max={9.0}
                    value={formPh}
                    onChange={(e) => setFormPh(parseFloat(e.target.value) || 6.0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Coordinates Section with GPS and Presets */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    Koordinat Geografis (GPS)
                  </span>

                  <button
                    type="button"
                    onClick={handleGetCurrentGps}
                    disabled={isGettingGps}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold hover:bg-emerald-100 flex items-center gap-1"
                  >
                    <Compass className="w-3 h-3" />
                    <span>{isGettingGps ? 'Mencari...' : 'Ambil GPS HP'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Latitude (Lintang):</label>
                    <input
                      type="number"
                      step={0.0001}
                      value={formLat}
                      onChange={(e) => setFormLat(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Longitude (Bujur):</label>
                    <input
                      type="number"
                      step={0.0001}
                      value={formLng}
                      onChange={(e) => setFormLng(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Region Presets Dropdown */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                    Atau Pilih Preset Wilayah Nusantara:
                  </label>
                  <select
                    onChange={(e) => {
                      const idx = parseInt(e.target.value);
                      if (!isNaN(idx) && REGION_PRESETS[idx]) {
                        setFormLat(REGION_PRESETS[idx].lat);
                        setFormLng(REGION_PRESETS[idx].lng);
                        setFormAddress(REGION_PRESETS[idx].name);
                      }
                    }}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200"
                  >
                    <option value="">-- Pilih Wilayah Pertanian --</option>
                    {REGION_PRESETS.map((r, idx) => (
                      <option key={idx} value={idx}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat / Keterangan Wilayah</label>
                <input
                  type="text"
                  placeholder="Contoh: Panakukang, Makassar / Subang / Riau"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan Evaluasi Lahan</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Pernah kena jamur patek, tanah liat keras butuh pembenah Paten Gold"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 shadow-sm transition-colors"
                >
                  Simpan Titik Lahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Detail Laporan Hama Anonim */}
      {selectedPestReport && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-xs text-white ${
                  selectedPestReport.severity === 'Kritis' ? 'bg-rose-600' : 'bg-amber-500'
                }`}>
                  ⚠️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                      selectedPestReport.severity === 'Kritis'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    }`}>
                      Tingkat: {selectedPestReport.severity}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      Akurasi AI {selectedPestReport.confidence}%
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 font-['Outfit'] mt-0.5">
                    {selectedPestReport.diseaseName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Menyerang Komoditas: <strong className="text-emerald-700 dark:text-emerald-400">{selectedPestReport.cropName}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPestReport(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Anonimity & Location Notice */}
            <div className="bg-slate-50 dark:bg-slate-800/70 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  Pelapor Anonim:
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  {selectedPestReport.anonymousReporter}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  Wilayah Terpantau:
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {selectedPestReport.regionName}
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 text-right">
                [{selectedPestReport.coordinates.lat.toFixed(4)}, {selectedPestReport.coordinates.lng.toFixed(4)}] • Dilaporkan {selectedPestReport.reportedAt}
              </div>
            </div>

            {/* Gejala Serangan */}
            {selectedPestReport.symptoms && selectedPestReport.symptoms.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Gejala Serangan di Lapangan:
                </span>
                <ul className="space-y-1 bg-amber-50/60 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/80 dark:border-amber-900/40 text-xs text-slate-700 dark:text-slate-300">
                  {selectedPestReport.symptoms.map((symptom, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rekomendasi Solusi Paten Organik */}
            {selectedPestReport.patenRecommendation && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Protokol Pengendalian Paten Organik
                  </span>
                  <div className="flex gap-1">
                    {selectedPestReport.patenRecommendation.products.map((p, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-700 text-white">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Dosis Aplikasi:</strong> {selectedPestReport.patenRecommendation.dosage}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
                  {selectedPestReport.patenRecommendation.instructions}
                </p>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedPestReport.coordinates.lat},${selectedPestReport.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Buka Google Maps</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedPestReport(null)}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs"
              >
                Tutup Informasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
