"use client";

import { useI18n } from "@/intl";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DriverSearchFilter } from "@/components/DriverSearchFilter";
import { DriverListRow } from "@/components/DriverListRow";
import { Users, UserX, Search } from "lucide-react";

const mockDrivers = [
  { 
    id: "DRV-1001", 
    name: "Abebe Kebede", 
    phone: "+251 911 111 111", 
    vehicle: "Motorcycle - 01", 
    vehicleIcon: "bike" as const,
    deliveries: 124, 
    status: "Active", 
    rating: "4.8"
  },
  { 
    id: "DRV-1002", 
    name: "Sara Mohammed", 
    phone: "+251 912 222 222", 
    vehicle: "Compact Car - 05", 
    vehicleIcon: "car" as const,
    deliveries: 89, 
    status: "Busy", 
    rating: "4.9"
  },
  { 
    id: "DRV-1003", 
    name: "Dawit Girma", 
    phone: "+251 913 333 333", 
    vehicle: "Motorcycle - 12", 
    vehicleIcon: "bike" as const,
    deliveries: 156, 
    status: "On Break", 
    rating: "4.7"
  },
  { 
    id: "DRV-1004", 
    name: "Hagos Teklay", 
    phone: "+251 914 444 444", 
    vehicle: "Motorcycle - 08", 
    vehicleIcon: "bike" as const,
    deliveries: 23, 
    status: "Active", 
    rating: "4.5"
  },
  { 
    id: "DRV-1005", 
    name: "Lemlem Hailu", 
    phone: "+251 915 555 555", 
    vehicle: "Compact Car - 02", 
    vehicleIcon: "car" as const,
    deliveries: 0, 
    status: "Inactive", 
    rating: "N/A"
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

export default function DriversPage() {
  const t = useI18n("drivers");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredDrivers = useMemo(() => {
    return mockDrivers.filter(driver => {
      const matchesSearch = 
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filterStatus === "all" || 
        (filterStatus === "active" && driver.status.toLowerCase() !== "inactive") ||
        (filterStatus === "inactive" && driver.status.toLowerCase() === "inactive");

      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterStatus]);

  return (
    <div className="space-y-10 min-h-screen relative">
      {/* Background Decorative Blur */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[20%] -right-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -left-20 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10"
      >
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 mb-2">
          {t("title")}
        </h1>
        <p className="text-muted-foreground font-medium text-lg italic">
          {t("subtitle")}
        </p>
      </motion.div>

      {/* Controls Container */}
      <DriverSearchFilter 
        onSearch={setSearchTerm} 
        onFilterChange={setFilterStatus} 
        currentFilter={filterStatus}
      />

      {/* List Header */}
      <div className="hidden md:grid grid-cols-6 gap-4 md:px-6 mb-2 items-center opacity-40 uppercase tracking-[0.2em] font-black text-[10px] text-muted-foreground pointer-events-none">
        <div className="md:col-span-1">{t("table.driver")}</div>
        <div className="md:col-span-1">{t("table.vehicle")}</div>
        <div className="md:col-span-1">{t("table.deliveries")}</div>
        <div className="md:col-span-1">{t("table.status")}</div>
        <div className="md:col-span-1">{t("table.rating")}</div>
        <div className="md:col-span-1 text-right">{t("table.actions")}</div>
      </div>

      {/* Driver List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={filterStatus + searchTerm}
        className="relative z-10"
      >
        <AnimatePresence mode="popLayout">
          {filteredDrivers.map((driver) => (
            <DriverListRow key={driver.id} driver={driver} />
          ))}
        </AnimatePresence>

        {filteredDrivers.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-20 text-center rounded-[3rem] border-4 border-dashed border-border/20 bg-card/10 backdrop-blur-sm"
          >
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-glow shadow-primary/20">
              <UserX className="h-12 w-12 text-primary/50" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {searchTerm ? t("empty.title") : "Fleet is Empty"}
            </h3>
            <p className="text-muted-foreground max-w-sm font-medium">
              {searchTerm 
                ? t("empty.description") 
                : "No drivers registered yet for your courier network."}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
