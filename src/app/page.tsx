"use client";

import Link from "next/link";
import {
  Package,
  Truck,
  BarChart3,
  Shield,
  ArrowRight,
  Users,
  Zap,
  Globe,
  MapPin,
  Key,
  Star,
  CheckCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import dispatchLogo from "@/assets/dispatch-logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/intl";

export default function Index() {
  const tNav = useI18n("nav");
  const tHero = useI18n("hero");
  const tStats = useI18n("stats");
  const tFeatures = useI18n("features");
  const tHow = useI18n("howItWorks");
  const tPortals = useI18n("portals");
  const tCta = useI18n("cta");
  const tFooter = useI18n("footer");

  const features = [
    {
      icon: Package,
      title: tFeatures("shipmentManagement.title"),
      description: tFeatures("shipmentManagement.description"),
    },
    {
      icon: Truck,
      title: tFeatures("fleetCoordination.title"),
      description: tFeatures("fleetCoordination.description"),
    },
    {
      icon: BarChart3,
      title: tFeatures("performanceAnalytics.title"),
      description: tFeatures("performanceAnalytics.description"),
    },
    {
      icon: Key,
      title: tFeatures("apiIntegration.title"),
      description: tFeatures("apiIntegration.description"),
    },
    {
      icon: MapPin,
      title: tFeatures("locationIntelligence.title"),
      description: tFeatures("locationIntelligence.description"),
    },
    {
      icon: Star,
      title: tFeatures("courierRatings.title"),
      description: tFeatures("courierRatings.description"),
    },
  ];

  const roles = [
    {
      title: tPortals("merchant.title"),
      description: tPortals("merchant.description"),
      href: "/login/merchant",
      icon: Package,
    },
    {
      title: tPortals("supervisor.title"),
      description: tPortals("supervisor.description"),
      href: "/login/supervisor",
      icon: Users,
    },
    {
      title: tPortals("admin.title"),
      description: tPortals("admin.description"),
      href: "/login/admin",
      icon: Shield,
    },
  ];

  const stats = [
    { label: tStats("courierPartners"), value: "24+", icon: Truck },
    { label: tStats("activeMerchants"), value: "1,800+", icon: Package },
    { label: tStats("deliveriesCompleted"), value: "45K+", icon: CheckCircle },
    { label: tStats("avgDeliveryTime"), value: "32 min", icon: Clock },
  ];

  const steps = [
    {
      step: "01",
      title: tHow("step1.title"),
      desc: tHow("step1.description"),
    },
    {
      step: "02",
      title: tHow("step2.title"),
      desc: tHow("step2.description"),
    },
    {
      step: "03",
      title: tHow("step3.title"),
      desc: tHow("step3.description"),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-24 px-6">
          <Link href="/" className="flex items-center gap-3">
            <img src={dispatchLogo.src} alt="Dispatch" className="h-[5.5rem] w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {tNav("features")}
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {tNav("howItWorks")}
            </a>
            <a href="#roles" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {tNav("portals")}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href="/login/merchant">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                {tNav("login")}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-info/8 rounded-full blur-[80px]" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-2">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary tracking-wide">
                {tHero("badge")}
              </span>
              <ChevronRight className="h-3 w-3 text-primary/60" />
            </div>
          </div>

          <div className="flex justify-center -mb-8 animate-scale-in">
            <img
              src={dispatchLogo.src}
              alt="Dispatch"
              className="h-32 md:h-44 lg:h-52 w-auto drop-shadow-[0_0_40px_hsl(270,70%,60%,0.3)]"
            />
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95] mb-8 animate-slide-up">
            <span className="text-foreground">{tHero("headline1")}</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-shift_3s_ease-in-out_infinite]">
              {tHero("headline2")}
            </span>
          </h1>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <button className="rounded-full gap-2 px-8 h-12 text-base shadow-[0_0_30px_hsl(270,70%,60%,0.3)] hover:shadow-[0_0_40px_hsl(270,70%,60%,0.5)] transition-all bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center font-medium">
              {tHero("downloadDriverApp")} <ArrowRight className="h-4 w-4" />
            </button>
            <Link href="/login/merchant">
              <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-base border-border/60 hover:border-primary/40">
                {tHero("merchantLogin")}
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
            {tHero("scroll")}
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-muted-foreground/30 to-transparent" />
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-20 border-y border-border/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 group-hover:border-primary/20 transition-all duration-300">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-xs font-semibold text-primary tracking-[0.2em] uppercase">
              {tFeatures("sectionLabel")}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-4 mb-5 tracking-tight">
              {tFeatures("headline1")}
              <br />
              <span className="text-muted-foreground">{tFeatures("headline2")}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/30 rounded-3xl overflow-hidden border border-border/40">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-background p-8 hover:bg-card/80 transition-colors duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 group-hover:border-primary/20 transition-all duration-300">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-xs font-semibold text-accent tracking-[0.2em] uppercase">
              {tHow("sectionLabel")}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-4 tracking-tight">
              {tHow("headline")}
            </h2>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-primary/30 via-accent/30 to-success/30" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {steps.map((item) => (
                <div key={item.step} className="text-center relative">
                  <div className="w-24 h-24 rounded-3xl bg-card border border-border/60 flex items-center justify-center mx-auto mb-6 relative z-10">
                    <span className="text-3xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Role Portals */}
      <section id="roles" className="py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-xs font-semibold text-primary tracking-[0.2em] uppercase">
              {tPortals("sectionLabel")}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-4 mb-5 tracking-tight">
              {tPortals("headline")}
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {tPortals("subheading")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {roles.map((role) => (
              <Link
                key={role.href}
                href={role.href}
                className="group relative bg-card/60 rounded-2xl border border-border/50 p-8 hover:border-primary/40 hover:bg-card transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                      <role.icon className="h-5 w-5 text-primary" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {role.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {role.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 relative">
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_hsl(270,70%,60%,0.3)]">
            <Globe className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-5 tracking-tight">
            {tCta("headline1")}
            <br />
            {tCta("headline2")}
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            {tCta("subheading")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login/supervisor">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 h-12 text-base border-border/60 hover:border-primary/40"
              >
                {tCta("courierLogin")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <img
              src={dispatchLogo.src}
              alt="Dispatch"
              className="h-10 w-auto opacity-70"
            />
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link href="/login/merchant" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {tFooter("merchant")}
              </Link>
              <Link href="/login/supervisor" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {tFooter("supervisor")}
              </Link>
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                {tFooter("downloadDriverApp")}
              </button>
              <Link href="/login/admin" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {tFooter("admin")}
              </Link>
            </div>
            <p className="text-xs text-muted-foreground/50">{tFooter("copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
