import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComputerFromDB } from "@/hooks/useComputers";
import { WarrantyBadge } from "./WarrantyBadge";
import { Monitor, Hash, User, Shield, Cpu } from "lucide-react";
import { getWarrantyStatus, getDaysUntilExpiry } from "@/utils/warrantyUtils";

// ลบการ import WarrantyStatus ที่มีปัญหาออก 
// และใช้ Type โดยตรงแทนเพื่อความชัวร์
interface ComputerCardProps {
  computer: ComputerFromDB;
}

export function ComputerCard({ computer }: ComputerCardProps) {
  
  // คำนวณสถานะประกัน
  // ใช้ 'as any' หรือระบุ union type เพื่อเลี่ยง error จากการ import utils
  const wStatus = getWarrantyStatus(computer.warranty_expiry) as "valid" | "warning" | "expired";
  const daysRemaining = getDaysUntilExpiry(computer.warranty_expiry);

  return (
    <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Monitor className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">{computer.device_name}</CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-center gap-3 text-sm">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground w-24">รุ่น/โมเดล:</span>
            <span className="font-medium">{computer.model || "-"}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground w-24">ซีเรียล:</span>
            <span className="font-mono font-medium">{computer.serial_number}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground w-24">ผู้ใช้งาน:</span>
            <span className="font-medium">{computer.user_name || "ไม่ระบุ"}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground w-24">หมดประกัน:</span>
            <span className="font-medium">
              {computer.warranty_expiry || "-"}
            </span>
          </div>
        </div>

        {/* หมายเหตุ */}
        {computer.notes && (
          <div className="pt-2 text-xs text-muted-foreground italic border-t border-dashed">
            หมายเหตุ: {computer.notes}
          </div>
        )}

        {/* แสดงเฉพาะสถานะประกัน */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">สถานะการรับประกัน:</span>
            <WarrantyBadge 
              status={wStatus} 
              daysUntilExpiry={daysRemaining} 
              showDays={true}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}