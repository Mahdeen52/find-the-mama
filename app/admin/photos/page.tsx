"use client";

import { VendorPhoto } from "@/components/vendor-photo";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AdminDialog } from "@/components/admin/admin-dialog";
import {
  AdminPagination,
  AdminResults,
  type AdminPage,
} from "@/components/admin/admin-results";
import { api } from "@/lib/api";

type Photo = {
  id: string;
  photoUrl: string;
  caption: string | null;
  isHidden: boolean;
  isInappropriate: boolean;
  createdAt: string;
  vendor: { name: string };
  user: { name: string | null };
};
export default function PhotosPage() {
  const [flagged, setFlagged] = useState(false);
  const [deleting, setDeleting] = useState<Photo | null>(null);
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["admin-photos", flagged, page],
    queryFn: () =>
      api<AdminPage<Photo>>(
        `/api/admin/photos?flagged=${flagged || ""}&page=${page}`,
      ),
  });
  const act = async (
    photo: Photo,
    action: string,
    reason = `Admin ${action}`,
  ) => {
    try {
      await api(`/api/admin/photos/${photo.id}/moderate`, {
        method: "POST",
        body: JSON.stringify({ action, reason }),
      });
      toast.success("Photo updated");
      await query.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
      throw error;
    }
  };
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title break-words">Photos</h1>
          <p className="mt-2 text-muted">
            Review recent and reported community uploads.
          </p>
        </div>
        <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={flagged}
            onChange={(event) => {
              setFlagged(event.target.checked);
              setPage(1);
            }}
          />
          Flagged only
        </label>
      </div>
      <AdminResults
        query={query}
        empty={query.data?.total === 0 ? "No photos found" : undefined}
      >
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {query.data?.items.map((photo) => (
            <article className="card overflow-hidden" key={photo.id}>
              <div className="relative aspect-video bg-surface">
                <VendorPhoto
                  src={photo.photoUrl}
                  alt={photo.caption || "Community upload"}
                  sizes="(max-width: 639px) 100vw, 35vw"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between gap-2">
                  <b>{photo.vendor.name}</b>
                  <span className="text-xs text-muted">
                    {photo.user.name || "Unknown"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {photo.caption || "No caption"}
                </p>
                <p className="mt-2 text-xs">
                  {photo.isInappropriate
                    ? "Inappropriate"
                    : photo.isHidden
                      ? "Hidden"
                      : "Visible"}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  <button
                    className="btn-ghost px-2"
                    onClick={() =>
                      void act(photo, photo.isHidden ? "show" : "hide").catch(
                        () => undefined,
                      )
                    }
                  >
                    {photo.isHidden ? "Show" : "Hide"}
                  </button>
                  <button
                    className="btn-ghost px-2 text-brand-700"
                    onClick={() =>
                      void act(
                        photo,
                        photo.isInappropriate ? "appropriate" : "inappropriate",
                      ).catch(() => undefined)
                    }
                  >
                    {photo.isInappropriate
                      ? "Mark appropriate"
                      : "Inappropriate"}
                  </button>
                  <button
                    className="btn-ghost px-2 text-red-700"
                    onClick={() => setDeleting(photo)}
                  >
                    Delete
                  </button>
                </div>
              </div>
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
        open={Boolean(deleting)}
        title="Delete photo?"
        description={`Permanently remove this upload from ${deleting?.vendor.name || "the vendor"}.`}
        confirmLabel="Delete photo"
        danger
        onClose={() => setDeleting(null)}
        onSubmit={async (values) => {
          if (deleting) await act(deleting, "delete", values.reason);
        }}
        fields={[
          { name: "reason", label: "Reason", type: "textarea", required: true },
        ]}
      />
    </div>
  );
}
