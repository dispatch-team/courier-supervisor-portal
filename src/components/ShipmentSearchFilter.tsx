"use client";

import { useI18n } from "@/intl";
import { Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ShipmentSearchFilterProps {
  onSearch: (term: string) => void;
  onFilterChange: (status: string) => void;
  currentFilter: string;
}

export function ShipmentSearchFilter({ 
  onSearch, 
  onFilterChange, 
  currentFilter 
}: ShipmentSearchFilterProps) {
  const t = useI18n("shipments");
  const [searchTerm, setSearchTerm] = useState("");

  const filters = [
    { id: "all", label: t("filters.all") },
    { id: "pending", label: t("filters.pending") },
    { id: "assigned_to_courier", label: "Assigned" },
    { id: "in_transit", label: t("filters.inTransit") },
    { id: "delivered", label: t("filters.delivered") },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8 relative z-20">
      {/* Search Bar */}
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

      {/* Filter Pills */}
      <div className="flex p-1.5 bg-card/30 backdrop-blur-xl border border-border/40 rounded-2xl gap-1 shadow-sm overflow-x-auto no-scrollbar max-w-full">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              "px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300",
              currentFilter === filter.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
