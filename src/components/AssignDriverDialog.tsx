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
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useDrivers } from "@/hooks/queries/use-drivers";
import { useAssignDriver } from "@/hooks/queries/use-assign-driver";
import type { Shipment } from "@/types/api";
import { useI18n } from "@/intl";

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
  const t = useI18n("shipments");
  const tDrivers = useI18n("drivers");
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

  const getTranslatedDescription = (code: string) => {
    const raw = t("assignDialog.description");
    const parts = raw.split("{code}");
    return (
      <>
        {parts[0]}
        <span className="font-mono font-bold">{code}</span>
        {parts[1]}
      </>
    );
  };

  const getTranslatedCannotAssign = (status: string) => {
    const raw = t("assignDialog.cannotAssign");
    const parts = raw.split("{status}");
    const statusText = t(`status.${status}` as never) || status;
    return (
      <>
        {parts[0]}
        <span className="font-semibold">{statusText}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("assignDialog.title")}</DialogTitle>
          <DialogDescription>
            {getTranslatedDescription(shipment.code)}
          </DialogDescription>
        </DialogHeader>

        {/* Prevent assignment for delivered/cancelled */}
        {isDeliveredOrCancelled ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm">
              {getTranslatedCannotAssign(shipment.status)}
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Already assigned warning */}
            {isAlreadyAssigned && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  {t("assignDialog.alreadyAssigned", {
                    name: drivers?.find((d) => d.id === shipment.assigned_driver_id)
                      ? `${drivers.find((d) => d.id === shipment.assigned_driver_id)!.first_name} ${drivers.find((d) => d.id === shipment.assigned_driver_id)!.last_name}`
                      : `Driver #${shipment.assigned_driver_id}`,
                  })}
                </p>
              </div>
            )}

            {/* Shipment summary */}
            <div className="text-sm space-y-1 p-3 rounded-lg bg-muted/50">
              <p><span className="text-muted-foreground">{t("assignDialog.summary.description")}</span> {shipment.description}</p>
              <p><span className="text-muted-foreground">{t("assignDialog.summary.route")}</span> {shipment.start_address} → {shipment.end_address}</p>
              <p><span className="text-muted-foreground">{t("assignDialog.summary.fee")}</span> ETB {shipment.total_fee.toFixed(2)}</p>
            </div>

            {/* Driver selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("assignDialog.selectDriverLabel")}</label>
              {driversLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("assignDialog.loadingDrivers")}
                </div>
              ) : activeDrivers.length === 0 ? (
                <p className="text-sm text-destructive">
                  {t("assignDialog.noActiveDrivers")}
                </p>
              ) : (
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 [color-scheme:dark]"
                >
                  <option value="">{t("assignDialog.chooseDriverPlaceholder")}</option>
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
                  {friendlyError(assignMutation.error)}
                </p>
              </div>
            )}

            {/* Success */}
            {assignMutation.isSuccess && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-400">
                  {t("assignDialog.assignedSuccess", {
                    name: activeDrivers.find((d) => d.id === Number(selectedDriverId))
                      ? `${activeDrivers.find((d) => d.id === Number(selectedDriverId))!.first_name} ${activeDrivers.find((d) => d.id === Number(selectedDriverId))!.last_name}`
                      : `Driver #${selectedDriverId}`,
                    time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
                  })}
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {tDrivers("dialogs.cancel")}
          </Button>
          {!isDeliveredOrCancelled && (
            <Button
              onClick={handleAssign}
              disabled={!canAssign}
            >
              {assignMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {t("assignDialog.submit")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
