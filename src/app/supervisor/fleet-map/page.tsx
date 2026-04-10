"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/intl";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { MapMarker } from "@/components/MapMarker";
import { 
  Users, 
  Search, 
  Navigation, 
  Info, 
  MoreVertical, 
  Phone, 
  Navigation2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const mockDrivers = [
  { id: "D-101", name: "Abebe Kebede", x: 45, y: 35, status: "active", type: "bike", lastUpdated: "2s ago", route: "Bole -> Piassa" },
  { id: "D-102", name: "Sara Mohammed", x: 65, y: 55, status: "busy", type: "car", lastUpdated: "5s ago", route: "Haya Hulet -> CMC" },
  { id: "D-103", name: "Dawit Girma", x: 30, y: 60, status: "active", type: "bike", lastUpdated: "1s ago", route: "Mexico -> Sarbet" },
  { id: "D-104", name: "Hagos Teklay", x: 50, y: 75, status: "onBreak", type: "bike", lastUpdated: "10m ago", route: "Idle" },
  { id: "D-105", name: "Mulugeta Belay", x: 20, y: 40, status: "busy", type: "car", lastUpdated: "3s ago", route: "Summit -> Ayat" },
];

export default function FleetMapPage() {
  const t = useI18n("fleetMap");
  const [selectedDriver, setSelectedDriver] = useState<typeof mockDrivers[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Simulation of real-time refresh (per SUP-026)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredDrivers = mockDrivers.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col md:flex-row gap-6">
      {/* Sidebar: Driver List */}
      <div className="w-full md:w-80 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-sm font-medium italic">
            {t("subtitle")}
          </p>
        </div>

        <GlassCard className="flex-1 flex flex-col p-4 overflow-hidden !rounded-[2.5rem]">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder={t("sidebar.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background/40 border-none rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 transition-all font-medium"
            />
          </div>

          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
            <div className="flex items-center justify-between px-2 opacity-50 uppercase tracking-[0.2em] font-black text-[10px]">
              <span>{t("sidebar.activeDrivers")}</span>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {filteredDrivers.map((driver) => (
              <motion.div
                key={driver.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedDriver(driver)}
                className={cn(
                  "p-3 rounded-2xl cursor-pointer transition-all border border-transparent",
                  selectedDriver?.id === driver.id 
                    ? "bg-primary/20 border-primary/40" 
                    : "hover:bg-card/40"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center border",
                    driver.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                    driver.status === 'busy' ? 'bg-primary/10 border-primary/20 text-primary' :
                    'bg-amber-500/10 border-amber-500/20 text-amber-500'
                  )}>
                    <Navigation className="h-4 w-4 fill-current" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black truncate">{driver.name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-tighter">
                      {driver.id} • {driver.lastUpdated}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Main Map Area */}
      <GlassCard className="flex-1 relative overflow-hidden !rounded-[3rem] p-0 border-primary/10 shadow-2xl group">
        {/* Map Header / Controls Overlay */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20 pointer-events-none">
          <div className="p-3 bg-background/60 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-4 pointer-events-auto">
             <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black uppercase text-foreground/70">{mockDrivers.filter(d => d.status === 'active').length} {t("sidebar.idleDrivers")}</span>
             </div>
             <div className="w-[1px] h-4 bg-white/10" />
             <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-[10px] font-black uppercase text-foreground/70">{mockDrivers.filter(d => d.status === 'busy').length} {t("sidebar.onDelivery")}</span>
             </div>
          </div>

          <div className="p-3 bg-background/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-2 pointer-events-auto shadow-lg">
             <Navigation2 className="h-4 w-4 text-primary" />
             <span className="text-xs font-black tracking-tighter">ADDIS ABABA</span>
          </div>
        </div>

        {/* Mock Map Background (Stylized SVG of Addis Ababa) */}
        <div className="absolute inset-0 bg-[#0a0a0c] overflow-hidden">
          {/* Subtle Grid */}
          <div className="absolute inset-0 opacity-[0.03]" 
               style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          {/* Stylized Routes/Parks */}
          <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 1000 1000">
            <path d="M 0 500 Q 250 450 500 500 T 1000 500" stroke="white" fill="none" strokeWidth="2" />
            <path d="M 500 0 Q 550 250 500 500 T 500 1000" stroke="white" fill="none" strokeWidth="2" />
            <circle cx="500" cy="500" r="150" stroke="white" fill="none" strokeWidth="1" strokeDasharray="10 10" />
            <rect x="200" y="200" width="100" height="100" stroke="white" fill="none" strokeWidth="0.5" />
            <rect x="700" y="700" width="150" height="80" stroke="white" fill="none" strokeWidth="0.5" />
          </svg>

          {/* Interaction Area */}
          <div className="absolute inset-0 z-10">
            {filteredDrivers.map((driver) => (
              <MapMarker 
                key={driver.id} 
                x={driver.x} 
                y={driver.y} 
                status={driver.status as any}
                type={driver.type as any}
                onClick={() => setSelectedDriver(driver)}
                isSelected={selectedDriver?.id === driver.id}
              />
            ))}
          </div>
        </div>

        {/* Detail Panel Overlay (AnimatePresence) */}
        <AnimatePresence>
          {selectedDriver && (
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              className="absolute top-0 right-0 h-full w-full md:w-96 bg-background/40 backdrop-blur-3xl border-l border-white/10 z-30 p-8 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg">
                    <Navigation className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight">{selectedDriver.name}</h2>
                    <p className="text-[11px] font-bold text-primary tracking-widest uppercase">{selectedDriver.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDriver(null)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <MoreVertical className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-6 flex-1">
                {/* Status Badge */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">{t("marker.status")}</p>
                  <div className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter",
                    selectedDriver.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                    selectedDriver.status === 'busy' ? 'bg-primary/20 text-primary-foreground' :
                    'bg-amber-500/20 text-amber-400'
                  )}>
                    <div className={cn("h-2 w-2 rounded-full", 
                        selectedDriver.status === 'active' ? 'bg-emerald-500 animate-pulse' : 
                        selectedDriver.status === 'busy' ? 'bg-primary' : 'bg-amber-500'
                    )} />
                    {selectedDriver.status === 'active' ? t("marker.idle") : selectedDriver.status}
                  </div>
                </div>

                {/* Assignment Detail */}
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Navigation2 className="h-4 w-4 text-primary" />
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("marker.assignment")}</p>
                  </div>
                  <p className="text-lg font-black text-foreground">{selectedDriver.route}</p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <button className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-white py-3 rounded-2xl transition-all shadow-lg active:scale-95">
                      <Phone className="h-4 w-4" />
                      <span className="text-xs font-black uppercase">Call</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-2xl transition-all active:scale-95">
                      <Info className="h-4 w-4" />
                      <span className="text-xs font-black uppercase">{t("marker.viewDetails")}</span>
                    </button>
                  </div>
                </div>

                {/* Battery/Connection Stats (Bonus) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl flex flex-col gap-1">
                    <p className="text-[8px] font-black text-muted-foreground uppercase">Signal</p>
                    <p className="text-xs font-black text-emerald-400">Excellent (LTE)</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl flex flex-col gap-1">
                    <p className="text-[8px] font-black text-muted-foreground uppercase">Battery</p>
                    <p className="text-xs font-black">84%</p>
                  </div>
                </div>
              </div>

              {/* Timestamp Footer */}
              <div className="mt-auto pt-6 flex items-center justify-center gap-2 opacity-30">
                <AlertCircle className="h-3 w-3" />
                <p className="text-[9px] font-black uppercase tracking-widest">Last Updated: {currentTime.toLocaleTimeString()}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend / Overlay Bottom */}
        <div className="absolute bottom-6 left-6 z-20 hidden md:flex items-center gap-4 p-4 bg-background/40 backdrop-blur-2xl border border-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase opacity-60">
             <div className="h-2 w-2 rounded-full bg-emerald-500" /> Active
           </div>
           <div className="flex items-center gap-2 text-[10px] font-black uppercase opacity-60">
             <div className="h-2 w-2 rounded-full bg-primary" /> Busy
           </div>
           <div className="flex items-center gap-2 text-[10px] font-black uppercase opacity-60">
             <div className="h-2 w-2 rounded-full bg-amber-500" /> Break
           </div>
        </div>
      </GlassCard>
    </div>
  );
}
