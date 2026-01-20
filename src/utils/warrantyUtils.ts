import { Computer, ComputerWithWarranty, WarrantyStatus } from "@/types/computer";
import { differenceInDays, parseISO } from "date-fns";

export function getWarrantyStatus(warrantyEndDate: string): WarrantyStatus {
  const today = new Date();
  const endDate = parseISO(warrantyEndDate);
  const daysUntilExpiry = differenceInDays(endDate, today);

  if (daysUntilExpiry < 0) {
    return "expired";
  } else if (daysUntilExpiry <= 30) {
    return "warning";
  }
  return "valid";
}

export function getDaysUntilExpiry(warrantyEndDate: string): number {
  const today = new Date();
  const endDate = parseISO(warrantyEndDate);
  return differenceInDays(endDate, today);
}

export function enrichComputerWithWarranty(computer: Computer): ComputerWithWarranty {
  return {
    ...computer,
    warrantyStatus: getWarrantyStatus(computer.warrantyEndDate),
    daysUntilExpiry: getDaysUntilExpiry(computer.warrantyEndDate),
  };
}

export function getWarrantyStatusText(status: WarrantyStatus): string {
  switch (status) {
    case "valid":
      return "อยู่ในประกัน";
    case "warning":
      return "ใกล้หมดประกัน";
    case "expired":
      return "หมดประกัน";
  }
}

export function getComputerStatusText(status: string): string {
  switch (status) {
    case "active":
      return "ใช้งาน";
    case "repair":
      return "ซ่อม";
    case "retired":
      return "ปลดระวาง";
    default:
      return status;
  }
}
