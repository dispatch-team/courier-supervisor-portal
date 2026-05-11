"use client";

import { useI18n } from "@/intl";
import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";

interface RevenueChartProps {
  data: number[];
  labels?: string[];
  className?: string;
}

export function RevenueChart({ data, labels, className }: RevenueChartProps) {
  const t = useI18n("revenue");

  // Create SVG path for the wave
  const width = 1000;
  const height = 300; // Increased height to fit labels
  const paddingLeft = 80; // More space for Y-axis numbers
  const paddingBottom = 40; // Space for X-axis labels
  const paddingRight = 40;
  const paddingTop = 40;
  
  const maxValue = Math.max(...data, 1);
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * chartWidth + paddingLeft;
    const y = height - paddingBottom - (val / maxValue) * chartHeight;
    return { x, y };
  });

  const pathData = points.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    
    // Cubic bezier for smooth curve
    const prev = a[i - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (point.x - prev.x) / 2;
    const cp2y = point.y;
    
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`;
  }, "");

  // Y-axis ticks
  const yTicks = [0, maxValue * 0.25, maxValue * 0.5, maxValue * 0.75, maxValue];

  // X-axis ticks (sample them if too many)
  const xTickIndices = labels ? [0, Math.floor(labels.length / 2), labels.length - 1] : [];

  return (
    <GlassCard className={className} gradient={false}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <div className="relative z-10 p-2 h-full flex flex-col">
        <h3 className="text-xl font-bold text-foreground mb-6">
          {t("trend.title")}
        </h3>

        <div className="relative flex-1 min-h-[250px]">
          <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            {/* Horizontal Grid Lines and Y-axis labels */}
            {yTicks.map((val, i) => {
              const y = height - paddingBottom - (val / maxValue) * chartHeight;
              return (
                <g key={`y-${i}`}>
                  <line 
                    x1={paddingLeft} 
                    y1={y} 
                    x2={width - paddingRight} 
                    y2={y} 
                    stroke="currentColor" 
                    strokeOpacity="0.05" 
                    strokeWidth="1" 
                  />
                  <text
                    x={paddingLeft - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-muted-foreground font-black text-[14px]"
                  >
                    {Math.round(val).toLocaleString()}
                  </text>
                </g>
              );
            })}
            
            {/* X-axis labels */}
            {labels && xTickIndices.map((idx) => {
              const p = points[idx];
              if (!p) return null;
              return (
                <text
                  key={`x-${idx}`}
                  x={p.x}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-muted-foreground font-bold text-[12px] uppercase tracking-wider"
                >
                  {labels[idx]}
                </text>
              );
            })}

            {/* Animated Path */}
            <motion.path
              d={pathData}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            
            {/* Gradient Fill */}
            <motion.path
              d={`${pathData} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`}
              fill="url(#revenueGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              transition={{ duration: 1, delay: 1 }}
            />

            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>

            {/* Data Points */}
            {points.map((p, i) => (
              <motion.circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="6"
                className="fill-background stroke-primary stroke-[3]"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.5 + i * 0.1 }}
                whileHover={{ r: 8, strokeWidth: 4 }}
              />
            ))}
          </svg>
        </div>
      </div>
    </GlassCard>
  );
}
