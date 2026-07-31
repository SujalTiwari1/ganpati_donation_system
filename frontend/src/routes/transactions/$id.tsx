import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { ArrowLeft, Download, Circle as XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { WhatsAppStatusBadge } from "@/components/common/whatsapp-status-badge";
import { ErrorState } from "@/components/common/error-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransaction, useCancelTransaction } from "@/hooks/queries/use-transactions";
import { transactionsService } from "@/api/services/transactions.service";
import { useAuth } from "@/providers/auth-provider";
import { formatCurrency, formatDate, formatDateTime, formatMobile, titleCase } from "@/utils/format";

export const Route = createFileRoute("/transactions/$id")({
  head: () => ({
    meta: [
      { title: "Transaction detail — Vargani CMS" },
      { name: "description", content: "Full record, status and receipt for this donation." },
      { property: "og:title", content: "Transaction detail — Vargani CMS" },
    ],
  }),
  component: TransactionDetailPage,
});

function TransactionDetailPage() {
  return (
    <AppShell>
      <TransactionDetailContent />
    </AppShell>
  );
}

function TransactionDetailContent() {
  const { id } = useParams({ strict: false }) as { id: string };
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { data: tx, isLoading, isError, error, refetch } = useTransaction(id);
  const cancelMutation = useCancelTransaction();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!tx) return;
    setDownloading(true);
    try {
      const blob = await transactionsService.receiptBlob(tx.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Receipt_${tx.receiptNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Receipt downloaded successfully.");
    } catch (e: any) {
      if (e?.status === 404) {
        toast.error("Receipt not found.");
      } else {
        toast.error("Unable to download receipt.");
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleCancel = () => {
    cancelMutation.mutate(tx!.id, {
      onSuccess: () => refetch(),
    });
  };

  if (isError) {
    return (
      <Card>
        <ErrorState message={(error as Error)?.message} onRetry={() => void refetch()} />
      </Card>
    );
  }

  if (isLoading || !tx) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const detailRows: { label: string; value: React.ReactNode }[] = [
    { label: "Receipt Number", value: <span className="font-mono">{tx.receiptNumber}</span> },
    { label: "Donor", value: tx.donor.name },
    { label: "Mobile", value: formatMobile(tx.donor.mobile) },
    { label: "Building", value: tx.building.name },
    { label: "Room", value: tx.roomNumber },
    { label: "Amount", value: <span className="font-semibold">{formatCurrency(tx.amount)}</span> },
    { label: "Payment Method", value: titleCase(tx.paymentMethod) },
    { label: "Status", value: <StatusBadge value={tx.status} /> },
    { label: "WhatsApp", value: <WhatsAppStatusBadge status={tx.whatsappStatus} /> },
    { label: "Donation Date", value: formatDate(tx.donationDate) },
    { label: "Recorded", value: formatDateTime(tx.createdAt) },
    ...(tx.updatedAt ? [{ label: "Last Updated", value: formatDateTime(tx.updatedAt) }] : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Receipt ${tx.receiptNumber}`}
        description="Full transaction record and receipt."
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="active:scale-95">
              <Link to="/transactions">
                <ArrowLeft className="size-4" /> Back
              </Link>
            </Button>
            <Button onClick={handleDownload} disabled={downloading} className="active:scale-95">
              <Download className="size-4" /> {downloading ? "Preparing…" : "Download"}
            </Button>
            {isAdmin && tx.status !== "CANCELLED" ? (
              <Button
                variant="destructive"
                size="sm"
                className="active:scale-95"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
              >
                <XCircle className="size-4" /> Cancel
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="card-elevated rounded-xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Transaction Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-border">
              {detailRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <dt className="text-sm text-muted-foreground">{row.label}</dt>
                  <dd className="text-sm font-medium text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card className="card-elevated rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {tx.notes ? (
              <p className="text-sm text-foreground">{tx.notes}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No notes recorded.</p>
            )}

            {tx.isDuplicate ? (
              <div className="mt-4 rounded-lg border border-warning/30 bg-warning/8 p-3">
                <p className="text-xs font-medium text-warning">Duplicate donation</p>
                {tx.duplicateOverrideReason ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {tx.duplicateOverrideReason}
                  </p>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
