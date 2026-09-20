"use client";
import dynamic from "next/dynamic";
export const DynamicVendorMap = dynamic(() => import("@/components/vendor-map").then((module) => module.VendorMap), { ssr: false, loading: () => <div className="h-[460px] animate-pulse rounded-3xl bg-orange-100"/> });
