import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, LucideIcon } from "lucide-react";

interface DashboardSectionHeaderProps {
  subtitle: string;
  title: string;
  action?: {
    label: string;
    onClick?: () => void;
    icon?: LucideIcon;
  };
  className?: string;
  titleClassName?: string;
}

export function DashboardSectionHeader({ 
  subtitle, 
  title, 
  action, 
  className,
  titleClassName
}: DashboardSectionHeaderProps) {
  const ActionIcon = action?.icon || ArrowUpRight;

  return (
    <div className={cn("flex items-center justify-between mb-8 relative z-10 font-sans", className)}>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground/70 mb-1">{subtitle}</p>
        <h2 className={cn("text-2xl font-bold text-foreground tracking-tight", titleClassName)}>{title}</h2>
      </div>
      {action && (
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-xl text-xs font-semibold border-border/40 hover:bg-background/50 hover:border-border/80 h-9 px-4"
          onClick={action.onClick}
        >
          {action.label}
          <ActionIcon className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
