"use client";

import { friendlyError } from "@/lib/api-client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, CheckCircle2, Package } from "lucide-react";
import { useUpdateDriver } from "@/hooks/queries/use-update-driver";
import { useShipments } from "@/hooks/queries/use-shipments";
import { useCompanyId } from "@/hooks/queries/use-company-id";
import type { Driver } from "@/types/api";
import { useI18n } from "@/intl";

interface DeactivateDriverDialogProps {
  driver: Driver | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACTIVE_SHIPMENT_STATUSES = [
  "assigned_to_driver",
  "picked_up",
  "in_transit",
];

export function DeactivateDriverDialog({
  driver,
  open,
  onOpenChange,
}: DeactivateDriverDialogProps) {
  const t = useI18n("drivers");

  const [success, setSuccess] = useState(false);
  const { companyId } = useCompanyId();
  const updateMutation = useUpdateDriver();

  // Fetch shipments assigned to this driver to warn about active ones
  const { data: shipmentData, isFetching: shipmentsFetching } = useShipments(
    driver
      ? { assigned_driver_id: driver.id, page_size: 100 }
      : {},
  );

  // Guard against keepPreviousData showing stale data from the last driver
  const activeShipments = shipmentsFetching
    ? []
    : (shipmentData?.shipments ?? []).filter(
        (s) => ACTIVE_SHIPMENT_STATUSES.includes(s.status),
      );

  useEffect(() => {
    if (open) {
      setSuccess(false);
      updateMutation.reset();
    }
    // updateMutation excluded intentionally — it's a new object reference every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleDeactivate = () => {
    if (!driver || !companyId) return;

    updateMutation.mutate(
      {
        courierCompanyId: companyId,
        driverId: driver.id,
        data: { status: "inactive" },
      },
      { onSuccess: () => setSuccess(true) },
    );
  };

  const handleClose = () => onOpenChange(false);

  if (!driver) return null;

  const fullName = [driver.first_name, driver.middle_name, driver.last_name]
    .filter(Boolean)
    .join(" ");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dialogs.deactivate.title")}</DialogTitle>
          <DialogDescription>
            {t("dialogs.deactivate.description", { name: fullName })}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  {t("dialogs.deactivate.success")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("dialogs.deactivate.successDesc", { name: fullName })}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>{t("dialogs.done")}</Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-2">
              {/* Active assignments warning */}
              {activeShipments.length > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Package className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      {t("dialogs.deactivate.activeAssignments", { count: String(activeShipments.length) })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("dialogs.deactivate.activeAssignmentsDesc")}
                    </p>
                  </div>
                </div>
              )}

              {/* Warning */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p>{t("dialogs.deactivate.warningTitle")}</p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
                    <li>{t("dialogs.deactivate.warningList.login")}</li>
                    <li>{t("dialogs.deactivate.warningList.newAssignments")}</li>
                    <li>{t("dialogs.deactivate.warningList.preserve")}</li>
                  </ul>
                </div>
              </div>

              {/* Mutation error */}
              {updateMutation.isError && (
                <p className="text-sm text-destructive">
                  {friendlyError(updateMutation.error)}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                {t("dialogs.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeactivate}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {t("dialogs.deactivate.submit")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
