/**
 * PATEN AGRO RENNER SYARIAH - GOOGLE APPS SCRIPT BACKEND
 * Pengembang: Husni, S. Kom. I. (Member Renner Syariah)
 * PT. Renner Inti Internasional
 * Sertifikasi: DSN-MUI No. 012.161.01/DSN-MUI/1X/2023 • Kementan RI No. 02.02.2022.763
 * 
 * File ini berfungsi sebagai backend controller untuk deployment Google Apps Script Web App.
 * Dapat dihubungkan langsung ke Google Sheets sebagai database cloud tanpa biaya server.
 */

// Konfigurasi Nama Spreadsheet Default
var SPREADSHEET_NAME = "Database Paten Agro Renner Syariah";

/**
 * Entry point HTTP GET untuk Web App Google Apps Script
 */
function doGet(e) {
  try {
    var template = HtmlService.createTemplateFromFile('Index');
    
    // Inject konfigurasi awal ke template
    template.appConfig = {
      appName: "Paten Agro Renner Syariah",
      version: "2.5.0",
      developer: "Husni, S. Kom. I.",
      developerTitle: "Member Renner Syariah",
      legalMui: "DSN-MUI: 012.161.01/DSN-MUI/1X/2023",
      legalKementan: "Kementan RI: 02.02.2022.763",
      regions: [
        "Lombok Barat",
        "Lombok Tengah",
        "Lombok Utara",
        "Lombok Timur",
        "Sumbawa Barat",
        "Sumbawa Besar",
        "Dompu",
        "Bima"
      ]
    };

    return template.evaluate()
      .setTitle('Paten Agro Renner Syariah - Pupuk Organik Nano')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  } catch (err) {
    return HtmlService.createHtmlOutput('<h3>Terjadi kesalahan saat memuat aplikasi:</h3><p>' + err.toString() + '</p>');
  }
}

/**
 * Entry point HTTP POST untuk webhook sinkronisasi eksternal
 */
function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    var action = postData.action;
    var result = {};

    switch (action) {
      case 'sync_all':
        result = syncAllData(postData.data);
        break;
      case 'save_harvest':
        result = saveHarvestRecord(postData.record);
        break;
      case 'save_plot':
        result = saveLandPlot(postData.plot);
        break;
      case 'save_task':
        result = saveDailyTask(postData.task);
        break;
      default:
        result = { success: false, message: 'Action tidak dikenal' };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Mendapatkan atau membuat Spreadsheet Database otomatis
 */
function getDatabaseSpreadsheet() {
  var props = PropertiesService.getScriptProperties();
  var sheetId = props.getProperty('SPREADSHEET_ID');
  var ss;

  if (sheetId) {
    try {
      ss = SpreadsheetApp.openById(sheetId);
      return ss;
    } catch (e) {
      // ID lama mungkin tidak valid, buat baru
    }
  }

  // Cek apakah file sudah ada di Drive root
  var files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (files.hasNext()) {
    var file = files.next();
    ss = SpreadsheetApp.open(file);
  } else {
    // Buat spreadsheet baru
    ss = SpreadsheetApp.create(SPREADSHEET_NAME);
    initSpreadsheetStructure(ss);
  }

  props.setProperty('SPREADSHEET_ID', ss.getId());
  return ss;
}

/**
 * Inisialisasi struktur sheet dan header tabel
 */
function initSpreadsheetStructure(ss) {
  // 1. Sheet Lahan Petani NTB
  var plotSheet = ss.getSheetByName('Lahan_Petani_NTB') || ss.insertSheet('Lahan_Petani_NTB');
  if (plotSheet.getLastRow() === 0) {
    plotSheet.appendRow([
      'ID', 'Nama Petani', 'Wilayah (Kab/Kota)', 'Kecamatan', 'Komoditi', 
      'Luas (Are)', 'pH Tanah', 'Latitude', 'Longitude', 'Status Rekomendasi Paten', 'Tanggal Ditambahkan'
    ]);
    plotSheet.getRange(1, 1, 1, 11).setBackground('#15803d').setFontColor('#ffffff').setFontWeight('bold');

    // Data Awal Presisi Wilayah NTB
    var defaultPlots = [
      ['PLT-001', "Lalu Mas'ud", 'Lombok Barat', 'Narmada', 'Padi Sawah', 25, 6.2, -8.6833, 116.1333, 'Paket Paten Hijau + Gold (Rendeng)', new Date()],
      ['PLT-002', 'H. Baiq Mulyani', 'Lombok Tengah', 'Praya Timur', 'Tembakau Virginia', 35, 5.7, -8.7000, 116.2833, 'Paten Imun + Pembenah Tanah pH Rendah', new Date()],
      ['PLT-003', 'Amaq Rohani', 'Lombok Utara', 'Bayan', 'Jagung Hibrida', 40, 6.4, -8.3500, 116.1667, 'Paten Hijau Vegetatif + Gold Generatif', new Date()],
      ['PLT-004', 'Dae Ruslan', 'Bima', 'Woha', 'Bawang Merah', 20, 6.5, -8.4500, 118.7333, 'Paket Paten Bawang Merah Bima Anti-Layu', new Date()],
      ['PLT-005', 'Muhammad Syahrir', 'Dompu', 'Kempo', 'Jagung Hibrida', 50, 6.1, -8.5333, 118.4667, 'Paten Gold Dosis Jagung Food Estate', new Date()],
      ['PLT-006', 'Drs. H. Syamsuddin', 'Sumbawa Besar', 'Utan', 'Padi Gogo', 30, 6.3, -8.5000, 117.4333, 'Paten Imun Tahan Hama Penggerek Batang', new Date()],
      ['PLT-007', 'Abdul Gani', 'Sumbawa Barat', 'Taliwang', 'Padi Sawah', 18, 6.0, -8.7500, 116.8500, 'Pola Paten Nano Hemat Kimia 75%', new Date()]
    ];
    defaultPlots.forEach(function(p) { plotSheet.appendRow(p); });
  }

  // 2. Sheet Catatan Panen Lapangan
  var harvestSheet = ss.getSheetByName('Catatan_Panen') || ss.insertSheet('Catatan_Panen');
  if (harvestSheet.getLastRow() === 0) {
    harvestSheet.appendRow([
      'ID', 'Tanggal', 'Musim Tanam', 'Nama Komoditi', 'Luas (Are)', 
      'Metode Pupuk', 'Hasil Panen (kg)', 'Biaya Operasional (Rp)', 'Pendapatan (Rp)', 'Laba Bersih (Rp)', 'Catatan Lapangan'
    ]);
    harvestSheet.getRange(1, 1, 1, 11).setBackground('#047857').setFontColor('#ffffff').setFontWeight('bold');

    var defaultHarvest = [
      ['HV-001', '2026-03-15', 'Musim Rendeng MT-1 2026', 'Padi Sawah Inpari 32', 20, 'Paten Nano', 1680, 480000, 11424000, 10944000, 'Gabah padat bernas, bebas patah leher (blas) berkat Paten Imun'],
      ['HV-002', '2025-11-20', 'Musim Gadu 2025', 'Padi Sawah IR-64', 20, 'Kimia Konvensional', 1100, 1450000, 7480000, 6030000, 'Terserang sundep & keasaman tanah drop ke pH 5.2']
    ];
    defaultHarvest.forEach(function(h) { harvestSheet.appendRow(h); });
  }

  // 3. Sheet Forum Petani
  var forumSheet = ss.getSheetByName('Forum_Diskusi') || ss.insertSheet('Forum_Diskusi');
  if (forumSheet.getLastRow() === 0) {
    forumSheet.appendRow(['ID', 'Nama Petani', 'Wilayah', 'Komoditi', 'Kategori', 'Judul Diskusi', 'Isi Pesan', 'Jumlah Suka', 'Tanggal']);
    forumSheet.getRange(1, 1, 1, 9).setBackground('#0f766e').setFontColor('#ffffff').setFontWeight('bold');

    forumSheet.appendRow([
      'FRM-001', "Lalu Mas'ud", 'Lombok Barat', 'Padi Sawah', 'pengalaman', 
      'Hasil Panen Padi Narmada Meningkat 40% dengan Paten Gold',
      'Alhamdulillah setelah 3 kali semprot Paten Hijau dan 2 kali Paten Gold, anakan produktif mencapai 34 batang per rumpun. Penggunaan urea berkurang 70%.',
      12, new Date()
    ]);
  }

  // Hapus 'Sheet1' default jika ada
  var defaultSheet1 = ss.getSheetByName('Sheet1');
  if (defaultSheet1 && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet1); } catch (e) {}
  }
}

/**
 * Mengambil semua data untuk inisialisasi awal aplikasi client (1 round-trip)
 */
function getInitialData() {
  try {
    var ss = getDatabaseSpreadsheet();

    // 1. Ambil Titik Lahan
    var plotSheet = ss.getSheetByName('Lahan_Petani_NTB');
    var plots = [];
    if (plotSheet && plotSheet.getLastRow() > 1) {
      var plotRows = plotSheet.getRange(2, 1, plotSheet.getLastRow() - 1, 11).getValues();
      plots = plotRows.map(function(r) {
        return {
          id: r[0],
          farmerName: r[1],
          region: r[2],
          district: r[3],
          commodityName: r[4],
          areaInAre: Number(r[5]),
          soilPh: Number(r[6]),
          latitude: Number(r[7]),
          longitude: Number(r[8]),
          recommendation: r[9],
          dateAdded: r[10] ? r[10].toString() : ''
        };
      });
    }

    // 2. Ambil Catatan Panen
    var harvestSheet = ss.getSheetByName('Catatan_Panen');
    var harvests = [];
    if (harvestSheet && harvestSheet.getLastRow() > 1) {
      var harvestRows = harvestSheet.getRange(2, 1, harvestSheet.getLastRow() - 1, 11).getValues();
      harvests = harvestRows.map(function(r) {
        return {
          id: r[0],
          date: r[1] ? r[1].toString().split('T')[0] : '',
          seasonName: r[2],
          commodityName: r[3],
          areaInAre: Number(r[4]),
          method: r[5],
          yieldKg: Number(r[6]),
          costRp: Number(r[7]),
          revenueRp: Number(r[8]),
          profitRp: Number(r[9]),
          notes: r[10]
        };
      });
    }

    // 3. Ambil Forum Diskusi
    var forumSheet = ss.getSheetByName('Forum_Diskusi');
    var forums = [];
    if (forumSheet && forumSheet.getLastRow() > 1) {
      var forumRows = forumSheet.getRange(2, 1, forumSheet.getLastRow() - 1, 9).getValues();
      forums = forumRows.map(function(r) {
        return {
          id: r[0],
          farmerName: r[1],
          region: r[2],
          commodity: r[3],
          category: r[4],
          title: r[5],
          message: r[6],
          likes: Number(r[7]),
          date: r[8] ? r[8].toString() : ''
        };
      });
    }

    return {
      success: true,
      plots: plots,
      harvests: harvests,
      forums: forums,
      syncTime: Utilities.formatDate(new Date(), "GMT+8", "yyyy-MM-dd HH:mm:ss") + " WITA",
      spreadsheetUrl: ss.getUrl()
    };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Menyimpan catatan panen baru ke Google Sheets
 */
function saveHarvestRecord(record) {
  try {
    var ss = getDatabaseSpreadsheet();
    var sheet = ss.getSheetByName('Catatan_Panen') || ss.insertSheet('Catatan_Panen');
    var id = record.id || ('HV-' + Utilities.formatDate(new Date(), "GMT+8", "yyyyMMdd-HHmmss"));

    sheet.appendRow([
      id,
      record.date || new Date().toISOString().split('T')[0],
      record.seasonName || 'Musim Tanam',
      record.commodityName || 'Padi Sawah',
      Number(record.areaInAre) || 1,
      record.method || 'Paten Nano',
      Number(record.yieldKg) || 0,
      Number(record.costRp) || 0,
      Number(record.revenueRp) || 0,
      Number(record.profitRp) || 0,
      record.notes || '-'
    ]);

    return { success: true, id: id };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Menyimpan titik lahan baru ke Google Sheets
 */
function saveLandPlot(plot) {
  try {
    var ss = getDatabaseSpreadsheet();
    var sheet = ss.getSheetByName('Lahan_Petani_NTB') || ss.insertSheet('Lahan_Petani_NTB');
    var id = plot.id || ('PLT-' + Utilities.formatDate(new Date(), "GMT+8", "yyyyMMdd-HHmmss"));

    sheet.appendRow([
      id,
      plot.farmerName || 'Petani Mitra',
      plot.region || 'Lombok Barat',
      plot.district || 'Kecamatan',
      plot.commodityName || 'Padi Sawah',
      Number(plot.areaInAre) || 10,
      Number(plot.soilPh) || 6.5,
      Number(plot.latitude) || -8.5,
      Number(plot.longitude) || 116.5,
      plot.recommendation || 'Paket Pupuk Paten Nano',
      new Date()
    ]);

    return { success: true, id: id };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Menyimpan postingan forum baru ke Google Sheets
 */
function saveForumPost(post) {
  try {
    var ss = getDatabaseSpreadsheet();
    var sheet = ss.getSheetByName('Forum_Diskusi') || ss.insertSheet('Forum_Diskusi');
    var id = post.id || ('FRM-' + Utilities.formatDate(new Date(), "GMT+8", "yyyyMMdd-HHmmss"));

    sheet.appendRow([
      id,
      post.farmerName || 'Petani Anonim',
      post.region || 'NTB',
      post.commodity || 'Padi Sawah',
      post.category || 'tips',
      post.title || 'Diskusi Baru',
      post.message || '',
      0,
      new Date()
    ]);

    return { success: true, id: id };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Menyinkronkan seluruh array data offline ke Google Sheets
 */
function syncAllData(data) {
  try {
    var savedHarvests = 0;
    var savedPlots = 0;

    if (data.harvests && Array.isArray(data.harvests)) {
      data.harvests.forEach(function(h) {
        saveHarvestRecord(h);
        savedHarvests++;
      });
    }

    if (data.plots && Array.isArray(data.plots)) {
      data.plots.forEach(function(p) {
        saveLandPlot(p);
        savedPlots++;
      });
    }

    return {
      success: true,
      savedHarvests: savedHarvests,
      savedPlots: savedPlots,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * URL Google Spreadsheet aktif untuk dibuka pengguna
 */
function getSpreadsheetUrl() {
  return getDatabaseSpreadsheet().getUrl();
}
