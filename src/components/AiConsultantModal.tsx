import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ArrowRight,
  Sprout,
  ShieldCheck,
  Package,
  Layers,
  Copy,
  Check,
  RefreshCw,
  HelpCircle,
  Calendar,
  Calculator,
  MessageSquare
} from 'lucide-react';
import { CommodityId } from '../types';

interface AiConsultantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCropType?: string;
  onApplyToCalculator?: (commodityId: CommodityId) => void;
  onGoToSchedule?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  recommendedProducts?: string[];
  dosageSummary?: string;
  source?: string;
}

export const AiConsultantModal: React.FC<AiConsultantModalProps> = ({
  isOpen,
  onClose,
  initialCropType = 'Padi Sawah',
  onApplyToCalculator,
  onGoToSchedule
}) => {
  const [selectedCrop, setSelectedCrop] = useState<string>(initialCropType);
  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Assalamu'alaikum & Salam Tani Makmur! Saya **Konsultan Tani AI Paten Agro**.\n\n` +
        `Ada kendala pertanian atau pertanyaan dosis pupuk apa yang bisa saya bantu hari ini? Tanyakan seputar:\n` +
        `• Hama & penyakit tanaman (wereng, kresek, bulai, patek)\n` +
        `• Daun menguning / tanaman kerdil\n` +
        `• Takaran semprot stomata & kocor Paten Gold/Imun/Hijau\n` +
        `• Strategi pemangkasan pupuk kimia hingga 70%`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      recommendedProducts: ['Paten Gold', 'Paten Imun', 'Paten Hijau']
    }
  ]);

  const quickQuestions = [
    { label: '🌾 Daun Menguning & Kerdil', q: 'Daun tanaman padi saya menguning di umur 20 HST, apa resep pemulihan Paten?' },
    { label: '🐛 Hama Wereng & Jamur', q: 'Hama wereng dan jamur kresek mulai menyerang, bagaimana dosis semprot Paten Imun?' },
    { label: '🌽 Cegah Bulai Jagung', q: 'Bagaimana cara mencegah bulai pada jagung dan memacu tongkol bernas dengan Paten?' },
    { label: '🧅 Besarkan Umbi Bawang', q: 'Berapa takaran Paten Gold untuk membesarkan umbi bawang merah agar padat dan berbobot?' },
    { label: '🧪 Tanah Masam pH 5.2', q: 'Tanah sawah saya masam dengan pH 5.2, bagaimana aturan kocor dan semprot Paten?' },
    { label: '🌴 Dosis Sawit Buah Lebat', q: 'Bagaimana dosis kocor Paten Gold untuk kelapa sawit agar tandan buah lebat dan berat?' }
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendQuestion = async (questionText?: string) => {
    const textToSend = (questionText || inputQuestion).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          cropType: selectedCrop,
          soilCondition: 'Tergantung analisis lapangan'
        })
      });

      if (!res.ok) throw new Error('Respon server gagal');
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.answer || 'Mohon maaf, belum ada jawaban.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        recommendedProducts: data.recommendedProducts || ['Paten Gold', 'Paten Imun'],
        dosageSummary: data.dosageSummary,
        source: data.source
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.warn('AI Consultant fetch error, using local expert fallback:', err);
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `**Rekomendasi Agronomis Paten Agro untuk ${selectedCrop}:**\n\n` +
          `1. **Kombinasi Utama**: Gunakan **1 sachet Paten Gold + 1 sachet Paten Imun** per tangki semprot 16-20 Liter.\n` +
          `2. **Waktu Semprot Stomata**: Pukul 06.00 - 09.00 pagi saat stomata daun terbuka penuh.\n` +
          `3. **Penghematan Kimia**: Pangkas pupuk kimia granul 70%, nutrisi nano langsung diserap jaringan tanaman dalam 15 menit.\n` +
          `4. **Pemulihan**: Ulangi penyemprotan tiap 7 hari sekali untuk hasil optimal.`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        recommendedProducts: ['Paten Gold', 'Paten Imun']
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-emerald-500/30 flex flex-col max-h-[92vh] overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between border-b border-emerald-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg border border-emerald-300/40">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg font-['Outfit'] tracking-tight">
                  Konsultan Tani AI
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                  Gemini API
                </span>
              </div>
              <p className="text-[11px] text-emerald-200">
                Tanya Jawab Masalah Hama, Dosis & Solusi Paten Organik Nano
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Commodity Context Bar */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>Konteks Tanaman:</span>
          </div>

          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="Padi Sawah">🌾 Padi Sawah</option>
            <option value="Jagung Hibrida">🌽 Jagung Hibrida</option>
            <option value="Bawang Merah">🧅 Bawang Merah</option>
            <option value="Cabai Rawit / Merah">🌶️ Cabai Rawit / Merah</option>
            <option value="Kelapa Sawit">🌴 Kelapa Sawit</option>
            <option value="Kacang Kedelai">🌱 Kacang Kedelai</option>
            <option value="Tembakau">🍂 Tembakau</option>
          </select>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 text-xs leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-emerald-700 text-white rounded-tr-none'
                    : 'bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">
                  {msg.text}
                </div>

                {/* Recommended Products Badges */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Produk Solusi:
                    </span>
                    {msg.recommendedProducts.map((p, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer Toolbar on AI Messages */}
                {msg.sender === 'ai' && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                    <span className="font-mono">{msg.timestamp}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 font-bold transition-colors"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? 'Tersalin' : 'Salin Resep'}</span>
                      </button>

                      {onGoToSchedule && (
                        <button
                          onClick={() => {
                            onClose();
                            onGoToSchedule();
                          }}
                          className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1 font-bold transition-colors"
                        >
                          <Calendar className="w-3 h-3 text-emerald-600" />
                          <span>Buka Kalender</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2.5 text-xs text-slate-500">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center animate-spin">
                <RefreshCw className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="animate-pulse font-medium">Konsultan Tani AI sedang menganalisis solusi Paten...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
            Pertanyaan Cepat Petani:
          </p>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuestion(q.q)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:border-emerald-300 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap font-bold transition-all shrink-0 active:scale-95 shadow-2xs"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question Input Box */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuestion();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder={`Tulis pertanyaan Anda untuk ${selectedCrop}... (misal: daun keriting, dosis tangki)`}
              disabled={isLoading}
              className="flex-1 py-2.5 px-3.5 text-xs rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            <button
              type="submit"
              disabled={!inputQuestion.trim() || isLoading}
              className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold transition-all shadow-md active:scale-95 shrink-0 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
