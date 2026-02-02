import { differenceInCalendarDays, parse } from "date-fns";

export type WarrantyStatus = "valid" | "warning" | "expired";

function parseDate(dateStr?: string): Date | null {
  if (!dateStr) return null;

  const formats = [
    "dd/MM/yyyy",
    "dd-MM-yyyy",
    "dd.MM.yyyy", // 👈 ตัวนี้แหละ ตัวการ
    "yyyy-MM-dd",
  ];

  for (const f of formats) {
    const d = parse(dateStr, f, new Date());
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}


export function getDaysUntilExpiry(
  warrantyExpiry?: string
): number {
  const expiry = parseDate(warrantyExpiry);
  if (!expiry) return -1;

  const today = new Date();
  return differenceInCalendarDays(expiry, today);
}

export function getWarrantyStatus(
  warrantyExpiry?: string
): WarrantyStatus {
  const days = getDaysUntilExpiry(warrantyExpiry);

  if (days < 0) return "expired";
  if (days <= 30) return "warning";
  return "valid";
}