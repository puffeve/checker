import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ComputerFromDB {
  id: string;
  name: string;
  serial_number: string;
  department: string;
  status: string;
  registration_date: string;
  warranty_end_date: string;
  created_at: string;
  updated_at: string;
}

export function useComputers() {
  return useQuery({
    queryKey: ["computers"],
    queryFn: async (): Promise<ComputerFromDB[]> => {
      const { data, error } = await supabase
        .from("computers")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching computers:", error);
        throw error;
      }

      return data || [];
    },
  });
}
