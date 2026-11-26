"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { Skeleton, StatePanel } from "@/components/ui";

export type AdminPage<T> = {
  items: T[];
  total: number;
  page: number;
  pages: number;
};

export function AdminResults({
  query,
  empty,
  children,
}: {
  query: { isPending: boolean; isError: boolean; refetch: () => unknown };
  empty?: string;
  children: React.ReactNode;
}) {
  if (query.isPending)
    return <Skeleton className="mt-6 h-52" label="Loading…" />;
  if (query.isError)
    return (
      <div className="mt-6">
        <StatePanel
          error
          title="Could not load results"
          description="Try again to refresh this view."
          action={
            <button
              type="button"
              className="btn-primary"
              onClick={() => void query.refetch()}
            >
              Try again
            </button>
          }
        />
      </div>
    );
  if (empty)
    return (
      <div className="mt-6">
        <StatePanel title={empty} />
      </div>
    );
  return <>{children}</>;
}

export function AdminPagination({
  page,
  pages,
  setPage,
}: {
  page: number;
  pages: number;
  setPage: (page: number) => void;
}) {
  const last = Math.max(1, pages);
  useEffect(() => {
    if (page > last) setPage(last);
  }, [last, page, setPage]);
  if (last === 1) return null;

  return (
    <nav
      aria-label="Results pages"
      className="mt-4 flex flex-wrap items-center justify-end gap-2 text-sm"
    >
      <button
        type="button"
        className="btn-secondary"
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
      >
        <ChevronLeft size={16} aria-hidden="true" />
        Previous
      </button>
      <span className="px-2 text-muted" aria-live="polite">
        Page {page} of {pages}
      </span>
      <button
        type="button"
        className="btn-secondary"
        disabled={page >= last}
        onClick={() => setPage(page + 1)}
      >
        Next
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  );
}
