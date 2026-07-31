import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PAYMENT_METHODS, TRANSACTION_STATUSES, WHATSAPP_STATUSES } from "@/constants";
import { AnalyticsFiltersState } from "../types";
import { parseISO } from "date-fns";
import { FilterX } from "lucide-react";

interface AnalyticsFiltersProps {
  filters: AnalyticsFiltersState;
  onChange: (filters: AnalyticsFiltersState) => void;
}

export function AnalyticsFilters({ filters, onChange }: AnalyticsFiltersProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleReset = () => {
    onChange({
      year: currentYear,
    });
  };

  return (
    <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Festival Year</label>
          <Select
            value={String(filters.year || currentYear)}
            onValueChange={(val) => onChange({ ...filters, year: Number(val) })}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Payment Method</label>
          <Select
            value={filters.paymentMethod || "ALL"}
            onValueChange={(val) => onChange({ ...filters, paymentMethod: val as any })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Methods</SelectItem>
              {PAYMENT_METHODS.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <Select
            value={filters.status || "ALL"}
            onValueChange={(val) => onChange({ ...filters, status: val as any })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {TRANSACTION_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">WhatsApp Status</label>
          <Select
            value={filters.whatsappStatus || "ALL"}
            onValueChange={(val) => onChange({ ...filters, whatsappStatus: val as any })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All WA Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All WA Statuses</SelectItem>
              {WHATSAPP_STATUSES.map((ws) => (
                <SelectItem key={ws} value={ws}>
                  {ws}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">From Date</label>
          <Input
            type="date"
            className="h-9"
            value={filters.fromDate ? filters.fromDate.toISOString().split("T")[0] : ""}
            onChange={(e) =>
              onChange({ ...filters, fromDate: e.target.value ? parseISO(e.target.value) : undefined })
            }
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">To Date</label>
          <div className="flex gap-2">
            <Input
              type="date"
              className="h-9 flex-1"
              value={filters.toDate ? filters.toDate.toISOString().split("T")[0] : ""}
              onChange={(e) =>
                onChange({ ...filters, toDate: e.target.value ? parseISO(e.target.value) : undefined })
              }
            />
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={handleReset} title="Reset Filters">
              <FilterX className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
