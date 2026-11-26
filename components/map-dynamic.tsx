"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui";

export const DynamicVendorMap = dynamic(() => import("@/components/vendor-map").then((module) => module.VendorMap), {
  ssr: false,
  loading: () => <Skeleton className="h-80" />
});
