"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AdminDialog } from "@/components/admin/admin-dialog";
import { TrustBadge } from "@/components/admin/badges";
import { Rating } from "@/components/ui";
import {
  AdminPagination,
  AdminResults,
  type AdminPage,
} from "@/components/admin/admin-results";
import { api } from "@/lib/api";

type Row = {
  id: string;
  rating: number;
  comment: string;
  photos: unknown;
  createdAt: string;
  isHidden: boolean;
  isSpam: boolean;
  vendor: { name: string };
  user: {
    name: string | null;
    trustScore: number;
    isTrustedContributor: boolean;
  };
};
type Pending = {
  type: "moderate" | "trust";
  action?: "hide" | "show" | "spam" | "unspam" | "delete";
  review: Row;
} | null;

export default function ReviewsPage() {
  const [trusted, setTrusted] = useState("");
  const [hidden, setHidden] = useState("");
  const [spam, setSpam] = useState("");
  const [pending, setPending] = useState<Pending>(null);
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["admin-reviews", trusted, hidden, spam, page],
    queryFn: () =>
      api<AdminPage<Row>>(
        `/api/admin/reviews?trusted=${trusted}&hidden=${hidden}&spam=${spam}&page=${page}`,
      ),
  });
  const submit = async (values: Record<string, string>) => {
    if (!pending) return;
    try {
      if (pending.type === "trust")
        await api(`/api/admin/reviews/${pending.review.id}/adjust-trust`, {
          method: "POST",
          body: JSON.stringify({
            delta: Number(values.delta),
            reason: values.reason,
          }),
        });
      else
        await api(`/api/admin/reviews/${pending.review.id}/moderate`, {
          method: "POST",
          body: JSON.stringify({
            action: pending.action,
            reason: values.reason || undefined,
          }),
        });
      toast.success(
        pending.type === "trust" ? "Trust updated" : "Review updated",
      );
      await query.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
      throw error;
    }
  };
  const moderationTitle =
    pending?.action === "delete"
      ? "Delete review?"
      : `${pending?.action || "Moderate"} review`;
  return (
    <div>
      <h1 className="page-title break-words">Reviews</h1>
      <p className="mt-2 text-muted">
        Compare trusted weight and remove rating manipulation.
      </p>
      <div className="card mt-6 grid gap-3 p-4 sm:grid-cols-3">
        <label>
          <span className="label">Contributor trust</span>
          <select
            className="field"
            value={trusted}
            onChange={(event) => {
              setTrusted(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All contributors</option>
            <option value="true">Trusted</option>
            <option value="false">Standard</option>
          </select>
        </label>
        <label>
          <span className="label">Review visibility</span>
          <select
            className="field"
            value={hidden}
            onChange={(event) => {
              setHidden(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Visible + hidden</option>
            <option value="true">Hidden</option>
            <option value="false">Visible</option>
          </select>
        </label>
        <label>
          <span className="label">Spam status</span>
          <select
            className="field"
            value={spam}
            onChange={(event) => {
              setSpam(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Spam + clean</option>
            <option value="true">Spam</option>
            <option value="false">Clean</option>
          </select>
        </label>
      </div>
      <AdminResults
        query={query}
        empty={query.data?.total === 0 ? "No reviews found" : undefined}
      >
        <div
          className="table-scroll mt-6"
          tabIndex={0}
          role="region"
          aria-label="Reviews table"
        >
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-surface">
              <tr>
                {[
                  "Vendor",
                  "User",
                  "Rating / weight",
                  "Comment",
                  "Photos",
                  "Created",
                  "Flags",
                  "Actions",
                ].map((heading) => (
                  <th className="p-4" key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {query.data?.items.map((review) => (
                <tr className="border-t" key={review.id}>
                  <td className="p-4 font-bold">{review.vendor.name}</td>
                  <td className="p-4">
                    <p>{review.user.name || "Unnamed"}</p>
                    <TrustBadge
                      trusted={review.user.isTrustedContributor}
                      score={review.user.trustScore}
                    />
                  </td>
                  <td className="p-4">
                    <Rating
                      value={review.rating}
                      label={`${review.rating} out of 5 stars`}
                    />{" "}
                    · {review.user.isTrustedContributor ? "2x" : "1x"}
                  </td>
                  <td className="max-w-sm p-4">{review.comment}</td>
                  <td className="p-4">
                    {Array.isArray(review.photos) ? review.photos.length : 0}
                  </td>
                  <td className="p-4">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    {review.isSpam
                      ? "Spam"
                      : review.isHidden
                        ? "Hidden"
                        : "Clean"}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          setPending({
                            type: "moderate",
                            action: review.isHidden ? "show" : "hide",
                            review,
                          })
                        }
                      >
                        {review.isHidden ? "Show" : "Hide"}
                      </button>
                      <button
                        className="text-amber-700"
                        onClick={() =>
                          setPending({
                            type: "moderate",
                            action: review.isSpam ? "unspam" : "spam",
                            review,
                          })
                        }
                      >
                        {review.isSpam ? "Unspam" : "Spam"}
                      </button>
                      <button
                        className="text-brand-700"
                        onClick={() => setPending({ type: "trust", review })}
                      >
                        Trust
                      </button>
                      <button
                        className="text-red-700"
                        onClick={() =>
                          setPending({
                            type: "moderate",
                            action: "delete",
                            review,
                          })
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t p-4 text-sm text-muted">
            {query.data?.total ?? 0} reviews
          </p>
        </div>
        <AdminPagination
          page={page}
          pages={query.data?.pages ?? 1}
          setPage={setPage}
        />
      </AdminResults>
      <AdminDialog
        open={pending?.type === "moderate"}
        title={moderationTitle}
        description={
          pending?.action === "delete"
            ? "This permanently removes the review and recomputes the vendor rating."
            : "The moderation action and reason are written to the audit log."
        }
        confirmLabel={
          pending?.action === "delete" ? "Delete review" : "Apply action"
        }
        danger={pending?.action === "delete" || pending?.action === "spam"}
        onClose={() => setPending(null)}
        onSubmit={submit}
        fields={[
          {
            name: "reason",
            label: "Reason",
            type: "textarea",
            placeholder: "Why is this action needed?",
            required:
              pending?.action === "delete" || pending?.action === "spam",
          },
        ]}
      />
      <AdminDialog
        open={pending?.type === "trust"}
        title="Adjust contributor trust"
        description={`Current score: ${pending?.review.user.trustScore ?? 0}`}
        confirmLabel="Adjust trust"
        onClose={() => setPending(null)}
        onSubmit={submit}
        fields={[
          {
            name: "delta",
            label: "Score change",
            type: "number",
            defaultValue: "-20",
            required: true,
          },
          { name: "reason", label: "Reason", type: "textarea", required: true },
        ]}
      />
    </div>
  );
}
