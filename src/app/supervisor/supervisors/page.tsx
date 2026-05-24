"use client";

import { useState } from "react";
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
import { UserPlus, Loader2, AlertCircle, MoreHorizontal, Crown, UserCheck } from "lucide-react";
import { useCompanyId } from "@/hooks/queries/use-company-id";
import { useSupervisors } from "@/hooks/queries/use-supervisors";
import { useIsOwner } from "@/hooks/queries/use-is-owner";
import { useAuth } from "@/context/AuthContext";
import { CreateSupervisorDialog } from "@/components/CreateSupervisorDialog";
import { EditSupervisorDialog } from "@/components/EditSupervisorDialog";
import { DeleteSupervisorDialog } from "@/components/DeleteSupervisorDialog";
import { useI18n } from "@/intl";
import { cn } from "@/lib/utils";
import type { Supervisor } from "@/types/api";

const STATUS_COLOR: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  inactive: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

export default function SupervisorsPage() {
  const t = useI18n("supervisors");
  const { user } = useAuth();
  const { companyId } = useCompanyId();
  const { data: supervisors, isLoading, isError, refetch } = useSupervisors(companyId);
  const { isOwner, mySupervisorId } = useIsOwner();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Supervisor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supervisor | null>(null);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
        {isOwner && (
          <Button onClick={() => setCreateOpen(true)} className="shrink-0 self-start">
            <UserPlus className="h-4 w-4 mr-2" />
            {t("addSupervisor")}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">{t("loading")}</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <AlertCircle className="h-8 w-8 text-destructive/60" />
            <p className="text-sm">{t("errorLoad")}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>{t("retry")}</Button>
          </div>
        ) : !supervisors?.length ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            {t("empty")}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>{t("table.name")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("table.email")}</TableHead>
                <TableHead className="hidden lg:table-cell">{t("table.phone")}</TableHead>
                <TableHead>{t("table.status")}</TableHead>
                {isOwner && <TableHead className="w-10" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {supervisors.map((supervisor) => {
                const isMe = supervisor.id === mySupervisorId;
                const isOwnerRow = supervisor.id === supervisors.find(
                  (s) => isOwner && s.id === mySupervisorId
                )?.id && isOwner && isMe;
                return (
                  <TableRow key={supervisor.id} className="border-border/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                          {supervisor.first_name[0]}{supervisor.last_name[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {supervisor.first_name} {supervisor.middle_name} {supervisor.last_name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {isOwnerRow && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-500">
                                <Crown className="h-2.5 w-2.5" />
                                {t("ownerBadge")}
                              </span>
                            )}
                            {isMe && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-primary">
                                <UserCheck className="h-2.5 w-2.5" />
                                {t("youBadge")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {supervisor.email}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {supervisor.phone_number}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("text-xs capitalize", STATUS_COLOR[supervisor.status] ?? "")}
                      >
                        {t(`status.${supervisor.status}` as any)}
                      </Badge>
                    </TableCell>
                    {isOwner && (
                      <TableCell>
                        {!isMe && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditTarget(supervisor)}>
                                {t("editAction")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteTarget(supervisor)}
                              >
                                {t("deleteAction")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <CreateSupervisorDialog
        companyId={companyId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      <EditSupervisorDialog
        supervisor={editTarget}
        companyId={companyId}
        open={!!editTarget}
        onOpenChange={(open) => { if (!open) setEditTarget(null); }}
      />
      <DeleteSupervisorDialog
        supervisor={deleteTarget}
        companyId={companyId}
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      />
    </div>
  );
}
