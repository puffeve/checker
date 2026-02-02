import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { ComputerCard } from "@/components/ComputerCard";
import { getWarrantyStatus, getDaysUntilExpiry } from "@/utils/warrantyUtils";
import { Search, Monitor, Loader2, XCircle } from "lucide-react";

// ใช้ relative path
import { supabase } from "../lib/supabaseClient";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const [computers, setComputers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // โหลดข้อมูลจาก Supabase
  useEffect(() => {
    const fetchComputers = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("computers")
        .select("*")
        .eq("status", "active");

      if (error) {
        setError(error.message);
      } else {
        setComputers(data || []);
      }

      setIsLoading(false);
    };

    fetchComputers();
  }, []);

  // แปลงข้อมูลให้เข้ากับ ComputerCard
  const computersWithWarranty = useMemo(() => {
    return computers.map((computer) => {
      const warrantyDate = computer.warranty_expiry;
      const isDateValid =
        warrantyDate && warrantyDate !== "-" && warrantyDate.length > 5;

      return {
        ...computer,
        name: computer.device_name || "ไม่ระบุชื่อ",
        serialNumber: computer.serial_number,
        department: computer.notes || computer.user_name || "-",
        warrantyStatus: isDateValid
          ? getWarrantyStatus(warrantyDate)
          : "expired",
        daysUntilExpiry: isDateValid
          ? getDaysUntilExpiry(warrantyDate)
          : 0,
      };
    });
  }, [computers]);

  // ผลลัพธ์ค้นหา (หลังจากกดค้นหา) ❗ยังใช้ includes
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const q = searchQuery.toLowerCase().trim();
    return computersWithWarranty.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.serialNumber || "").toLowerCase().includes(q)
    );
  }, [searchQuery, computersWithWarranty]);

  // 🔍 suggestions ระหว่างพิมพ์ (ขึ้นต้นตัวอักษรเดียวกันเท่านั้น)
  const liveSuggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    return computersWithWarranty
      .filter(
        (c) =>
          c.name.toLowerCase().startsWith(q) ||
          (c.serialNumber || "").toLowerCase().startsWith(q)
      )
      .slice(0, 5);
  }, [searchQuery, computersWithWarranty]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setHasSearched(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-primary/10 p-4 rounded-full mb-4">
            <Monitor className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-2">
            ค้นหาข้อมูลคอมพิวเตอร์
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            ค้นหาด้วยชื่อคอมพิวเตอร์ หรือ ซีเรียลนัมเบอร์
          </p>
        </div>

        {/* Search */}
        <Card className="max-w-2xl mx-auto mb-10 shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHasSearched(false);
                  }}
                  placeholder="ค้นหาด้วยชื่อคอม หรือ ซีเรียลนัมเบอร์..."
                  className="pl-10 h-12 text-lg"
                />

                {/* Suggestions */}
                {liveSuggestions.length > 0 && !hasSearched && (
                  <div className="absolute z-50 mt-2 w-full rounded-md border bg-background shadow-lg">
                    {liveSuggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSearchQuery(item.name);
                          setHasSearched(true);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-muted transition"
                      >
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.serialNumber}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-12 px-8"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    ค้นหา
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto text-center py-12 text-destructive">
            <XCircle className="h-12 w-12 mx-auto mb-4" />
            <p>{error}</p>
          </div>
        )}

        {/* Results */}
        {hasSearched && !isLoading && !error && (
          <div className="max-w-2xl mx-auto space-y-4">
            <p className="text-sm text-muted-foreground">
              พบ {searchResults.length} รายการ
            </p>

            {searchResults.length > 0 ? (
              searchResults.map((computer) => (
                <ComputerCard key={computer.id} computer={computer} />
              ))
            ) : (
              <Card className="text-center py-10">
                <CardContent>
                  <p className="text-muted-foreground">
                    ไม่พบข้อมูลที่ตรงกับ “{searchQuery}”
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
