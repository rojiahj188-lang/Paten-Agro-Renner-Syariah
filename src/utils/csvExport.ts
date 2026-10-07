import { LandPlotLocation, HarvestRecord } from '../types';
import { COMMODITIES } from './calculatorEngine';

/**
 * Escapes a cell value for CSV (RFC 4180 standard)
 */
function escapeCsvCell(value: any): string {
  if (value === null || value === undefined) return '""';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return `"${stringValue}"`;
}

/**
 * Trigger download of CSV file with UTF-8 BOM for Microsoft Excel compatibility
 */
function triggerCsvDownload(csvContent: string, defaultFilename: string): void {
  // \uFEFF is UTF-8 Byte Order Mark (BOM) to ensure Excel opens Indonesian accents and symbols properly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', defaultFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports soil telemetry & land plot data to CSV for offline spreadsheet analysis
 */
export function exportSoilTelemetryToCSV(
  plots: LandPlotLocation[],
  filename?: string
): void {
  if (!plots || plots.length === 0) {
    alert('Tidak ada data telemetri lahan untuk diekspor ke CSV.');
    return;
  }

  const headers = [
    'ID Lahan',
    'Nama Lahan / Blok',
    'Nama Petani / Mitra',
    'Komoditi',
    'Kategori Komoditi',
    'Luas (Are)',
    'Luas (Hektar)',
    'Nilai pH Tanah',
    'Status Kondisi Tanah',
    'Kategori Masam / Kritis',
    'Rekomendasi Paket Pupuk Paten',
    'Kebutuhan Paten Gold (Box/Ha)',
    'Kebutuhan Paten Imun (Box/Ha)',
    'Target Serapan Nutrisi Nano (%)',
    'Latitude (Lintang GPS)',
    'Longitude (Bujur GPS)',
    'Wilayah / Alamat Lahan',
    'Tanggal Registrasi',
    'Telemetri Kelembapan Ideal (%)',
    'Telemetri Suhu Tanah Ideal (C)',
    'Telemetri Konduktivitas EC Ideal (mS/cm)',
    'Catatan Lapangan & Rekomendasi Agronomi'
  ];

  const rows = plots.map(plot => {
    const comm = COMMODITIES[plot.commodityId] || {
      category: 'Pangan',
      patenBoxesPerHa: 6,
      patenImunBoxesPerHa: 4
    };

    const areaHa = (plot.areaOrPopulation / 100).toFixed(2);
    const isCriticalPh = plot.phValue < 5.3;
    const phCategoryText = isCriticalPh
      ? 'Kritis (Sangat Masam - Butuh Dosis Ganda Pembenah Tanah)'
      : plot.phValue < 6.0
      ? 'Masam (Perlu Soil Treatment Paten Gold)'
      : plot.phValue < 6.5
      ? 'Agak Masam'
      : 'Ideal / Optimal Subur';

    const recommendationText = plot.phValue < 5.8
      ? 'Paten Gold + Paten Imun (Pemulihan pH & Imunitas Sel)'
      : 'Paten Hijau / Paten Gold + Paten Imun Rutin';

    // Target nano absorption is always 90-98% compared to chemical fertilizer ~30-40%
    const nanoAbsorptionRate = plot.phValue < 5.5 ? '92%' : '98%';

    return [
      escapeCsvCell(plot.id),
      escapeCsvCell(plot.name),
      escapeCsvCell(plot.farmerName),
      escapeCsvCell(plot.commodityName),
      escapeCsvCell(comm.category),
      escapeCsvCell(plot.areaOrPopulation),
      escapeCsvCell(areaHa),
      escapeCsvCell(plot.phValue.toFixed(2)),
      escapeCsvCell(plot.soilCondition.replace('_', ' ').toUpperCase()),
      escapeCsvCell(phCategoryText),
      escapeCsvCell(recommendationText),
      escapeCsvCell(comm.patenBoxesPerHa),
      escapeCsvCell(comm.patenImunBoxesPerHa),
      escapeCsvCell(nanoAbsorptionRate),
      escapeCsvCell(plot.coordinates.lat),
      escapeCsvCell(plot.coordinates.lng),
      escapeCsvCell(plot.addressName),
      escapeCsvCell(plot.registeredDate),
      escapeCsvCell('60 - 75%'), // Ideal Moisture
      escapeCsvCell('26 - 29 C'), // Ideal Temp
      escapeCsvCell('1.2 - 1.8 mS/cm'), // Ideal EC
      escapeCsvCell(plot.notes || '-')
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  const targetFilename = filename || `Data-Telemetri-Tanah-Paten-Agro-${dateStr}.csv`;

  triggerCsvDownload(csvContent, targetFilename);
}

/**
 * Exports a single plot's telemetry profile to CSV
 */
export function exportSinglePlotTelemetryToCSV(plot: LandPlotLocation): void {
  exportSoilTelemetryToCSV([plot], `Telemetri-${plot.name.replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().split('T')[0]}.csv`);
}

/**
 * Exports harvest history records to CSV
 */
export function exportHarvestRecordsToCSV(records: HarvestRecord[]): void {
  if (!records || records.length === 0) {
    alert('Tidak ada data catatan panen untuk diekspor ke CSV.');
    return;
  }

  const headers = [
    'ID Catatan',
    'Tanggal Panen',
    'Musim Tanam',
    'Komoditi',
    'Luas Lahan (Are)',
    'Pola Pemupukan',
    'Hasil Panen (kg)',
    'Hasil Panen (Ton)',
    'Produktivitas (Ton/Ha eq)',
    'Biaya Operasional (Rp)',
    'Penerimaan Penjualan (Rp)',
    'Laba Bersih Petani (Rp)',
    'Return on Investment (ROI %)',
    'Catatan Lapangan'
  ];

  const rows = records.map(rec => {
    const areaHa = rec.areaInAre / 100;
    const yieldTon = rec.yieldKg / 1000;
    const productivityTonPerHa = areaHa > 0 ? (yieldTon / areaHa).toFixed(2) : '0';
    const roi = rec.costRp > 0 ? Math.round((rec.profitRp / rec.costRp) * 100) : 0;

    return [
      escapeCsvCell(rec.id),
      escapeCsvCell(rec.date),
      escapeCsvCell(rec.seasonName),
      escapeCsvCell(rec.commodityName),
      escapeCsvCell(rec.areaInAre),
      escapeCsvCell(rec.method),
      escapeCsvCell(rec.yieldKg),
      escapeCsvCell(yieldTon.toFixed(2)),
      escapeCsvCell(productivityTonPerHa),
      escapeCsvCell(rec.costRp),
      escapeCsvCell(rec.revenueRp),
      escapeCsvCell(rec.profitRp),
      escapeCsvCell(`${roi}%`),
      escapeCsvCell(rec.notes || '-')
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  triggerCsvDownload(csvContent, `Rekapitulasi-Panen-Paten-Agro-${dateStr}.csv`);
}
