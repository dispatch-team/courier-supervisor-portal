"use client";

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
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useDrivers } from "@/hooks/queries/use-drivers";
import { useAssignDriver } from "@/hooks/queries/use-assign-driver";
import type { Shipment } from "@/types/api";

interface AssignDriverDialogProps {
  shipment: Shipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignDriverDialog({
  shipment,
  open,
  onOpenChange,
}: AssignDriverDialogProps) {
  const [selectedDriverId, setSelectedDriverId] = useState<number | "">("");

  const {
    data: drivers,
    isLoading: driversLoading,
  } = useDrivers(shipment?.courier_company_id);

  const assignMutation = useAssignDriver();

  const activeDrivers = drivers?.filter((d) => d.status === "active") ?? [];

  const canAssign =
    shipment &&
    selectedDriverId !== "" &&
    !assignMutation.isPending &&
    shipment.status !== "delivered" &&
    shipment.status !== "cancelled";

  const handleAssign = async () => {
    if (!shipment || selectedDriverId === "") return;

    assignMutation.mutate(
      { shipmentCode: shipment.code, driverId: Number(selectedDriverId) },
      {
        onSuccess: () => {
          setTimeout(() => {
            onOpenChange(false);
            resetState();
          }, 1500);
        },
      },
    );
  };

  const resetState = () => {
    setSelectedDriverId("");
    assignMutation.reset();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetState();
    onOpenChange(open);
  };

  if (!shipment) return null;

  const isDeliveredOrCancelled =
    shipment.status === "delivered" || shipment.status === "cancelled";
  const isAlreadyAssigned = !!shipment.assigned_driver_id;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Driver</DialogTitle>
          <DialogDescription>
            Assign a driver to shipment <span className="font-mono font-bold">{shipment.code}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Prevent assignment for delivered/cancelled */}
        {isDeliveredOrCancelled ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm">
              Cannot assign a driver to a shipment that is already{" "}
              <span className="font-semibold">{shipment.status}</span>.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Already assigned warning */}
            {isAlreadyAssigned && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  This shipment is already assigned to Driver #{shipment.assigned_driver_id}.
                  Assigning a new driver will reassign it.
                </p>
              </div>
            )}

            {/* Shipment summary */}
            <div className="text-sm space-y-1 p-3 rounded-lg bg-muted/50">
              <p><span className="text-muted-foreground">Description:</span> {shipment.description}</p>
              <p><span className="text-muted-foreground">Route:</span> {shipment.start_address} → {shipment.end_address}</p>
              <p><span className="text-muted-foreground">Fee:</span> ETB {shipment.total_fee.toFixed(2)}</p>
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
                  No active drivers available. Create a driver first.
                </p>
              ) : (
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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

            {/* Error */}
            {assignMutation.isError && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive">
                  {assignMutation.error?.message ?? "Failed to assign driver"}
                </p>
              </div>
            )}

            {/* Success */}
            {assignMutation.isSuccess && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-400">
                  Assigned to{" "}
                  <span className="font-semibold">
                    {activeDrivers.find((d) => d.id === Number(selectedDriverId))
                      ? `${activeDrivers.find((d) => d.id === Number(selectedDriverId))!.first_name} ${activeDrivers.find((d) => d.id === Number(selectedDriverId))!.last_name}`
                      : `Driver #${selectedDriverId}`}
                  </span>{" "}
                  at {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          {!isDeliveredOrCancelled && (
            <Button
              onClick={handleAssign}
              disabled={!canAssign}
            >
              {assignMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Assign Driver
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
