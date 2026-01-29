import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { WarrantyBadge } from "@/components/WarrantyBadge";
import { AdminLogin } from "@/components/AdminLogin";
import { EditComputerDialog } from "@/components/EditComputerDialog";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useComputers } from "@/hooks/useComputers";
import { getWarrantyStatus, getDaysUntilExpiry } from "@/utils/warrantyUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO, isValid } from "date-fns";
import { th } from "date-fns/locale";
import {
  Monitor,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  LogOut,
  Pencil,
  Loader2,
} from "lucide-react";

export default function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, login, logout } = useAdminAuth();
  const { data: computersData, isLoading, error } = useComputers();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ทั้งหมด");
  const [warrantyFilter, setWarrantyFilter] = useState("all");
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedComputer, setSelectedComputer] = useState<any | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleEdit = (computer: any) => {
    setSelectedComputer({
        id: computer.id,
        device_name: computer.device_name,
        serial_number: computer.serial_number,
        user_name: computer.user_name || computer.notes,
        status: computer.status,
        warranty_expiry: computer.warranty_expiry,
        notes: computer.notes
    });
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["computers"] });
  };

  // 1. แปลงข้อมูลและคำนวณสถานะประกัน
  const computersWithWarranty = useMemo(() => {
    if (!computersData) return [];
    
    return computersData.map((computer) => {
      try {
        const warrantyDate = computer.warranty_expiry; 
        const isDateValid = warrantyDate && warrantyDate !== "-" && warrantyDate.length > 5;

        return {
          ...computer,
          name: computer.device_name || "ไม่ระบุชื่อ", 
          display_user: computer.user_name || computer.notes || "-", 
          warrantyStatus: isDateValid ? getWarrantyStatus(warrantyDate) : "expired",
          daysUntilExpiry: isDateValid ? getDaysUntilExpiry(warrantyDate) : 0,
        };
      } catch (err) {
        return {
          ...computer,
          name: "Error",
          display_user: "-",
          warrantyStatus: "expired",
          daysUntilExpiry: 0,
        };
      }
    });
  }, [computersData]);

  // 2. สร้างรายการตัวกรองแผนก/ผู้ใช้งาน
  const uniqueDepartments = useMemo(() => {
    if (!computersWithWarranty) return [];
    const depts = new Set(computersWithWarranty.map(c => c.display_user).filter(d => d && d !== "-"));
    return Array.from(depts).sort();
  }, [computersWithWarranty]);

  // 3. กรองข้อมูล (ตัด Status Filter ออก)
  const filteredComputers = useMemo(() => {
    return computersWithWarranty.filter((computer) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        (computer.name || "").toLowerCase().includes(query) ||
        (computer.serial_number || "").toLowerCase().includes(query) ||
        (computer.display_user || "").toLowerCase().includes(query);

      const matchesDepartment =
        departmentFilter === "ทั้งหมด" || computer.display_user === departmentFilter;

      const matchesWarranty =
        warrantyFilter === "all" || computer.warrantyStatus === warrantyFilter;

      return matchesSearch && matchesDepartment && matchesWarranty;
    });
  }, [computersWithWarranty, searchQuery, departmentFilter, warrantyFilter]);

  const stats = useMemo(() => {
    const total = computersWithWarranty.length;
    const nearExpiry = computersWithWarranty.filter(c => c.warrantyStatus === "warning").length;
    const expired = computersWithWarranty.filter(c => c.warrantyStatus === "expired").length;
    const valid = total - expired;

    return { total, valid, nearExpiry, expired };
  }, [computersWithWarranty]);

  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">แดชบอร์ดผู้ดูแลระบบ</h2>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" /> ออกจากระบบ
          </Button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{stats.total}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">อยู่ในประกัน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold text-green-500">{stats.valid}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ใกล้หมดประกัน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span className="text-2xl font-bold text-orange-500">{stats.nearExpiry}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">หมดประกัน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold text-red-500">{stats.expired}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" /> ตัวกรองข้อมูล
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาชื่อ, ซีเรียล, ผู้ใช้งาน..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="กรองตามผู้ใช้งาน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ทั้งหมด">ผู้ใช้งานทั้งหมด</SelectItem>
                  {uniqueDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={warrantyFilter} onValueChange={setWarrantyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="สถานะประกัน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ประกันทั้งหมด</SelectItem>
                  <SelectItem value="valid">อยู่ในประกัน</SelectItem>
                  <SelectItem value="warning">ใกล้หมดประกัน</SelectItem>
                  <SelectItem value="expired">หมดประกัน</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>รายการคอมพิวเตอร์</span>
              <span className="text-sm font-normal text-muted-foreground">
                แสดง {filteredComputers.length} รายการ
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin mr-2" /> กำลังโหลด...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>ชื่อคอม</TableHead>
                      <TableHead>ซีเรียลนัมเบอร์</TableHead>
                      <TableHead>ผู้ใช้งาน / หมายเหตุ</TableHead>
                      <TableHead>สถานะประกัน</TableHead>
                      <TableHead className="w-20">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComputers.map((computer, index) => (
                      <TableRow key={computer.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{computer.name}</TableCell>
                        <TableCell className="font-mono text-sm">{computer.serial_number}</TableCell>
                        <TableCell className="text-sm">{computer.display_user}</TableCell>
                        <TableCell>
                          <WarrantyBadge
                            status={computer.warrantyStatus as any}
                            daysUntilExpiry={computer.daysUntilExpiry}
                            showDays={false}
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(computer)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <EditComputerDialog
        computer={selectedComputer}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}