"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { GlassCard } from "./GlassCard";
import { useI18n } from "@/intl";

const data = [
  { name: 'Delivered', value: 400, color: 'hsl(var(--primary))' },
  { name: 'In Transit', value: 300, color: 'hsl(var(--accent))' },
  { name: 'Pending', value: 200, color: 'hsl(var(--info))' },
  { name: 'Returned', value: 50, color: 'hsl(var(--destructive))' },
];

export function StatusBreakdownChart() {
  const t = useI18n("reports");

  return (
    <GlassCard className="h-[400px] flex flex-col p-6">
      <h3 className="text-lg font-black tracking-tight mb-6 uppercase opacity-60 text-[10px] tracking-[0.2em]">
        {t("charts.statusBreakdown")}
      </h3>
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={8}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                borderRadius: '16px', 
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '12px'
              }}
              itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-2xl font-black text-foreground">950</p>
          <p className="text-[8px] font-black uppercase text-muted-foreground">Total</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.name}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
