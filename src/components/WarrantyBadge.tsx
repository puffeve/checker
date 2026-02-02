import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { WarrantyStatus } from "@/utils/warrantyUtils";

interface WarrantyBadgeProps {
  status: WarrantyStatus;
  daysUntilExpiry: number;
}

export function WarrantyBadge({
  status,
  daysUntilExpiry,
}: WarrantyBadgeProps) {
  const Icon =
    status === "valid"
      ? CheckCircle
      : status === "warning"
      ? AlertTriangle
      : XCircle;

  const label =
    status === "valid"
      ? `อยู่ในประกัน (${daysUntilExpiry} วัน)`
      : status === "warning"
      ? `ใกล้หมดประกัน (${daysUntilExpiry} วัน)`
      : "หมดประกัน";

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 font-medium",
        status === "valid" &&
          "border-green-500 text-green-600 bg-green-50",
        status === "warning" &&
          "border-yellow-400 text-yellow-600 bg-yellow-50",
        status === "expired" &&
          "border-red-500 text-red-600 bg-red-50"
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </Badge>
  );
}