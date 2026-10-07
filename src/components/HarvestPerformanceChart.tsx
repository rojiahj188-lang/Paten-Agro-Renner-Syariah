import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
  Sparkles,
  Info,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { HarvestRecord } from '../types';
import { formatRupiah, formatNumber } from '../utils/calculatorEngine';
import { exportHarvestRecordsToCSV } from '../utils/csvExport';

interface HarvestPerformanceChartProps {
  records: HarvestRecord[];
  onAddRecordClick?: () => void;
  targetYieldTonPerHa?: number;
}

export type ChartType = 'bar' | 'line' | 'financial';
export type MetricType = 'yieldKg' | 'productivityTonHa' | 'profitRp' | 'costRp';

export const HarvestPerformanceChart: React.FC<HarvestPerformanceChartProps> = ({
  records,
  onAddRecordClick,
  targetYieldTonPerHa
}) => {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [metric, setMetric] = useState<MetricType>('yieldKg');
  const [commodityFilter, setCommodityFilter] = useState<string>('all');
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(null);

  // Available commodity options from records
  const availableCommodities = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => set.add(r.commodityName.split('(')[0].trim()));
    return Array.from(set);
  }, [records]);

  // Sort chronologically (earliest to latest) for time-series trend
  const sortedRecords = useMemo(() => {
    return [...records]
      .filter(r => {
        if (commodityFilter === 'all') return true;
        return r.commodityName.toLowerCase().includes(commodityFilter.toLowerCase());
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [records, commodityFilter]);

  // Calculate stats for the selected dataset
  const chartStats = useMemo(() => {
    if (sortedRecords.length === 0) {
      return {
        avgPatenYield: 0,
        avgChemYield: 0,
        yieldGrowthPercent: 0,
        totalPatenProfit: 0,
        totalSavings: 0
      };
    }

    const patenList = sortedRecords.filter(r => r.method === 'Paten Nano');
    const chemList = sortedRecords.filter(r => r.method === 'Kimia Konvensional');

    const avgPatenYield = patenList.length > 0
      ? patenList.reduce((acc, r) => acc + (r.yieldKg / (r.areaInAre / 100)), 0) / patenList.length / 1000
      : 8.2;

    const avgChemYield = chemList.length > 0
      ? chemList.reduce((acc, r) => acc + (r.yieldKg / (r.areaInAre / 100)), 0) / chemList.length / 1000
      : 5.4;

    const yieldGrowthPercent = avgChemYield > 0
      ? Math.round(((avgPatenYield - avgChemYield) / avgChemYield) * 100)
      : 51;

    const totalPatenProfit = patenList.reduce((acc, r) => acc + r.profitRp, 0);

    return {
      avgPatenYield,
      avgChemYield,
      yieldGrowthPercent,
      totalPatenProfit
    };
  }, [sortedRecords]);

  // Helper: extract raw numeric value based on active metric
  const getMetricValue = (r: HarvestRecord): number => {
    switch (metric) {
      case 'yieldKg':
        return r.yieldKg;
      case 'productivityTonHa':
        return r.areaInAre > 0 ? (r.yieldKg / (r.areaInAre / 100)) / 1000 : 0;
      case 'profitRp':
        return r.profitRp;
      case 'costRp':
        return r.costRp;
      default:
        return r.yieldKg;
    }
  };

  const getMetricLabel = (val: number): string => {
    switch (metric) {
      case 'yieldKg':
        return `${formatNumber(Math.round(val))} kg`;
      case 'productivityTonHa':
        return `${val.toFixed(2)} Ton/Ha`;
      case 'profitRp':
      case 'costRp':
        return formatRupiah(val);
      default:
        return formatNumber(val);
    }
  };

  // Find max value for chart scaling
  const maxValue = useMemo(() => {
    if (sortedRecords.length === 0) return 100;
    const values = sortedRecords.map(r => {
      if (chartType === 'financial') {
        return Math.max(r.revenueRp, r.profitRp, r.costRp);
      }
      return getMetricValue(r);
    });
    if (metric === 'productivityTonHa' && targetYieldTonPerHa && targetYieldTonPerHa > 0) {
      values.push(targetYieldTonPerHa);
    }
    const max = Math.max(...values);
    return max <= 0 ? 100 : max * 1.15; // 15% top padding
  }, [sortedRecords, metric, chartType, targetYieldTonPerHa]);

  // Chart Dimensions
  const chartHeight = 220;
  const paddingBottom = 40;
  const paddingTop = 25;
  const usableHeight = chartHeight - paddingBottom - paddingTop;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
      {/* Chart Top Controls & Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold mb-1 border border-emerald-200 dark:border-emerald-800">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span>Visualisasi Tren Hasil Panen dari Waktu ke Waktu</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 font-['Outfit']">
            Grafik Performa Panen & Efisiensi Musim Tanam
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Perbandingan produktivitas pola Pupuk Paten Organik Nano vs Kimia Konvensional antar-musim tanam.
          </p>
        </div>

        {/* View Switches & CSV Export Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Type Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setChartType('bar')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                chartType === 'bar'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Grafik Batang Perbandingan per Musim"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Batang</span>
            </button>

            <button
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                chartType === 'line'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Grafik Garis Tren Progresi Waktu"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Tren Garis</span>
            </button>

            <button
              onClick={() => setChartType('financial')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                chartType === 'financial'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Perbandingan Finansial Laba vs Biaya"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Finansial</span>
            </button>
          </div>

          {/* Export to CSV Button */}
          <button
            onClick={() => exportHarvestRecordsToCSV(sortedRecords)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
            title="Ekspor Seluruh Riwayat Panen ke File CSV Spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">CSV Panen</span>
          </button>
        </div>
      </div>

      {/* Metric Selector & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Metric Pill Buttons (Disabled for financial comparison view) */}
        {chartType !== 'financial' ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-0.5">
              Metrik:
            </span>
            {[
              { id: 'yieldKg' as MetricType, label: '🌾 Total Hasil (kg)' },
              { id: 'productivityTonHa' as MetricType, label: '📈 Ton/Ha (Produktivitas)' },
              { id: 'profitRp' as MetricType, label: '💰 Laba Bersih (Rp)' },
              { id: 'costRp' as MetricType, label: '📉 Biaya Pupuk (Rp)' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMetric(m.id)}
                className={`px-2.5 py-1 rounded-lg font-bold border transition-all ${
                  metric === m.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Laba Bersih
            </span>
            <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <span className="w-3 h-3 rounded bg-blue-500 inline-block" /> Omzet Bruto
            </span>
            <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <span className="w-3 h-3 rounded bg-amber-500 inline-block" /> Biaya Input
            </span>
          </div>
        )}

        {/* Commodity Filter */}
        <div className="flex items-center gap-1.5 ml-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={commodityFilter}
            onChange={(e) => setCommodityFilter(e.target.value)}
            className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">Semua Komoditi</option>
            {availableCommodities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 Metric Progress Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
            Rata-rata Produktivitas Paten
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-200 font-['Outfit']">
              {chartStats.avgPatenYield.toFixed(1)} Ton/Ha
            </span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              (+{chartStats.yieldGrowthPercent}%)
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
            Pola Konvensional: {chartStats.avgChemYield.toFixed(1)} Ton/Ha
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
          <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider block">
            Akumulasi Keuntungan Paten
          </span>
          <p className="text-xl sm:text-2xl font-black text-blue-950 dark:text-blue-200 font-['Outfit'] mt-1">
            {formatRupiah(chartStats.totalPatenProfit)}
          </p>
          <span className="text-[10px] text-blue-700 dark:text-blue-400 font-medium">
            Surplus laba bersih berkat efisiensi pupuk 70%
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
            Kenaikan Hasil Panen
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-black text-amber-900 dark:text-amber-200 font-['Outfit']">
              +{chartStats.yieldGrowthPercent}%
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[10px] font-extrabold">
              Teknologi Nano
            </span>
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
            Stomata daun menyerap nutrisi siap saji 15 menit
          </span>
        </div>
      </div>

      {/* CHART CANVAS AREA */}
      {sortedRecords.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
          Belum ada catatan panen untuk filter yang dipilih. Silakan tambah data panen baru.
        </div>
      ) : (
        <div className="relative w-full bg-slate-50/60 dark:bg-slate-950/50 rounded-2xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          {/* Legend indicator above chart */}
          <div className="flex items-center justify-between text-[11px] mb-2 text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-slate-700 dark:text-slate-300">Pola Paten Nano</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="font-bold text-slate-700 dark:text-slate-300">Kimia Konvensional</span>
              </span>
              {targetYieldTonPerHa && targetYieldTonPerHa > 0 && metric === 'productivityTonHa' && chartType !== 'financial' && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-0.5 border-t-2 border-dashed border-amber-500" />
                  <span className="font-bold text-amber-600 dark:text-amber-400">Target ({targetYieldTonPerHa} Ton/Ha)</span>
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400">
              *Klik / sentuh batang grafik untuk melihat rincian
            </span>
          </div>

          {/* SVG Canvas for Charts */}
          <div className="w-full min-w-[500px]">
            <svg viewBox={`0 0 700 ${chartHeight}`} className="w-full h-auto overflow-visible">
              {/* Horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = paddingTop + usableHeight * (1 - ratio);
                const val = maxValue * ratio;
                return (
                  <g key={i}>
                    <line
                      x1="45"
                      y1={y}
                      x2="690"
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-800"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x="40"
                      y={y + 3}
                      textAnchor="end"
                      className="text-[9px] fill-slate-400 font-mono"
                    >
                      {metric === 'productivityTonHa'
                        ? `${val.toFixed(1)}T`
                        : metric === 'profitRp' || metric === 'costRp' || chartType === 'financial'
                        ? `${(val / 1000000).toFixed(1)}M`
                        : `${formatNumber(Math.round(val))}`}
                    </text>
                  </g>
                );
              })}

              {/* Target Yield Horizontal Reference Line */}
              {targetYieldTonPerHa && targetYieldTonPerHa > 0 && metric === 'productivityTonHa' && chartType !== 'financial' && (() => {
                const targetY = paddingTop + usableHeight * (1 - (targetYieldTonPerHa / maxValue));
                if (targetY < paddingTop - 5 || targetY > paddingTop + usableHeight + 5) return null;
                return (
                  <g className="transition-all duration-300">
                    <line
                      x1="45"
                      y1={targetY}
                      x2="690"
                      y2={targetY}
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                    />
                    <rect
                      x="600"
                      y={targetY - 11}
                      width="88"
                      height="18"
                      rx="5"
                      fill="#fef3c7"
                      stroke="#f59e0b"
                      strokeWidth="1"
                    />
                    <text
                      x="644"
                      y={targetY + 2}
                      textAnchor="middle"
                      className="text-[9px] font-black fill-amber-900 font-mono"
                    >
                      🎯 Target: {targetYieldTonPerHa} T/Ha
                    </text>
                  </g>
                );
              })()}

              {/* 1. BAR CHART VIEW */}
              {chartType === 'bar' && (
                <g>
                  {sortedRecords.map((rec, idx) => {
                    const count = sortedRecords.length;
                    const step = (690 - 65) / count;
                    const barWidth = Math.min(48, step * 0.65);
                    const x = 65 + idx * step + (step - barWidth) / 2;
                    const val = getMetricValue(rec);
                    const barHeight = Math.max(6, (val / maxValue) * usableHeight);
                    const y = paddingTop + usableHeight - barHeight;
                    const isPaten = rec.method === 'Paten Nano';
                    const isHovered = activeTooltipIndex === idx;

                    return (
                      <g
                        key={rec.id}
                        className="cursor-pointer transition-transform group"
                        onMouseEnter={() => setActiveTooltipIndex(idx)}
                        onMouseLeave={() => setActiveTooltipIndex(null)}
                        onClick={() => setActiveTooltipIndex(activeTooltipIndex === idx ? null : idx)}
                      >
                        {/* Interactive hover highlight zone */}
                        <rect
                          x={x - 4}
                          y={paddingTop}
                          width={barWidth + 8}
                          height={usableHeight}
                          fill="transparent"
                        />

                        {/* Bar Gradient Definition */}
                        <defs>
                          <linearGradient id={`barGradient-${rec.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop
                              offset="0%"
                              stopColor={isPaten ? '#10b981' : '#64748b'}
                              stopOpacity={isHovered ? 1 : 0.9}
                            />
                            <stop
                              offset="100%"
                              stopColor={isPaten ? '#047857' : '#334155'}
                              stopOpacity="1"
                            />
                          </linearGradient>
                        </defs>

                        {/* The Bar */}
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          rx="6"
                          fill={`url(#barGradient-${rec.id})`}
                          className={`transition-all duration-200 ${
                            isHovered ? 'filter drop-shadow-md brightness-110' : ''
                          }`}
                        />

                        {/* Value Label above Bar */}
                        <text
                          x={x + barWidth / 2}
                          y={y - 6}
                          textAnchor="middle"
                          className={`text-[9px] font-extrabold font-mono transition-opacity ${
                            isHovered
                              ? 'fill-emerald-600 dark:fill-emerald-400 opacity-100 font-bold scale-110'
                              : 'fill-slate-700 dark:fill-slate-300 opacity-90'
                          }`}
                        >
                          {getMetricLabel(val)}
                        </text>

                        {/* Season & Date Label at X-Axis */}
                        <text
                          x={x + barWidth / 2}
                          y={chartHeight - 20}
                          textAnchor="middle"
                          className="text-[9.5px] font-bold fill-slate-800 dark:fill-slate-200 truncate"
                        >
                          {rec.seasonName.slice(0, 14)}
                        </text>
                        <text
                          x={x + barWidth / 2}
                          y={chartHeight - 8}
                          textAnchor="middle"
                          className="text-[8px] fill-slate-400 font-mono"
                        >
                          {rec.date}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* 2. LINE TREND VIEW */}
              {chartType === 'line' && (
                <g>
                  {/* Build Smooth Line Path */}
                  {(() => {
                    const count = sortedRecords.length;
                    const step = (690 - 65) / count;
                    const points = sortedRecords.map((rec, idx) => {
                      const x = 65 + idx * step + step / 2;
                      const val = getMetricValue(rec);
                      const y = paddingTop + usableHeight - Math.max(6, (val / maxValue) * usableHeight);
                      return { x, y, rec, val, idx };
                    });

                    const pathD = points.reduce((acc, pt, i, arr) => {
                      if (i === 0) return `M ${pt.x} ${pt.y}`;
                      // Bezier curve smoothing
                      const prev = arr[i - 1];
                      const cpX1 = prev.x + (pt.x - prev.x) / 2;
                      const cpY1 = prev.y;
                      const cpX2 = prev.x + (pt.x - prev.x) / 2;
                      const cpY2 = pt.y;
                      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
                    }, '');

                    const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + usableHeight} L ${points[0].x} ${paddingTop + usableHeight} Z`;

                    return (
                      <>
                        {/* Area gradient under line */}
                        <defs>
                          <linearGradient id="lineAreaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d={areaD} fill="url(#lineAreaGradient)" />

                        {/* Trend Line */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          className="drop-shadow-sm"
                        />

                        {/* Interactive Points on Line */}
                        {points.map((pt) => {
                          const isPaten = pt.rec.method === 'Paten Nano';
                          const isHovered = activeTooltipIndex === pt.idx;

                          return (
                            <g
                              key={pt.rec.id}
                              className="cursor-pointer"
                              onMouseEnter={() => setActiveTooltipIndex(pt.idx)}
                              onMouseLeave={() => setActiveTooltipIndex(null)}
                              onClick={() => setActiveTooltipIndex(activeTooltipIndex === pt.idx ? null : pt.idx)}
                            >
                              {/* Outer ring */}
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={isHovered ? 8 : 5}
                                fill={isPaten ? '#10b981' : '#64748b'}
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="transition-all"
                              />

                              {/* Value badge */}
                              <text
                                x={pt.x}
                                y={pt.y - 10}
                                textAnchor="middle"
                                className={`text-[9px] font-extrabold font-mono ${
                                  isPaten ? 'fill-emerald-600 dark:fill-emerald-400' : 'fill-slate-600 dark:fill-slate-300'
                                }`}
                              >
                                {getMetricLabel(pt.val)}
                              </text>

                              {/* Season label at X-axis */}
                              <text
                                x={pt.x}
                                y={chartHeight - 20}
                                textAnchor="middle"
                                className="text-[9.5px] font-bold fill-slate-800 dark:fill-slate-200"
                              >
                                {pt.rec.seasonName.slice(0, 14)}
                              </text>
                              <text
                                x={pt.x}
                                y={chartHeight - 8}
                                textAnchor="middle"
                                className="text-[8px] fill-slate-400 font-mono"
                              >
                                {pt.rec.date}
                              </text>
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
                </g>
              )}

              {/* 3. FINANCIAL COMPARISON VIEW (DUAL/TRIPLE BARS) */}
              {chartType === 'financial' && (
                <g>
                  {sortedRecords.map((rec, idx) => {
                    const count = sortedRecords.length;
                    const step = (690 - 65) / count;
                    const groupWidth = Math.min(56, step * 0.75);
                    const subBarWidth = groupWidth / 3;
                    const groupX = 65 + idx * step + (step - groupWidth) / 2;

                    const profitH = Math.max(4, (rec.profitRp / maxValue) * usableHeight);
                    const revH = Math.max(4, (rec.revenueRp / maxValue) * usableHeight);
                    const costH = Math.max(4, (rec.costRp / maxValue) * usableHeight);

                    const profitY = paddingTop + usableHeight - profitH;
                    const revY = paddingTop + usableHeight - revH;
                    const costY = paddingTop + usableHeight - costH;

                    const isHovered = activeTooltipIndex === idx;

                    return (
                      <g
                        key={rec.id}
                        className="cursor-pointer group"
                        onMouseEnter={() => setActiveTooltipIndex(idx)}
                        onMouseLeave={() => setActiveTooltipIndex(null)}
                        onClick={() => setActiveTooltipIndex(activeTooltipIndex === idx ? null : idx)}
                      >
                        {/* Laba Bersih Bar */}
                        <rect
                          x={groupX}
                          y={profitY}
                          width={subBarWidth - 2}
                          height={profitH}
                          rx="3"
                          fill="#10b981"
                        />

                        {/* Omzet Bar */}
                        <rect
                          x={groupX + subBarWidth}
                          y={revY}
                          width={subBarWidth - 2}
                          height={revH}
                          rx="3"
                          fill="#3b82f6"
                        />

                        {/* Biaya Pupuk Bar */}
                        <rect
                          x={groupX + subBarWidth * 2}
                          y={costY}
                          width={subBarWidth - 2}
                          height={costH}
                          rx="3"
                          fill="#f59e0b"
                        />

                        {/* Label */}
                        <text
                          x={groupX + groupWidth / 2}
                          y={Math.min(profitY, revY, costY) - 5}
                          textAnchor="middle"
                          className="text-[8.5px] font-mono font-bold fill-emerald-600 dark:fill-emerald-400"
                        >
                          +{formatRupiah(rec.profitRp)}
                        </text>

                        {/* X-axis */}
                        <text
                          x={groupX + groupWidth / 2}
                          y={chartHeight - 20}
                          textAnchor="middle"
                          className="text-[9.5px] font-bold fill-slate-800 dark:fill-slate-200"
                        >
                          {rec.seasonName.slice(0, 14)}
                        </text>
                        <text
                          x={groupX + groupWidth / 2}
                          y={chartHeight - 8}
                          textAnchor="middle"
                          className="text-[8px] fill-slate-400 font-mono"
                        >
                          {rec.method === 'Paten Nano' ? 'Paten Nano' : 'Kimia'}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}
            </svg>
          </div>

          {/* Interactive Floating Tooltip Card */}
          {activeTooltipIndex !== null && sortedRecords[activeTooltipIndex] && (
            <div className="mt-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md animate-in fade-in zoom-in-95 duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
                  sortedRecords[activeTooltipIndex].method === 'Paten Nano' ? 'bg-emerald-600' : 'bg-slate-600'
                }`}>
                  {sortedRecords[activeTooltipIndex].method === 'Paten Nano' ? '🌿' : '🧪'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100">
                      {sortedRecords[activeTooltipIndex].seasonName}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      sortedRecords[activeTooltipIndex].method === 'Paten Nano'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {sortedRecords[activeTooltipIndex].method}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {sortedRecords[activeTooltipIndex].commodityName} • Luas: {sortedRecords[activeTooltipIndex].areaInAre} Are • Tanggal: {sortedRecords[activeTooltipIndex].date}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[9px] text-slate-400 block uppercase">Hasil Panen:</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 font-black">
                    {formatNumber(sortedRecords[activeTooltipIndex].yieldKg)} kg
                  </strong>
                </div>

                <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[9px] text-slate-400 block uppercase">Produktivitas:</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-black">
                    {((sortedRecords[activeTooltipIndex].yieldKg / (sortedRecords[activeTooltipIndex].areaInAre / 100)) / 1000).toFixed(2)} Ton/Ha
                  </strong>
                </div>

                <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[9px] text-slate-400 block uppercase">Biaya Input:</span>
                  <span className="text-amber-700 dark:text-amber-400 font-bold">
                    {formatRupiah(sortedRecords[activeTooltipIndex].costRp)}
                  </span>
                </div>

                <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[9px] text-slate-400 block uppercase">Laba Bersih:</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 font-black">
                    {formatRupiah(sortedRecords[activeTooltipIndex].profitRp)}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
