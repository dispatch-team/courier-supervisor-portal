"use client";

import { motion } from "framer-motion";
import { Navigation, Bike, Car, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapMarkerProps {
  x: number; // 0-100
  y: number; // 0-100
  status: "active" | "busy" | "onBreak";
  type: "bike" | "car";
  onClick: () => void;
  isSelected?: boolean;
}

export function MapMarker({ x, y, status, type, onClick, isSelected }: MapMarkerProps) {
  const Icon = type === "bike" ? Bike : Car;
  
  const statusColors = {
    active: "bg-emerald-500",
    busy: "bg-primary",
    onBreak: "bg-amber-500",
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.2, zIndex: 50 }}
      className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={onClick}
    >
      {/* Outer Glow / Pulse for Busy/Active */}
      {status !== "onBreak" && (
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={cn(
            "absolute inset-0 rounded-full blur-md opacity-30",
            statusColors[status]
          )}
        />
      )}

      {/* Marker Body */}
      <div className={cn(
        "relative flex items-center justify-center h-10 w-10 rounded-full border-2 transition-all shadow-lg",
        isSelected ? "border-white bg-foreground text-background scale-110" : "border-background/50 bg-card text-foreground",
        status === "onBreak" && "grayscale opacity-80"
      )}>
        <Icon className="h-5 w-5" />
        
        {/* Status Dot */}
        <div className={cn(
          "absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-background",
          statusColors[status]
        )} />
      </div>

      {/* Tooltip-like label if selected */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-foreground text-background text-[10px] font-black px-2 py-1 rounded-full shadow-2xl z-50 uppercase tracking-tighter"
        >
          Active Assignment
        </motion.div>
      )}
    </motion.div>
  );
}
