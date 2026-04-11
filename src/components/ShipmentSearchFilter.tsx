"use client";

import { useI18n } from "@/intl";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface ShipmentFilterValues {
  status: string;
  dateStart: string;
  dateEnd: string;
  driverAssignment: string;
}

interface ShipmentSearchFilterProps {
  onSearch: (term: string) => void;
  onFiltersChange: (filters: ShipmentFilterValues) => void;
  filters: ShipmentFilterValues;
}

const STATUS_OPTIONS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "assigned_to_courier", label: "Assigned" },
  { id: "in_transit", label: "In Transit" },
  { id: "delivered", label: "Delivered" },
  { id: "failed", label: "Failed" },
  { id: "cancelled", label: "Cancelled" },
];

const DRIVER_OPTIONS = [
  { id: "all", label: "All Drivers" },
  { id: "unassigned", label: "Unassigned" },
  { id: "assigned", label: "Assigned" },
];

const DEFAULT_FILTERS: ShipmentFilterValues = {
  status: "all",
  dateStart: "",
  dateEnd: "",
  driverAssignment: "all",
};

function hasActiveFilters(filters: ShipmentFilterValues): boolean {
  return (
    filters.status !== "all" ||
    filters.dateStart !== "" ||
    filters.dateEnd !== "" ||
    filters.driverAssignment !== "all"
  );
}

function validateDateRange(start: string, end: string): string | null {
  if (start && end && new Date(start) > new Date(end)) {
    return "Start date must be before end date";
  }
  return null;
}

export function ShipmentSearchFilter({
  onSearch,
  onFiltersChange,
  filters,
}: ShipmentSearchFilterProps) {
  const t = useI18n("shipments");
  const [searchTerm, setSearchTerm] = useState("");
  const dateError = validateDateRange(filters.dateStart, filters.dateEnd);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const updateFilter = (key: keyof ShipmentFilterValues, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setSearchTerm("");
    onSearch("");
    onFiltersChange(DEFAULT_FILTERS);
  };

  return (
    <div className="space-y-4 mb-8 relative z-20">
      {/* Row 1: Search + Clear */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={t("searchPlaceholder")}
            className="block w-full pl-11 pr-4 py-3 bg-card/30 backdrop-blur-xl border border-border/40 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-muted-foreground/50 shadow-sm"
          />
        </div>

        {hasActiveFilters(filters) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all filters
          </Button>
        )}
      </div>

      {/* Row 2: Status Pills */}
      <div className="flex p-1.5 bg-card/30 backdrop-blur-xl border border-border/40 rounded-2xl gap-1 shadow-sm overflow-x-auto no-scrollbar max-w-full">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => updateFilter("status", opt.id)}
            className={cn(
              "px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300",
              filters.status === opt.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                : "text-muted-foreground hover:bg-background/50 hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Row 3: Date Range + Driver Assignment */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Date Range */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            From
          </label>
          <input
            type="date"
            value={filters.dateStart}
            onChange={(e) => updateFilter("dateStart", e.target.value)}
            className="bg-card/30 border border-border/40 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            To
          </label>
          <input
            type="date"
            value={filters.dateEnd}
            onChange={(e) => updateFilter("dateEnd", e.target.value)}
            className="bg-card/30 border border-border/40 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Driver Assignment */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            Driver
          </label>
          <select
            value={filters.driverAssignment}
            onChange={(e) => updateFilter("driverAssignment", e.target.value)}
            className="bg-card/30 border border-border/40 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {DRIVER_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Validation Error */}
      {dateError && (
        <p className="text-sm text-destructive font-medium">{dateError}</p>
      )}
    </div>
  );
}

export { DEFAULT_FILTERS };
