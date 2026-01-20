export type ComputerStatus = "active" | "repair" | "retired";
export type WarrantyStatus = "valid" | "warning" | "expired";

export interface Computer {
  id: string;
  name: string;
  serialNumber: string;
  department: string;
  registrationDate: string;
  warrantyEndDate: string;
  status: ComputerStatus;
}

export interface ComputerWithWarranty extends Computer {
  warrantyStatus: WarrantyStatus;
  daysUntilExpiry: number;
}
