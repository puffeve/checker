import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types"; // นำเข้า Type ที่เราแก้เมื่อกี้

// ใช้ Type จาก Database ตรงๆ เพื่อความปลอดภัย
type ComputerRow = Database['public']['Tables']['computers']['Row'];

export interface ComputerFromDB {
  id: number;
  serial_number: string;
  device_name: string;
  model: string;
  status: string;
  warranty_expiry: string;
  notes: string;
  created_at: string;
  user_name: string;
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
      // ระบุ <any, "computers", any> หรือ <Database> เพื่อให้ TS รู้จัก Table
      const { data, error } = await supabase
        .from("computers") 
        .select("*");

      if (error) {
        console.error("❌ Supabase Error:", error);
        throw error;
      }

      if (!data) return [];

      // ใช้ item: ComputerRow แทน item: any เพื่อให้มี Auto-complete
      return data.map((item: ComputerRow, index: number) => {
        const expiryRaw = item.warranty_expiry || "";
        const expiryDate = parseThaiDate(expiryRaw);
        
        let currentStatus = item.status || "active";
        
        if (expiryDate) {
            const now = new Date();
            const expiry = new Date(expiryDate);
            if (now > expiry) currentStatus = "retired";
        }

        return {
            id: Number(item.id) || index, // มั่นใจว่าเป็นตัวเลข
            serial_number: item.serial_number || "-",
            device_name: item.device_name || "Unknown Device", 
            model: item.model || "-", 
            status: currentStatus,
            warranty_expiry: expiryRaw, 
            notes: item.notes || "", 
            user_name: item.user_name || "",
            created_at: item.created_at || new Date().toISOString(),
        };
      });
    },
  });
}

// ตัวอย่างการใช้งานภายใน component