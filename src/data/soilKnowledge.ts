import { SoilCondition, SoilInfo } from '../types';

export const SOIL_CONDITIONS: Record<SoilCondition, SoilInfo> = {
  sangat_asam: {
    condition: 'sangat_asam',
    phRange: 'pH < 5.3',
    phValue: 4.8,
    label: 'Sangat Masam (Kritis)',
    description: 'Tanah keras, keracunan Al & Fe tinggi, fosfat terikat kuat. Pupuk kimia granul mengendap dan tidak diserap tanaman.',
    nutrientAbsorptionRate: 0.30,
    patenAbsorptionRate: 0.95,
    color: '#ef4444'
  },
  asam: {
    condition: 'asam',
    phRange: 'pH 5.3 – 5.9',
    phValue: 5.5,
    label: 'Masam (Perlu Pembenah)',
    description: 'Aktivitas mikroba tanah rendah, penyerapan nitrogen dan kalium berkurang. Sangat membutuhkan bio-pembenah tanah Paten.',
    nutrientAbsorptionRate: 0.45,
    patenAbsorptionRate: 0.98,
    color: '#f97316'
  },
  agak_asam: {
    condition: 'agak_asam',
    phRange: 'pH 6.0 – 6.4',
    phValue: 6.2,
    label: 'Agak Masam (Mendekati Netral)',
    description: 'Kondisi cukup toleran namun efisiensi pupuk kimia granul masih bocor 35%. Nano Paten langsung diserap stomata daun.',
    nutrientAbsorptionRate: 0.65,
    patenAbsorptionRate: 1.0,
    color: '#eab308'
  },
  ideal: {
    condition: 'ideal',
    phRange: 'pH 6.5 – 7.0',
    phValue: 6.8,
    label: 'Subur & Optimal',
    description: 'Kondisi pH netral ideal. Kombinasi Paten Gold + Paten Imun memacu produktivitas anakan dan bobot panen maksimal.',
    nutrientAbsorptionRate: 0.85,
    patenAbsorptionRate: 1.0,
    color: '#10b981'
  }
};
