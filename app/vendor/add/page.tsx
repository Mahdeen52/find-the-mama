"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { VendorForm } from "@/components/vendor-form";
export default function AddVendorPage() { const { user, loading } = useAuth(); const router = useRouter(); useEffect(() => { if (!loading && !user) router.replace("/auth/login"); }, [loading, user, router]); if (loading || !user) return <div className="container-page py-20"><div className="h-80 animate-pulse rounded-3xl bg-orange-100"/></div>; return <VendorForm/>; }
