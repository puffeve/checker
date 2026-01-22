import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { ComputerCard } from "@/components/ComputerCard";
import { mockComputers } from "@/data/mockComputers";
import { enrichComputerWithWarranty } from "@/utils/warrantyUtils";
import { Search, Monitor } from "lucide-react";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const computersWithWarranty = useMemo(
    () => mockComputers.map(enrichComputerWithWarranty),
    []
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase().trim();
    return computersWithWarranty.filter(
      (computer) =>
        computer.name.toLowerCase().includes(query) ||
        computer.serialNumber.toLowerCase().includes(query)
    );
  }, [searchQuery, computersWithWarranty]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
  };

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
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!e.target.value.trim()) setHasSearched(false);
                  }}
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8">
                <Search className="h-5 w-5 mr-2" />
                ค้นหา
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {hasSearched && (
          <div className="max-w-2xl mx-auto">
            {searchResults.length > 0 ? (
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
                    ไม่พบคอมพิวเตอร์ที่ตรงกับ "{searchQuery}"
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Quick Tips */}
        {!hasSearched && (
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
