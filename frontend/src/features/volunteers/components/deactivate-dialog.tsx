import { TriangleAlert as AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function DeactivateDialog({
  open,
  onOpenChange,
  volunteerName,
  action,
  onConfirm,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volunteerName: string;
  action: "deactivate" | "activate";
  onConfirm: () => void;
  isSubmitting: boolean;
}) {
  const isDeactivate = action === "deactivate";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isDeactivate ? "Deactivate this volunteer?" : "Activate this volunteer?"}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex items-start gap-2">
              {isDeactivate ? (
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
              ) : null}
              <span>
                {isDeactivate
                  ? `${volunteerName} will no longer be able to login.`
                  : `${volunteerName} will be able to login again.`}
              </span>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isSubmitting}
            className={
              isDeactivate
                ? "bg-warning text-warning-foreground hover:bg-warning/90"
                : "bg-success text-success-foreground hover:bg-success/90"
            }
          >
            {isDeactivate ? "Deactivate" : "Activate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
