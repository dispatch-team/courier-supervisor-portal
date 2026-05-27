"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useI18n } from "@/intl";

// Force dark text in Leaflet elements (popups, attribution) for dark theme compat
const LEAFLET_STYLE = `
  .leaflet-popup-content, .leaflet-control-attribution {
    color: #1a1a1a !important;
  }
  .leaflet-popup-content-wrapper {
    border-radius: 12px !important;
  }
`;

interface Coords {
  lat: number;
  lng: number;
}

function parseCoords(address: string): Coords | null {
  const match = address.match(/(-?\d+\.?\d*)\s*[;,]\s*(-?\d+\.?\d*)/);
  if (!match) return null;
  const lat = parseFloat(match[1]);
  const lng = parseFloat(match[2]);
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

function createLabelIcon(color: string, label: string) {
  return L.divIcon({
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    html: `<div style="
      width:32px;height:32px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
      border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);
    "><span style="transform:rotate(45deg);color:white;font-weight:900;font-size:14px;">${label}</span></div>`,
  });
}

const PICKUP_ICON = createLabelIcon("#22c55e", "P");
const DELIVERY_ICON = createLabelIcon("#ef4444", "D");

function initMap(
  container: HTMLDivElement,
  pickup: Coords | null,
  delivery: Coords | null,
  points: Coords[],
  pickupLabel: string,
  deliveryLabel: string,
): L.Map {
  const center = points[0];
  const map = L.map(container, {
    center: [center.lat, center.lng],
    zoom: 13,
    scrollWheelZoom: true,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  if (pickup) {
    L.marker([pickup.lat, pickup.lng], { icon: PICKUP_ICON })
      .addTo(map)
      .bindPopup(pickupLabel);
  }

  if (delivery) {
    L.marker([delivery.lat, delivery.lng], { icon: DELIVERY_ICON })
      .addTo(map)
      .bindPopup(deliveryLabel);
  }

  if (points.length > 1) {
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }

  return map;
}

function MapLegend({ className = "" }: { className?: string }) {
  const t = useI18n("shipments");
  return (
    <div className={`flex items-center gap-4 text-xs ${className}`}>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full bg-green-500 border border-white shadow-sm" />
        <span>{t("details.mapPickup")}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-sm" />
        <span>{t("details.mapDelivery")}</span>
      </div>
    </div>
  );
}

interface ShipmentMapProps {
  pickupAddress: string;
  deliveryAddress: string;
  pickupLabel?: string;
  deliveryLabel?: string;
}

export function ShipmentMap({
  pickupAddress,
  deliveryAddress,
  pickupLabel,
  deliveryLabel,
}: ShipmentMapProps) {
  const t = useI18n("shipments");
  const actualPickupLabel = pickupLabel || t("details.mapPickup");
  const actualDeliveryLabel = deliveryLabel || t("details.mapDelivery");
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const pickup = parseCoords(pickupAddress);
  const delivery = parseCoords(deliveryAddress);
  const points = [pickup, delivery].filter((p): p is Coords => p !== null);

  useEffect(() => {
    if (!containerRef.current || points.length === 0) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = initMap(containerRef.current, pickup, delivery, points, actualPickupLabel, actualDeliveryLabel);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [pickupAddress, deliveryAddress, actualPickupLabel, actualDeliveryLabel]);

  useEffect(() => {
    if (!fullscreen) return;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [fullscreen]);

  if (points.length === 0) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LEAFLET_STYLE }} />
      <div className="space-y-2">
        <div className="relative">
          <div
            ref={containerRef}
            className="h-[300px] w-full rounded-xl overflow-hidden border border-border/40"
          />
          <button
            onClick={() => setFullscreen(true)}
            className="absolute top-3 right-3 z-[1000] bg-white hover:bg-gray-100 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-800 shadow-md"
          >
            {t("details.mapExpand")}
          </button>
        </div>
        <MapLegend className="text-muted-foreground px-1" />
      </div>

      {fullscreen && (
        <FullscreenMap
          pickup={pickup}
          delivery={delivery}
          points={points}
          pickupLabel={actualPickupLabel}
          deliveryLabel={actualDeliveryLabel}
          onClose={() => setFullscreen(false)}
        />
      )}
    </>
  );
}

function FullscreenMap({
  pickup,
  delivery,
  points,
  pickupLabel,
  deliveryLabel,
  onClose,
}: {
  pickup: Coords | null;
  delivery: Coords | null;
  points: Coords[];
  pickupLabel: string;
  deliveryLabel: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const t = useI18n("shipments");

  useEffect(() => {
    if (!ref.current) return;
    const map = initMap(ref.current, pickup, delivery, points, pickupLabel, deliveryLabel);
    return () => { map.remove(); };
  }, []);

  // Measure sidebar width from DOM
  useEffect(() => {
    const sidebar = document.querySelector("aside, nav, [class*='sidebar'], [class*='Sidebar']");
    if (sidebar) {
      const measure = () => setSidebarWidth(sidebar.getBoundingClientRect().width);
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(sidebar);
      return () => observer.disconnect();
    }
  }, []);

  return (
    <div
      className="fixed inset-y-0 right-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
      style={{ left: `${sidebarWidth}px` }}
      onClick={onClose}
    >
      <div
        className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-gray-300 bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div ref={ref} className="w-full h-full" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[10000] bg-white hover:bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 shadow-md"
        >
          {t("details.mapClose")}
        </button>
        <MapLegend className="absolute bottom-4 left-4 z-[10000] bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-gray-800 shadow-md" />
      </div>
    </div>
  );
}
