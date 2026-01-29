export type ComputerStatus = "active" | "repair" | "retired";
export type WarrantyStatus = "valid" | "warning" | "expired";

export interface Computer {
  id: number; // เปลี่ยนจาก string เป็น number ตาม bigint ใน Database
  device_name: string; // เปลี่ยนจาก name -> device_name
  serial_number: string; // เปลี่ยนจาก serialNumber -> serial_number
  model: string; // เพิ่มฟิลด์ model
  user_name: string; // ใช้แทน department หรือจะเก็บทั้งคู่ก็ได้
  notes: string;
  created_at: string;
  warranty_expiry: string; // เปลี่ยนจาก warrantyEndDate -> warranty_expiry
  status: string; // หรือจะใช้ ComputerStatus ถ้าคุณคุมค่าใน DB ให้ตรงกันได้
}

export interface ComputerWithWarranty extends Computer {
  warrantyStatus: WarrantyStatus;
  daysUntilExpiry: number;
}