"use client";

import { useI18n } from "@/intl";
import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserPlus,
  Loader2,
  AlertCircle,
  UserX,
  MoreHorizontal,
  Search,
  Star,
} from "lucide-react";
import { CreateDriverDialog } from "@/components/CreateDriverDialog";
import { EditDriverDialog } from "@/components/EditDriverDialog";
import { DriverAvatar } from "@/components/DriverAvatar";
import { useDrivers } from "@/hooks/queries/use-drivers";
import { useCompanyId } from "@/hooks/queries/use-company-id";
import { cn } from "@/lib/utils";
import type { Driver } from "@/types/api";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
  { id: "pending", label: "Pending" },
];

function getStatusBadge(status: Driver["status"]) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500/15 text-green-500 border-green-500/25 hover:bg-green-500/20">{status}</Badge>;
    case "inactive":
      return <Badge className="bg-muted/50 text-muted-foreground border-muted hover:bg-muted/60">{status}</Badge>;
    case "pending":
      return <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/25 hover:bg-amber-500/20">{status}</Badge>;
  }
}

function driverName(d: Driver): string {
  return [d.first_name, d.middle_name, d.last_name].filter(Boolean).join(" ");
}

const inputClass =
  "h-8 bg-background border border-border rounded-md px-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring [color-scheme:dark] placeholder:text-muted-foreground/50";

export default function DriversPage() {
  const t = useI18n("drivers");
  const { companyId, isLoading: companyLoading } = useCompanyId();
  const { data: drivers, isLoading: driversLoading, error, refetch } = useDrivers(companyId);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);

  const isLoading = companyLoading || driversLoading;

  const filteredDrivers = useMemo(() => {
    let result = drivers ?? [];

    if (statusFilter !== "all") {
      result = result.filter((d) => d.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (d) =>
          driverName(d).toLowerCase().includes(term) ||
          d.email.toLowerCase().includes(term) ||
          d.phone_number.includes(term),
      );
    }

    return result;
  }, [drivers, searchTerm, statusFilter]);

  const counts = useMemo(() => {
    const all = drivers ?? [];
    return {
      all: all.length,
      active: all.filter((d) => d.status === "active").length,
      inactive: all.filter((d) => d.status === "inactive").length,
      pending: all.filter((d) => d.status === "pending").length,
    };
  }, [drivers]);

  if (isLoading && !drivers) {
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
        <h3 className="text-lg font-semibold mb-2">Failed to load drivers</h3>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            Manage your fleet of drivers
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
          <UserPlus className="h-4 w-4" />
          Add Driver
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search drivers..."
              className={cn(inputClass, "w-full pl-8")}
            />
          </div>

          {/* Status Tabs */}
          <div className="hidden sm:flex items-center gap-0.5 ml-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                  statusFilter === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {tab.label}
                <span className="ml-1 text-[10px] opacity-60">
                  {counts[tab.id as keyof typeof counts]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/30 border-border/50">
              <TableHead>Driver</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="hidden lg:table-cell">Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Rating</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDrivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <UserX className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? "No drivers match your search."
                        : "No drivers in your fleet yet."}
                    </p>
                    {!searchTerm && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 gap-1.5"
                        onClick={() => setCreateOpen(true)}
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Add your first driver
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredDrivers.map((driver) => (
                <TableRow
                  key={driver.id}
                  className={cn(
                    "group/row transition-all duration-150",
                    "hover:bg-primary/[0.04] hover:shadow-[inset_2px_0_0_0_hsl(var(--primary))]",
                    "animate-in fade-in-50 slide-in-from-bottom-1 duration-300",
                  )}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <DriverAvatar
                        driverId={driver.id}
                        profilePictureId={driver.profile_picture_id}
                        initials={`${driver.first_name[0]}${driver.last_name[0]}`}
                      />
                      <div>
                        <p className="text-sm font-medium group-hover/row:text-primary transition-colors">
                          {driverName(driver)}
                        </p>
                        <p className="text-xs text-muted-foreground md:hidden">
                          {driver.phone_number}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm">{driver.phone_number}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">{driver.email}</span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(driver.status)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {driver.rating_aggregate > 0 ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <span>{driver.rating_aggregate.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">
                          ({driver.rating_count})
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover/row:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => setEditDriver(driver)}>Edit Driver</DropdownMenuItem>
                        <DropdownMenuItem>View Performance</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          {driver.status === "active" ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      <CreateDriverDialog
        courierCompanyId={companyId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      <EditDriverDialog
        driver={editDriver}
        courierCompanyId={companyId}
        open={!!editDriver}
        onOpenChange={(open) => { if (!open) setEditDriver(null); }}
      />
    </div>
  );
}
