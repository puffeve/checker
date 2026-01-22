import { useState, useMemo, useCallback } from "react";
import { Header } from "@/components/Header";
import { ComputerCard } from "@/components/ComputerCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useComputers } from "@/hooks/useComputers";
import { Search, Monitor, Loader2 } from "lucide-react";

export default function SearchPage() {
  const { computers, loading } = useComputers();
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const normalizedSearch = searchTerm.toLowerCase().trim();
    return computers.filter(
      (computer) =>
        computer.name.toLowerCase().includes(normalizedSearch) ||
        computer.serialNumber.toLowerCase().includes(normalizedSearch)
    );
  }, [computers, searchTerm]);

  const handleSearch = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    setSearchTerm(query);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-primary/10 p-4 rounded-full mb-4">
            <Monitor className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            ค้นหาข้อมูลคอมพิวเตอร์
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            กรอกชื่อคอมพิวเตอร์หรือซีเรียลนัมเบอร์เพื่อตรวจสอบสถานะประกัน
          </p>
        </div>

        {/* Search Form */}
        <Card className="max-w-2xl mx-auto mb-8 shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="ค้นหาด้วยชื่อคอม หรือ ซีเรียลนัมเบอร์..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (!e.target.value.trim()) setSearchTerm("");
                  }}
                  onKeyDown={handleKeyDown}
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8" disabled={loading}>
                {loading ? (
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

        {/* Search Results */}
        {searchTerm && (
          <div className="max-w-2xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  พบ {searchResults.length} รายการ
                </p>
                {searchResults.map((computer) => (
                  <ComputerCard key={computer.id} computer={computer} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="inline-flex items-center justify-center bg-muted p-4 rounded-full mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">ไม่พบข้อมูล</h3>
                  <p className="text-muted-foreground">
                    ไม่พบคอมพิวเตอร์ที่ตรงกับ "{searchTerm}"
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Quick Tips */}
        {!searchTerm && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3 text-foreground">💡 ตัวอย่างการค้นหา</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• ค้นหาด้วยชื่อคอม: <span className="font-mono bg-background px-2 py-1 rounded">PC-SALES-001</span></li>
                  <li>• ค้นหาด้วยซีเรียล: <span className="font-mono bg-background px-2 py-1 rounded">DELL-XPS15-2024</span></li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
