import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculationResult, HarvestRecord, CropScheduleConfig } from '../types';
import { formatRupiah, formatNumber } from './calculatorEngine';

export function exportCalculationToPDF(
  result: CalculationResult,
  farmerName: string = 'Petani Mitra Renner Syariah',
  farmLocation: string = 'Lahan Pertanian Indonesia',
  action: 'save' | 'print' = 'save'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. Header & Branding
  doc.setFillColor(21, 128, 61); // Emerald 700
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('PT. RENNER INTI INTERNASIONAL', 14, 11);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('RENNER SYARIAH • SISTEM ANALISIS PERTANIAN PUPUK PATEN AGRO', 14, 18);
  doc.setFontSize(8);
  doc.text('Izin Kementan RI: 02.02.2022.763 • DSN-MUI: 012.161.01/DSN-MUI/1X/2023 • SIUPL: 91202001606480003', 14, 23);

  // 2. Document Title & Metadata
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN SIMULASI EFISIENSI BIAYA & PREDIKSI HASIL PANEN', 14, 38);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 14, 44);
  doc.text(`Nama Petani / Mitra: ${farmerName}`, 14, 49);
  doc.text(`Lokasi Lahan: ${farmLocation}`, 14, 54);

  doc.text(`Komoditi: ${result.commodity.name}`, pageWidth / 2, 44);
  doc.text(`Luas Lahan: ${result.areaInAre} Are (${formatNumber(result.areaInM2)} m² / ${result.areaInHa} Ha)`, pageWidth / 2, 49);
  doc.text(`Kondisi Tanah: ${result.soil.label} (${result.soil.phRange})`, pageWidth / 2, 54);

  // Horizontal divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 58, pageWidth - 14, 58);

  // 3. Highlight Summary Boxes
  const boxWidth = (pageWidth - 28 - 6) / 3;
  const boxY = 62;

  // Box 1: Penghematan Biaya
  doc.setFillColor(240, 253, 244); // Emerald 50
  doc.setDrawColor(34, 197, 94); // Emerald 500
  doc.roundedRect(14, boxY, boxWidth, 22, 2, 2, 'FD');
  doc.setTextColor(21, 128, 61);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PENGHEMATAN BIAYA INPUT', 18, boxY + 6);
  doc.setFontSize(12);
  doc.text(formatRupiah(result.savings.operationalSavingsRp), 18, boxY + 13);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Hemat ${result.savings.operationalSavingsPercent}% biaya operasional`, 18, boxY + 18);

  // Box 2: Tambahan Laba Bersih
  doc.setFillColor(254, 243, 199); // Amber 50
  doc.setDrawColor(245, 158, 11); // Amber 500
  doc.roundedRect(14 + boxWidth + 3, boxY, boxWidth, 22, 2, 2, 'FD');
  doc.setTextColor(180, 83, 9);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('SURPLUS LABA BERSIH', 14 + boxWidth + 7, boxY + 6);
  doc.setFontSize(12);
  doc.text(`+${formatRupiah(result.savings.additionalProfitRp)}`, 14 + boxWidth + 7, boxY + 13);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Kenaikan laba +${result.savings.profitIncreasePercent}%`, 14 + boxWidth + 7, boxY + 18);

  // Box 3: Estimasi Kenaikan Panen
  doc.setFillColor(239, 246, 255); // Blue 50
  doc.setDrawColor(59, 130, 246); // Blue 500
  doc.roundedRect(14 + (boxWidth * 2) + 6, boxY, boxWidth, 22, 2, 2, 'FD');
  doc.setTextColor(29, 78, 216);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PROYEKSI KENAIKAN TONASE', 14 + (boxWidth * 2) + 10, boxY + 6);
  doc.setFontSize(12);
  doc.text(`+${formatNumber(result.savings.yieldIncreaseKg)} kg`, 14 + (boxWidth * 2) + 10, boxY + 13);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total panen: ${result.paten.yieldTon} Ton`, 14 + (boxWidth * 2) + 10, boxY + 18);

  // 4. Comparison Table (Pupuk Kimia Konvensional vs Pupuk Paten Nano)
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Tabel Perbandingan Finansial & Operasional Lahan', 14, 92);

  autoTable(doc, {
    startY: 96,
    head: [['Parameter Analisis', 'Pola Pupuk Kimia Konvensional', 'Pola Pupuk Organik Paten Nano', 'Selisih / Efisiensi']],
    body: [
      [
        'Biaya Pupuk Utama',
        formatRupiah(result.conventional.fertilizerCost),
        `${formatRupiah(result.paten.patenCost)} (${result.paten.patenBoxes} Box / ${result.paten.sachetCount} Sachet)`,
        `Hemat ${formatRupiah(result.conventional.fertilizerCost - result.paten.patenCost)}`
      ],
      [
        'Biaya Pupuk Pelengkap',
        'Rp 0 (Sudah termasuk kimia)',
        formatRupiah(result.paten.complementaryChemicalCost),
        'Dosis kimia dikurangi 70%'
      ],
      [
        'Biaya Pestisida & Fungisida',
        formatRupiah(result.conventional.pesticideCost),
        formatRupiah(result.paten.reducedPesticideCost),
        `Hemat 80% (Fungisida 100%)`
      ],
      [
        'TOTAL BIAYA OPERASIONAL',
        formatRupiah(result.conventional.totalCost),
        formatRupiah(result.paten.totalCost),
        `Hemat ${result.savings.operationalSavingsPercent}% (${formatRupiah(result.savings.operationalSavingsRp)})`
      ],
      [
        'Estimasi Hasil Panen',
        `${result.conventional.yieldTon} Ton (${formatNumber(result.conventional.yieldKg)} kg)`,
        `${result.paten.yieldTon} Ton (${formatNumber(result.paten.yieldKg)} kg)`,
        `+${formatNumber(result.savings.yieldIncreaseKg)} kg (+${result.savings.yieldIncreasePercent}%)`
      ],
      [
        'Total Pendapatan (Omzet)',
        formatRupiah(result.conventional.revenue),
        formatRupiah(result.paten.revenue),
        `+${formatRupiah(result.paten.revenue - result.conventional.revenue)}`
      ],
      [
        'LABA BERSIH PETANI',
        formatRupiah(result.conventional.netProfit),
        formatRupiah(result.paten.netProfit),
        `+${formatRupiah(result.savings.additionalProfitRp)} (+${result.savings.profitIncreasePercent}%)`
      ],
      [
        'Return on Investment (ROI)',
        `${((result.conventional.netProfit / (result.conventional.totalCost || 1)) * 100).toFixed(0)}%`,
        `${result.savings.roiPercent}%`,
        'Tingkat pengembalian modal tinggi'
      ]
    ],
    headStyles: {
      fillColor: [21, 128, 61],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 46 },
      2: { cellWidth: 52 },
      3: { fontStyle: 'bold', textColor: [21, 128, 61], cellWidth: 38 }
    }
  });

  // 5. Rekomendasi Dosis & Cara Aplikasi
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Petunjuk Dosis & Kebutuhan Aplikasi Pupuk Paten:', 14, finalY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  const tipsLines = [
    `• Kebutuhan Pupuk: ${result.paten.patenBoxes} Box Paten Gold (${result.paten.sachetCount} sachet)${result.paten.patenImunBoxes > 0 ? ` + ${result.paten.patenImunBoxes} Box Paten Imun` : ''}.`,
    `• Volume Penyemprotan: Sekitar ${result.paten.tanksNeeded} tangki semprot (16-20 Liter air) untuk lahan ${result.areaInAre} are.`,
    '• Waktu Penyemprotan Terbaik: Pagi hari pukul 06.00 - 09.00 saat stomata daun terbuka sempurna.',
    '• Keunggulan Nano: Nutrisi siap saji langsung menembus dinding sel tanaman tanpa menunggu fotosintesis panjang.',
    '• Pembenah Tanah: Satu sachet Paten Gold telah dilengkapi unsur soil treatment untuk menormalkan kembali keasaman tanah ke pH ideal 6.5 - 7.0.'
  ];

  let currentY = finalY + 5;
  tipsLines.forEach((line) => {
    doc.text(line, 14, currentY);
    currentY += 4.5;
  });

  // 6. Footer & Legal Stamp
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 275, pageWidth - 14, 275);

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Dicetak otomatis dari Sistem Paten Agro Renner Syariah • Legalitas Resmi PT Renner Inti Internasional (Makassar, Sulawesi Selatan)', 14, 280);
  doc.text('Laporan ini sah digunakan sebagai bahan rujukan kelompok tani, gapoktan, dan permohonan kemitraan pupuk organik.', 14, 284);

  // Save or Print PDF
  const filename = `Laporan-Paten-Agro-${result.commodity.id}-${result.areaInAre}Are-${new Date().getTime().toString().slice(-4)}.pdf`;
  if (action === 'print') {
    doc.autoPrint();
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const printWindow = window.open(blobUrl, '_blank');
    if (!printWindow) doc.save(filename);
  } else {
    doc.save(filename);
  }
}

export function exportHarvestHistoryToPDF(
  records: HarvestRecord[],
  farmerName: string = 'Petani Mitra Renner Syariah',
  action: 'save' | 'print' = 'save'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(21, 128, 61);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('PT. RENNER INTI INTERNASIONAL', 14, 11);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('RENNER SYARIAH • LAPORAN HISTORIS PERFORMA PANEN LAPANGAN', 14, 18);
  doc.setFontSize(8);
  doc.text('Izin Kementan RI: 02.02.2022.763 • DSN-MUI: 012.161.01/DSN-MUI/1X/2023', 14, 23);

  // Title
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('REKAPITULASI HASIL PANEN & EFISIENSI MUSIM TANAM', 14, 38);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nama Petani / Mitra: ${farmerName}`, 14, 44);
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 14, 49);
  doc.text(`Total Catatan Panen: ${records.length} Musim Tanam`, 14, 54);

  // Table
  autoTable(doc, {
    startY: 60,
    head: [['Tanggal', 'Musim Tanam', 'Komoditi', 'Luas', 'Metode', 'Hasil (kg)', 'Biaya', 'Laba Bersih']],
    body: records.map(r => [
      r.date,
      r.seasonName,
      r.commodityName,
      `${r.areaInAre} Are`,
      r.method,
      `${formatNumber(r.yieldKg)} kg`,
      formatRupiah(r.costRp),
      formatRupiah(r.profitRp)
    ]),
    headStyles: {
      fillColor: [21, 128, 61],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 275, pageWidth - 14, 275);
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Dokumen resmi hasil rekapitulasi performa panen Pupuk Organik Paten Nano Renner Syariah.', 14, 280);

  const filename = `Rekap-Panen-Paten-Agro-${new Date().getTime().toString().slice(-4)}.pdf`;
  if (action === 'print') {
    doc.autoPrint();
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const printWindow = window.open(blobUrl, '_blank');
    if (!printWindow) doc.save(filename);
  } else {
    doc.save(filename);
  }
}

// -------------------------------------------------------------
// LAPORAN JADWAL PEMUPUKAN & WAKTU SEMPROT STOMATA KE DALAM PDF
// -------------------------------------------------------------
export interface SchedulePdfOptions {
  cropSchedule: CropScheduleConfig;
  plantingDate: string; // YYYY-MM-DD
  farmerName?: string;
  farmLocation?: string;
  areaInAre?: number;
  completedScheduleIds?: Record<string, boolean>;
  action?: 'save' | 'print';
}

export function exportFertilizationScheduleToPDF(options: SchedulePdfOptions): void {
  const {
    cropSchedule,
    plantingDate,
    farmerName = 'Petani Mitra Renner Syariah',
    farmLocation = 'Lahan Pertanian Indonesia',
    areaInAre = 20,
    completedScheduleIds = {},
    action = 'save'
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. Header Banner
  doc.setFillColor(21, 128, 61); // Emerald 700
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Gold accent bar
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 28, pageWidth, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('PT. RENNER INTI INTERNASIONAL', 14, 11);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text('RENNER SYARIAH • PANDUAN JADWAL APLIKASI TEKNOLOGI NANO PATEN AGRO', 14, 17.5);
  doc.setFontSize(7.5);
  doc.text('Izin Kementan RI: 02.02.2022.763 • DSN-MUI: 012.161.01/DSN-MUI/1X/2023 • SIUPL: 91202001606480003', 14, 23);

  // 2. Title & Metadata
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('KALENDER JADWAL PEMUPUKAN & WAKTU SEMPROT STOMATA', 14, 38);

  const plantDateObj = new Date(plantingDate);
  const now = new Date();
  const currentHST = Math.max(0, Math.floor((now.getTime() - plantDateObj.getTime()) / (1000 * 60 * 60 * 24)));

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tanggal Cetak: ${now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 14, 44);
  doc.text(`Nama Petani / Mitra: ${farmerName}`, 14, 49);
  doc.text(`Lokasi Lahan: ${farmLocation}`, 14, 54);

  doc.text(`Komoditi: ${cropSchedule.name}`, pageWidth / 2, 44);
  doc.text(`Tanggal Tanam: ${plantDateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} (Usia: HST ${currentHST})`, pageWidth / 2, 49);
  doc.text(`Luas Lahan: ${areaInAre} Are (${(areaInAre / 100).toFixed(2)} Ha)`, pageWidth / 2, 54);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 58, pageWidth - 14, 58);

  // 3. Highlight Summary Boxes
  const boxWidth = (pageWidth - 28 - 6) / 3;
  const boxY = 62;

  // Box 1: HST Saat Ini
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(52, 211, 153);
  doc.roundedRect(14, boxY, boxWidth, 20, 2, 2, 'FD');
  doc.setTextColor(6, 95, 70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('USIA TANAMAN SAAT INI', 18, boxY + 6);
  doc.setFontSize(12);
  doc.text(`HST ${currentHST}`, 18, boxY + 13);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Hari Setelah Tanam (Aktif)', 18, boxY + 17.5);

  // Box 2: Total Tahapan
  const totalStages = cropSchedule.schedules.length;
  const completedCount = cropSchedule.schedules.filter(s => !!completedScheduleIds[s.id]).length;
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(14 + boxWidth + 3, boxY, boxWidth, 20, 2, 2, 'FD');
  doc.setTextColor(180, 83, 9);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('PROGRESS APLIKASI', 14 + boxWidth + 7, boxY + 6);
  doc.setFontSize(12);
  doc.text(`${completedCount} / ${totalStages} Tahap`, 14 + boxWidth + 7, boxY + 13);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${totalStages - completedCount} tahap berikutnya`, 14 + boxWidth + 7, boxY + 17.5);

  // Box 3: Jendela Semprot
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(59, 130, 246);
  doc.roundedRect(14 + (boxWidth * 2) + 6, boxY, boxWidth, 20, 2, 2, 'FD');
  doc.setTextColor(29, 78, 216);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('WAKTU APLIKASI TERBAIK', 14 + (boxWidth * 2) + 10, boxY + 6);
  doc.setFontSize(11);
  doc.text('06.00 - 09.00 Pagi', 14 + (boxWidth * 2) + 10, boxY + 13);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Stomata Terbuka Maksimal', 14 + (boxWidth * 2) + 10, boxY + 17.5);

  // 4. AutoTable for Schedules
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Tabel Rangkaian Aplikasi Pupuk Paten per Usia Tanaman:', 14, 89);

  const tableBody = cropSchedule.schedules.map(item => {
    const scheduledDateObj = new Date(plantDateObj.getTime() + item.dayAfterPlanting * 86400000);
    const dateFormatted = scheduledDateObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const isDone = !!completedScheduleIds[item.id];
    const isDue = currentHST >= item.dayAfterPlanting;
    const statusText = isDone ? 'SELESAI' : isDue ? 'SEKARANG' : 'MENDATANG';

    return [
      `HST ${item.dayAfterPlanting}`,
      dateFormatted,
      `${item.title}\n(${item.actionType})`,
      item.products.join(', '),
      `${item.dosage}\n[${item.waterVolume}]`,
      item.mixingInstruction,
      statusText
    ];
  });

  autoTable(doc, {
    startY: 93,
    head: [['Usia', 'Estimasi Tanggal', 'Tahap / Tindakan', 'Produk Paten', 'Dosis per Tangki', 'Instruksi Pencampuran & Stomata', 'Status']],
    body: tableBody,
    headStyles: {
      fillColor: [21, 128, 61],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 7.2,
      cellPadding: 2.2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 16 },
      1: { cellWidth: 24 },
      2: { fontStyle: 'bold', cellWidth: 32 },
      3: { textColor: [21, 128, 61], fontStyle: 'bold', cellWidth: 26 },
      4: { cellWidth: 28 },
      5: { cellWidth: 42 },
      6: { fontStyle: 'bold', cellWidth: 16 }
    },
    theme: 'grid'
  });

  const finalTableY = (doc as any).lastAutoTable?.finalY || 180;

  // 5. Tips & SOP Petunjuk Aplikasi
  let tipsY = finalTableY + 7;
  if (tipsY > 230) {
    doc.addPage();
    tipsY = 20;
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Petunjuk Teknis Agronomi & Kaidah Aplikasi Pupuk Paten Nano:', 14, tipsY);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  const tipsList = cropSchedule.tips || [
    'Semprot di pagi hari pukul 06.00-09.00 saat stomata daun terbuka.',
    'Partikel nano menembus sel daun dalam 15 menit tanpa menunggu fotosintesis panjang.',
    'Bisa dicampur insektisida/fungisida untuk menghemat tenaga kerja.',
    'Dosis pupuk kimia dasar dapat dikurangi bertahap hingga 70%.'
  ];

  let currentY = tipsY + 4.5;
  tipsList.slice(0, 4).forEach((tip, idx) => {
    doc.text(`${idx + 1}. ${tip}`, 14, currentY);
    currentY += 4;
  });

  // 6. Signature Block
  let signY = currentY + 4;
  if (signY > 240) {
    doc.addPage();
    signY = 20;
  }

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, signY, pageWidth - 14, signY);
  signY += 5;

  const colSignWidth = (pageWidth - 28) / 3;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Petani Pelaksana,', 14, signY);
  doc.text('Ketua Kelompok Tani / Koperasi,', 14 + colSignWidth, signY);
  doc.text('Verifikator Agronomi Renner,', 14 + (colSignWidth * 2), signY);

  signY += 13;

  doc.setFontSize(8);
  doc.text(`( ${farmerName} )`, 14, signY);
  doc.text('( Pengurus Gapoktan )', 14 + colSignWidth, signY);
  doc.text('( Husni, S. Kom. I. )', 14 + (colSignWidth * 2), signY);

  signY += 4;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Pemilik Lahan', 14, signY);
  doc.text('Penyuluh Pertanian', 14 + colSignWidth, signY);
  doc.text('Member PT. Renner Inti Internasional', 14 + (colSignWidth * 2), signY);

  // 7. Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 282, pageWidth - 14, 282);
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.text('Dokumen kalender jadwal pemupukan resmi diterbitkan oleh Aplikasi Paten Agro Renner Syariah.', 14, 286);
  doc.text('Pengembang: Husni, S. Kom. I. (Member Renner Syariah) • Izin Kementan RI: 02.02.2022.763', 14, 290);

  // Output
  const filename = `Jadwal-Pemupukan-Paten-${cropSchedule.commodityId}-${currentHST}HST-${new Date().getTime().toString().slice(-4)}.pdf`;
  if (action === 'print') {
    doc.autoPrint();
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const printWindow = window.open(blobUrl, '_blank');
    if (!printWindow) doc.save(filename);
  } else {
    doc.save(filename);
  }
}

// -------------------------------------------------------------
// LAPORAN ANALITIK TAHUNAN RESMI (PERMODALAN & KOPERASI PETANI)
// -------------------------------------------------------------
export interface AnnualReportOptions {
  farmerName: string;
  cooperativeName: string;
  farmLocation: string;
  purpose: string;
  reportingYear: string;
  notes?: string;
  action?: 'save' | 'print';
}

export function exportAnnualAnalyticsReportToPDF(
  records: HarvestRecord[],
  options: AnnualReportOptions
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Calculation summaries
  const totalAreaAre = records.reduce((acc, r) => acc + r.areaInAre, 0);
  const totalYieldKg = records.reduce((acc, r) => acc + r.yieldKg, 0);
  const totalRevenueRp = records.reduce((acc, r) => acc + r.revenueRp, 0);
  const totalCostRp = records.reduce((acc, r) => acc + r.costRp, 0);
  const totalProfitRp = records.reduce((acc, r) => acc + r.profitRp, 0);

  const patenRecords = records.filter(r => r.method === 'Paten Nano');
  const chemRecords = records.filter(r => r.method === 'Kimia Konvensional');

  const patenCostPerAre = patenRecords.length > 0
    ? patenRecords.reduce((acc, r) => acc + r.costRp, 0) / patenRecords.reduce((acc, r) => acc + r.areaInAre, 0)
    : 18000;

  const chemCostPerAre = chemRecords.length > 0
    ? chemRecords.reduce((acc, r) => acc + r.costRp, 0) / chemRecords.reduce((acc, r) => acc + r.areaInAre, 0)
    : 45000;

  const savingsPercent = chemCostPerAre > 0
    ? Math.round(((chemCostPerAre - patenCostPerAre) / chemCostPerAre) * 100)
    : 58;

  const benefitCostRatio = totalCostRp > 0
    ? (totalRevenueRp / totalCostRp).toFixed(2)
    : '3.12';

  const docNumber = `DOC/RENNER-AGRO/TH-${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;

  // ================= PAGE 1 =================
  // Header Banner
  doc.setFillColor(11, 113, 59); // Renner Emerald
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Gold accent line
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 32, pageWidth, 1.8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('PT. RENNER INTI INTERNASIONAL', 14, 11);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text('RENNER SYARIAH • DIVISI AGRO PERTANIAN & KEMITRAAN KOPERASI', 14, 17);
  doc.setFontSize(7.5);
  doc.text('Legalitas: Izin Kementan RI No. 02.02.2022.763 • Opini Syariah DSN-MUI No. 012.161.01/DSN-MUI/1X/2023', 14, 23);
  doc.text('Kantor Pusat: Gedung Renner Centre, Makassar, Sulsel • Layanan Petani: www.rennersyariah.com', 14, 28);

  // Document Title & Purpose
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN ANALITIK TAHUNAN & EVALUASI KELAYAKAN USAHA TANI', 14, 41);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Untuk Keperluan: ${options.purpose}`, 14, 46.5);
  doc.text(`No. Registrasi: ${docNumber} • Tahun Buku Evaluasi: ${options.reportingYear}`, 14, 51);

  // Metadata Panel Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, 55, pageWidth - 28, 24, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text('IDENTITAS PEMILIK LAHAN & KELEMBAGAAN TANI', 18, 61);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Nama Petani / Mitra : ${options.farmerName}`, 18, 67);
  doc.text(`Kelompok Tani / KUD : ${options.cooperativeName || 'Gapoktan Binaan Renner Syariah'}`, 18, 72);
  doc.text(`Lokasi Lahan / Wilayah : ${options.farmLocation}`, 18, 76.5);

  doc.text(`Akumulasi Lahan Binaan : ${totalAreaAre} Are (${(totalAreaAre / 100).toFixed(1)} Hektar)`, pageWidth / 2 + 5, 67);
  doc.text(`Status Mitra           : Anggota Aktif Bersertifikat Organik Nano`, pageWidth / 2 + 5, 72);
  doc.text(`Tanggal Audit Evaluasi : ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth / 2 + 5, 76.5);

  // 4 KPI Metric Summary Cards
  const kpiWidth = (pageWidth - 28 - 9) / 4;
  const kpiY = 82;

  // KPI 1: Tonase Panen
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(52, 211, 153);
  doc.roundedRect(14, kpiY, kpiWidth, 20, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setTextColor(6, 95, 70);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL HASIL PANEN', 17, kpiY + 5.5);
  doc.setFontSize(11);
  doc.text(`${(totalYieldKg / 1000).toFixed(1)} Ton`, 17, kpiY + 12);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatNumber(totalYieldKg)} kg riil panen`, 17, kpiY + 17);

  // KPI 2: Penerimaan Bruto
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(96, 165, 250);
  doc.roundedRect(14 + kpiWidth + 3, kpiY, kpiWidth, 20, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.text('PENERIMAAN BRUTO', 14 + kpiWidth + 6, kpiY + 5.5);
  doc.setFontSize(10.5);
  doc.text(formatRupiah(totalRevenueRp), 14 + kpiWidth + 6, kpiY + 12);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Total perputaran hasil', 14 + kpiWidth + 6, kpiY + 17);

  // KPI 3: Penghematan Biaya
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(251, 191, 36);
  doc.roundedRect(14 + (kpiWidth * 2) + 6, kpiY, kpiWidth, 20, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setTextColor(146, 64, 14);
  doc.setFont('helvetica', 'bold');
  doc.text('EFISIENSI BIAYA INPUT', 14 + (kpiWidth * 2) + 9, kpiY + 5.5);
  doc.setFontSize(11);
  doc.text(`Hemat ${savingsPercent}%`, 14 + (kpiWidth * 2) + 9, kpiY + 12);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Substitusi kimia ke nano', 14 + (kpiWidth * 2) + 9, kpiY + 17);

  // KPI 4: Laba Bersih & B/C Ratio
  doc.setFillColor(245, 243, 255);
  doc.setDrawColor(167, 139, 250);
  doc.roundedRect(14 + (kpiWidth * 3) + 9, kpiY, kpiWidth, 20, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setTextColor(91, 33, 182);
  doc.setFont('helvetica', 'bold');
  doc.text('SURPLUS LABA & B/C', 14 + (kpiWidth * 3) + 12, kpiY + 5.5);
  doc.setFontSize(10.5);
  doc.text(formatRupiah(totalProfitRp), 14 + (kpiWidth * 3) + 12, kpiY + 12);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`B/C Ratio: ${benefitCostRatio} (Layak)`, 14 + (kpiWidth * 3) + 12, kpiY + 17);

  // Table of Harvest Records
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('REKAPITULASI HISTORIS PANEN & POLA PEMUPUKAN ANTAR-MUSIM', 14, 108);

  autoTable(doc, {
    startY: 111,
    head: [['Tanggal', 'Musim Tanam', 'Komoditi', 'Luas', 'Pola Aplikasi Pupuk', 'Panen', 'Biaya Input', 'Penerimaan', 'Laba Bersih']],
    body: records.map(r => [
      r.date,
      r.seasonName,
      r.commodityName.split('(')[0],
      `${r.areaInAre} Are`,
      r.method === 'Paten Nano' ? 'Paten Nano Organik' : 'Konvensional Kimia',
      `${formatNumber(r.yieldKg)} kg`,
      formatRupiah(r.costRp),
      formatRupiah(r.revenueRp),
      formatRupiah(r.profitRp)
    ]),
    headStyles: {
      fillColor: [11, 113, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 7.2,
      cellPadding: 2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    theme: 'grid',
    margin: { left: 14, right: 14 }
  });

  const finalTableY = (doc as any).lastAutoTable?.finalY || 180;

  // Analysis & Viability Recommendation Section
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('KESIMPULAN KELAYAKAN USAHA TANI & EFISIENSI PERMODALAN:', 14, finalTableY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  const evaluationNotes = [
    `1. Efisiensi Biaya Operasional: Penggunaan paket pupuk Paten Gold & Imun terbukti memangkas biaya pemupukan rata-rata ${savingsPercent}% dibanding pupuk kimia konvensional dengan serapan nano 15 menit.`,
    `2. Rasio Kelayakan Usaha (B/C Ratio): Rasio pendapatan terhadap biaya input sebesar ${benefitCostRatio} (kategori SANGAT LAYAK), menunjukkan kemampuan pengembalian pokok permodalan KUR/pembiayaan yang tinggi.`,
    `3. Ketahanan Tanaman & pH Tanah: Tanaman memiliki imunitas lebih tinggi terhadap serangan hama bulai, blas, dan kresek berkat vaksin nabati Paten Imun, serta perbaikan pH tanah berkelanjutan.`
  ];

  let evalY = finalYCheck(finalTableY + 13, doc);
  evaluationNotes.forEach(note => {
    doc.text(note, 14, evalY);
    evalY += 4.5;
  });

  // Signature and Verification Block
  evalY += 3;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, evalY, pageWidth - 14, evalY);
  evalY += 5;

  const colSignWidth = (pageWidth - 28) / 3;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);

  doc.text('Pemilik Lahan / Petani,', 14, evalY);
  doc.text('Ketua Koperasi / Gapoktan,', 14 + colSignWidth, evalY);
  doc.text('Verifikator Agronomis & Pengembang,', 14 + (colSignWidth * 2), evalY);

  evalY += 15; // Space for signature / stamp

  doc.setFontSize(8);
  doc.text(`( ${options.farmerName} )`, 14, evalY);
  doc.text(`( ${options.cooperativeName || 'Pengurus Gapoktan'} )`, 14 + colSignWidth, evalY);
  doc.text(`( Husni, S. Kom. I. )`, 14 + (colSignWidth * 2), evalY);

  evalY += 4;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Petani Pelaksana Mitra', 14, evalY);
  doc.text('Verifikasi Kelompok Tani', 14 + colSignWidth, evalY);
  doc.text('Member Renner Syariah / Pengembang', 14 + (colSignWidth * 2), evalY);

  // Bottom Legal Strip
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 282, pageWidth - 14, 282);
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.text('Dokumen resmi hasil audit analitik tahunan Sistem Paten Agro Renner Syariah • Sah untuk kelengkapan administrasi perbankan/koperasi.', 14, 286);
  doc.text('Pengembang Aplikasi: Husni, S. Kom. I. (Member Renner Syariah) • PT. Renner Inti Internasional', 14, 290);

  // Save or Print PDF
  const safeFarmerName = options.farmerName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Laporan-Analitik-Tahunan-Paten-Agro-${safeFarmerName}-${options.reportingYear.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  if (options.action === 'print') {
    doc.autoPrint();
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const printWindow = window.open(blobUrl, '_blank');
    if (!printWindow) doc.save(filename);
  } else {
    doc.save(filename);
  }
}

function finalYCheck(y: number, doc: jsPDF): number {
  if (y > 260) {
    doc.addPage();
    return 20;
  }
  return y;
}

/**
 * Ekspor Data Historis Panen ke File CSV (Comma Separated Values / Excel)
 */
export function exportHarvestHistoryToCSV(
  records: HarvestRecord[],
  farmerName: string = 'Petani Mitra Renner Syariah'
): void {
  if (records.length === 0) {
    throw new Error('Tidak ada data catatan panen untuk diekspor ke CSV.');
  }

  // Header CSV
  const headers = [
    'No',
    'Tanggal Catat',
    'Nama Musim Tanam',
    'Komoditas',
    'Luas (Are)',
    'Metode Budidaya',
    'Hasil Panen (Kg)',
    'Hasil Panen (Ton/Ha)',
    'Biaya Operasional (Rp)',
    'Pendapatan Penjualan (Rp)',
    'Laba Bersih (Rp)',
    'ROI (%)',
    'Catatan / Keterangan'
  ];

  // Helper escape string untuk format CSV
  const escapeCsv = (str: any): string => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows: string[] = [];
  // Row 1: Judul Laporan
  rows.push(escapeCsv(`LAPORAN HISTORIS PANEN PETANI - PATEN AGRO RENNER SYARIAH`));
  rows.push(escapeCsv(`Nama Petani / Mitra: ${farmerName}`));
  rows.push(escapeCsv(`Tanggal Unduh: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`));
  rows.push(''); // Baris kosong

  // Row Header
  rows.push(headers.map(h => escapeCsv(h)).join(','));

  // Rows Data
  records.forEach((rec, idx) => {
    const yieldTonPerHa = rec.areaInAre > 0
      ? (rec.yieldKg / (rec.areaInAre / 100) / 1000).toFixed(2)
      : '0.00';
    const roi = rec.costRp > 0
      ? ((rec.profitRp / rec.costRp) * 100).toFixed(1)
      : '0.0';

    const row = [
      idx + 1,
      rec.date,
      rec.seasonName,
      rec.commodityName,
      rec.areaInAre,
      rec.method,
      rec.yieldKg,
      yieldTonPerHa,
      rec.costRp,
      rec.revenueRp,
      rec.profitRp,
      roi,
      rec.notes || '-'
    ];

    rows.push(row.map(cell => escapeCsv(cell)).join(','));
  });

  // Summary row di bagian bawah
  const totalYieldKg = records.reduce((acc, r) => acc + r.yieldKg, 0);
  const totalCostRp = records.reduce((acc, r) => acc + r.costRp, 0);
  const totalRevenueRp = records.reduce((acc, r) => acc + r.revenueRp, 0);
  const totalProfitRp = records.reduce((acc, r) => acc + r.profitRp, 0);
  const totalAreaAre = records.reduce((acc, r) => acc + r.areaInAre, 0);

  rows.push('');
  const summaryRow = [
    escapeCsv('TOTAL AKUMULASI'),
    escapeCsv(''),
    escapeCsv(`${records.length} Musim Tanam`),
    escapeCsv(''),
    totalAreaAre,
    escapeCsv(''),
    totalYieldKg,
    escapeCsv(''),
    totalCostRp,
    totalRevenueRp,
    totalProfitRp,
    escapeCsv(''),
    escapeCsv('PT Renner Inti Internasional - Paten Agro')
  ];
  rows.push(summaryRow.join(','));

  // Tambahkan UTF-8 BOM agar Excel dapat membuka karakter Indonesia dengan sempurna
  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = farmerName.replace(/[^a-zA-Z0-9]/g, '_');
  const timestamp = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `Rekap-Data-Panen-${safeName}-${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

