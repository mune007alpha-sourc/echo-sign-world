import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "idle" | "active" | "error" | "success";
  label: string;
  className?: string;
}

export function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
  const statusColors = {
    idle: "bg-muted-foreground/40",
    active: "bg-success",
    error: "bg-destructive",
    success: "bg-primary",
  };

  const statusLabels = {
    idle: "Ready",
    active: "Active",
    error: "Error",
    success: "Complete",
  };

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      role="status"
      aria-live="polite"
    >
      <span className="relative flex h-3 w-3">
        {status === "active" && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              statusColors[status]
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex h-3 w-3 rounded-full",
            statusColors[status]
          )}
        />
      </span>
      <span className="text-sm font-medium text-muted-foreground">
        {label || statusLabels[status]}
      </span>
    </div>
  );
}
