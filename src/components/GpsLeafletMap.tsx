import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LandPlotLocation, PestOutbreakReport } from '../types';
import { COMMODITIES, formatNumber } from '../utils/calculatorEngine';
import { Navigation, Compass, Layers, ExternalLink, MapPin } from 'lucide-react';

interface GpsLeafletMapProps {
  plots: LandPlotLocation[];
  selectedPlotId: string | null;
  onSelectPlot: (plotId: string) => void;
  mapType: 'satellite' | 'streets';
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  isClickToAddActive?: boolean;
  onOpenCalculator?: (plot: LandPlotLocation) => void;
  // Anonymous Pest Outbreak Layer
  pestOutbreaks?: PestOutbreakReport[];
  showPestOutbreaks?: boolean;
  onSelectPestOutbreak?: (pest: PestOutbreakReport) => void;
}

export const GpsLeafletMap: React.FC<GpsLeafletMapProps> = ({
  plots,
  selectedPlotId,
  onSelectPlot,
  mapType,
  onMapClick,
  isClickToAddActive,
  onOpenCalculator,
  pestOutbreaks = [],
  showPestOutbreaks = true,
  onSelectPestOutbreak
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userLocationMarkerRef = useRef<L.CircleMarker | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const getPinColor = (p: LandPlotLocation) => {
    const comm = COMMODITIES[p.commodityId];
    if (comm?.category === 'Peternakan') return '#8b5cf6'; // Violet for livestock
    if (p.phValue < 5.3) return '#ef4444'; // Red
    if (p.phValue < 6.0) return '#f97316'; // Orange
    if (p.phValue < 6.5) return '#eab308'; // Yellow
    return '#10b981'; // Emerald
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default center Indonesia
    const map = L.map(mapContainerRef.current, {
      center: [-2.5, 118.0],
      zoom: 5,
      zoomControl: false,
      attributionControl: false
    });

    // Custom Zoom control at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Attribution
    L.control.attribution({ position: 'bottomleft', prefix: false })
      .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OSM</a> / Esri')
      .addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Click handler on map
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick({
          lat: parseFloat(e.latlng.lat.toFixed(5)),
          lng: parseFloat(e.latlng.lng.toFixed(5))
        });
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when mapType changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (mapType === 'satellite') {
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Esri World Imagery'
        }
      );
      satLayer.addTo(map);
      tileLayerRef.current = satLayer;
    } else {
      const osmLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap'
        }
      );
      osmLayer.addTo(map);
      tileLayerRef.current = osmLayer;
    }
  }, [mapType]);

  // Render plot markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    const bounds = L.latLngBounds([]);

    plots.forEach((plot) => {
      const isSelected = plot.id === selectedPlotId;
      const pinColor = getPinColor(plot);
      const comm = COMMODITIES[plot.commodityId];
      const iconEmoji = comm?.icon || '🌱';

      // Custom HTML Marker using L.divIcon
      const markerHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
          ${isSelected ? `
            <div style="position: absolute; top: -6px; width: 44px; height: 44px; border-radius: 50%; border: 3px solid ${pinColor}; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.75;"></div>
          ` : ''}
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? '36px' : '30px'};
            height: ${isSelected ? '36px' : '30px'};
            border-radius: 50%;
            background-color: ${pinColor};
            border: 3px solid #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            font-size: ${isSelected ? '18px' : '14px'};
            color: #ffffff;
            transition: all 0.2s ease;
          ">
            ${iconEmoji}
          </div>
          <div style="
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 8px solid ${pinColor};
            margin-top: -1px;
          "></div>
          <div style="
            margin-top: 2px;
            background-color: rgba(15, 23, 42, 0.92);
            backdrop-filter: blur(4px);
            border: 1px solid ${isSelected ? pinColor : 'rgba(255, 255, 255, 0.2)'};
            border-radius: 6px;
            padding: 2px 6px;
            white-space: nowrap;
            color: #ffffff;
            font-size: 10px;
            font-weight: 700;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">
            ${plot.name.slice(0, 16)}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-gps-marker',
        html: markerHtml,
        iconSize: [40, 50],
        iconAnchor: [20, 50]
      });

      const marker = L.marker([plot.coordinates.lat, plot.coordinates.lng], {
        icon: customIcon
      });

      // Marker click
      marker.on('click', () => {
        onSelectPlot(plot.id);
      });

      // Popup Content
      const popupHtml = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; color: #1e293b; max-width: 240px; padding: 2px;">
          <div style="display: flex; align-items: center; gap: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
            <span style="font-size: 18px;">${iconEmoji}</span>
            <div>
              <div style="font-weight: 800; font-size: 13px; color: #0f172a;">${plot.name}</div>
              <div style="font-size: 11px; color: #64748b;">${plot.farmerName} • ${plot.addressName}</div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; margin-bottom: 8px;">
            <div style="background: #f8fafc; padding: 4px; border-radius: 6px;">
              <span style="color: #64748b; font-size: 10px; display: block;">Luas/Populasi:</span>
              <strong style="color: #0f172a;">${plot.areaOrPopulation} ${plot.unit}</strong>
            </div>
            <div style="background: #f8fafc; padding: 4px; border-radius: 6px;">
              <span style="color: #64748b; font-size: 10px; display: block;">Status Tanah:</span>
              <strong style="color: ${pinColor};">pH ${plot.phValue.toFixed(1)}</strong>
            </div>
          </div>
          <div style="font-size: 10px; color: #475569; font-family: monospace; margin-bottom: 8px; background: #f1f5f9; padding: 3px 6px; border-radius: 4px;">
            GPS: ${plot.coordinates.lat.toFixed(4)}, ${plot.coordinates.lng.toFixed(4)}
          </div>
          <div style="display: flex; gap: 4px;">
            <a href="https://www.google.com/maps/search/?api=1&query=${plot.coordinates.lat},${plot.coordinates.lng}" 
               target="_blank" 
               rel="noopener noreferrer" 
               style="flex: 1; text-align: center; background: #0b713b; color: #ffffff; text-decoration: none; padding: 5px 8px; border-radius: 6px; font-weight: 700; font-size: 10px;">
              🧭 Google Maps
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        offset: [0, -45],
        closeButton: true
      });

      marker.addTo(markersGroup);
      bounds.extend([plot.coordinates.lat, plot.coordinates.lng]);
    });

    // Render Anonymous Pest Outbreak Hazard Markers
    if (showPestOutbreaks && pestOutbreaks.length > 0) {
      pestOutbreaks.forEach((pest) => {
        const pestColor = pest.severity === 'Kritis' ? '#ef4444' : pest.severity === 'Sedang' ? '#f97316' : '#eab308';
        const pestHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
            <div style="position: absolute; top: -6px; width: 44px; height: 44px; border-radius: 50%; border: 3px solid ${pestColor}; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.85;"></div>
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background-color: ${pestColor};
              border: 3px solid #ffffff;
              box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
              font-size: 15px;
              color: #ffffff;
            ">
              ⚠️
            </div>
            <div style="
              width: 0;
              height: 0;
              border-left: 5px solid transparent;
              border-right: 5px solid transparent;
              border-top: 7px solid ${pestColor};
              margin-top: -1px;
            "></div>
            <div style="
              background: rgba(15, 23, 42, 0.95);
              color: #fee2e2;
              border: 1px solid ${pestColor};
              padding: 2px 6px;
              border-radius: 6px;
              font-size: 9px;
              font-weight: 800;
              white-space: nowrap;
              box-shadow: 0 2px 6px rgba(0,0,0,0.5);
              margin-top: 1px;
            ">
              🦠 HAMA: ${pest.diseaseName.slice(0, 16)}...
            </div>
          </div>
        `;

        const pestIcon = L.divIcon({
          className: 'custom-pest-icon',
          html: pestHtml,
          iconSize: [40, 50],
          iconAnchor: [20, 50]
        });

        const pestMarker = L.marker([pest.coordinates.lat, pest.coordinates.lng], {
          icon: pestIcon,
          zIndexOffset: 1000
        });

        const pestPopupHtml = `
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; min-width: 210px; max-width: 250px;">
            <div style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 9px; font-weight: 800; background: #fee2e2; color: #991b1b; margin-bottom: 4px;">
              🚨 RADAR HAMA (${pest.severity.toUpperCase()})
            </div>
            <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 2px;">
              ${pest.diseaseName}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
              Komoditi: <strong>${pest.cropName}</strong> • ${pest.regionName}
            </div>
            <div style="font-size: 10px; color: #047857; background: #ecfdf5; padding: 5px; border-radius: 6px; margin-bottom: 6px; border: 1px solid #a7f3d0;">
              <strong>Rekomendasi Paten:</strong><br/>
              ${pest.patenRecommendation.products.join(' + ')} (${pest.patenRecommendation.dosage})
            </div>
            <div style="font-size: 9px; color: #94a3b8; display: flex; justify-content: space-between;">
              <span>👤 ${pest.anonymousReporter}</span>
              <span>${pest.reportedAt}</span>
            </div>
          </div>
        `;

        pestMarker.bindPopup(pestPopupHtml, {
          offset: [0, -45],
          closeButton: true
        });

        if (onSelectPestOutbreak) {
          pestMarker.on('click', () => onSelectPestOutbreak(pest));
        }

        pestMarker.addTo(markersGroup);
        bounds.extend([pest.coordinates.lat, pest.coordinates.lng]);
      });
    }

    // If there are plots and no specific one selected, or on initial load, fit bounds
    if (plots.length > 0 && map) {
      if (selectedPlotId) {
        const selected = plots.find(p => p.id === selectedPlotId);
        if (selected) {
          map.setView([selected.coordinates.lat, selected.coordinates.lng], Math.max(map.getZoom(), 11), {
            animate: true
          });
        }
      } else if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [plots, selectedPlotId, pestOutbreaks, showPestOutbreaks]);

  // Pan to selected plot when selectedPlotId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedPlotId) return;

    const plot = plots.find(p => p.id === selectedPlotId);
    if (plot) {
      map.setView([plot.coordinates.lat, plot.coordinates.lng], Math.max(map.getZoom(), 11), {
        animate: true
      });
    }
  }, [selectedPlotId]);

  // Handle Current User GPS Locate
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Perangkat Anda tidak mendukung fitur geolokasi GPS.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        const map = mapInstanceRef.current;
        if (map) {
          map.setView([latitude, longitude], 14, { animate: true });

          // Add or update user pulse marker
          if (userLocationMarkerRef.current) {
            userLocationMarkerRef.current.setLatLng([latitude, longitude]);
          } else {
            const marker = L.circleMarker([latitude, longitude], {
              radius: 9,
              fillColor: '#3b82f6',
              color: '#ffffff',
              weight: 3,
              opacity: 1,
              fillOpacity: 0.9
            }).addTo(map);

            marker.bindPopup(`
              <div style="font-size: 11px; text-align: center;">
                <strong>📍 Lokasi GPS Anda Saat Ini</strong><br/>
                [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]
              </div>
            `).openPopup();

            userLocationMarkerRef.current = marker;
          }
        }
      },
      (err) => {
        setIsLocating(false);
        alert('Gagal mendeteksi lokasi GPS: ' + err.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleResetIndonesia = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setView([-2.5, 118.0], 5, { animate: true });
  };

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] rounded-2xl overflow-hidden border border-slate-700/80 shadow-inner">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-slate-900" />

      {/* Floating GPS Map Controls at Top Right */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        {/* GPS Locate Me Button */}
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="p-2.5 bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-bold hover:scale-105 active:scale-95"
          title="Temukan Lokasi GPS Saya Saat Ini"
        >
          <Compass className={`w-4 h-4 text-emerald-700 dark:text-emerald-400 ${isLocating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isLocating ? 'Mencari...' : 'GPS Saya'}</span>
        </button>

        {/* Reset View Button */}
        <button
          type="button"
          onClick={handleResetIndonesia}
          className="p-2.5 bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-bold hover:scale-105 active:scale-95"
          title="Tampilkan Seluruh Kepulauan Indonesia"
        >
          <Navigation className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          <span className="hidden sm:inline">Pusat Indonesia</span>
        </button>
      </div>

      {/* Click to add prompt hint */}
      {isClickToAddActive && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-emerald-700/95 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-md border border-emerald-400 flex items-center gap-2 animate-bounce">
          <MapPin className="w-4 h-4 text-amber-300" />
          <span>Klik di peta untuk menentukan koordinat lahan baru!</span>
        </div>
      )}

      {/* Floating Legend Overlay at Top Left matching Screenshot */}
      <div className="absolute top-3 left-3 z-10 bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-700/80 text-[10px] text-slate-200 space-y-1 shadow-lg max-w-[210px] pointer-events-none sm:pointer-events-auto">
        <span className="font-extrabold text-white block uppercase tracking-wider text-[9px] text-emerald-400">
          LEGENDA STATUS PH LAHAN:
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 ring-1 ring-white/50" />
          <span className="text-slate-200">pH &lt; 5.3 (Sangat Masam – Kritis)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0 ring-1 ring-white/50" />
          <span className="text-slate-200">pH 5.3 – 5.9 (Masam – Butuh Paten)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 ring-1 ring-white/50" />
          <span className="text-slate-200">pH 6.0 – 6.4 (Agak Masam)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 ring-1 ring-white/50" />
          <span className="text-slate-200">pH 6.5 – 7.0 (Subur / Optimal)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0 ring-1 ring-white/50" />
          <span className="text-slate-200">Peternakan (Sapi, Kambing, Unggas)</span>
        </div>
      </div>
    </div>
  );
};
