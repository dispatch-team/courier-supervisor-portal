"use client";

import { useI18n } from "@/intl";
import { Search, X, SlidersHorizontal, Calendar, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

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

function countAdvanced(filters: ShipmentFilterValues): number {
  return (
    (filters.dateStart ? 1 : 0) +
    (filters.dateEnd ? 1 : 0) +
    (filters.driverAssignment !== "all" ? 1 : 0)
  );
}

function validateDateRange(start: string, end: string): string | null {
  if (start && end && new Date(start) > new Date(end)) {
    return "Start date must be before end date";
  }
  return null;
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

const inputClass =
  "h-8 w-full bg-background border border-border rounded-md px-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring [color-scheme:dark]";

export function ShipmentSearchFilter({
  onSearch,
  onFiltersChange,
  filters,
}: ShipmentSearchFilterProps) {
  const t = useI18n("shipments");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const dateError = validateDateRange(filters.dateStart, filters.dateEnd);
  const advancedCount = countAdvanced(filters);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const updateFilter = (key: keyof ShipmentFilterValues, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilter = (key: keyof ShipmentFilterValues) => {
    onFiltersChange({ ...filters, [key]: DEFAULT_FILTERS[key] });
  };

  const clearAll = () => {
    setSearchTerm("");
    onSearch("");
    onFiltersChange(DEFAULT_FILTERS);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar: Search + Filter Popover */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search shipments..."
            className={cn(inputClass, "pl-8 max-w-none")}
          />
        </div>

        {/* Status Tabs — inline */}
        <div className="hidden sm:flex items-center gap-0.5 ml-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => updateFilter("status", opt.id)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                filters.status === opt.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Filter Popover */}
          <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 gap-1.5 text-xs",
                  advancedCount > 0 && "border-primary/50",
                )}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
                {advancedCount > 0 && (
                  <span className="h-4 min-w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold px-1">
                    {advancedCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="p-3 border-b border-border">
                <p className="text-sm font-medium">Advanced Filters</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Narrow down your shipment list
                </p>
              </div>
              <div className="p-3 space-y-4">
                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Date Range
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={filters.dateStart}
                      onChange={(e) => updateFilter("dateStart", e.target.value)}
                      className={inputClass}
                    />
                    <span className="text-xs text-muted-foreground shrink-0">to</span>
                    <input
                      type="date"
                      value={filters.dateEnd}
                      onChange={(e) => updateFilter("dateEnd", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  {dateError && (
                    <p className="text-xs text-destructive">{dateError}</p>
                  )}
                </div>

                <Separator />

                {/* Driver Assignment */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <UserCheck className="h-3 w-3" />
                    Driver Assignment
                  </label>
                  <div className="flex gap-1.5">
                    {DRIVER_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => updateFilter("driverAssignment", opt.id)}
                        className={cn(
                          "flex-1 px-2 py-1.5 rounded-md text-xs font-medium border transition-colors",
                          filters.driverAssignment === opt.id
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {advancedCount > 0 && (
                <div className="p-3 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-7 text-xs text-muted-foreground"
                    onClick={() => {
                      onFiltersChange({
                        ...filters,
                        dateStart: "",
                        dateEnd: "",
                        driverAssignment: "all",
                      });
                    }}
                  >
                    Clear advanced filters
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {(advancedCount > 0 || filters.status !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-8 px-2 text-xs text-muted-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Reset all
            </Button>
          )}
        </div>
      </div>

      {/* Active Filter Badges */}
      {advancedCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {filters.dateStart && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs font-normal">
              From: {formatDateShort(filters.dateStart)}
              <button
                onClick={() => clearFilter("dateStart")}
                className="ml-0.5 h-3.5 w-3.5 rounded-full hover:bg-foreground/10 flex items-center justify-center"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          )}
          {filters.dateEnd && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs font-normal">
              To: {formatDateShort(filters.dateEnd)}
              <button
                onClick={() => clearFilter("dateEnd")}
                className="ml-0.5 h-3.5 w-3.5 rounded-full hover:bg-foreground/10 flex items-center justify-center"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          )}
          {filters.driverAssignment !== "all" && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs font-normal">
              Driver: {filters.driverAssignment}
              <button
                onClick={() => clearFilter("driverAssignment")}
                className="ml-0.5 h-3.5 w-3.5 rounded-full hover:bg-foreground/10 flex items-center justify-center"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Mobile-only status tabs */}
      <div className="flex sm:hidden items-center gap-0.5 overflow-x-auto no-scrollbar">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => updateFilter("status", opt.id)}
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
              filters.status === opt.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export { DEFAULT_FILTERS };
