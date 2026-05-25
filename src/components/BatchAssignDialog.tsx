"use client";

import { friendlyError } from "@/lib/api-client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { useDrivers } from "@/hooks/queries/use-drivers";
import { useBatchAssignDriver, type BatchResult } from "@/hooks/queries/use-batch-assign";
import type { Shipment } from "@/types/api";

interface BatchAssignDialogProps {
  shipments: Shipment[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function BatchAssignDialog({
  shipments,
  open,
  onOpenChange,
  onComplete,
}: BatchAssignDialogProps) {
  const [selectedDriverId, setSelectedDriverId] = useState<number | "">("");
  const [results, setResults] = useState<BatchResult[] | null>(null);

  const courierCompanyId = shipments[0]?.courier_company_id;
  const { data: drivers, isLoading: driversLoading } = useDrivers(courierCompanyId);
  const batchMutation = useBatchAssignDriver();

  const activeDrivers = drivers?.filter((d) => d.status === "active") ?? [];
  const canAssign = selectedDriverId !== "" && !batchMutation.isPending && shipments.length > 0;

  const handleAssign = () => {
    if (selectedDriverId === "") return;

    batchMutation.mutate(
      {
        shipmentCodes: shipments.map((s) => s.code),
        driverId: Number(selectedDriverId),
      },
      {
        onSuccess: (data) => {
          setResults(data);
          setTimeout(() => {
            onOpenChange(false);
            onComplete();
            resetState();
          }, 3000);
        },
      },
    );
  };

  const resetState = () => {
    setSelectedDriverId("");
    setResults(null);
    batchMutation.reset();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetState();
    onOpenChange(open);
  };

  const successCount = results?.filter((r) => r.success).length ?? 0;
  const failCount = results?.filter((r) => !r.success).length ?? 0;
  const selectedDriver = activeDrivers.find((d) => d.id === Number(selectedDriverId));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Batch Assign to Driver</DialogTitle>
          <DialogDescription>
            Assign {shipments.length} shipment{shipments.length > 1 ? "s" : ""} to a single driver
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Selected shipments summary */}
          <div className="p-3 rounded-lg bg-muted/50 max-h-[150px] overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Selected Shipments
            </p>
            <div className="space-y-1">
              {shipments.map((s) => (
                <p key={s.code} className="text-sm font-mono">
                  {s.code} <span className="text-muted-foreground">— {s.description}</span>
                </p>
              ))}
            </div>
          </div>

          {/* Driver selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Driver</label>
            {driversLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading drivers...
              </div>
            ) : activeDrivers.length === 0 ? (
              <p className="text-sm text-destructive">
                No active drivers available.
              </p>
            ) : (
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value ? Number(e.target.value) : "")}
                disabled={batchMutation.isPending || !!results}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              >
                <option value="">Choose a driver...</option>
                {activeDrivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.first_name} {driver.last_name} — {driver.phone_number}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Results */}
          {results && (
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-400">
                  {successCount} shipment{successCount !== 1 ? "s" : ""} assigned to{" "}
                  <span className="font-semibold">
                    {selectedDriver
                      ? `${selectedDriver.first_name} ${selectedDriver.last_name}`
                      : `Driver #${selectedDriverId}`}
                  </span>
                </p>
              </div>

              {failCount > 0 && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 space-y-1">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-destructive shrink-0" />
                    <p className="text-sm font-semibold text-destructive">
                      {failCount} failed
                    </p>
                  </div>
                  {results
                    .filter((r) => !r.success)
                    .map((r) => (
                      <p key={r.code} className="text-sm text-destructive/80 pl-6">
                        <span className="font-mono">{r.code}</span>: {r.error}
                      </p>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {batchMutation.isError && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">
                {friendlyError(batchMutation.error)}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {results ? "Close" : "Cancel"}
          </Button>
          {!results && (
            <Button onClick={handleAssign} disabled={!canAssign}>
              {batchMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Assign {shipments.length} Shipment{shipments.length > 1 ? "s" : ""}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
