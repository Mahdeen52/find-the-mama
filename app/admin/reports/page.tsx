"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AdminDialog } from "@/components/admin/admin-dialog";
import { StatusBadge } from "@/components/admin/badges";
import {
  AdminPagination,
  AdminResults,
  type AdminPage,
} from "@/components/admin/admin-results";
import { api } from "@/lib/api";

type Report = {
  id: string;
  entityType: string;
  priority: number;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
  vendor: { name: string; area: string } | null;
  user: { name: string | null; trustScore: number };
  assignedTo: { name: string | null } | null;
};
export default function ReportsPage() {
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [pending, setPending] = useState<{
    report: Report;
    status: "RESOLVED" | "DISMISSED";
  } | null>(null);
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["admin-reports", status, type, page],
    queryFn: () =>
      api<AdminPage<Report>>(
        `/api/admin/reports?status=${status}&type=${type}&page=${page}`,
      ),
  });
  const submit = async (values: Record<string, string>) => {
    if (!pending) return;
    try {
      await api(`/api/admin/reports/${pending.report.id}/resolve`, {
        method: "POST",
        body: JSON.stringify({
          status: pending.status,
          resolutionType: values.resolutionType,
          note: values.note || undefined,
        }),
      });
      toast.success(
        pending.status === "RESOLVED" ? "Report resolved" : "Report rejected",
      );
      await query.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
      throw error;
    }
  };
  return (
    <div>
      <h1 className="page-title break-words">Reports inbox</h1>
      <p className="mt-2 text-muted">
        A unified moderation queue for vendors, reviews and photos.
      </p>
      <div className="card mt-6 grid gap-3 p-4 sm:grid-cols-2">
        <label>
          <span className="label">Report status</span>
          <select
            className="field"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {["OPEN", "REVIEWING", "RESOLVED", "DISMISSED"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Content type</span>
          <select
            className="field"
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All content types</option>
            {["VENDOR", "REVIEW", "PHOTO"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <AdminResults
        query={query}
        empty={query.data?.total === 0 ? "No reports found" : undefined}
      >
        <div className="mt-6 space-y-4">
          {query.data?.items.map((report) => (
            <article className="card p-5" key={report.id}>
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge value={report.status} />
                    <span className="chip">{report.entityType}</span>
                    {report.priority > 0 && (
                      <span className="chip">Priority {report.priority}</span>
                    )}
                  </div>
                  <h2 className="mt-3 card-title">{report.reason}</h2>
                  <p className="mt-1 text-muted">
                    {report.description || "No description"}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <b>{report.vendor?.name || "Linked content"}</b>
                  <p>{report.vendor?.area}</p>
                  <p className="text-muted">
                    Reporter: {report.user.name || "Anonymous"} · trust{" "}
                    {report.user.trustScore}
                  </p>
                </div>
              </div>
              {!["RESOLVED", "DISMISSED"].includes(report.status) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className="btn-primary !min-h-9 !px-4"
                    onClick={() => setPending({ report, status: "RESOLVED" })}
                  >
                    Resolve
                  </button>
                  <button
                    className="btn-secondary !min-h-9 !px-4"
                    onClick={() => setPending({ report, status: "DISMISSED" })}
                  >
                    Reject
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
        <AdminPagination
          page={page}
          pages={query.data?.pages ?? 1}
          setPage={setPage}
        />
      </AdminResults>
      <AdminDialog
        open={Boolean(pending)}
        title={
          pending?.status === "RESOLVED" ? "Resolve report" : "Reject report"
        }
        description={pending?.report.reason}
        confirmLabel={pending?.status === "RESOLVED" ? "Resolve" : "Reject"}
        danger={pending?.status === "DISMISSED"}
        onClose={() => setPending(null)}
        onSubmit={submit}
        fields={[
          {
            name: "resolutionType",
            label: "Resolution",
            type: "select",
            defaultValue: "no_action",
            options: [
              { value: "no_action", label: "No action needed" },
              { value: "vendor_removed", label: "Vendor removed" },
              { value: "review_removed", label: "Review removed" },
              { value: "photo_removed", label: "Photo removed" },
            ],
          },
          {
            name: "note",
            label: "Internal note",
            type: "textarea",
            placeholder: "What was checked and decided?",
          },
        ]}
      />
    </div>
  );
}
