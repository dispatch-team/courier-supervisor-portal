"use client";

import { useI18n } from "@/intl";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShipmentSearchFilter } from "@/components/ShipmentSearchFilter";
import { ShipmentListRow } from "@/components/ShipmentListRow";
import { Package, Inbox, Search } from "lucide-react";

const mockShipments = [
  {
    id: "SHIP-0091",
    merchant: "Lorum Ipsum Shop",
    merchantEmail: "orders@lorumipsum.com",
    route: "Bole 01 -> Piassa",
    driver: "Abebe Kebede",
    driverStatus: "Pending Pickup",
    status: "Urgent",
    fee: "ETB 240",
    priority: "high" as const
  },
  {
    id: "SHIP-0092",
    merchant: "Market Hub Ltd",
    merchantEmail: "shipping@markethub.et",
    route: "Kazanchis -> Sarbet",
    driver: "Sara Mohammed",
    driverStatus: "In Transit",
    status: "In Transit",
    fee: "ETB 180",
    priority: "normal" as const
  },
  {
    id: "SHIP-0093",
    merchant: "Fresh Foods",
    merchantEmail: "fresh@foods.com",
    route: "Megenagna -> Bole",
    driver: "Dawit Girma",
    driverStatus: "Assigned",
    status: "Pending",
    fee: "ETB 150",
    priority: "normal" as const
  },
  {
    id: "SHIP-0094",
    merchant: "Ethio Fashion",
    merchantEmail: "sales@ethiofashion.com",
    route: "CMC -> Bole",
    driver: "-",
    driverStatus: "Unassigned",
    status: "Pending",
    fee: "ETB 320",
    priority: "high" as const
  },
  {
    id: "SHIP-0095",
    merchant: "Tech Central",
    merchantEmail: "support@techcentral.et",
    route: "6 Kilo -> Piassa",
    driver: "Hagos Teklay",
    driverStatus: "Delivered",
    status: "Delivered",
    fee: "ETB 120",
    priority: "normal" as const
  },
  {
    id: "SHIP-0096",
    merchant: "Coffee Roasters",
    merchantEmail: "beans@roasters.com",
    route: "Bole -> Kazanchis",
    driver: "Abebe Kebede",
    driverStatus: "Delivered",
    status: "Delivered",
    fee: "ETB 210",
    priority: "normal" as const
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

export default function ShipmentsPage() {
  const t = useI18n("shipments");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredShipments = useMemo(() => {
    return mockShipments.filter(shipment => {
      const matchesSearch =
        shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.merchant.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" ||
        shipment.status.toLowerCase().replace(" ", "-") === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterStatus]);

  return (
    <div className="space-y-10 min-h-screen">
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
      <ShipmentSearchFilter
        onSearch={setSearchTerm}
        onFilterChange={setFilterStatus}
        currentFilter={filterStatus}
      />

      {/* List Header (Mock Table Head for reference) */}
      <div className="hidden md:grid grid-cols-7 gap-4 md:px-6 mb-2 items-center opacity-40 uppercase tracking-[0.2em] font-black text-[10px] text-muted-foreground pointer-events-none">
        <div className="md:col-span-1">{t("table.id")}</div>
        <div className="md:col-span-1">{t("table.merchant")}</div>
        <div className="md:col-span-1">{t("table.route")}</div>
        <div className="md:col-span-1">{t("table.driver")}</div>
        <div className="md:col-span-1">{t("table.status")}</div>
        <div className="md:col-span-1">{t("table.fee")}</div>
        <div className="md:col-span-1 text-right">{t("table.actions")}</div>
      </div>

      {/* Shipment List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={filterStatus + searchTerm} // Force re-animation on filter change
        className="relative z-10"
      >
        <AnimatePresence mode="popLayout">
          {filteredShipments.map((shipment) => (
            <ShipmentListRow key={shipment.id} shipment={shipment} />
          ))}
        </AnimatePresence>

        {filteredShipments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-20 text-center rounded-[3rem] border-4 border-dashed border-border/20 bg-card/10 backdrop-blur-sm"
          >
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-glow shadow-primary/20">
              <Inbox className="h-12 w-12 text-primary/50" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {searchTerm ? t("empty.title") : "All Caught Up!"}
            </h3>
            <p className="text-muted-foreground max-w-sm font-medium">
              {searchTerm
                ? t("empty.description")
                : "There are no shipments matching this filter at the moment."}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Subtle Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[20%] -right-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -left-20 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
