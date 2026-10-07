import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Compass,
  Satellite,
  Navigation,
  MapPin,
  RotateCw,
  Layers,
  Plus,
  Maximize2,
  Minimize2,
  Crosshair,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { LandPlotLocation, PestOutbreakReport } from '../types';

interface GarminFinderViewProps {
  onRegisterPlotFromGps?: (coords: { lat: number; lng: number; accuracy: number }) => void;
  existingPlots?: LandPlotLocation[];
  onSelectPlot?: (plotId: string) => void;
  isEmbedded?: boolean;
  pestOutbreaks?: PestOutbreakReport[];
  showPestOutbreaks?: boolean;
  onSelectPestOutbreak?: (pest: PestOutbreakReport) => void;
}

export const GarminFinderView: React.FC<GarminFinderViewProps> = ({
  onRegisterPlotFromGps,
  existingPlots = [],
  onSelectPlot,
  isEmbedded = false,
  pestOutbreaks = [],
  showPestOutbreaks = true,
  onSelectPestOutbreak
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const plotsLayerRef = useRef<L.LayerGroup | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // GPS State
  const [gpsStatus, setGpsStatus] = useState<'searching' | 'active' | 'error'>('searching');
  const [gpsErrorMessage, setGpsErrorMessage] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  const [altitude, setAltitude] = useState<number | null>(null);

  // Map settings
  const [mapLayer, setMapLayer] = useState<'osm' | 'satellite'>('osm');
  const [tileLayerRef, setTileLayerRef] = useState<L.TileLayer | null>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [hasFirstFixed, setHasFirstFixed] = useState<boolean>(false);
  const [savedSuccessToast, setSavedSuccessToast] = useState<string | null>(null);

  // Initialize Map: Default Lombok, NTB [-8.7118, 116.1554], zoom 10
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Safeguard: remove any existing Leaflet map on this container to prevent "Map container is already initialized"
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        console.warn('Leaflet cleanup warning:', e);
      }
      mapInstanceRef.current = null;
    }

    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    // Create map without default zoomControl
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([-8.7118, 116.1554], 10);

    // Custom attribution as requested: '© OpenStreetMap | By Bang Husni'
    L.control.attribution({ position: 'bottomleft', prefix: false })
      .addAttribution('&copy; OpenStreetMap | By Bang Husni')
      .addTo(map);

    // Add zoom control at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial tile layer (OpenStreetMap)
    const initialTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap | By Bang Husni'
    }).addTo(map);
    setTileLayerRef(initialTile);

    // Layer group for existing plots
    const plotsGroup = L.layerGroup().addTo(map);
    plotsLayerRef.current = plotsGroup;

    mapInstanceRef.current = map;

    // Invalidate map size after DOM mount and container layout settle
    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 450);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
      try {
        map.remove();
      } catch (e) {
        console.warn('Leaflet unmount warning:', e);
      }
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef) {
      map.removeLayer(tileLayerRef);
    }

    let newTile: L.TileLayer;
    if (mapLayer === 'satellite') {
      newTile = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Esri World Imagery | By Bang Husni'
        }
      );
    } else {
      newTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap | By Bang Husni'
      });
    }

    newTile.addTo(map);
    setTileLayerRef(newTile);
  }, [mapLayer]);

  // Render existing plots on the Garmin Map
  useEffect(() => {
    const plotsGroup = plotsLayerRef.current;
    if (!plotsGroup) return;

    plotsGroup.clearLayers();

    existingPlots.forEach(plot => {
      const pinColor = plot.phValue < 5.3 ? '#ef4444' : plot.phValue < 6.0 ? '#f97316' : plot.phValue < 6.5 ? '#eab308' : '#10b981';
      
      const customPlotIcon = L.divIcon({
        className: 'garmin-plot-icon',
        html: `
          <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="background: ${pinColor}; border: 2px solid white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.4); font-size: 11px;">
              🌱
            </div>
            <div style="width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 6px solid ${pinColor}; margin-top: -1px;"></div>
            <div style="background: rgba(15,23,42,0.85); color: white; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: bold; white-space: nowrap; margin-top: 1px;">
              ${plot.name.slice(0, 14)}
            </div>
          </div>
        `,
        iconSize: [30, 40],
        iconAnchor: [15, 40]
      });

      const marker = L.marker([plot.coordinates.lat, plot.coordinates.lng], { icon: customPlotIcon });
      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; padding: 2px;">
          <strong style="color: #047857; font-size: 13px;">${plot.name}</strong><br/>
          <span style="color: #64748b;">${plot.farmerName} • pH ${plot.phValue.toFixed(1)}</span><br/>
          <span style="font-family: monospace; font-size: 10px; color: #475569;">[${plot.coordinates.lat.toFixed(4)}, ${plot.coordinates.lng.toFixed(4)}]</span>
        </div>
      `);
      if (onSelectPlot) {
        marker.on('click', () => onSelectPlot(plot.id));
      }
      marker.addTo(plotsGroup);
    });

    // Render Anonymous Pest Outbreak Hazard Markers on Garmin map
    if (showPestOutbreaks && pestOutbreaks.length > 0) {
      pestOutbreaks.forEach((pest) => {
        const pestColor = pest.severity === 'Kritis' ? '#ef4444' : pest.severity === 'Sedang' ? '#f97316' : '#eab308';
        const customPestIcon = L.divIcon({
          className: 'garmin-pest-icon',
          html: `
            <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; cursor: pointer;">
              <div style="position: absolute; top: -4px; width: 34px; height: 34px; border-radius: 50%; border: 2px solid ${pestColor}; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.85;"></div>
              <div style="background: ${pestColor}; border: 2px solid white; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.5); font-size: 13px;">
                ⚠️
              </div>
              <div style="width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 6px solid ${pestColor}; margin-top: -1px;"></div>
              <div style="background: rgba(15,23,42,0.92); color: #fee2e2; border: 1px solid ${pestColor}; padding: 1px 5px; border-radius: 4px; font-size: 9px; font-weight: 800; white-space: nowrap; margin-top: 1px;">
                RADAR: ${pest.diseaseName.slice(0, 13)}
              </div>
            </div>
          `,
          iconSize: [34, 44],
          iconAnchor: [17, 44]
        });

        const marker = L.marker([pest.coordinates.lat, pest.coordinates.lng], { icon: customPestIcon });
        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; padding: 2px;">
            <div style="color: #dc2626; font-size: 9px; font-weight: 800; margin-bottom: 2px;">🚨 RADAR HAMA (${pest.severity.toUpperCase()})</div>
            <strong style="color: #0f172a; font-size: 13px;">${pest.diseaseName}</strong><br/>
            <span style="color: #64748b;">Komoditi: ${pest.cropName} • ${pest.regionName}</span><br/>
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 4px; border-radius: 4px; margin-top: 4px; font-size: 10px; color: #065f46;">
              <strong>Resep Paten:</strong> ${pest.patenRecommendation.products.join(' + ')} (${pest.patenRecommendation.dosage})
            </div>
            <span style="font-size: 9px; color: #94a3b8; display: block; margin-top: 4px;">Dilaporkan: ${pest.anonymousReporter} (${pest.reportedAt})</span>
          </div>
        `);
        if (onSelectPestOutbreak) {
          marker.on('click', () => onSelectPestOutbreak(pest));
        }
        marker.addTo(plotsGroup);
      });
    }
  }, [existingPlots, onSelectPlot, pestOutbreaks, showPestOutbreaks]);

  // Read GPS with navigator.geolocation.watchPosition
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('error');
      setGpsErrorMessage('Browser perangkat Anda tidak mendukung fitur GPS.');
      return;
    }

    setGpsStatus('searching');

    const handleSuccess = (position: GeolocationPosition) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const acc = position.coords.accuracy;
      const spd = position.coords.speed;
      const alt = position.coords.altitude;

      setLatitude(lat);
      setLongitude(lng);
      setAccuracy(acc);
      if (spd !== null) setSpeed(spd);
      if (alt !== null) setAltitude(alt);
      setGpsStatus('active');
      setGpsErrorMessage(null);

      const map = mapInstanceRef.current;
      if (!map) return;

      // Update or create user marker & accuracy circle
      if (!userMarkerRef.current) {
        // Create custom Garmin Navigator icon
        const garminIcon = L.divIcon({
          className: 'garmin-user-marker',
          html: `
            <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(16, 185, 129, 0.35); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 18px; height: 18px; border-radius: 50%; background: #10b981; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.5); z-index: 2;"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([lat, lng], { icon: garminIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; text-align: center;">
            <strong style="color: #059669;">📍 Posisi GPS Anda (Garmin Finder)</strong><br/>
            Lat: ${lat.toFixed(6)}<br/>
            Lng: ${lng.toFixed(6)}<br/>
            Akurasi: ±${Math.round(acc)} m
          </div>
        `);
        userMarkerRef.current = marker;

        const circle = L.circle([lat, lng], {
          radius: acc,
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.2,
          weight: 1.5
        }).addTo(map);
        accuracyCircleRef.current = circle;

        // Zoom in when first position is acquired
        if (!hasFirstFixed) {
          map.setView([lat, lng], 16, { animate: true });
          setHasFirstFixed(true);
        }
      } else {
        userMarkerRef.current.setLatLng([lat, lng]);
        if (accuracyCircleRef.current) {
          accuracyCircleRef.current.setLatLng([lat, lng]);
          accuracyCircleRef.current.setRadius(acc);
        }
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      setGpsStatus('error');
      setGpsErrorMessage(error.message);
      console.warn('GPS Error:', error.message);
    };

    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000
      }
    );
    watchIdRef.current = watchId;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [hasFirstFixed]);

  // Read Compass (Device Orientation)
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let currentHeading: number | null = null;

      // iOS Safari (webkitCompassHeading)
      if ((event as any).webkitCompassHeading !== undefined && (event as any).webkitCompassHeading !== null) {
        currentHeading = (event as any).webkitCompassHeading;
      } else if (event.alpha !== null && event.alpha !== undefined) {
        // Android Chrome
        currentHeading = (360 - event.alpha) % 360;
      }

      if (currentHeading !== null && !isNaN(currentHeading)) {
        setHeading(Math.round(currentHeading));
      }
    };

    window.addEventListener('deviceorientationabsolute', handleOrientation as any, true);
    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation as any, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  // Request Compass Permission for iOS 13+
  const requestCompassPermission = async () => {
    if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          alert('Sensor Kompas berhasil diaktifkan!');
        } else {
          alert('Izin sensor kompas ditolak oleh perangkat.');
        }
      } catch (err: any) {
        alert('Gagal mengaktifkan kompas: ' + err.message);
      }
    } else {
      alert('Sensor orientasi kompas sudah aktif di browser Anda.');
    }
  };

  // Center on user position
  const handleRecenterUser = () => {
    const map = mapInstanceRef.current;
    if (map && latitude !== null && longitude !== null) {
      map.setView([latitude, longitude], 17, { animate: true });
    } else if (map) {
      // Default center Lombok, NTB
      map.setView([-8.7118, 116.1554], 14, { animate: true });
      activateSimulatedGps();
    }
  };

  // Quick fallback GPS simulation (useful when browser denies GPS or in iframe)
  const activateSimulatedGps = (customLat = -8.7118, customLng = 116.1554) => {
    setLatitude(customLat);
    setLongitude(customLng);
    setAccuracy(6);
    setHeading(prev => (prev !== null ? (prev + 45) % 360 : 75));
    setGpsStatus('active');
    setGpsErrorMessage(null);

    const map = mapInstanceRef.current;
    if (!map) return;

    if (!userMarkerRef.current) {
      const garminIcon = L.divIcon({
        className: 'garmin-user-marker',
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(16, 185, 129, 0.35); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 18px; height: 18px; border-radius: 50%; background: #10b981; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.5); z-index: 2;"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([customLat, customLng], { icon: garminIcon }).addTo(map);
      userMarkerRef.current = marker;

      const circle = L.circle([customLat, customLng], {
        radius: 15,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.2,
        weight: 1.5
      }).addTo(map);
      accuracyCircleRef.current = circle;
    } else {
      userMarkerRef.current.setLatLng([customLat, customLng]);
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng([customLat, customLng]);
        accuracyCircleRef.current.setRadius(15);
      }
    }

    map.setView([customLat, customLng], 16, { animate: true });
  };

  // Register current Garmin GPS coords to Farmer Land Plots
  const handleSaveAsLandPlot = () => {
    if (latitude === null || longitude === null) {
      alert('Tunggu hingga koordinat GPS berhasil dikunci (Status ACTIVE).');
      return;
    }

    if (onRegisterPlotFromGps) {
      onRegisterPlotFromGps({
        lat: latitude,
        lng: longitude,
        accuracy: accuracy || 10
      });
      setSavedSuccessToast(`Koordinat GPS [${latitude.toFixed(5)}, ${longitude.toFixed(5)}] siap didaftarkan!`);
      setTimeout(() => setSavedSuccessToast(null), 3500);
    }
  };

  return (
    <div className={`relative w-full overflow-hidden transition-all duration-300 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-xl ${
      isFullScreen ? 'fixed inset-0 z-50 rounded-none' : isEmbedded ? 'h-[520px] sm:h-[600px]' : 'h-[620px] sm:h-[700px]'
    }`}>
      {/* Area Peta Utama */}
      <div ref={mapContainerRef} className="w-full h-full bg-slate-900 z-0" />

      {/* Top Dashboard (Matching User Brief) */}
      <div className="glass-panel absolute top-4 left-4 right-4 p-3.5 sm:p-4 z-[1000] flex justify-between items-center shadow-lg transition-all">
        <div>
          <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2 emerald-text tracking-tight font-['Outfit']">
            <Compass className="w-5 h-5 text-emerald-600 animate-spin-slow" />
            <span>GARMIN FINDER</span>
          </h1>
          <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 font-semibold tracking-wider">
            JELAJAH • TEMUKAN • MANFAATKAN
          </p>
        </div>

        {/* GPS Status Indicator */}
        <div className="flex items-center gap-2">
          {gpsStatus === 'searching' && (
            <button
              type="button"
              onClick={() => activateSimulatedGps()}
              id="gps-status"
              className="text-xs font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-950/80 hover:bg-yellow-200 px-2.5 py-1.5 rounded-full border border-yellow-300 dark:border-yellow-800 shadow-2xs transition-all cursor-pointer"
              title="Sedang mencari GPS... Klik untuk gunakan simulasi koordinat Lombok NTB"
            >
              <Satellite className="w-3.5 h-3.5 animate-pulse text-yellow-600" />
              <span>🟡 SEARCHING</span>
            </button>
          )}

          {gpsStatus === 'active' && (
            <button
              type="button"
              onClick={handleRecenterUser}
              id="gps-status"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 px-2.5 py-1.5 rounded-full border border-emerald-300 dark:border-emerald-800 shadow-2xs transition-all cursor-pointer"
              title="GPS Terkunci Aktif. Klik untuk pusatkan posisi"
            >
              <Satellite className="w-3.5 h-3.5 text-emerald-600" />
              <span>🟢 ACTIVE</span>
            </button>
          )}

          {gpsStatus === 'error' && (
            <button
              type="button"
              onClick={() => activateSimulatedGps()}
              id="gps-status"
              className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5 bg-red-100 dark:bg-red-950/80 hover:bg-red-200 px-2.5 py-1.5 rounded-full border border-red-300 dark:border-red-800 shadow-2xs transition-all cursor-pointer"
              title="Sensor GPS belum terbaca. Klik di sini untuk aktifkan simulasi GPS Lombok NTB"
            >
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              <span>🔴 ERROR (Klik Simulasi)</span>
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullScreen(prev => !prev)}
            className="p-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-xs transition-all"
            title={isFullScreen ? 'Keluar Layar Penuh' : 'Layar Penuh Garmin'}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Floating Action Controls on Right Side */}
      <div className="absolute top-24 right-4 z-[1000] flex flex-col gap-2">
        {/* Recenter My GPS */}
        <button
          type="button"
          onClick={handleRecenterUser}
          className="p-2.5 bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95"
          title="Kunci Posisi Saya"
        >
          <Crosshair className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Kunci GPS</span>
        </button>

        {/* Map Layer Toggle (OSM vs Satellite) */}
        <button
          type="button"
          onClick={() => setMapLayer(prev => prev === 'osm' ? 'satellite' : 'osm')}
          className="p-2.5 bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95"
          title="Ganti Mode Peta"
        >
          <Layers className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          <span className="hidden sm:inline">{mapLayer === 'osm' ? 'Satelit' : 'Jalan'}</span>
        </button>

        {/* Request Compass Permission / Calibrate */}
        <button
          type="button"
          onClick={requestCompassPermission}
          className="p-2.5 bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95"
          title="Kalibrasi Sensor Kompas"
        >
          <RotateCw className="w-4 h-4 text-amber-500" />
          <span className="hidden sm:inline">Kompas</span>
        </button>
      </div>

      {/* Floating Center Compass Needle HUD (When heading is available) */}
      {heading !== null && (
        <div className="absolute top-24 left-4 z-[1000] bg-slate-900/80 backdrop-blur-md text-white px-3 py-2 rounded-2xl border border-slate-700 flex items-center gap-2 shadow-lg">
          <div
            className="w-7 h-7 rounded-full border-2 border-emerald-400 flex items-center justify-center transition-transform duration-200"
            style={{ transform: `rotate(${heading}deg)` }}
          >
            <Navigation className="w-4 h-4 text-rose-500 fill-rose-500" />
          </div>
          <div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Arah Hadap</div>
            <div className="text-xs font-extrabold text-emerald-400 font-mono">{heading}°</div>
          </div>
        </div>
      )}

      {/* Floating Pest Outbreak Radar Alert Badge */}
      {showPestOutbreaks && pestOutbreaks.length > 0 && (
        <div className="absolute top-36 sm:top-24 sm:left-44 left-4 z-[1000] bg-rose-950/90 backdrop-blur-md text-white px-3 py-1.5 rounded-2xl border border-rose-500/60 flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
          <div className="text-[10px]">
            <span className="font-extrabold text-rose-300">RADAR HAMA: </span>
            <span className="font-bold text-white">{pestOutbreaks.length} Titik Sekitar</span>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {savedSuccessToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1001] bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl border border-emerald-400 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{savedSuccessToast}</span>
        </div>
      )}

      {/* Action Bar Above Bottom Panel */}
      {onRegisterPlotFromGps && (
        <div className="absolute bottom-36 sm:bottom-28 left-4 right-4 z-[1000] flex justify-end">
          <button
            type="button"
            onClick={handleSaveAsLandPlot}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 border border-emerald-400/40 backdrop-blur-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Tandai Titik Lahan Petani dari GPS Garmin</span>
          </button>
        </div>
      )}

      {/* Bottom Info Panel (Matching User Brief) */}
      <div className="glass-panel absolute bottom-4 sm:bottom-6 left-4 right-4 p-3.5 sm:p-4 z-[1000] grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm shadow-xl">
        <div className="border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-slate-700 pb-2 sm:pb-0 sm:pr-3">
          <p className="text-gray-400 dark:text-gray-400 text-[10px] font-bold tracking-wider">LATITUDE</p>
          <p id="lat-display" className="font-extrabold text-gray-800 dark:text-gray-100 font-mono text-sm sm:text-base">
            {latitude !== null ? latitude.toFixed(6) : '-'}
          </p>
        </div>

        <div className="border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-slate-700 pb-2 sm:pb-0 sm:pr-3">
          <p className="text-gray-400 dark:text-gray-400 text-[10px] font-bold tracking-wider">LONGITUDE</p>
          <p id="lng-display" className="font-extrabold text-gray-800 dark:text-gray-100 font-mono text-sm sm:text-base">
            {longitude !== null ? longitude.toFixed(6) : '-'}
          </p>
        </div>

        <div className="sm:border-r border-gray-200 dark:border-slate-700 sm:pr-3">
          <p className="text-gray-400 dark:text-gray-400 text-[10px] font-bold tracking-wider">HEADING (COMPASS)</p>
          <p id="heading-display" className="font-extrabold text-emerald-700 dark:text-emerald-400 font-mono text-sm sm:text-base flex items-center gap-1">
            {heading !== null ? `${heading}°` : 'Sensor N/A'}
          </p>
        </div>

        <div>
          <p className="text-gray-400 dark:text-gray-400 text-[10px] font-bold tracking-wider">ACCURACY</p>
          <p id="acc-display" className="font-extrabold text-gray-800 dark:text-gray-100 font-mono text-sm sm:text-base">
            {accuracy !== null ? `±${Math.round(accuracy)} m` : '-'}
          </p>
        </div>
      </div>
    </div>
  );
};
