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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useDeleteSupervisor } from "@/hooks/queries/use-delete-supervisor";
import type { Supervisor } from "@/types/api";
import { useI18n } from "@/intl";

interface DeleteSupervisorDialogProps {
  supervisor: Supervisor | null;
  companyId: number | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteSupervisorDialog({ supervisor, companyId, open, onOpenChange }: DeleteSupervisorDialogProps) {
  const t = useI18n("supervisors");
  const [confirmed, setConfirmed] = useState(false);
  const [success, setSuccess] = useState(false);
  const mutation = useDeleteSupervisor(companyId);

  function handleClose() {
    setConfirmed(false);
    setSuccess(false);
    mutation.reset();
    onOpenChange(false);
  }

  async function handleDelete() {
    if (!supervisor || !confirmed) return;
    try {
      await mutation.mutateAsync(supervisor.id);
      setSuccess(true);
    } catch {
      // error shown from mutation.error
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t("delete.title" as any)}
          </DialogTitle>
          <DialogDescription>{t("delete.description" as any)}</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            <p className="text-sm font-medium">{t("delete.success" as any)}</p>
            <Button onClick={handleClose} className="mt-2">{t("close")}</Button>
          </div>
        ) : (
          <>
            {supervisor && (
              <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
                <p className="font-medium">{supervisor.first_name} {supervisor.middle_name} {supervisor.last_name}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{supervisor.email}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Checkbox
                id="confirm-delete"
                checked={confirmed}
                onCheckedChange={(v) => setConfirmed(!!v)}
              />
              <label htmlFor="confirm-delete" className="text-sm cursor-pointer select-none">
                {t("delete.confirm" as any)}
              </label>
            </div>

            {mutation.isError && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{mutation.error instanceof Error ? mutation.error.message : "Failed to delete supervisor"}</span>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
                {t("cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={!confirmed || mutation.isPending}
              >
                {mutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("delete.submitting" as any)}</>
                ) : t("delete.submit" as any)}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
