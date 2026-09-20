import { redirect } from "next/navigation"; import { AdminShell } from "@/components/admin/admin-shell"; import { requireAdmin } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function AdminLayout({ children }: { children: React.ReactNode }) { try { const user = await requireAdmin(); return <AdminShell user={{ name: user.name, role: user.role }}>{children}</AdminShell>; } catch { redirect("/auth/login?next=/admin"); } }
