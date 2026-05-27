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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertTriangle, CheckCircle2, Package } from "lucide-react";
import { useDeleteDriver } from "@/hooks/queries/use-delete-driver";
import { useShipments } from "@/hooks/queries/use-shipments";
import { useCompanyId } from "@/hooks/queries/use-company-id";
import type { Driver } from "@/types/api";
import { useI18n } from "@/intl";

interface DeleteDriverDialogProps {
  driver: Driver | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const IN_PROGRESS_STATUSES = [
  "assigned_to_driver",
  "picked_up",
  "in_transit",
];

export function DeleteDriverDialog({
  driver,
  open,
  onOpenChange,
}: DeleteDriverDialogProps) {
  const t = useI18n("drivers");

  const [confirmed, setConfirmed] = useState(false);
  const [success, setSuccess] = useState(false);
  const { companyId } = useCompanyId();
  const deleteMutation = useDeleteDriver();

  const { data: shipmentData } = useShipments(
    driver ? { assigned_driver_id: driver.id, page_size: 100 } : {},
  );

  const inProgressShipments = (shipmentData?.shipments ?? []).filter(
    (s) => IN_PROGRESS_STATUSES.includes(s.status),
  );

  const hasInProgress = inProgressShipments.length > 0;

  useEffect(() => {
    if (open) {
      setConfirmed(false);
      setSuccess(false);
      deleteMutation.reset();
    }
    // deleteMutation excluded intentionally — new object reference every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleDelete = () => {
    if (!driver || !companyId || !confirmed || hasInProgress) return;

    deleteMutation.mutate(
      { courierCompanyId: companyId, driverId: driver.id },
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
          <DialogTitle>{t("dialogs.delete.title")}</DialogTitle>
          <DialogDescription>
            {t("dialogs.delete.description", { name: fullName })}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  {t("dialogs.delete.success")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("dialogs.delete.successDesc", { name: fullName })}
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
              {/* Block if in-progress shipments */}
              {hasInProgress && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <Package className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">
                      {t("dialogs.delete.cannotDeleteTitle", { count: String(inProgressShipments.length) })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("dialogs.delete.cannotDeleteDesc")}
                    </p>
                  </div>
                </div>
              )}

              {/* Warning */}
              {!hasInProgress && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p>{t("dialogs.delete.permanentWarning")}</p>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
                      <li>{t("dialogs.delete.permList.login", { name: fullName })}</li>
                      <li>{t("dialogs.delete.permList.lists")}</li>
                      <li>{t("dialogs.delete.permList.audit")}</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Confirmation checkbox */}
              {!hasInProgress && (
                <label className="flex items-start gap-2 cursor-pointer">
                  <Checkbox
                    checked={confirmed}
                    onCheckedChange={(v) => setConfirmed(v === true)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-muted-foreground">
                    {t("dialogs.delete.checkboxLabel")}
                  </span>
                </label>
              )}

              {/* Mutation error */}
              {deleteMutation.isError && (
                <p className="text-sm text-destructive">
                  {friendlyError(deleteMutation.error)}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                {t("dialogs.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={!confirmed || hasInProgress || deleteMutation.isPending}
              >
                {deleteMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {t("dialogs.delete.submit")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
