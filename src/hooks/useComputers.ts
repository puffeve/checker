import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types"; // นำเข้า Type ที่เราแก้เมื่อกี้

// ใช้ Type จาก Database ตรงๆ เพื่อความปลอดภัย
type ComputerRow = Database['public']['Tables']['computers']['Row'];

export interface ComputerFromDB {
  id: string;
  name: string;
  serial_number: string;
  department: string;
  status: string;
  registration_date: string;
  warranty_end_date: string;
  created_at: string;
main
  user_name: string;

  updated_at: string;
main
}

export function useComputers() {
  return useQuery({
    queryKey: ["computers"],
    queryFn: async (): Promise<ComputerFromDB[]> => {
main
      // ระบุ <any, "computers", any> หรือ <Database> เพื่อให้ TS รู้จัก Table
      const { data, error } = await supabase
        .from("computers") 
        .select("*");

      const { data, error } = await supabase
        .from("computers")
        .select("*")
        .order("name", { ascending: true });
main

      if (error) {
        console.error("Error fetching computers:", error);
        throw error;
      }

main
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

      return data || [];
    },
  });
}
main
