import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/common/search-input";
import { StatusBadge } from "@/components/common/status-badge";
import { DataPagination } from "@/components/common/data-pagination";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { TableSkeleton } from "@/components/common/skeletons";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuditLogs } from "@/hooks/queries/use-audit-logs";
import { useUrlSearchParams } from "@/hooks/use-url-search-params";
import { useAuth } from "@/providers/auth-provider";
import { formatDateTime } from "@/utils/format";
import { AUDIT_ACTIONS, AUDIT_ENTITIES } from "@/constants";
import type { AuditAction, AuditEntity, AuditLog } from "@/types/api";

export const Route = createFileRoute("/audit-logs/")({
  head: () => ({
    meta: [
      { title: "Audit Logs — Vargani CMS" },
      {
        name: "description",
        content: "Immutable activity log of every system action.",
      },
      { property: "og:title", content: "Audit Logs — Vargani CMS" },
    ],
  }),
  component: AuditLogsPage,
});

function AuditLogsPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) navigate({ to: "/dashboard", replace: true });
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  return (
    <AppShell>
      <AuditLogsContent />
    </AppShell>
  );
}

function AuditLogsContent() {
  const { params: searchParams, setParams } = useUrlSearchParams();

  const page = Number(searchParams.get("page") ?? 1) || 1;
  const limit = Number(searchParams.get("limit") ?? 20) || 20;
  const search = searchParams.get("search") ?? "";
  const entity = (searchParams.get("entity") ?? "") as AuditEntity | "";
  const action = (searchParams.get("action") ?? "") as AuditAction | "";

  const { data, isLoading, isError, error, refetch } = useAuditLogs({
    page,
    limit,
    search: search || undefined,
    entity: entity || undefined,
    action: action || undefined,
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const updateParams = (updates: Record<string, string | null>) => {
    setParams(updates);
  };

  const rows = data?.data ?? [];
  const pagination = data?.pagination;

  const renderDiff = (log: AuditLog) => {
    const oldVal = log.oldValue as Record<string, unknown> | null;
    const newVal = log.newValue as Record<string, unknown> | null;

    if (!oldVal && !newVal) {
      return (
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs text-muted-foreground">
          No change data recorded.
        </pre>
      );
    }

    const changedFields: Record<string, { from: unknown; to: unknown }> = {};
    if (newVal && typeof newVal === "object") {
      for (const [key, toVal] of Object.entries(newVal)) {
        const fromVal = oldVal && typeof oldVal === "object" ? (oldVal as Record<string, unknown>)[key] : undefined;
        if (JSON.stringify(fromVal) !== JSON.stringify(toVal)) {
          changedFields[key] = { from: fromVal, to: toVal };
        }
      }
    }

    if (Object.keys(changedFields).length === 0) {
      return (
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs text-muted-foreground">
          {JSON.stringify(newVal ?? oldVal, null, 2)}
        </pre>
      );
    }

    return (
      <div className="mt-2 space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Changed fields</p>
        <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs text-foreground">
          {JSON.stringify({ changedFields }, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Immutable record of every action in the system."
      />

      <Card className="card-elevated rounded-xl">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
          <SearchInput
            value={search}
            onChange={(value) => updateParams({ search: value, page: null })}
            placeholder="Search by label, user or email…"
            className="lg:w-72"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={entity}
              onValueChange={(value) => updateParams({ entity: value || null, page: null })}
            >
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All entities</SelectItem>
                {AUDIT_ENTITIES.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={action}
              onValueChange={(value) => updateParams({ action: value || null, page: null })}
            >
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All actions</SelectItem>
                {AUDIT_ACTIONS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isError ? (
          <ErrorState message={(error as Error)?.message} onRetry={() => void refetch()} />
        ) : isLoading ? (
          <TableSkeleton rows={10} columns={5} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No audit logs"
            description="Activity will appear here as actions are performed."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Actor</th>
                  <th className="px-4 py-3 font-medium">Entity</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Label</th>
                  <th className="px-4 py-3 font-medium">Timestamp</th>
                  <th className="px-4 py-3 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((log) => (
                  <>
                    <tr
                      key={log.id}
                      className="cursor-pointer transition-colors hover:bg-muted/40"
                      onClick={() =>
                        setExpandedId(expandedId === log.id ? null : log.id)
                      }
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">
                          {log.user?.name ?? "System"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.user?.email ?? "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-muted-foreground">
                          {log.entity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge value={log.action} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {log.entityLabel ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {expandedId === log.id ? (
                          <ChevronDown className="size-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="size-4 text-muted-foreground" />
                        )}
                      </td>
                    </tr>
                    {expandedId === log.id ? (
                      <tr key={`${log.id}-detail`}>
                        <td colSpan={6} className="bg-muted/20 px-4 py-3">
                          {renderDiff(log)}
                          {log.ipAddress ? (
                            <p className="mt-2 text-xs text-muted-foreground">
                              IP: {log.ipAddress}
                            </p>
                          ) : null}
                        </td>
                      </tr>
                    ) : null}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !isError && pagination ? (
          <DataPagination
            pagination={pagination}
            onPageChange={(p) => updateParams({ page: String(p) })}
            onLimitChange={(l) => updateParams({ limit: String(l), page: "1" })}
          />
        ) : null}
      </Card>
    </div>
  );
}
