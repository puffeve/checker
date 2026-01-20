import { Badge } from "@/components/ui/badge";
import { ComputerStatus } from "@/types/computer";
import { getComputerStatusText } from "@/utils/warrantyUtils";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ComputerStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-medium",
        status === "active" && "bg-warranty-valid/20 text-warranty-valid border-warranty-valid",
        status === "repair" && "bg-warranty-warning/20 text-warranty-warning border-warranty-warning",
        status === "retired" && "bg-muted text-muted-foreground"
      )}
    >
      {getComputerStatusText(status)}
    </Badge>
  );
}
