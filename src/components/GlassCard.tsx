import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export function GlassCard({ 
  children, 
  className, 
  gradient = true,
  ...props 
}: GlassCardProps) {
  return (
    <motion.div
      {...props}
      className={cn(
        "rounded-[2.5rem] border border-border/40 bg-card/30 backdrop-blur-xl p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col",
        className
      )}
    >
      {gradient && (
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
      )}
      {children}
    </motion.div>
  );
}
