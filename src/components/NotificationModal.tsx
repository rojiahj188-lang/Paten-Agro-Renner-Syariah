import React, { useState } from 'react';
import {
  X,
  Bell,
  CheckCheck,
  AlertTriangle,
  Calendar,
  Cpu,
  CloudRain,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { NotificationItem } from '../types';
import {
  getNotifications,
  markNotificationAsRead,
  saveNotifications,
  addNotification,
  triggerDailyFertilizationBrowserNotification
} from '../utils/offlineStorage';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshUnread: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onRefreshUnread
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getNotifications());
  const [filter, setFilter] = useState<'all' | 'critical'>('all');

  if (!isOpen) return null;

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    setNotifications(updated);
    onRefreshUnread();
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    saveNotifications(updated);
    setNotifications(updated);
    onRefreshUnread();
  };

  const handleTriggerTestCriticalAlert = () => {
    const samples = [
      {
        title: '🚨 Peringatan Kritis Sensor: Kelembapan Tanah 32%',
        message: 'Kadar air tanah di Blok Barat turun tajam di bawah batas kritis (32%). Segera alirkan air irigasi untuk mencegah stres air pada tanaman!',
        type: 'sensor' as const,
        priority: 'kritis' as const
      },
      {
        title: '⚠️ Peringatan Kritis Hama & Jamur: Spora Bulai Terdeteksi',
        message: 'Laporan agronomist mendeteksi kelembapan tinggi malam hari memicu spora Peronosclerospora. Segera semprot Paten Imun 1 sachet per tangki 16L!',
        type: 'penyakit' as const,
        priority: 'kritis' as const
      },
      {
        title: '🌾 Jadwal Pemupukan HST 14: Anakan Maksimal',
        message: 'Hari ini saatnya semprot kasar 3 sachet Paten Gold per tangki 16-20 Liter untuk memperbanyak anakan produktif.',
        type: 'jadwal' as const,
        priority: 'normal' as const
      }
    ];

    const pick = samples[Math.floor(Math.random() * samples.length)];
    const created = addNotification(pick);
    setNotifications([created, ...notifications]);
    onRefreshUnread();

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(created.title, { body: created.message });
    }
  };

  const filteredNotifs = filter === 'critical'
    ? notifications.filter(n => n.priority === 'kritis')
    : notifications;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'jadwal':
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case 'sensor':
        return <Cpu className="w-4 h-4 text-blue-600" />;
      case 'penyakit':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'cuaca':
        return <CloudRain className="w-4 h-4 text-cyan-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm font-['Outfit']">
                Pusat Peringatan & Notifikasi
              </h3>
              <p className="text-[10px] text-slate-500">
                Pembaruan Kesehatan Tanaman & Jadwal Pemupukan
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters & Actions */}
        <div className="p-3 bg-white border-b border-slate-100 flex items-center justify-between gap-2 text-xs">
          <div className="flex gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold ${
                filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-2.5 py-1 rounded-lg font-bold ${
                filter === 'critical' ? 'bg-rose-600 text-white' : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              Kritis Saja ({notifications.filter(n => n.priority === 'kritis').length})
            </button>
          </div>

          <button
            onClick={handleMarkAllAsRead}
            className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Tandai Semua Dibaca</span>
          </button>
        </div>

        {/* List of Notifications */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100">
          {filteredNotifs.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Tidak ada notifikasi saat ini.
            </div>
          ) : (
            filteredNotifs.map((item) => (
              <div
                key={item.id}
                onClick={() => handleMarkAsRead(item.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  !item.isRead
                    ? item.priority === 'kritis'
                      ? 'bg-rose-50/70 border-rose-300 shadow-xs'
                      : 'bg-emerald-50/50 border-emerald-300'
                    : 'bg-white border-slate-200 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {getIcon(item.type)}
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{item.date}</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed pl-5">
                  {item.message}
                </p>
                {!item.isRead && (
                  <div className="mt-2 pl-5 flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>Klik untuk tandai selesai</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer trigger test */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={() => {
              triggerDailyFertilizationBrowserNotification(undefined, true);
              setNotifications(getNotifications());
              onRefreshUnread();
            }}
            className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-300" />
            <span>Kirim Pengingat Pemupukan Hari Ini</span>
          </button>

          <button
            onClick={handleTriggerTestCriticalAlert}
            className="py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-200" />
            <span>Simulasi Peringatan Kritis Sensor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
