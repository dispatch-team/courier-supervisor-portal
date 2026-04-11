"use client";

import { useI18n } from "@/intl";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShipmentSearchFilter } from "@/components/ShipmentSearchFilter";
import { ShipmentListRow } from "@/components/ShipmentListRow";
import { Inbox, Loader2, AlertCircle, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShipments } from "@/hooks/queries/use-shipments";
import type { Shipment } from "@/types/api";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

type SortField = "code" | "created_at" | "status" | "total_fee";
type SortDir = "asc" | "desc";

function sortShipments(shipments: Shipment[], field: SortField, dir: SortDir): Shipment[] {
  return [...shipments].sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case "code":
        cmp = a.code.localeCompare(b.code);
        break;
      case "created_at":
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case "status":
        cmp = a.status.localeCompare(b.status);
        break;
      case "total_fee":
        cmp = a.total_fee - b.total_fee;
        break;
    }
    return dir === "desc" ? -cmp : cmp;
  });
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

export default function ShipmentsPage() {
  const t = useI18n("shipments");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const statusParam = filterStatus === "all" ? undefined : filterStatus;
  const { data, isLoading, error, refetch } = useShipments({
    page,
    page_size: pageSize,
    status: statusParam,
  });

  const shipments = data?.shipments ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const processedShipments = useMemo(() => {
    let result = shipments;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.code.toLowerCase().includes(term) ||
          s.description.toLowerCase().includes(term) ||
          s.start_address_contact_name?.toLowerCase().includes(term) ||
          s.end_address_contact_name?.toLowerCase().includes(term),
      );
    }

    return sortShipments(result, sortField, sortDir);
  }, [shipments, searchTerm, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load shipments</h3>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

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
        <p className="text-sm text-muted-foreground mt-1">
          {totalCount} total shipments
        </p>
      </motion.div>

      {/* Controls */}
      <ShipmentSearchFilter
        onSearch={setSearchTerm}
        onFilterChange={handleFilterChange}
        currentFilter={filterStatus}
      />

      {/* Column Headers with Sort */}
      <div className="hidden md:grid grid-cols-8 gap-4 md:px-6 mb-2 items-center">
        {([
          { field: "code" as SortField, label: t("table.id") },
          { field: null, label: "Recipient" },
          { field: null, label: "Pickup" },
          { field: null, label: "Delivery" },
          { field: "status" as SortField | null, label: t("table.status") },
          { field: null, label: t("table.driver") },
          { field: "created_at" as SortField, label: "Created" },
          { field: null, label: t("table.actions") },
        ] as const).map((col, i) => (
          <div key={i} className="md:col-span-1">
            {col.field ? (
              <button
                onClick={() => handleSort(col.field as SortField)}
                className="flex items-center gap-1 uppercase tracking-[0.2em] font-black text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {col.label}
                <ArrowUpDown className={`h-3 w-3 ${sortField === col.field ? "text-primary" : ""}`} />
              </button>
            ) : (
              <span className={`uppercase tracking-[0.2em] font-black text-[10px] text-muted-foreground opacity-40 ${i === 7 ? "text-right block" : ""}`}>
                {col.label}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Shipment List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={filterStatus + searchTerm + sortField + sortDir}
        className="relative z-10"
      >
        <AnimatePresence mode="popLayout">
          {processedShipments.map((shipment) => (
            <ShipmentListRow key={shipment.code} shipment={shipment} />
          ))}
        </AnimatePresence>

        {processedShipments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-20 text-center rounded-[3rem] border-4 border-dashed border-border/20 bg-card/10 backdrop-blur-sm"
          >
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-glow shadow-primary/20">
              <Inbox className="h-12 w-12 text-primary/50" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {searchTerm ? t("empty.title") : "No Shipments Found"}
            </h3>
            <p className="text-muted-foreground max-w-sm font-medium">
              {searchTerm
                ? t("empty.description")
                : "No shipments currently assigned to your courier company."}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Pagination Controls */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/20">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="bg-card/30 border border-border/40 rounded-lg px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>per page</span>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[20%] -right-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -left-20 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
