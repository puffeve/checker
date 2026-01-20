import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { WarrantyBadge } from "@/components/WarrantyBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { mockComputers, departments } from "@/data/mockComputers";
import { enrichComputerWithWarranty } from "@/utils/warrantyUtils";
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
} from "lucide-react";

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ทั้งหมด");
  const [warrantyFilter, setWarrantyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const computersWithWarranty = useMemo(
    () => mockComputers.map(enrichComputerWithWarranty),
    []
  );

  const filteredComputers = useMemo(() => {
    return computersWithWarranty.filter((computer) => {
      // Search filter
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        computer.name.toLowerCase().includes(query) ||
        computer.serialNumber.toLowerCase().includes(query);

      // Department filter
      const matchesDepartment =
        departmentFilter === "ทั้งหมด" || computer.department === departmentFilter;

      // Warranty filter
      const matchesWarranty =
        warrantyFilter === "all" || computer.warrantyStatus === warrantyFilter;

      // Status filter
      const matchesStatus =
        statusFilter === "all" || computer.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesWarranty && matchesStatus;
    });
  }, [computersWithWarranty, searchQuery, departmentFilter, warrantyFilter, statusFilter]);

  // Dashboard stats
  const stats = useMemo(() => {
    const total = computersWithWarranty.length;
    const active = computersWithWarranty.filter((c) => c.status === "active").length;
    const repair = computersWithWarranty.filter((c) => c.status === "repair").length;
    const retired = computersWithWarranty.filter((c) => c.status === "retired").length;
    const nearExpiry = computersWithWarranty.filter(
      (c) => c.warrantyStatus === "warning"
    ).length;
    const expired = computersWithWarranty.filter(
      (c) => c.warrantyStatus === "expired"
    ).length;

    return { total, active, repair, retired, nearExpiry, expired };
  }, [computersWithWarranty]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          แดชบอร์ดผู้ดูแลระบบ
        </h2>

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
                แสดง {filteredComputers.length} จาก {computersWithWarranty.length} รายการ
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComputers.map((computer, index) => (
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
