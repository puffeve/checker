import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useComputers() {
  return useQuery({
    queryKey: ["computers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("computers")
        .select("*");

      if (error) {
        throw error;
      }

      return data || [];
    },
  });
}