"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { SupervisorSidebar } from "@/components/SupervisorSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AuthGuard allowedRoles={["courier"]} loginPath="/login/supervisor">
      <div className="flex h-screen w-full bg-background overflow-hidden relative selection:bg-primary/20">
        <div className="absolute inset-0 z-0 bg-radial-gradient from-background to-muted/20 pointer-events-none" />
        
        {/* Sidebar */}
        <SupervisorSidebar />

        {/* Main Content Area */}
        <main className="relative z-10 flex-1 overflow-y-auto w-full">
          <div className="h-full w-full p-6 md:p-8 lg:p-10 max-w-[1600px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="h-full w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
