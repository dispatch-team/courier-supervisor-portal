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
import { Loader2, CheckCircle2 } from "lucide-react";
import { useUpdateDriver } from "@/hooks/queries/use-update-driver";
import { useCompanyId } from "@/hooks/queries/use-company-id";
import type { Driver } from "@/types/api";
import { useI18n } from "@/intl";

interface ReactivateDriverDialogProps {
  driver: Driver | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReactivateDriverDialog({
  driver,
  open,
  onOpenChange,
}: ReactivateDriverDialogProps) {
  const t = useI18n("drivers");

  const [success, setSuccess] = useState(false);
  const { companyId } = useCompanyId();
  const updateMutation = useUpdateDriver();

  useEffect(() => {
    if (open) {
      setSuccess(false);
      updateMutation.reset();
    }
  }, [open, updateMutation]);

  const handleReactivate = () => {
    if (!driver || !companyId) return;

    updateMutation.mutate(
      {
        courierCompanyId: companyId,
        driverId: driver.id,
        data: { status: "active" },
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
          <DialogTitle>{t("dialogs.reactivate.title")}</DialogTitle>
          <DialogDescription>
            {t("dialogs.reactivate.description", { name: fullName })}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  {t("dialogs.reactivate.success")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("dialogs.reactivate.successDesc", { name: fullName })}
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
              <p className="text-sm text-muted-foreground">
                {t("dialogs.reactivate.body", { name: fullName })}
              </p>

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
                onClick={handleReactivate}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {t("dialogs.reactivate.submit")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
