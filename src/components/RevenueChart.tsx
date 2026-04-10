"use client";

import { useI18n } from "@/intl";
import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";

interface RevenueChartProps {
  data: number[];
  className?: string;
}

export function RevenueChart({ data, className }: RevenueChartProps) {
  const t = useI18n("revenue");

  // Create SVG path for the wave
  const width = 1000;
  const height = 200;
  const padding = 40;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((val / Math.max(...data)) * (height - padding * 2) + padding);
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

  return (
    <GlassCard className={className} gradient={false}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <div className="relative z-10 p-2">
        <h3 className="text-xl font-bold text-foreground mb-8">
          {t("trend.title")}
        </h3>

        <div className="relative w-full aspect-[5/1] min-h-[150px]">
          <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            {/* Grid Lines */}
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
            
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
              d={`${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
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
