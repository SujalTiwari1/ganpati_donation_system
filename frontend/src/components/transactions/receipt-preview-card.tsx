import { Flower2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";
import { amountToWords } from "@/utils/amount-to-words";
import { titleCase } from "@/utils/format";
import type { PaymentMethod } from "@/types/api";

export interface ReceiptPreviewData {
  receiptNumber?: string;
  donorName: string;
  donorMobile: string;
  buildingName: string;
  roomNumber: string;
  amount: number;
  paymentMethod: PaymentMethod;
  donationDate?: string;
  volunteerName?: string;
}

export function ReceiptPreviewCard({ data }: { data: ReceiptPreviewData }) {
  const today = data.donationDate
    ? new Date(data.donationDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

  return (
    <Card className="card-elevated overflow-hidden rounded-xl">
      <div className="bg-gradient-to-br from-primary/12 to-primary/4 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Flower2 className="size-4" />
          </span>
          <div>
            <p className="font-display text-sm font-semibold text-foreground">Vargani CMS</p>
            <p className="text-[11px] text-muted-foreground">Ganpati Collection Receipt</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 px-5 py-4 text-sm">
        <div className="flex items-center justify-between border-b border-dashed border-border pb-2">
          <span className="text-muted-foreground">Receipt No.</span>
          <span className="font-mono font-medium text-foreground">
            {data.receiptNumber ?? "— (pending)"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Date</span>
          <span className="font-medium text-foreground">{today}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Donor</span>
          <span className="max-w-[60%] truncate font-medium text-foreground">
            {data.donorName || "—"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Mobile</span>
          <span className="font-medium text-foreground">
            {data.donorMobile || "—"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Building / Room</span>
          <span className="max-w-[60%] truncate text-right font-medium text-foreground">
            {data.buildingName || "—"}
            {data.roomNumber ? ` · ${data.roomNumber}` : ""}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Method</span>
          <span className="font-medium text-foreground">{titleCase(data.paymentMethod)}</span>
        </div>

        <div className="border-t border-dashed border-border pt-3">
          <p className="text-xs text-muted-foreground">Amount</p>
          <p className="font-display text-3xl font-semibold text-primary">
            {formatCurrency(data.amount || 0)}
          </p>
          <p className="mt-1 text-xs italic text-muted-foreground">
            {data.amount ? amountToWords(data.amount) : "—"}
          </p>
        </div>

        {data.volunteerName ? (
          <p className="pt-1 text-[11px] text-muted-foreground">
            Collected by {data.volunteerName}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
