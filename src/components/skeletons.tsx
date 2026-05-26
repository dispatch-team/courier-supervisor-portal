"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Primitive building blocks
// ---------------------------------------------------------------------------

function SkHeader({ hasButton = false }: { hasButton?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      {hasButton && <Skeleton className="h-9 w-28 rounded-lg" />}
    </div>
  );
}

function SkFilterBar({ cols = 3 }: { cols?: number }) {
  return (
    <div className="flex gap-2 flex-wrap">
      <Skeleton className="h-9 w-56 rounded-lg" />
      {Array.from({ length: cols - 1 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-32 rounded-lg" />
      ))}
    </div>
  );
}

function SkStatCard() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-7 w-24 mb-1.5" />
        <Skeleton className="h-3.5 w-36" />
      </CardContent>
    </Card>
  );
}

function SkChartCard({ height = "h-60", title = true }: { height?: string; title?: boolean }) {
  return (
    <Card>
      {title && (
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-56 mt-1" />
        </CardHeader>
      )}
      <CardContent className="pt-2">
        <Skeleton className={`w-full rounded-lg ${height}`} />
      </CardContent>
    </Card>
  );
}

function SkTableRow({ cols = 5 }: { cols?: number }) {
  const widths = ["w-6", "w-36", "w-28", "w-24", "w-20", "w-16", "w-12"];
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border/40">
      <Skeleton className="h-4 w-4 rounded" />
      <div className="flex items-center gap-2 flex-1">
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        <div className="space-y-1">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      {Array.from({ length: cols - 2 }).map((_, i) => (
        <Skeleton key={i} className={`h-3.5 ${widths[i + 2] ?? "w-20"} hidden sm:block`} />
      ))}
      <Skeleton className="h-7 w-7 rounded ml-auto" />
    </div>
  );
}

function SkTable({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <Card>
      {/* Table header */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-b border-border bg-muted/30 rounded-t-lg">
        <Skeleton className="h-4 w-4 rounded" />
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 w-20" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkTableRow key={i} cols={cols} />
      ))}
    </Card>
  );
}

function SkInfoCard({ rows = 4, title = true }: { rows?: number; title?: boolean }) {
  return (
    <Card>
      {title && (
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-36" />
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 shrink-0" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page-level skeletons
// ---------------------------------------------------------------------------

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <SkHeader hasButton />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkStatCard key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-1">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-5 w-10 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function DriversPageSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <SkHeader hasButton />
      <SkFilterBar cols={4} />
      <SkTable rows={8} cols={5} />
    </div>
  );
}

export function DriverPerformanceSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Driver header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full ml-auto" />
      </div>
      {/* Date filter */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-16 rounded-lg" />)}
        <Skeleton className="h-8 w-9 rounded-lg ml-auto" />
      </div>
      {/* 6 metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <SkStatCard key={i} />)}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SkChartCard height="h-56" />
        <SkChartCard height="h-56" />
        <SkChartCard height="h-56" />
      </div>
    </div>
  );
}

export function DriverCompareSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <SkHeader />
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-16 rounded-lg" />)}
      </div>
      <Card>
        <div className="overflow-x-auto">
          {/* Column headers */}
          <div className="flex gap-4 px-4 py-3 border-b border-border bg-muted/30 min-w-[600px]">
            <Skeleton className="h-4 w-28 shrink-0" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 min-w-[180px]">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
          {/* Metric rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-4 px-4 py-3 border-b border-border/40 min-w-[600px]">
              <Skeleton className="h-4 w-28 shrink-0" />
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-20 min-w-[180px]" />
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function FleetSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <SkHeader />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-16 rounded-lg" />)}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkStatCard key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent className="space-y-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <Skeleton className="h-5 w-24 shrink-0" />
                <Skeleton className="h-5 flex-1 rounded-md" />
                <Skeleton className="h-4 w-8 shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>
        <SkChartCard height="h-48" />
      </div>
    </div>
  );
}

export function RevenueSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <SkHeader hasButton />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-16 rounded-lg" />)}
        <Skeleton className="h-8 w-9 rounded-lg ml-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => <SkStatCard key={i} />)}
      </div>
      <SkChartCard height="h-64" />
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-44" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-full shrink-0" />
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 flex-1 rounded-full ml-2" />
              <Skeleton className="h-3.5 w-16 shrink-0" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function ReportsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <SkHeader hasButton />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkStatCard key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SkChartCard height="h-56" />
        <SkChartCard height="h-56" />
      </div>
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-5 w-12 shrink-0" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ShipmentsPageSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <SkHeader />
      <SkFilterBar cols={5} />
      <SkTable rows={8} cols={6} />
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function ShipmentDetailSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-6 w-24 rounded-full ml-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkInfoCard rows={4} />
        <SkInfoCard rows={4} />
        <SkInfoCard rows={3} />
        <SkInfoCard rows={3} />
      </div>
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3.5 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function SupervisorsPageSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <SkHeader hasButton />
      <SkTable rows={6} cols={4} />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      {/* Company card with logo */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-36" />
            </div>
          ))}
        </CardContent>
      </Card>
      <SkInfoCard rows={3} />
      {/* Pricing grid */}
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
