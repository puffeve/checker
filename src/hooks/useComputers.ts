import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { enrichComputerWithWarranty } from "@/utils/warrantyUtils";
import type { Computer, ComputerWithWarranty } from "@/types/computer";

export type ComputerInput = {
  name: string;
  serial_number: string;
  department: string;
  registration_date: string;
  warranty_end_date: string;
  status: "active" | "repair" | "retired";
};

export function useComputers() {
  const [computers, setComputers] = useState<ComputerWithWarranty[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchComputers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("computers")
        .select("*")
        .order("name");

      if (error) throw error;

      const mapped: Computer[] = (data || []).map((c) => ({
        id: c.id,
        name: c.name,
        serialNumber: c.serial_number,
        department: c.department,
        registrationDate: c.registration_date,
        warrantyEndDate: c.warranty_end_date,
        status: c.status as Computer["status"],
      }));

      const enriched = mapped.map(enrichComputerWithWarranty);
      setComputers(enriched);
    } catch (error) {
      console.error("Error fetching computers:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addComputer = async (input: ComputerInput) => {
    try {
      const { error } = await supabase.from("computers").insert([input]);

      if (error) throw error;

      toast({
        title: "สำเร็จ",
        description: "เพิ่มข้อมูลคอมพิวเตอร์เรียบร้อยแล้ว",
      });

      await fetchComputers();
      return true;
    } catch (error: any) {
      console.error("Error adding computer:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message?.includes("duplicate") 
          ? "ซีเรียลนัมเบอร์ซ้ำ" 
          : "ไม่สามารถเพิ่มข้อมูลได้",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateComputer = async (id: string, input: ComputerInput) => {
    try {
      const { error } = await supabase
        .from("computers")
        .update(input)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "สำเร็จ",
        description: "อัปเดตข้อมูลเรียบร้อยแล้ว",
      });

      await fetchComputers();
      return true;
    } catch (error: any) {
      console.error("Error updating computer:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message?.includes("duplicate") 
          ? "ซีเรียลนัมเบอร์ซ้ำ" 
          : "ไม่สามารถอัปเดตข้อมูลได้",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteComputer = async (id: string) => {
    try {
      const { error } = await supabase
        .from("computers")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "สำเร็จ",
        description: "ลบข้อมูลเรียบร้อยแล้ว",
      });

      await fetchComputers();
      return true;
    } catch (error) {
      console.error("Error deleting computer:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบข้อมูลได้",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchComputers();
  }, [fetchComputers]);

  return {
    computers,
    loading,
    refetch: fetchComputers,
    addComputer,
    updateComputer,
    deleteComputer,
  };
}
