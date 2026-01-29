import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Header } from "@/components/Header";
import { WarrantyBadge } from "@/components/WarrantyBadge";
import { AdminLogin } from "@/components/AdminLogin";
import { EditComputerDialog } from "@/components/EditComputerDialog";
import { AddComputerDialog } from "@/components/AddComputerDialog";
import { DeleteComputerDialog } from "@/components/DeleteComputerDialog";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useComputers } from "@/hooks/useComputers";
import { departments } from "@/data/mockComputers";
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
import { format, parseISO } from "date-fns";
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
  Trash2,
} from "lucide-react";

export default function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, login, logout } = useAdminAuth();
  const { data: computersData, isLoading, error } = useComputers();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ทั้งหมด");
  const [warrantyFilter, setWarrantyFilter] = useState("all");
main

  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
main
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedComputer, setSelectedComputer] = useState<any | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

main
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

  const handleEdit = (computer: typeof selectedComputer) => {
    setSelectedComputer(computer);
main
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["computers"] });
  };

 main
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

  const handleDeleteSuccess = () => {
    setSelectedIds([]);
    queryClient.invalidateQueries({ queryKey: ["computers"] });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredComputers.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((prevId) => prevId !== id));
    }
  };

  // Transform database data to include warranty info
  const computersWithWarranty = useMemo(() => {
    if (!computersData) return [];
    return computersData.map((computer) => ({
      ...computer,
      warrantyStatus: getWarrantyStatus(computer.warranty_end_date),
      daysUntilExpiry: getDaysUntilExpiry(computer.warranty_end_date),
    }));
  }, [computersData]);

main
  const filteredComputers = useMemo(() => {
    return computersWithWarranty.filter((computer) => {
      // Search filter
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
main
        (computer.name || "").toLowerCase().includes(query) ||
        (computer.serial_number || "").toLowerCase().includes(query) ||
        (computer.display_user || "").toLowerCase().includes(query);

        computer.name.toLowerCase().includes(query) ||
        computer.serial_number.toLowerCase().includes(query);
main

      // Department filter
      const matchesDepartment =
        departmentFilter === "ทั้งหมด" || computer.display_user === departmentFilter;

      // Warranty filter
      const matchesWarranty =
        warrantyFilter === "all" || computer.warrantyStatus === warrantyFilter;

      return matchesSearch && matchesDepartment && matchesWarranty;
    });
  }, [computersWithWarranty, searchQuery, departmentFilter, warrantyFilter]);

  const stats = useMemo(() => {
    const total = computersWithWarranty.length;
main
    const nearExpiry = computersWithWarranty.filter(c => c.warrantyStatus === "warning").length;
    const expired = computersWithWarranty.filter(c => c.warrantyStatus === "expired").length;
    const valid = total - expired;

    const active = computersWithWarranty.filter((c) => c.status === "active").length;
    const nearExpiry = computersWithWarranty.filter(
      (c) => c.warrantyStatus === "warning"
    ).length;
    const expired = computersWithWarranty.filter(
      (c) => c.warrantyStatus === "expired"
    ).length;
main

    return { total, valid, nearExpiry, expired };
  }, [computersWithWarranty]);

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
main
          <h2 className="text-2xl font-bold text-foreground">แดชบอร์ดผู้ดูแลระบบ</h2>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" /> ออกจากระบบ
          </Button>

          <h2 className="text-2xl font-bold text-foreground">
            แดชบอร์ดผู้ดูแลระบบ
          </h2>
          <div className="flex items-center gap-2">
            <AddComputerDialog onSuccess={handleEditSuccess} />
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </Button>
          </div>
main
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                ทั้งหมด
              </CardTitle>
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
main
              <CardTitle className="text-sm font-medium text-muted-foreground">อยู่ในประกัน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-green-500" />

              <CardTitle className="text-sm font-medium text-muted-foreground">
                ใช้งาน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-warranty-valid" />
                <span className="text-2xl font-bold text-warranty-valid">
                  {stats.active}
                </span>
main
              </div>
            </CardContent>
          </Card>

main
          <Card className="border-orange-200">

          <Card className="border-warranty-warning">
main
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                ใกล้หมดประกัน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
main
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span className="text-2xl font-bold text-orange-500">{stats.nearExpiry}</span>

                <AlertTriangle className="h-5 w-5 text-warranty-warning" />
                <span className="text-2xl font-bold text-warranty-warning">
                  {stats.nearExpiry}
                </span>
main
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                หมดประกัน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
main
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold text-red-500">{stats.expired}</span>

                <XCircle className="h-5 w-5 text-warranty-expired" />
                <span className="text-2xl font-bold text-warranty-expired">
                  {stats.expired}
                </span>
main
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
                  placeholder="ค้นหาชื่อคอม / ซีเรียล..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
main
                  <SelectValue placeholder="กรองตามผู้ใช้งาน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ทั้งหมด">ผู้ใช้งานทั้งหมด</SelectItem>
                  {uniqueDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>

                  <SelectValue placeholder="แผนก" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
main
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
              <div className="flex items-center gap-2">
                <span>รายการคอมพิวเตอร์</span>
                {selectedIds.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    ลบ ({selectedIds.length})
                  </Button>
                )}
              </div>
              <span className="text-sm font-normal text-muted-foreground">
                แสดง {filteredComputers.length} รายการ
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
main
              <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin mr-2" /> กำลังโหลด...</div>

              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">กำลังโหลดข้อมูล...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-destructive">
                <XCircle className="h-5 w-5 mr-2" />
                เกิดข้อผิดพลาดในการโหลดข้อมูล
              </div>
main
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            filteredComputers.length > 0 &&
                            selectedIds.length === filteredComputers.length
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>ชื่อคอม</TableHead>
main
                      <TableHead>ซีเรียลนัมเบอร์</TableHead>
                      <TableHead>ผู้ใช้งาน / หมายเหตุ</TableHead>

                      <TableHead className="hidden md:table-cell">ซีเรียลนัมเบอร์</TableHead>
                      <TableHead className="hidden sm:table-cell">แผนก</TableHead>
                      <TableHead className="hidden lg:table-cell">วันหมดประกัน</TableHead>
main
                      <TableHead>สถานะประกัน</TableHead>
                      <TableHead className="w-20">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComputers.map((computer, index) => (
                      <TableRow key={computer.id}>
main
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{computer.name}</TableCell>
                        <TableCell className="font-mono text-sm">{computer.serial_number}</TableCell>
                        <TableCell className="text-sm">{computer.display_user}</TableCell>

                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(computer.id)}
                            onCheckedChange={(checked) =>
                              handleSelectOne(computer.id, !!checked)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">{computer.name}</TableCell>
                        <TableCell className="hidden md:table-cell font-mono text-sm">
                          {computer.serial_number}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {computer.department}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {format(parseISO(computer.warranty_end_date), "d MMM yyyy", {
                            locale: th,
                          })}
                        </TableCell>
main
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

      {/* Delete Dialog */}
      <DeleteComputerDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        computerIds={selectedIds}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
