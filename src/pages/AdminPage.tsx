import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { WarrantyBadge } from "@/components/WarrantyBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { AuthForm } from "@/components/AuthForm";
import { ComputerFormDialog } from "@/components/ComputerFormDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { useAuth } from "@/hooks/useAuth";
import { useComputers, type ComputerInput } from "@/hooks/useComputers";
import { departments } from "@/data/mockComputers";
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
  Wrench,
  Archive,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import type { ComputerWithWarranty } from "@/types/computer";

export default function AdminPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, signOut } = useAuth();
  const { computers, loading: dataLoading, addComputer, updateComputer, deleteComputer } = useComputers();

  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ทั้งหมด");
  const [warrantyFilter, setWarrantyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedComputer, setSelectedComputer] = useState<ComputerWithWarranty | null>(null);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleAdd = () => {
    setSelectedComputer(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (computer: ComputerWithWarranty) => {
    setSelectedComputer(computer);
    setFormDialogOpen(true);
  };

  const handleDelete = (computer: ComputerWithWarranty) => {
    setSelectedComputer(computer);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: ComputerInput) => {
    if (selectedComputer) {
      return await updateComputer(selectedComputer.id, data);
    } else {
      return await addComputer(data);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedComputer) {
      await deleteComputer(selectedComputer.id);
      setDeleteDialogOpen(false);
      setSelectedComputer(null);
    }
  };

  const filteredComputers = useMemo(() => {
    return computers.filter((computer) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        computer.name.toLowerCase().includes(query) ||
        computer.serialNumber.toLowerCase().includes(query);

      const matchesDepartment =
        departmentFilter === "ทั้งหมด" || computer.department === departmentFilter;

      const matchesWarranty =
        warrantyFilter === "all" || computer.warrantyStatus === warrantyFilter;

      const matchesStatus =
        statusFilter === "all" || computer.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesWarranty && matchesStatus;
    });
  }, [computers, searchQuery, departmentFilter, warrantyFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = computers.length;
    const active = computers.filter((c) => c.status === "active").length;
    const repair = computers.filter((c) => c.status === "repair").length;
    const retired = computers.filter((c) => c.status === "retired").length;
    const nearExpiry = computers.filter((c) => c.warrantyStatus === "warning").length;
    const expired = computers.filter((c) => c.warrantyStatus === "expired").length;

    return { total, active, repair, retired, nearExpiry, expired };
  }, [computers]);

  // Show loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            แดชบอร์ดผู้ดูแลระบบ
          </h2>
          <div className="flex gap-2">
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              เพิ่มคอมพิวเตอร์
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </Button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                ซ่อม
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-warranty-warning" />
                <span className="text-2xl font-bold text-warranty-warning">
                  {stats.repair}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                ปลดระวาง
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.retired}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-warranty-warning">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                ใกล้หมดประกัน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warranty-warning" />
                <span className="text-2xl font-bold text-warranty-warning">
                  {stats.nearExpiry}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-warranty-expired">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                หมดประกัน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-warranty-expired" />
                <span className="text-2xl font-bold text-warranty-expired">
                  {stats.expired}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              ตัวกรองข้อมูล
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <SelectValue placeholder="แผนก" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
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

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="สถานะเครื่อง" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                  <SelectItem value="active">ใช้งาน</SelectItem>
                  <SelectItem value="repair">ซ่อม</SelectItem>
                  <SelectItem value="retired">ปลดระวาง</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Computer Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>รายการคอมพิวเตอร์</span>
              <span className="text-sm font-normal text-muted-foreground">
                แสดง {filteredComputers.length} จาก {computers.length} รายการ
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {dataLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>ชื่อคอม</TableHead>
                      <TableHead className="hidden md:table-cell">ซีเรียลนัมเบอร์</TableHead>
                      <TableHead className="hidden sm:table-cell">แผนก</TableHead>
                      <TableHead className="hidden lg:table-cell">วันหมดประกัน</TableHead>
                      <TableHead>สถานะประกัน</TableHead>
                      <TableHead>สถานะเครื่อง</TableHead>
                      <TableHead className="w-24">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComputers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          ไม่พบข้อมูล
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredComputers.map((computer, index) => (
                        <TableRow key={computer.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-medium">{computer.name}</TableCell>
                          <TableCell className="hidden md:table-cell font-mono text-sm">
                            {computer.serialNumber}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {computer.department}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {format(parseISO(computer.warrantyEndDate), "d MMM yyyy", {
                              locale: th,
                            })}
                          </TableCell>
                          <TableCell>
                            <WarrantyBadge
                              status={computer.warrantyStatus}
                              daysUntilExpiry={computer.daysUntilExpiry}
                              showDays={false}
                            />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={computer.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(computer)}
                                className="h-8 w-8"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(computer)}
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Dialogs */}
      <ComputerFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        computer={selectedComputer}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        computerName={selectedComputer?.name || ""}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
