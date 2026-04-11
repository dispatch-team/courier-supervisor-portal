"use client";

import dynamic from "next/dynamic";

const ShipmentMap = dynamic(
  () => import("./ShipmentMap").then((mod) => mod.ShipmentMap),
  { ssr: false },
);

interface ShipmentMapLoaderProps {
  pickupAddress: string;
  deliveryAddress: string;
  pickupLabel?: string;
  deliveryLabel?: string;
}

export function ShipmentMapLoader(props: ShipmentMapLoaderProps) {
  return <ShipmentMap {...props} />;
}
