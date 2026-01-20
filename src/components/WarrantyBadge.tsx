import { Badge } from "@/components/ui/badge";
import { WarrantyStatus } from "@/types/computer";
import { getWarrantyStatusText } from "@/utils/warrantyUtils";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface WarrantyBadgeProps {
  status: WarrantyStatus;
  daysUntilExpiry: number;
  showDays?: boolean;
}

export function WarrantyBadge({ status, daysUntilExpiry, showDays = true }: WarrantyBadgeProps) {
  const Icon = status === "valid" ? CheckCircle : status === "warning" ? AlertTriangle : XCircle;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 font-medium",
        status === "valid" && "border-warranty-valid text-warranty-valid bg-warranty-valid/10",
        status === "warning" && "border-warranty-warning text-warranty-warning bg-warranty-warning/10",
        status === "expired" && "border-warranty-expired text-warranty-expired bg-warranty-expired/10"
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{getWarrantyStatusText(status)}</span>
      {showDays && (
        <span className="text-xs opacity-80">
          {status === "expired"
            ? `(${Math.abs(daysUntilExpiry)} วันที่แล้ว)`
            : `(${daysUntilExpiry} วัน)`}
        </span>
      )}
    </Badge>
  );
}
