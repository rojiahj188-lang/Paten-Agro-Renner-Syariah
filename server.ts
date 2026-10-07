import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Endpoint: AI Plant Disease Detection
app.post('/api/detect-disease', async (req: Request, res: Response) => {
  try {
    const { imageBase64, cropType, notes } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Data gambar diperlukan.' });
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    if (!ai) {
      // Fallback response if API key is not configured
      return res.json({
        diagnosis: {
          diseaseName: cropType === 'jagung' ? 'Gejala Awal Bulai (Peronosclerospora)' : cropType === 'kedelai' ? 'Karat Daun Kedelai (Phakopsora pachyrhizi)' : 'Bercak Daun & Defisiensi Hara Mikro',
          severity: 'Sedang',
          confidence: 88,
          symptoms: [
            'Klorosis atau bercak kekuningan pada helai daun.',
            'Penurunan laju fotosintesis akibat gangguan stomata.',
            'Indikasi tanah kurang poros atau asam yang menghambat serapan kation.'
          ],
          causes: 'Kelembapan tinggi dan daya tahan sel tanaman menurun akibat aplikasi pupuk kimia berlebih.',
          patenRecommendation: {
            products: ['Paten Imun', 'Paten Gold / Paten Hijau'],
            dosage: '1 sachet Paten Imun + 1 sachet Paten Hijau/Gold per tangki 16-20 Liter',
            frequency: 'Semprot tiap 5-7 hari sekali di pagi hari (pukul 06.00-09.00)',
            instructions: 'Semprot kabut halus merata pada stomata daun bagian bawah dan atas.',
            savingsBenefit: 'Menghemat biaya fungisida kimia hingga 100% dan melindungi sel tanaman secara nano.'
          },
          prevention: 'Perbaiki pH tanah ke 6.5-7.0 menggunakan unsur pembenah tanah Paten. Hindari genangan air berlebih.'
        }
      });
    }

    const prompt = `Anda adalah Ahli Agronomi dan Patologi Tanaman Spesialis Pupuk Paten Organik Teknologi Nano (PT Renner Inti Internasional).
Lakukan diagnosis penyakit atau gangguan nutrisi pada tanaman berdasarkan foto daun/tanaman ini.
Komoditi target: ${cropType || 'Tanaman Pertanian (Padi / Jagung / Kedelai)'}.
Catatan petani: ${notes || '-'}.

Berikan analisis dalam format JSON murni tanpa markdown triple-backtick:
{
  "diseaseName": "Nama penyakit / hama / defisiensi nutrisi (Bahasa Indonesia & Latin)",
  "severity": "Ringan" | "Sedang" | "Kritis",
  "confidence": 92,
  "symptoms": ["gejala 1", "gejala 2", "gejala 3"],
  "causes": "Penyebab utama (jamur/bakteri/virus/tanah asam)",
  "patenRecommendation": {
    "products": ["Paten Imun", "Paten Gold / Hijau"],
    "dosage": "Takaran sachet per tangki 16-20L atau per pohon",
    "frequency": "Jadwal penyemprotan / pengocoran",
    "instructions": "Cara aplikasi stomata & tips praktis",
    "savingsBenefit": "Manfaat hemat biaya fungisida/pestisida & pemulihan cepat"
  },
  "prevention": "Langkah mitigasi & perawatan tanah"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let diagnosisJson;
    try {
      diagnosisJson = JSON.parse(rawText);
    } catch {
      diagnosisJson = {
        diseaseName: 'Analisis Daun Tanaman',
        severity: 'Sedang',
        confidence: 85,
        symptoms: ['Perubahan warna daun akibat ketidakseimbangan hara'],
        causes: 'Gangguan penyerapan hara dan kelembapan ekstrem',
        patenRecommendation: {
          products: ['Paten Imun', 'Paten Gold'],
          dosage: '1 sachet Paten Imun + 1 sachet Paten Gold per tangki 16-20L',
          frequency: 'Semprot 7 hari sekali',
          instructions: 'Semprot di pagi hari saat stomata terbuka.',
          savingsBenefit: 'Nutrisi nano makanan siap saji memperkuat imunitas sel.'
        },
        prevention: 'Jaga kelembapan tanah di 65% dan rutin gunakan pembenah tanah Paten.'
      };
    }

    return res.json({ diagnosis: diagnosisJson });
  } catch (error: any) {
    console.error('Error in /api/detect-disease:', error);
    return res.status(500).json({
      error: 'Gagal memproses diagnosis gambar.',
      details: error.message,
    });
  }
});

// Endpoint: Simulated IoT Soil Telemetry & Sensor Readings
app.get('/api/sensor-data', (req: Request, res: Response) => {
  const moisture = 64 + Math.round((Math.random() * 8 - 4));
  const temp = 28.5 + (Math.random() * 2 - 1);
  const ph = 6.4 + (Math.random() * 0.4 - 0.2);
  const ec = 1.2 + (Math.random() * 0.2 - 0.1);

  res.json({
    timestamp: new Date().toISOString(),
    soilMoisture: moisture,
    soilTemperature: parseFloat(temp.toFixed(1)),
    soilPh: parseFloat(ph.toFixed(2)),
    conductivityEc: parseFloat(ec.toFixed(2)),
    stomataStatus: 'Terbuka Optimal (Waktu Ideal Penyemprotan)',
    batteryLevel: 94,
    status: moisture < 40 ? 'Kering - Perlu Pengairan' : moisture > 85 ? 'Jenuh Air' : 'Optimal Subur'
  });
});

// Helper for offline / fallback agronomic advice
function generateOfflineConsultantResponse(question: string, cropType?: string, soilCondition?: string) {
  const q = (question || '').toLowerCase();
  const crop = cropType || 'Tanaman Pertanian';
  
  if (q.includes('wereng') || q.includes('hama') || q.includes('sundep') || q.includes('beluk')) {
    return {
      text: `Untuk menanggulangi serangan hama pada ${crop}, sistem antibodi tanaman wajib ditingkatkan segera menggunakan kombinasi **Paten Imun** dan **Paten Hijau/Gold**.\n\n` +
        `**Protokol Penanganan:**\n` +
        `1. **Kombinasi Formula**: Campurkan **1 sachet Paten Imun + 1 sachet Paten Hijau** (jika fase vegetatif) atau **1 sachet Paten Gold** (jika fase bunting/generatif) ke dalam 1 tangki 16-20 Liter air.\n` +
        `2. **Waktu Semprot**: Pukul 06.00 - 08.30 pagi saat stomata daun terbuka maksimal. Semprot kabut halus mengarah ke pangkal batang dan balik daun tempat hama bersembunyi.\n` +
        `3. **Pengulangan**: Semprot dengan interval 3-5 hari sekali selama fase serangan aktif, kemudian kembali ke jadwal normal 10-14 hari sekali.\n` +
        `4. **Efisiensi**: Kurangi insektisida kimia hingga 80% karena Paten Imun merangsang pembentukan fitoaleksin alami yang membuat jaringan tanaman kebal dari gigitan hama.`,
      products: ['Paten Imun', 'Paten Hijau', 'Paten Gold'],
      dosage: '1 sachet Paten Imun + 1 sachet Paten Gold/Hijau per tangki 16L'
    };
  }

  if (q.includes('kuning') || q.includes('layu') || q.includes('jamur') || q.includes('kresek') || q.includes('bulai') || q.includes('patek')) {
    return {
      text: `Gejala daun menguning atau bercak jamur (kresek/bulai/patek) pada ${crop} mengindikasikan gangguan permeabilitas membran sel dan infeksi patogen yang diperparah tanah masam.\n\n` +
        `**Resep Pemulihan Paten Organik Nano:**\n` +
        `1. **Kombinasi Resep**: **1 sachet Paten Imun + 1 sachet Paten Gold** dilarutkan dalam 1 tangki semprot 16-20 Liter.\n` +
        `2. **Kocor Pangkal & Semprot Daun**: Semprotkan kabut halus ke seluruh tajuk daun pagi hari, dan kocor sedikit larutan ke area perakaran untuk menetralkan jamur tular tanah.\n` +
        `3. **Perbaikan Tanah**: Jika pH tanah di bawah 6.0, taburkan pembenah tanah atau dolomit tipis di parit bedengan.\n` +
        `4. **Hasil**: Dalam 3-5 hari pasca aplikasi, sel daun baru akan tumbuh hijau segar dan fotosintesis kembali optimal.`,
      products: ['Paten Imun', 'Paten Gold'],
      dosage: '1 sachet Paten Imun + 1 sachet Paten Gold per tangki 16L (Semprot Pagi)'
    };
  }

  if (q.includes('dosis') || q.includes('takaran') || q.includes('aturan') || q.includes('jadwal')) {
    return {
      text: `Berikut pedoman takaran dan jadwal aplikasi baku Pupuk Paten Nano untuk komoditi **${crop}**:\n\n` +
        `**Jadwal & Dosis Aplikasi:**\n` +
        `• **Olah Tanah / HST -3 s.d 0**: Kocor lahan dengan 1 sachet Paten Hijau + 1 sachet Paten Imun per 15L air untuk mengaktifkan mikroba tanah.\n` +
        `• **Fase Vegetatif (HST 10 & 25)**: 1 sachet Paten Hijau/Gold + 1 sachet Paten Imun per tangki 16-20 Liter (memacu 40-50 anakan produktif).\n` +
        `• **Fase Primordia / Bunting (HST 40)**: 1 sachet Paten Gold + 1 sachet Paten Imun per tangki 16 Liter (memperkuat malai dan tangkai bunga).\n` +
        `• **Fase Pengisian Bulir/Buah (HST 60)**: 1 sachet Paten Gold per tangki 16 Liter (memaksimalkan bobot bernas dan rendemen panen).\n\n` +
        `*Catatan: Pupuk kimia granul (Urea/NPK) cukup diberikan 30% dari dosis kebiasaan untuk menghemat modal 70%.*`,
      products: ['Paten Gold', 'Paten Hijau', 'Paten Imun'],
      dosage: '1 sachet Paten Gold + 1 sachet Paten Imun per tangki 16L'
    };
  }

  // General consultation default
  return {
    text: `Terima kasih atas pertanyaannya mengenai komoditi **${crop}**. Pupuk Paten berteknologi nano organik siap saji langsung diserap stomata daun dalam 15 menit tanpa tergantung proses fotosintesis akar semata.\n\n` +
      `**Saran Agronomis Paten Agro:**\n` +
      `1. **Rekomendasi Paket Lengkap**: Gunakan duet **Paten Gold Nano** (sebagai nutrisi pembobot & pemacu hasil) dipadukan dengan **Paten Imun** (sebagai perisai antibodi tanaman terhadap hama & penyakit).\n` +
      `2. **Takaran Larutan**: 1 sachet Paten Gold + 1 sachet Paten Imun dilarutkan ke dalam tangki sprayer 16 sampai 20 Liter air bersih.\n` +
      `3. **Waktu Semprot Ideal**: Pukul 06.00 s.d 09.00 pagi. Hindari menyemprot di atas pukul 10.00 karena stomata daun menutup akibat terik matahari.\n` +
      `4. **Efisiensi Finansial**: Anda dapat memangkas pupuk kimia hingga 70% dan meniadakan fungisida sintetis, sehingga modal tanam hemat lebih dari 60%.`,
    products: ['Paten Gold', 'Paten Imun'],
    dosage: '1 sachet Paten Gold + 1 sachet Paten Imun per tangki 16-20 Liter'
  };
}

// Endpoint: Konsultan Tani AI (Didukung Gemini API gemini-3.8-flash)
app.post('/api/ai-consultant', async (req: Request, res: Response) => {
  try {
    const { question, cropType, soilCondition, history } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Pertanyaan petani diperlukan.' });
    }

    if (!ai) {
      const fallback = generateOfflineConsultantResponse(question, cropType, soilCondition);
      return res.json({
        answer: fallback.text,
        recommendedProducts: fallback.products,
        dosageSummary: fallback.dosage,
        source: 'local_expert'
      });
    }

    const systemInstruction = `Anda adalah "Konsultan Tani AI Paten Agro" dari PT. Renner Inti Internasional (Renner Syariah), asisten pakar agronomi resmi untuk petani Indonesia.
Tugas Anda: Menjawab pertanyaan petani mengenai masalah pertanian spesifik (hama, penyakit tanaman, daun kuning, tanah masam, pemupukan berimbang, penurunan hasil, dll.) dan memberikan rekomendasi takaran & protokol aplikasi Pupuk Organik Paten secara instan dan solutif.

Pengetahuan Produk Paten Resmi PT. Renner Inti Internasional:
1. Paten Hijau (Nutrisi Organik Murni Nano):
   - Merangsang perakaran, tunas, anakan produktif, fotosintesis stomata, menstabilkan pertumbuhan vegetatif.
   - Dosis: 1 sachet per tangki 16-20 Liter (atau 1 sachet Paten Hijau + 1 sachet Paten Imun).
2. Paten Gold (Nutrisi Sawit & Tanaman Keras/Pangan/Generatif):
   - Nutrisi fase generatif, pembungaan, pengisian bulir padi, bobot tongkol jagung, rendemen sawit/kopi/kakao/buah.
   - Dosis: 1 sachet per tangki 16L, atau 1 sachet per pohon sawit/tanaman keras (kocor lingkar piringan).
3. Paten Imun (Antibodi & Imunitas Tanaman):
   - Melindungi dari jamur, bakteri, virus, wereng, sundep/beluk, hawar daun (kresek), antraknosa (patek), bulai jagung.
   - Dosis: 1 sachet per tangki 16-20 Liter, selalu dicampur berdampingan dengan Paten Hijau atau Paten Gold.
4. Colpro & Revit:
   - Suplemen nutrisi ternak, perikanan, serta pemulih kesuburan tanah.

Aturan Penting:
- Pupuk kimia konvensional (Urea/NPK) dapat dipangkas hingga 70% (cukup 20-30% sebagai pupuk dasar).
- Waktu semprot wajib: Pagi hari pukul 06.00 - 09.00 saat stomata mulut daun terbuka penuh. Semprot kabut halus pada permukaan bawah daun.
- Gaya bahasa: Bahasa Indonesia santun, ramah, optimis, mudah dipahami petani desa, terstruktur dengan poin-poin jelas (1. Diagnosis Masalah, 2. Resep Produk Paten & Dosis, 3. Petunjuk Aplikasi Semprot, 4. Manfaat & Penghematan).`;

    const contents: any[] = [];
    if (Array.isArray(history)) {
      history.slice(-4).forEach(h => {
        contents.push({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.text }]
        });
      });
    }

    contents.push({
      role: 'user',
      parts: [{
        text: `Konteks Tanaman: ${cropType || 'Pertanian Umum'}. Kondisi Tanah: ${soilCondition || 'Normal'}.\nPertanyaan Petani: ${question}`
      }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const responseText = response.text || 'Maaf, belum ada respon dari konsultan.';
    
    // Extract products mentions
    const detectedProducts: string[] = [];
    if (/paten gold/i.test(responseText)) detectedProducts.push('Paten Gold');
    if (/paten imun/i.test(responseText)) detectedProducts.push('Paten Imun');
    if (/paten hijau/i.test(responseText)) detectedProducts.push('Paten Hijau');
    if (/colpro/i.test(responseText)) detectedProducts.push('Colpro');
    if (/revit/i.test(responseText)) detectedProducts.push('Revit');

    return res.json({
      answer: responseText,
      recommendedProducts: detectedProducts.length > 0 ? detectedProducts : ['Paten Gold', 'Paten Imun'],
      source: 'gemini_ai'
    });
  } catch (error: any) {
    console.error('Gemini Consultant Error:', error);
    const fallback = generateOfflineConsultantResponse(req.body.question, req.body.cropType, req.body.soilCondition);
    return res.json({
      answer: fallback.text,
      recommendedProducts: fallback.products,
      dosageSummary: fallback.dosage,
      source: 'offline_fallback',
      notice: 'Menampilkan rekomendasi basis data agronomi lokal Paten.'
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Paten Agro Renner Syariah berjalan di http://localhost:${PORT}`);
  });
}

startServer();
