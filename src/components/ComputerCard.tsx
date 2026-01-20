import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComputerWithWarranty } from "@/types/computer";
import { WarrantyBadge } from "./WarrantyBadge";
import { StatusBadge } from "./StatusBadge";
import { Monitor, Hash, Building2, Calendar, Shield } from "lucide-react";
import { format, parseISO } from "date-fns";
import { th } from "date-fns/locale";

interface ComputerCardProps {
  computer: ComputerWithWarranty;
}

export function ComputerCard({ computer }: ComputerCardProps) {
  return (
    <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Monitor className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">{computer.name}</CardTitle>
          </div>
          <StatusBadge status={computer.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-center gap-3 text-sm">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">ซีเรียลนัมเบอร์:</span>
            <span className="font-mono font-medium">{computer.serialNumber}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">แผนก:</span>
            <span className="font-medium">{computer.department}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">ลงทะเบียน:</span>
            <span className="font-medium">
              {format(parseISO(computer.registrationDate), "d MMMM yyyy", { locale: th })}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">หมดประกัน:</span>
            <span className="font-medium">
              {format(parseISO(computer.warrantyEndDate), "d MMMM yyyy", { locale: th })}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">สถานะประกัน:</span>
            <WarrantyBadge 
              status={computer.warrantyStatus} 
              daysUntilExpiry={computer.daysUntilExpiry} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
