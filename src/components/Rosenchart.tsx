import React, { useState } from 'react';

// ==========================================
// 1. COMPARADOR DE BARRAS (Intereses Totales)
// ==========================================
interface BarItem {
  label: string;
  value: number;
  color: string;
  secondaryColor?: string;
}

interface RosenBarChartProps {
  data: BarItem[];
  title?: string;
  subtitle?: string;
  currencySymbol?: string;
}

export function RosenBarChart({ data, title, subtitle, currencySymbol = '$' }: RosenBarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = 200;
  const paddingBottom = 40;
  const paddingTop = 20;
  const totalHeight = chartHeight + paddingTop + paddingBottom;
  const barWidth = 60;
  const gap = 40;
  const totalWidth = data.length * (barWidth + gap) + gap;

  return (
    <div className="w-full bg-white/70 backdrop-blur-md border border-neutral-100 rounded-2xl p-6 shadow-sm">
      {title && (
        <div className="mb-4">
          <h4 className="text-sm font-bold text-neutral-900">{title}</h4>
          {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
        </div>
      )}

      <div className="relative flex justify-center items-end h-[260px] w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          className="w-full max-w-[400px] h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = paddingTop + chartHeight * (1 - pct);
            const val = (maxValue * pct).toFixed(0);
            return (
              <g key={i}>
                <line
                  x1={0}
                  y1={y}
                  x2={totalWidth}
                  y2={y}
                  stroke="#F3F4F6"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <text
                  x={5}
                  y={y - 4}
                  fill="#9CA3AF"
                  fontSize="9"
                  className="font-mono select-none"
                >
                  {currencySymbol}{val}
                </text>
              </g>
            );
          })}

          {/* Render Bars */}
          {data.map((item, idx) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            const x = gap + idx * (barWidth + gap);
            const y = paddingTop + (chartHeight - barHeight);
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer transition-all duration-300"
              >
                {/* Background glow when hovered */}
                <rect
                  x={x - 6}
                  y={paddingTop}
                  width={barWidth + 12}
                  height={chartHeight + 10}
                  fill={isHovered ? 'rgba(0,0,0,0.02)' : 'transparent'}
                  rx={8}
                  className="transition-colors duration-200"
                />

                {/* The Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 4)}
                  fill={item.color}
                  rx={6}
                  className="transition-all duration-500 ease-out origin-bottom"
                />

                {/* Top value badge when hovered or always visible */}
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  fill={isHovered ? '#A91D22' : '#4B5563'}
                  fontSize="10"
                  fontWeight={isHovered ? '700' : '500'}
                  className="font-mono transition-all duration-200"
                >
                  {currencySymbol}{item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </text>

                {/* X Axis Label */}
                <text
                  x={x + barWidth / 2}
                  y={totalHeight - 12}
                  textAnchor="middle"
                  fill="#374151"
                  fontSize="11"
                  fontWeight="600"
                  className="select-none"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating HTML Tooltip */}
        {hoveredIdx !== null && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-neutral-900/90 text-white backdrop-blur-md border border-neutral-800 rounded-lg p-2.5 shadow-lg text-xs font-mono z-10 transition-opacity">
            <span className="font-semibold block text-red-400">{data[hoveredIdx].label}</span>
            <span className="text-neutral-400 mt-1 block">
              Interés: <strong className="text-white">{currencySymbol}{data[hoveredIdx].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2. GRÁFICO DE LÍNEAS (Trayectorias de Ahorro / Saldos)
// ==========================================
interface LineSeries {
  name: string;
  data: number[]; // valores por período
  color: string;
}

interface RosenLineChartProps {
  series: LineSeries[];
  periods: number[];
  title?: string;
  subtitle?: string;
  yAxisLabel?: string;
  currencySymbol?: string;
}

export function RosenLineChart({ series, periods, title, subtitle, yAxisLabel, currencySymbol = '$' }: RosenLineChartProps) {
  const [activeDot, setActiveDot] = useState<{ seriesIdx: number; dotIdx: number; x: number; y: number } | null>(null);

  // Validaciones básicas
  if (!series || series.length === 0 || !periods || periods.length === 0) {
    return <div className="text-center text-xs text-neutral-400 py-6">Sin datos para graficar</div>;
  }

  const allValues = series.flatMap((s) => s.data);
  const maxValue = Math.max(...allValues, 100);
  const minValue = Math.min(...allValues, 0);
  const valueRange = maxValue - minValue;

  // Dimensiones del SVG
  const width = 500;
  const height = 240;
  const padding = { top: 30, right: 30, bottom: 40, left: 60 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Generar coordenadas X e Y
  const getX = (index: number) => {
    if (periods.length <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (periods.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return padding.top + chartHeight - ((val - minValue) / valueRange) * chartHeight;
  };

  return (
    <div className="w-full bg-white/70 backdrop-blur-md border border-neutral-100 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div>
          {title && <h4 className="text-sm font-bold text-neutral-900">{title}</h4>}
          {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
        </div>
        
        {/* Leyenda */}
        <div className="flex flex-wrap gap-3">
          {series.map((s, i) => (
            <div key={i} className="flex items-center space-x-1.5 text-xs text-neutral-600">
              <span className="h-2 w-4 rounded-sm" style={{ backgroundColor: s.color }}></span>
              <span className="font-medium">{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative w-full h-[280px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Y Axis Grid lines & Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + chartHeight * (1 - pct);
            const val = (minValue + valueRange * pct).toFixed(0);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#F3F4F6"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#9CA3AF"
                  fontSize="8"
                  className="font-mono select-none"
                >
                  {currencySymbol}{parseFloat(val).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </text>
              </g>
            );
          })}

          {/* X Axis Labels */}
          {periods.map((period, idx) => {
            // Mostrar solo una fracción de etiquetas para evitar colisión si hay muchos períodos
            const shouldShow = periods.length <= 12 || idx % Math.ceil(periods.length / 10) === 0 || idx === periods.length - 1;
            if (!shouldShow) return null;

            const x = getX(idx);
            return (
              <text
                key={idx}
                x={x}
                y={height - padding.bottom + 18}
                textAnchor="middle"
                fill="#6B7280"
                fontSize="9"
                className="font-mono select-none"
              >
                {period}
              </text>
            );
          })}

          {/* Draw lines */}
          {series.map((s, seriesIdx) => {
            const pointsPath = s.data
              .map((val, idx) => `${getX(idx)},${getY(val)}`)
              .join(' L ');

            const path = `M ${pointsPath}`;

            return (
              <g key={seriesIdx}>
                {/* Background Shadow Line */}
                <path
                  d={path}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={4}
                  strokeOpacity={0.15}
                  className="transition-all duration-300"
                />
                
                {/* Main Colored Line */}
                <path
                  d={path}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-500 ease-out"
                />

                {/* Render interactive dots */}
                {s.data.map((val, dotIdx) => {
                  const cx = getX(dotIdx);
                  const cy = getY(val);
                  const isActive = activeDot?.seriesIdx === seriesIdx && activeDot?.dotIdx === dotIdx;

                  return (
                    <circle
                      key={dotIdx}
                      cx={cx}
                      cy={cy}
                      r={isActive ? 5.5 : 3.5}
                      fill={isActive ? '#fff' : s.color}
                      stroke={s.color}
                      strokeWidth={isActive ? 3 : 1.5}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setActiveDot({ seriesIdx, dotIdx, x: cx, y: cy })}
                      onMouseLeave={() => setActiveDot(null)}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Floating Line Tooltip */}
        {activeDot !== null && (
          <div
            className="absolute bg-neutral-900/90 text-white backdrop-blur-md border border-neutral-800 rounded-lg p-2.5 shadow-lg text-xs font-mono z-20 pointer-events-none transition-all duration-75"
            style={{
              left: `${(activeDot.x / width) * 100}%`,
              top: `${(activeDot.y / height) * 100 - 15}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <span className="font-semibold block text-amber-400">{series[activeDot.seriesIdx].name}</span>
            <span className="text-neutral-400 mt-1 block">
              Mes: <strong className="text-white">{periods[activeDot.dotIdx]}</strong>
            </span>
            <span className="text-neutral-400 block">
              Valor:{' '}
              <strong className="text-white">
                {currencySymbol}{series[activeDot.seriesIdx].data[activeDot.dotIdx].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
