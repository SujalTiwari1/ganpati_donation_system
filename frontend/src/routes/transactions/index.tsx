import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Download, Eye, MoveVertical as MoreVertical, Plus, Circle as XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/common/search-input";
import { StatusBadge } from "@/components/common/status-badge";
import { WhatsAppStatusBadge } from "@/components/common/whatsapp-status-badge";
import { DataPagination } from "@/components/common/data-pagination";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { TableSkeleton } from "@/components/common/skeletons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTransactions, useCancelTransaction } from "@/hooks/queries/use-transactions";
import { useUrlSearchParams } from "@/hooks/use-url-search-params";
import { transactionsService } from "@/api/services/transactions.service";
import { useAuth } from "@/providers/auth-provider";
import { formatCurrency, formatDate, formatMobile, titleCase } from "@/utils/format";
import { PAYMENT_METHODS, TRANSACTION_STATUSES } from "@/constants";
import type { PaymentMethod, TransactionStatus } from "@/types/api";

export const Route = createFileRoute("/transactions/")({
  head: () => ({
    meta: [
      { title: "Transactions — Vargani CMS" },
      {
        name: "description",
        content: "Browse, filter and manage every recorded Ganpati vargani donation.",
      },
      { property: "og:title", content: "Transactions — Vargani CMS" },
      { property: "og:description", content: "Full donation ledger with filters and receipts." },
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  return (
    <AppShell>
      <TransactionsContent />
    </AppShell>
  );
}

const DEFAULT_LIMIT = 20;

function TransactionsContent() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { params: searchParams, setParams: setSearchParams } = useUrlSearchParams();
  const cancelMutation = useCancelTransaction();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const page = Number(searchParams.get("page") ?? 1) || 1;
  const limit = Number(searchParams.get("limit") ?? DEFAULT_LIMIT) || DEFAULT_LIMIT;
  const search = searchParams.get("search") ?? "";
  const paymentMethod = searchParams.get("paymentMethod") ?? "";
  const status = searchParams.get("status") ?? "";
  const year = searchParams.get("year") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = searchParams.get("sortOrder") ?? "desc";

  const params = {
    page,
    limit,
    search: search || undefined,
    paymentMethod: (paymentMethod || undefined) as PaymentMethod | undefined,
    status: (status || undefined) as TransactionStatus | undefined,
    year: year ? Number(year) : undefined,
    sortBy: sortBy as "donationDate" | "amount" | "createdAt" | "receiptNumber",
    sortOrder: sortOrder as "asc" | "desc",
  };

  const { data, isLoading, isError, error, refetch } = useTransactions(params);

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    if (!("page" in updates)) next.delete("page");
    setSearchParams(Object.fromEntries(next.entries()));
  };

  const handleDownload = async (id: string, receiptNumber: string) => {
    if (downloadingId) return;
    setDownloadingId(id);
    try {
      const blob = await transactionsService.receiptBlob(id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Receipt_${receiptNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Receipt downloaded successfully");
    } catch (e: any) {
      if (e?.status === 404) {
        toast.error("Receipt not found.");
      } else {
        toast.error("Unable to download receipt.");
      }
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCancel = (id: string) => {
    cancelMutation.mutate(id);
  };

  const rows = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Every recorded donation, filterable and auditable."
        actions={
          <Button asChild className="active:scale-95">
            <Link to="/transactions/new">
              <Plus className="size-4" /> New Donation
            </Link>
          </Button>
        }
      />

      <Card className="card-elevated rounded-xl">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
          <SearchInput
            value={search}
            onChange={(value) => updateParams({ search: value, page: null })}
            placeholder="Search donor, mobile or receipt…"
            className="lg:w-72"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={paymentMethod}
              onValueChange={(value) => updateParams({ paymentMethod: value || null, page: null })}
            >
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All methods</SelectItem>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {titleCase(method)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={status}
              onValueChange={(value) => updateParams({ status: value || null, page: null })}
            >
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                {TRANSACTION_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {titleCase(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={year}
              onValueChange={(value) => updateParams({ year: value || null, page: null })}
            >
              <SelectTrigger className="h-9 w-[110px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All years</SelectItem>
                {Array.from({ length: 5 }).map((_, i) => {
                  const y = new Date().getFullYear() - i;
                  return (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value) => updateParams({ sortBy: value, page: null })}
            >
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date added</SelectItem>
                <SelectItem value="donationDate">Donation date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="receiptNumber">Receipt no.</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setSearchParams({ page: "1", limit: String(limit), search: null, paymentMethod: null, status: null, year: null, sortBy: null, sortOrder: null })
              }
              className="active:scale-95"
            >
              Clear
            </Button>
          </div>
        </div>

        {isError ? (
          <ErrorState message={(error as Error)?.message} onRetry={() => void refetch()} />
        ) : isLoading ? (
          <TableSkeleton rows={8} columns={7} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="No transactions found"
            description="Try adjusting your filters, or record a new donation."
            action={
              <Button asChild size="sm">
                <Link to="/transactions/new">Record donation</Link>
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Receipt</th>
                  <th className="px-4 py-3 font-medium">Donor</th>
                  <th className="px-4 py-3 font-medium">Building / Room</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">WhatsApp</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((tx, index) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.3) }}
                    className="cursor-pointer transition-colors hover:bg-muted/40"
                    onClick={() => navigate({ to: "/transactions/$id", params: { id: tx.id } })}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-foreground">
                      {tx.receiptNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{tx.donor.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatMobile(tx.donor.mobile)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground">{tx.building.name}</p>
                      <p className="text-xs text-muted-foreground">{tx.roomNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {titleCase(tx.paymentMethod)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={tx.status} />
                    </td>
                    <td className="px-4 py-3">
                      <WhatsAppStatusBadge status={tx.whatsappStatus} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(tx.donationDate)}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to="/transactions/$id" params={{ id: tx.id }}>
                              <Eye className="size-4" /> View detail
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleDownload(tx.id, tx.receiptNumber); }} disabled={downloadingId === tx.id}>
                            <Download className="size-4" /> {downloadingId === tx.id ? "Downloading..." : "Download receipt"}
                          </DropdownMenuItem>
                          {isAdmin && tx.status !== "CANCELLED" ? (
                            <DropdownMenuItem
                              onSelect={() => handleCancel(tx.id)}
                              className="text-destructive"
                            >
                              <XCircle className="size-4" /> Cancel
                            </DropdownMenuItem>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
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
