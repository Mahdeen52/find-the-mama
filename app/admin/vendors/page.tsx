"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AdminDialog } from "@/components/admin/admin-dialog";
import { StatusBadge, VerificationBadge } from "@/components/admin/badges";
import {
  AdminPagination,
  AdminResults,
  type AdminPage,
} from "@/components/admin/admin-results";
import { api } from "@/lib/api";

type Vendor = {
  id: string;
  name: string;
  area: string;
  zone: string;
  phone: string | null;
  verificationLevel: number;
  status: string;
  ratingAvg: number;
  weightedRatingAvg: number;
  ratingCount: number;
  trustedReviewCount: number;
  createdAt: string;
  addedBy: { name: string | null };
  _count: { reviews: number };
};
type PendingAction = {
  type: "verify" | "merge" | "fake";
  vendor: Vendor;
} | null;

export default function VendorsPage() {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState<PendingAction>(null);
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["admin-vendors", search, level, status, page],
    queryFn: () =>
      api<AdminPage<Vendor>>(
        `/api/admin/vendors?search=${encodeURIComponent(search)}&level=${level}&status=${status}&page=${page}`,
      ),
  });
  const allVendorsQuery = useQuery({
    queryKey: ["admin-vendors-merge-options"],
    queryFn: () => api<{ items: Vendor[] }>("/api/admin/vendors?pageSize=100"),
  });
  const vendors = query.data?.items || [];

  const submitAction = async (values: Record<string, string>) => {
    if (!pending) return;
    try {
      if (pending.type === "verify")
        await api(`/api/admin/vendors/${pending.vendor.id}/verification`, {
          method: "POST",
          body: JSON.stringify({
            level: Number(values.level),
            notes: values.notes || undefined,
          }),
        });
      if (pending.type === "merge")
        await api(`/api/admin/vendors/${pending.vendor.id}/merge`, {
          method: "POST",
          body: JSON.stringify({ targetVendorId: values.targetVendorId }),
        });
      if (pending.type === "fake")
        await api(`/api/admin/vendors/${pending.vendor.id}/mark-fake`, {
          method: "POST",
          body: JSON.stringify({ reason: values.reason }),
        });
      toast.success(
        pending.type === "verify"
          ? "Verification updated"
          : pending.type === "merge"
            ? "Vendors merged"
            : "Vendor marked as fake",
      );
      await query.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
      throw error;
    }
  };

  const targetOptions = [
    { label: "Select the canonical vendor", value: "" },
    ...(allVendorsQuery.data?.items || [])
      .filter((vendor) => vendor.id !== pending?.vendor.id)
      .map((vendor) => ({
        label: `${vendor.name} · ${vendor.area}`,
        value: vendor.id,
      })),
  ];
  return (
    <div>
      <h1 className="page-title break-words">Vendors</h1>
      <p className="mt-2 text-muted">
        Detect fakes, verify real stalls and merge duplicate records.
      </p>
      <div className="card mt-6 grid gap-3 p-4 xl:grid-cols-[minmax(0,1fr)_180px_180px]">
        <label>
          <span className="label">Search vendors</span>
          <input
            type="search"
            className="field"
            placeholder="Search name, area, zone or phone"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <label>
          <span className="label">Verification level</span>
          <select
            className="field"
            value={level}
            onChange={(event) => {
              setLevel(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All verification levels</option>
            {[0, 1, 2, 3].map((item) => (
              <option key={item} value={item}>
                Level {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Vendor status</span>
          <select
            className="field"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {["ACTIVE", "PENDING", "REJECTED", "CLOSED"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <AdminResults
        query={query}
        empty={query.data?.total === 0 ? "No vendors found" : undefined}
      >
        <div
          className="table-scroll mt-6"
          tabIndex={0}
          role="region"
          aria-label="Vendors table"
        >
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-surface">
              <tr>
                {[
                  "Vendor",
                  "Location",
                  "Verification",
                  "Status",
                  "Simple / weighted",
                  "Reviews",
                  "Added by",
                  "Created",
                  "Actions",
                ].map((heading) => (
                  <th className="p-4" key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr className="border-t border-line" key={vendor.id}>
                  <td className="p-4 font-bold">
                    <Link
                      className="text-link"
                      href={`/admin/vendors/${vendor.id}`}
                    >
                      {vendor.name}
                    </Link>
                  </td>
                  <td className="p-4">
                    {vendor.area}
                    <br />
                    <span className="text-xs text-muted">{vendor.zone}</span>
                  </td>
                  <td className="p-4">
                    <VerificationBadge level={vendor.verificationLevel} />
                  </td>
                  <td className="p-4">
                    <StatusBadge value={vendor.status} />
                  </td>
                  <td className="p-4">
                    {vendor.ratingAvg.toFixed(2)} /{" "}
                    <b>{vendor.weightedRatingAvg.toFixed(2)}</b>
                  </td>
                  <td className="p-4">
                    {vendor.ratingCount} · {vendor.trustedReviewCount} trusted
                  </td>
                  <td className="p-4">{vendor.addedBy.name || "—"}</td>
                  <td className="p-4">
                    {new Date(vendor.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="font-bold text-brand-700"
                        onClick={() => setPending({ type: "verify", vendor })}
                      >
                        Verify
                      </button>
                      <button
                        className="font-bold text-amber-700"
                        onClick={() => setPending({ type: "merge", vendor })}
                      >
                        Merge
                      </button>
                      <button
                        className="font-bold text-red-700"
                        onClick={() => setPending({ type: "fake", vendor })}
                      >
                        Fake
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t p-4 text-sm text-muted">
            {query.data?.total ?? 0} vendors
          </p>
        </div>
        <AdminPagination
          page={page}
          pages={query.data?.pages ?? 1}
          setPage={setPage}
        />
      </AdminResults>
      <AdminDialog
        open={pending?.type === "verify"}
        title={`Verify ${pending?.vendor.name || "vendor"}`}
        description="Choose the evidence-backed verification level. This change is recorded in the audit log."
        confirmLabel="Save verification"
        onClose={() => setPending(null)}
        onSubmit={submitAction}
        fields={[
          {
            name: "level",
            label: "Verification level",
            type: "select",
            defaultValue: String(pending?.vendor.verificationLevel ?? 0),
            options: [0, 1, 2, 3].map((item) => ({
              value: String(item),
              label: `Level ${item}`,
            })),
          },
          {
            name: "notes",
            label: "Internal notes",
            type: "textarea",
            placeholder: "Evidence checked, call outcome, visit notes…",
          },
        ]}
      />
      <AdminDialog
        open={pending?.type === "merge"}
        title={`Merge ${pending?.vendor.name || "vendor"}`}
        description="Reviews, photos and reports move to the canonical vendor. The source listing is then rejected as a duplicate."
        confirmLabel="Merge vendor"
        danger
        onClose={() => setPending(null)}
        onSubmit={submitAction}
        fields={[
          {
            name: "targetVendorId",
            label: "Canonical vendor",
            type: "select",
            options: targetOptions,
            required: true,
          },
        ]}
      />
      <AdminDialog
        open={pending?.type === "fake"}
        title={`Mark ${pending?.vendor.name || "vendor"} as fake?`}
        description="The listing will be rejected and its contributor will receive the configured trust penalty."
        confirmLabel="Mark as fake"
        danger
        onClose={() => setPending(null)}
        onSubmit={submitAction}
        fields={[
          {
            name: "reason",
            label: "Reason",
            type: "textarea",
            placeholder: "Describe the evidence that this listing is fake…",
            required: true,
          },
        ]}
      />
    </div>
  );
}
