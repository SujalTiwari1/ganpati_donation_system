import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNumber } from "@/utils/format";
import type { Pagination } from "@/types/api";

export function DataPagination({
  pagination,
  onPageChange,
  onLimitChange,
}: {
  pagination?: Pagination;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}) {
  if (!pagination) return null;
  const { page, limit, total, totalPages } = pagination;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-medium text-foreground">{formatNumber(from)}</span>–
        <span className="font-medium text-foreground">{formatNumber(to)}</span> of{" "}
        <span className="font-medium text-foreground">{formatNumber(total)}</span>
      </p>
      <div className="flex items-center gap-2">
        {onLimitChange ? (
          <Select value={String(limit)} onValueChange={(value) => onLimitChange(Number(value))}>
            <SelectTrigger className="h-9 w-[104px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="active:scale-95"
        >
          <ChevronLeft className="size-4" /> Prev
        </Button>
        <span className="px-1 text-xs text-muted-foreground">
          Page {page} of {Math.max(totalPages, 1)}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="active:scale-95"
        >
          Next <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}