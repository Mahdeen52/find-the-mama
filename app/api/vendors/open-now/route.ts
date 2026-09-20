import { db } from "@/lib/db";
import { handleApiError, ok } from "@/lib/http";
import { isOpenNow } from "@/lib/utils";
import { serializeVendor } from "@/lib/vendor";
import { DEMO_VENDORS } from "@/lib/demo-data";
export const dynamic = "force-dynamic";
export async function GET(request: Request) { const area = new URL(request.url).searchParams.get("area"); try { const rows = await db.vendor.findMany({ where: { status: "ACTIVE", ...(area && { area }) }, include: { photos: true } }); return ok(rows.filter((row) => isOpenNow(row.operatingHours as never)).map(serializeVendor)); } catch (error) { console.warn("Database unavailable; serving open demo vendors", error); return ok(DEMO_VENDORS.filter((row) => (!area || row.area === area) && isOpenNow(row.operatingHours))); } }
