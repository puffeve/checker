import { Link, useLocation } from "react-router-dom";
import { Monitor, Settings, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();

  return (
    <header className="bg-sidebar text-sidebar-foreground shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Monitor className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">ระบบตรวจสอบซีเรียลนัมเบอร์</h1>
              <p className="text-xs text-sidebar-foreground/70">บริษัท ออโต้ พรีเมียม จำกัด</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            <Link
              to="/"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                location.pathname === "/"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-sidebar-accent"
              )}
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">ค้นหา</span>
            </Link>
            <Link
              to="/admin"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                location.pathname === "/admin"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-sidebar-accent"
              )}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">แอดมิน</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
