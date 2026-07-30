import { createFileRoute } from "@tanstack/react-router";
import { Info, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/common/search-input";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { TableSkeleton } from "@/components/common/skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useTransactions } from "@/hooks/queries/use-transactions";
import { formatCurrency, formatDate, formatMobile } from "@/utils/format";
import type { Transaction } from "@/types/api";

export const Route = createFileRoute("/donors/")({
  head: () => ({
    meta: [
      { title: "Donors — Vargani CMS" },
      {
        name: "description",
        content: "Donor insights derived from recorded transactions.",
      },
      { property: "og:title", content: "Donors — Vargani CMS" },
    ],
  }),
  component: DonorsPage,
});

interface DonorAggregate {
  key: string;
  name: string;
  mobile: string;
  buildingName: string;
  roomNumber: string | null;
  totalDonated: number;
  donationCount: number;
  firstDonation: string;
  lastDonation: string;
  transactions: Transaction[];
}

function DonorsPage() {
  return (
    <AppShell>
      <DonorsContent />
    </AppShell>
  );
}

function DonorsContent() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"total" | "count" | "recent">("total");
  const [selectedDonor, setSelectedDonor] = useState<DonorAggregate | null>(null);

  // Fetch a large batch of transactions to group client-side
  const { data, isLoading, isError, error, refetch } = useTransactions({
    limit: 200,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const donors = useMemo<DonorAggregate[]>(() => {
    const txs = data?.data ?? [];
    const map = new Map<string, DonorAggregate>();

    for (const tx of txs) {
      const key = tx.donor.mobile;
      const existing = map.get(key);
      if (existing) {
        existing.totalDonated += Number(tx.amount);
        existing.donationCount += 1;
        if (tx.donationDate < existing.firstDonation) {
          existing.firstDonation = tx.donationDate;
        }
        if (tx.donationDate > existing.lastDonation) {
          existing.lastDonation = tx.donationDate;
          existing.name = tx.donor.name;
          existing.buildingName = tx.building?.name ?? existing.buildingName;
          existing.roomNumber = tx.roomNumber ?? existing.roomNumber;
        }
        existing.transactions.push(tx);
      } else {
        map.set(key, {
          key,
          name: tx.donor.name,
          mobile: tx.donor.mobile,
          buildingName: tx.building?.name ?? "",
          roomNumber: tx.roomNumber ?? null,
          totalDonated: Number(tx.amount),
          donationCount: 1,
          firstDonation: tx.donationDate,
          lastDonation: tx.donationDate,
          transactions: [tx],
        });
      }
    }

    let arr = Array.from(map.values());
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.mobile.includes(q) ||
          d.buildingName.toLowerCase().includes(q),
      );
    }
    arr.sort((a, b) => {
      if (sortBy === "total") return b.totalDonated - a.totalDonated;
      if (sortBy === "count") return b.donationCount - a.donationCount;
      return new Date(b.lastDonation).getTime() - new Date(a.lastDonation).getTime();
    });
    return arr;
  }, [data, search, sortBy]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Donors"
        description="Donor insights derived from recorded transactions."
      />

      <div className="flex items-center gap-3 rounded-lg border border-info/25 bg-info/8 px-4 py-2.5 text-sm text-info">
        <Info className="size-4 shrink-0" />
        <p>
          The backend has no dedicated donor endpoint. Donors below are derived by
          grouping transactions by mobile number.
        </p>
      </div>

      <Card className="card-elevated rounded-xl">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search donor, mobile or building…"
            className="lg:w-72"
          />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total">Total donated</SelectItem>
              <SelectItem value="count">Donation count</SelectItem>
              <SelectItem value="recent">Most recent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isError ? (
          <ErrorState message={(error as Error)?.message} onRetry={() => void refetch()} />
        ) : isLoading ? (
          <TableSkeleton rows={8} columns={5} />
        ) : donors.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No donors found"
            description="Donors will appear here once transactions are recorded."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Mobile</th>
                  <th className="px-4 py-3 font-medium">Building / Room</th>
                  <th className="px-4 py-3 text-right font-medium">Total Donated</th>
                  <th className="px-4 py-3 text-right font-medium">Count</th>
                  <th className="px-4 py-3 font-medium">Last Donation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {donors.map((donor, index) => (
                  <motion.tr
                    key={donor.key}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.3) }}
                    className="cursor-pointer transition-colors hover:bg-muted/40"
                    onClick={() => setSelectedDonor(donor)}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{donor.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatMobile(donor.mobile)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {donor.buildingName} · {donor.roomNumber}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                      {formatCurrency(donor.totalDonated)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {donor.donationCount}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(donor.lastDonation)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Sheet open={!!selectedDonor} onOpenChange={(open) => !open && setSelectedDonor(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selectedDonor ? (
            <>
              <SheetHeader>
                <SheetTitle>{selectedDonor.name}</SheetTitle>
                <SheetDescription>
                  {formatMobile(selectedDonor.mobile)} · {selectedDonor.buildingName}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">Total Donated</p>
                    <p className="mt-1 font-display text-lg font-semibold text-primary">
                      {formatCurrency(selectedDonor.totalDonated)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">Donations</p>
                    <p className="mt-1 font-display text-lg font-semibold text-foreground">
                      {selectedDonor.donationCount}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">First Donation</p>
                    <p className="mt-1 text-sm text-foreground">
                      {formatDate(selectedDonor.firstDonation)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">Last Donation</p>
                    <p className="mt-1 text-sm text-foreground">
                      {formatDate(selectedDonor.lastDonation)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Donation History
                  </p>
                  <ul className="space-y-2">
                    {selectedDonor.transactions.map((tx) => (
                      <li
                        key={tx.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div className="min-w-0">
                          <p className="font-mono text-xs text-foreground">
                            {tx.receiptNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(tx.donationDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {tx.paymentMethod}
                          </Badge>
                          <span className="text-sm font-semibold text-foreground">
                            {formatCurrency(tx.amount)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
