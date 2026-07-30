import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="rounded-2xl bg-destructive/10 p-3 text-destructive">
        <AlertTriangle className="size-6" />
      </span>
      <div className="space-y-1">
        <p className="font-medium text-foreground">{title}</p>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          {message ?? "We couldn't load this data."}
        </p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="active:scale-95">
          <RefreshCw className="size-4" /> Retry
        </Button>
      ) : null}
    </div>
  );
}