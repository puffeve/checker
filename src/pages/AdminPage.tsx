import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ===== Components ===== */
import { Header } from "@/components/Header";
import { AdminLogin } from "@/components/AdminLogin";
import { AddComputerDialog } from "@/components/AddComputerDialog";
import { EditComputerDialog } from "@/components/EditComputerDialog";
import { WarrantyBadge } from "@/components/WarrantyBadge";

/* ===== UI ===== */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ===== Icons ===== */
import {
  Monitor,
  CheckCircle,
  AlertTriangle,
  XCircle,
  LogOut,
  Filter,
  Search,
  Pencil,
  Trash2,
} from "lucide-react";

/* ===== Utils & Hooks ===== */
import { supabase } from "../lib/supabaseClient";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  getWarrantyStatus,
  getDaysUntilExpiry,
} from "@/utils/warrantyUtils";

export default function AdminPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login, logout } = useAdminAuth();

  /* ===== State ===== */
  const [computers, setComputers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ทั้งหมด");
  const [warrantyFilter, setWarrantyFilter] = useState("all");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedComputer, setSelectedComputer] = useState<any | null>(null);

  /* ===== Auth ===== */
  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} />;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  /* ===== Fetch Data ===== */
  const fetchComputers = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("computers")
      .select("*")
      .order("id", { ascending: true });

    if (error) setError(error.message);
    else setComputers(data || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchComputers();
  }, []);

  /* ===== Map + Warranty ===== */
  const computersWithWarranty = useMemo(() => {
  return computers
    .map((c) => {
      const daysUntilExpiry = getDaysUntilExpiry(c.warranty_expiry);
      const warrantyStatus = getWarrantyStatus(c.warranty_expiry);

      const name = c.device_name || "-";
      const department = c.notes || c.user_name || "-";

      // ❌ ไม่มีชื่อคอมเลย
      const hasNoName =
        !c.device_name || c.device_name === "-" || c.device_name.trim() === "";

      // ⚠️ มีชื่อคอม แต่ช่องอื่นมี "-"
      const hasOtherMissingData = !hasNoName &&
        [
          c.serial_number,
          department,
          c.warranty_expiry,
        ].some(
          (v) =>
            v === "-" ||
            v === null ||
            v === undefined ||
            String(v).trim() === ""
        );

      return {
        ...c,
        name,
        department,
        daysUntilExpiry,
        warrantyStatus,
        hasNoName,
        hasOtherMissingData,
      };
    })
    .sort((a, b) => {
      // 🥇 มีชื่อ + ข้อมูลครบ
      if (!a.hasNoName && !a.hasOtherMissingData &&
          (b.hasNoName || b.hasOtherMissingData)) return -1;

      if (!b.hasNoName && !b.hasOtherMissingData &&
          (a.hasNoName || a.hasOtherMissingData)) return 1;

      // 🥈 มีชื่อ แต่ข้อมูลไม่ครบ
      if (!a.hasNoName && a.hasOtherMissingData && b.hasNoName) return -1;
      if (!b.hasNoName && b.hasOtherMissingData && a.hasNoName) return 1;

      // 🥉 ไม่มีชื่อ → ล่างสุด
      return 0;
    });
}, [computers]);



  /* ===== Stats ===== */
  const stats = useMemo(() => {
    const total = computersWithWarranty.length;
    const active = computersWithWarranty.filter(
      (c) => c.warrantyStatus !== "expired"
    ).length;
    const warning = computersWithWarranty.filter(
      (c) => c.warrantyStatus === "warning"
    ).length;
    const expired = computersWithWarranty.filter(
      (c) => c.warrantyStatus === "expired"
    ).length;

    return { total, active, warning, expired };
  }, [computersWithWarranty]);

  /* ===== Filters ===== */
  const departments = useMemo(() => {
    return Array.from(
      new Set(
        computersWithWarranty
          .map((c) => c.name)
          .filter((n) => n && n !== "-")
      )
    );
  }, [computersWithWarranty]);

  /* ===== 🔍 Search Suggestions (≤ 5) ===== */
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const q = searchQuery.toLowerCase();

    return Array.from(
      new Set(
        computersWithWarranty
          .map((c) => c.name)
          .filter((name) => name.toLowerCase().startsWith(q))
      )
    ).slice(0, 5);
  }, [searchQuery, computersWithWarranty]);

  const filteredComputers = useMemo(() => {
    return computersWithWarranty.filter((c) => {
      const q = searchQuery.toLowerCase().trim();

      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.serial_number || "").toLowerCase().includes(q);

      const matchDept =
        departmentFilter === "ทั้งหมด" ||
        c.name === departmentFilter;

      const matchWarranty =
        warrantyFilter === "all" ||
        c.warrantyStatus === warrantyFilter;

      return matchSearch && matchDept && matchWarranty;
    });
  }, [computersWithWarranty, searchQuery, departmentFilter, warrantyFilter]);

  /* ===== Bulk Delete ===== */
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    const { error } = await supabase
      .from("computers")
      .delete()
      .in("id", selectedIds);

    if (!error) {
      setSelectedIds([]);
      fetchComputers();
    }
  };

  const allChecked =
    filteredComputers.length > 0 &&
    filteredComputers.every((c) => selectedIds.includes(c.id));

  /* ===== Render ===== */
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* ===== Header ===== */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">แดชบอร์ดผู้ดูแลระบบ</h1>

          <div className="flex items-center gap-2">
            <AddComputerDialog onSuccess={fetchComputers} />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              ออกจากระบบ
            </Button>
          </div>
        </div>

        {/* ===== Stats ===== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 flex gap-3">
              <Monitor />
              <div>
                <p className="text-sm text-muted-foreground">ทั้งหมด</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 flex gap-3">
              <CheckCircle className="text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">อยู่ในประกัน</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-400">
            <CardContent className="pt-6 flex gap-3">
              <AlertTriangle className="text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">ใกล้หมดประกัน</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {stats.warning}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500">
            <CardContent className="pt-6 flex gap-3">
              <XCircle className="text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">หมดประกัน</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.expired}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ===== Filters ===== */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4 font-semibold">
              <Filter className="h-4 w-4" />
              ตัวกรองข้อมูล
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาชื่อคอม / ซีเรียล..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />

                {searchSuggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow">
                    {searchSuggestions.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setSearchQuery(name)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ทั้งหมด">ทั้งหมด</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={warrantyFilter}
                onValueChange={setWarrantyFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ประกันทั้งหมด" />
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

        {/* ===== Table ===== */}
        <Card>
          <CardHeader className="px-6 py-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">รายการคอมพิวเตอร์</h2>

              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  แสดง {filteredComputers.length} จาก{" "}
                  {computersWithWarranty.length} รายการ
                </span>

                <Button
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.length === 0}
                  className={
                    selectedIds.length === 0
                      ? "bg-muted text-muted-foreground cursor-not-allowed gap-2"
                      : "bg-red-500 hover:bg-red-600 text-white gap-2"
                  }
                >
                  <Trash2 className="h-4 w-4" />
                  ลบ ({selectedIds.length})
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={allChecked}
                      onCheckedChange={(checked) =>
                        setSelectedIds(
                          checked ? filteredComputers.map((c) => c.id) : []
                        )
                      }
                    />
                  </TableHead>
                  <TableHead>ลำดับ</TableHead>
                  <TableHead>ชื่อคอม</TableHead>
                  <TableHead>ซีเรียล</TableHead>
                  <TableHead>แผนก</TableHead>
                  <TableHead>วันหมดประกัน</TableHead>
                  <TableHead>สถานะประกัน</TableHead>
                  <TableHead className="text-center">จัดการ</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredComputers.map((c, i) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(c.id)}
                        onCheckedChange={(checked) =>
                          setSelectedIds((prev) =>
                            checked
                              ? [...prev, c.id]
                              : prev.filter((id) => id !== c.id)
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.serial_number}</TableCell>
                    <TableCell>{c.department}</TableCell>
                    <TableCell>{c.warranty_expiry}</TableCell>
                    <TableCell>
                      <WarrantyBadge
                        status={c.warrantyStatus}
                        daysUntilExpiry={c.daysUntilExpiry}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedComputer(c);
                          setEditOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <EditComputerDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        computer={selectedComputer}
        onSuccess={fetchComputers}
      />
    </div>
  );
}
