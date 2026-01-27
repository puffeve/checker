import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ComputerFromDB {
  id: number;
  serial_number: string;
  device_name: string;
  model: string;
  status: string;
  warranty_expiry: string;
  notes: string;
  created_at: string;
}

const parseThaiDate = (thaiDate: string) => {
  if (!thaiDate || typeof thaiDate !== 'string') return null;
  
  const months: { [key: string]: string } = {
    "ม.ค.": "01", "ก.พ.": "02", "มี.ค.": "03", "เม.ย.": "04", "พ.ค.": "05", "มิ.ย.": "06",
    "ก.ค.": "07", "ส.ค.": "08", "ก.ย.": "09", "ต.ค.": "10", "พ.ย.": "11", "ธ.ค.": "12"
  };

  try {
    const parts = thaiDate.split("-");
    if (parts.length !== 3) return null;

    const day = parts[0].padStart(2, "0");
    const month = months[parts[1]] || "01";
    
    // 71 -> 2571 - 543 = 2028
    const thaiYear = parseInt(parts[2]);
    const adYear = (thaiYear + 2500) - 543; 

    return `${adYear}-${month}-${day}`;
  } catch (e) {
    return null;
  }
};

export function useComputers() {
  return useQuery({
    queryKey: ["computers"],
    queryFn: async (): Promise<ComputerFromDB[]> => {
      console.log("กำลังดึงข้อมูลจาก Supabase...");

      // 1. ดึงข้อมูลจากตาราง computer_rentals
      const { data, error } = await supabase
        .from("computer_rentals") 
        .select("*");

      if (error) {
        console.error("❌ Supabase Error:", error);
        throw error;
      }

      console.log("✅ ข้อมูลที่ได้จาก DB:", data);

      if (!data) {
        return [];
      }

      // 2. แปลงข้อมูล (ใส่กันกระแทกไว้ ถ้า data เป็น null จะไม่พัง)
      const mappedData = (data || []).map((item: any, index: number) => {
        // ดึงค่าแบบปลอดภัย (ถ้าไม่มีคอลัมน์ ให้ใช้ค่าว่าง)
        const endDateRaw = item.contract_end_date || "";
        const expiryDate = parseThaiDate(endDateRaw);
        
        let status = "available";
        if (expiryDate) {
            const now = new Date();
            const expiry = new Date(expiryDate);
            if (now > expiry) status = "retired";
        }

        return {
            id: item.id || index, 
            serial_number: item.serial_number || item.contract_number || "-",
            device_name: item.model_name || "Unknown Device", 
            model: item.vendor_name || "-",
            status: status,
            warranty_expiry: expiryDate || "-",
            notes: item.user_name || "", 
            created_at: new Date().toISOString(),
        };
      });

      return mappedData;
    },
  });
}