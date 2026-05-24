"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  CircleDollarSign,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  User as UserIcon,
  Activity,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import dispatchLogo from "@/assets/dispatch-logo.png";

import { useI18n } from "@/intl";

// We'll define icons here but labels will be translated inside the component
const NAV_ICONS = [
  { id: "dashboard", href: "/supervisor", icon: LayoutDashboard },
  { id: "shipments", href: "/supervisor/shipments", icon: Package },
  { id: "drivers", href: "/supervisor/drivers", icon: Users },
  { id: "fleet", href: "/supervisor/fleet", icon: Activity },
  { id: "revenue", href: "/supervisor/revenue", icon: CircleDollarSign },
  { id: "reports", href: "/supervisor/reports", icon: FileText },
  { id: "supervisors", href: "/supervisor/supervisors", icon: UserCog },
];

export function SupervisorSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const t = useI18n("sidebar");
  const { logout, user } = useAuth();
  
  const navItems = NAV_ICONS.map(item => ({
    ...item,
    label: t(item.id as any)
  }));

  const handleLogout = async () => {
    await logout();
    router.push("/login/supervisor");
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 88 : 280 }}
      className="relative z-20 flex flex-col border-r border-border/40 bg-card/60 backdrop-blur-2xl transition-shadow duration-300 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)] h-full"
    >
      {/* Header / Logo */}
      <div className="flex items-center p-6 h-24 mb-2">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center overflow-hidden w-full"
            >
              <img src={dispatchLogo.src} alt="Dispatch Logo" className="h-20 w-auto object-contain drop-shadow-[0_0_15px_hsl(270,70%,60%,0.2)]" />
            </motion.div>
          ) : (
            <motion.div
              key="icon-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full flex justify-center"
            >
              <img src={dispatchLogo.src} alt="Dispatch Logo" className="h-[4.5rem] w-[4.5rem] object-contain drop-shadow-[0_0_15px_hsl(270,70%,60%,0.2)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 flex h-7 w-7 items-center justify-center rounded-full border border-border/50 bg-background shadow-md hover:border-primary/50 hover:text-primary transition-all z-50 text-muted-foreground"
      >
        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Nav Items */}
      <div className="flex-1 px-4 py-2 space-y-2 overflow-y-auto hidden-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/supervisor" && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "group flex items-center rounded-2xl p-3 transition-all duration-300 cursor-pointer overflow-hidden relative",
                  isActive
                    ? "bg-primary/10 text-primary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] border border-primary/20"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-1/4 h-1/2 w-1 rounded-r-full bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={cn("h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110", isCollapsed ? "mx-auto" : "mr-4")} />
                {!isCollapsed && (
                  <span className="text-sm font-semibold tracking-wide truncate">{item.label}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border/30 mt-auto flex flex-col gap-2 bg-gradient-to-t from-background/40 to-transparent">
        <Link href="/supervisor/profile">
          <div className={cn(
             "flex items-center rounded-2xl p-3 transition-all duration-300 cursor-pointer",
             pathname?.includes("/profile") ? "bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent"
          )}>
            <div className="relative flex-shrink-0 flex items-center justify-center">
              <UserIcon className={cn("h-5 w-5 flex-shrink-0 transition-transform duration-300", isCollapsed ? "mx-auto" : "mr-4")} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-semibold tracking-wide text-foreground truncate">
                  {user?.name || user?.preferred_username || "Supervisor"}
                </span>
                <span className="text-[11px] opacity-60 truncate">{user?.email || t("roleTitle")}</span>
              </div>
            )}
          </div>
        </Link>
        
         <Link href="/supervisor/settings">
          <div className={cn(
            "flex items-center rounded-2xl p-3 transition-all duration-300 cursor-pointer border",
            pathname?.startsWith("/supervisor/settings")
              ? "bg-primary/10 text-primary border-primary/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground border-transparent",
          )}>
            <Settings className={cn("h-5 w-5 flex-shrink-0 transition-transform duration-300", isCollapsed ? "mx-auto" : "mr-4")} />
            {!isCollapsed && <span className="text-sm font-medium tracking-wide">{t("settings")}</span>}
          </div>
        </Link>

         <button
          onClick={handleLogout}
          className="group flex w-full items-center rounded-2xl p-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300 border border-transparent"
        >
          <LogOut className={cn("h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110", isCollapsed ? "mx-auto" : "mr-4")} />
          {!isCollapsed && <span className="text-sm font-medium tracking-wide">{t("logOut")}</span>}
        </button>
      </div>
    </motion.aside>
  );
}
