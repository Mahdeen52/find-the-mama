"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AdminPagination,
  AdminResults,
  type AdminPage,
} from "@/components/admin/admin-results";
import { api } from "@/lib/api";
import { StatusBadge, TrustBadge } from "@/components/admin/badges";
type User = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  role: string;
  status: string;
  trustScore: number;
  isTrustedContributor: boolean;
  contributionPoints: number;
  createdAt: string;
  _count: { reviews: number; vendors: number };
};
export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [trusted, setTrusted] = useState("");
  const [page, setPage] = useState(1);
  const q = useQuery({
    queryKey: ["admin-users", search, role, trusted, page],
    queryFn: () =>
      api<AdminPage<User>>(
        `/api/admin/users?search=${encodeURIComponent(search)}&role=${role}&trusted=${trusted}&page=${page}`,
      ),
  });
  return (
    <div>
      <h1 className="page-title break-words">Users</h1>
      <p className="mt-2 text-muted">
        Manage trust, access roles and account safety.
      </p>
      <div className="card mt-6 grid gap-3 p-4 xl:grid-cols-[minmax(0,1fr)_180px_180px]">
        <label>
          <span className="label">Search users</span>
          <input
            type="search"
            className="field"
            placeholder="Search name, phone or email"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label>
          <span className="label">Role</span>
          <select
            className="field"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All roles</option>
            {["USER", "MODERATOR", "ADMIN"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Trust state</span>
          <select
            className="field"
            value={trusted}
            onChange={(e) => {
              setTrusted(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All trust states</option>
            <option value="true">Trusted</option>
            <option value="false">Standard</option>
          </select>
        </label>
      </div>
      <AdminResults
        query={q}
        empty={q.data?.total === 0 ? "No users found" : undefined}
      >
        <div
          className="table-scroll mt-6"
          tabIndex={0}
          role="region"
          aria-label="Users table"
        >
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-surface">
              <tr>
                {[
                  "User",
                  "Contact",
                  "Role",
                  "Trust",
                  "Status",
                  "Points",
                  "Content",
                  "Created",
                ].map((h) => (
                  <th className="p-4" key={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {q.data?.items.map((u) => (
                <tr className="border-t" key={u.id}>
                  <td className="p-4 font-bold">
                    <Link className="text-link" href={`/admin/users/${u.id}`}>
                      {u.name || "Unnamed"}
                    </Link>
                  </td>
                  <td className="p-4">
                    {u.phone || "—"}
                    <br />
                    <span className="text-xs text-muted">{u.email}</span>
                  </td>
                  <td className="p-4">{u.role}</td>
                  <td className="p-4">
                    <TrustBadge
                      trusted={u.isTrustedContributor}
                      score={u.trustScore}
                    />
                  </td>
                  <td className="p-4">
                    <StatusBadge value={u.status} />
                  </td>
                  <td className="p-4">{u.contributionPoints}</td>
                  <td className="p-4">
                    {u._count.reviews} reviews · {u._count.vendors} vendors
                  </td>
                  <td className="p-4">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t p-4 text-sm text-muted">
            {q.data?.total ?? 0} users
          </p>
        </div>
        <AdminPagination
          page={page}
          pages={q.data?.pages ?? 1}
          setPage={setPage}
        />
      </AdminResults>
    </div>
  );
}
