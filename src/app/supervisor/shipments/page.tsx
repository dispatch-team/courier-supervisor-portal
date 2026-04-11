"use client";

import { useI18n } from "@/intl";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ShipmentSearchFilter, DEFAULT_FILTERS, type ShipmentFilterValues } from "@/components/ShipmentSearchFilter";
import { AssignDriverDialog } from "@/components/AssignDriverDialog";
import { BatchAssignDialog } from "@/components/BatchAssignDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Inbox,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Users,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  X,
} from "lucide-react";
import { useShipments, type ShipmentFilters } from "@/hooks/queries/use-shipments";
import { cn } from "@/lib/utils";
import type { Shipment, ShipmentStatus } from "@/types/api";

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

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(status: ShipmentStatus): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getStatusStyle(status: ShipmentStatus) {
  switch (status) {
    case "pending":
      return { icon: Clock, cls: "bg-amber-500/15 text-amber-500 border-amber-500/25" };
    case "assigned_to_courier":
    case "assigned_to_driver":
      return { icon: Truck, cls: "bg-blue-500/15 text-blue-500 border-blue-500/25" };
    case "picked_up":
    case "in_transit":
      return { icon: Truck, cls: "bg-indigo-500/15 text-indigo-500 border-indigo-500/25" };
    case "delivered":
      return { icon: CheckCircle2, cls: "bg-green-500/15 text-green-500 border-green-500/25" };
    case "failed":
      return { icon: AlertCircle, cls: "bg-red-500/15 text-red-500 border-red-500/25" };
    case "returned":
      return { icon: RotateCcw, cls: "bg-orange-500/15 text-orange-500 border-orange-500/25" };
    case "cancelled":
      return { icon: XCircle, cls: "bg-muted/50 text-muted-foreground border-muted" };
  }
}

function SortableHeader({
  label,
  field,
  currentField,
  currentDir,
  onSort,
}: {
  label: string;
  field: SortField;
  currentField: SortField;
  currentDir: SortDir;
  onSort: (f: SortField) => void;
}) {
  const active = currentField === field;
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 text-xs font-medium"
      onClick={() => onSort(field)}
    >
      {label}
      {active ? (
        currentDir === "asc" ? (
          <ArrowUp className="ml-1 h-3 w-3" />
        ) : (
          <ArrowDown className="ml-1 h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
      )}
    </Button>
  );
}

export default function ShipmentsPage() {
  const t = useI18n("shipments");
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ShipmentFilterValues>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [assignShipment, setAssignShipment] = useState<Shipment | null>(null);

  const queryFilters: ShipmentFilters = {
    page,
    page_size: pageSize,
    status: filters.status !== "all" ? filters.status : undefined,
    created_at_start: filters.dateStart ? `${filters.dateStart}T00:00:00Z` : undefined,
    created_at_end: filters.dateEnd ? `${filters.dateEnd}T23:59:59Z` : undefined,
  };
  const { data, isLoading, isFetching, error, refetch } = useShipments(queryFilters);

  const shipments = data?.shipments ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const processedShipments = useMemo(() => {
    let result = shipments;

    if (filters.driverAssignment === "assigned") {
      result = result.filter((s) => s.assigned_driver_id !== null && s.assigned_driver_id !== 0);
    } else if (filters.driverAssignment === "unassigned") {
      result = result.filter((s) => !s.assigned_driver_id);
    }

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
  }, [shipments, searchTerm, sortField, sortDir, filters.driverAssignment]);

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

  const handleFiltersChange = (newFilters: ShipmentFilterValues) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSelectToggle = (code: string) => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedCodes.size === processedShipments.length) {
      setSelectedCodes(new Set());
    } else {
      setSelectedCodes(new Set(processedShipments.map((s) => s.code)));
    }
  };

  const selectedShipments = processedShipments.filter((s) => selectedCodes.has(s.code));
  const allSelected = processedShipments.length > 0 && selectedCodes.size === processedShipments.length;
  const someSelected = selectedCodes.size > 0 && !allSelected;

  if (isLoading && !data) {
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
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            Manage and assign shipments to drivers
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
          {isFetching && <Loader2 className="h-3 w-3 animate-spin" />}
          <span>{totalCount} shipments</span>
        </div>
      </div>

      {/* Filters */}
      <ShipmentSearchFilter
        onSearch={setSearchTerm}
        onFiltersChange={handleFiltersChange}
        filters={filters}
      />

      {/* Table */}
      <div className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/30 border-border/50">
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>
                <SortableHeader label="ID" field="code" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
              </TableHead>
              <TableHead className="hidden lg:table-cell">Recipient</TableHead>
              <TableHead className="hidden xl:table-cell">Pickup</TableHead>
              <TableHead className="hidden xl:table-cell">Delivery</TableHead>
              <TableHead>
                <SortableHeader label="Status" field="status" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
              </TableHead>
              <TableHead className="hidden md:table-cell">Driver</TableHead>
              <TableHead className="hidden md:table-cell">
                <SortableHeader label="Created" field="created_at" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
              </TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedShipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Inbox className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? "No shipments match your search."
                        : "No shipments currently assigned to your courier company."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              processedShipments.map((shipment) => {
                const status = getStatusStyle(shipment.status);
                const StatusIcon = status.icon;
                const isSelected = selectedCodes.has(shipment.code);

                return (
                  <TableRow
                    key={shipment.code}
                    data-state={isSelected ? "selected" : undefined}
                    className={cn(
                      "cursor-pointer transition-all duration-150 group/row",
                      "hover:bg-primary/[0.04] hover:shadow-[inset_2px_0_0_0_hsl(var(--primary))]",
                      "animate-in fade-in-50 slide-in-from-bottom-1 duration-300",
                      isSelected && "bg-primary/[0.06]",
                    )}
                    onClick={() => router.push(`/supervisor/shipments/${shipment.code}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleSelectToggle(shipment.code)}
                        aria-label={`Select ${shipment.code}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-mono font-semibold text-sm group-hover/row:text-primary transition-colors">
                          {shipment.code}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                          {shipment.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div>
                        <p className="text-sm font-medium truncate max-w-[140px]">
                          {shipment.end_address_contact_name || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                          {shipment.end_address_phone_number || ""}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <p className="text-sm truncate max-w-[140px]">
                        {shipment.start_address}
                      </p>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <p className="text-sm truncate max-w-[140px]">
                        {shipment.end_address}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                          status.cls,
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {formatStatus(shipment.status)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm">
                        {shipment.assigned_driver_id
                          ? `Driver #${shipment.assigned_driver_id}`
                          : <span className="text-muted-foreground">Unassigned</span>}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(shipment.created_at)}
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover/row:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => setAssignShipment(shipment)}>
                            Assign Driver
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/supervisor/shipments/${shipment.code}`)}
                          >
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="bg-transparent border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Floating Selection Bar */}
      {selectedCodes.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-card border border-border shadow-2xl shadow-black/20 backdrop-blur-lg">
            <div className="flex items-center gap-2">
              <div className="h-6 min-w-6 rounded-md bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center px-1.5">
                {selectedCodes.size}
              </div>
              <span className="text-sm font-medium text-foreground">selected</span>
            </div>
            <div className="w-px h-5 bg-border" />
            <Button
              size="sm"
              onClick={() => setBatchDialogOpen(true)}
              className="gap-1.5 h-7 text-xs"
            >
              <Users className="h-3 w-3" />
              Batch Assign
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedCodes(new Set())}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <AssignDriverDialog
        shipment={assignShipment}
        open={!!assignShipment}
        onOpenChange={(open) => { if (!open) setAssignShipment(null); }}
      />
      <BatchAssignDialog
        shipments={selectedShipments}
        open={batchDialogOpen}
        onOpenChange={setBatchDialogOpen}
        onComplete={() => setSelectedCodes(new Set())}
      />
    </div>
  );
}
