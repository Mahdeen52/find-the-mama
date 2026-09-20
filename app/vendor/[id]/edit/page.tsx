"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { VendorForm } from "@/components/vendor-form";
import { api } from "@/lib/api";
import type { Vendor } from "@/lib/types";
export default function EditVendorPage() { const { id } = useParams<{ id: string }>(); const { user, loading } = useAuth(); const router = useRouter(); const vendor = useQuery({ queryKey: ["vendor", id], queryFn: () => api<Vendor>(`/api/vendors/${id}`), enabled: Boolean(user) }); useEffect(() => { if (!loading && !user) router.replace("/auth/login"); }, [loading, user, router]); if (loading || vendor.isLoading || !vendor.data) return <div className="container-page py-20"><div className="h-80 animate-pulse rounded-3xl bg-orange-100"/></div>; return <VendorForm vendor={vendor.data}/>; }
