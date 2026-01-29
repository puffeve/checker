import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const statuses = [
  { value: "active", label: "ใช้งาน" },
  { value: "repair", label: "ซ่อม" },
  { value: "retired", label: "ปลดระวาง" },
];

// 1. Schema ปรับตาม Column ใหม่ในตาราง computers
const formSchema = z.object({
  device_name: z.string().trim().min(1, "กรุณากรอกชื่ออุปกรณ์"),
  serial_number: z.string().trim().min(1, "กรุณากรอกซีเรียลนัมเบอร์"),
  model: z.string().trim().optional(),
  user_name: z.string().trim().optional(),
  status: z.string().min(1, "กรุณาเลือกสถานะ"),
  warranty_expiry: z.date({ required_error: "กรุณาเลือกวันหมดประกัน" }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Computer {
  id: number | string;
  device_name: string;
  serial_number: string;
  model: string;
  user_name: string;
  status: string;
  warranty_expiry: string;
  notes: string;
}

interface EditComputerDialogProps {
  computer: Computer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditComputerDialog({
  computer,
  open,
  onOpenChange,
  onSuccess,
}: EditComputerDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      device_name: "",
      serial_number: "",
      model: "",
      user_name: "",
      status: "active",
      warranty_expiry: new Date(),
      notes: "",
    },
  });

  // อัปเดตข้อมูลใน Form เมื่อเปิด Dialog
  useEffect(() => {
    if (computer && open) {
      form.reset({
        device_name: computer.device_name || "",
        serial_number: computer.serial_number || "",
        model: computer.model || "",
        user_name: computer.user_name || "",
        status: computer.status || "active",
        // สำหรับวันที่ ถ้าใน DB เป็น string เราจะใช้ค่าปัจจุบันไปก่อน 
        // หรือถ้าอยาก parse ต้องใช้ฟังก์ชัน parseThaiDate ที่เคยเขียนไว้
        warranty_expiry: new Date(), 
        notes: computer.notes || "",
      });
    }
  }, [computer, open, form]);

  const onSubmit = async (values: FormValues) => {
    if (!computer) return;

    setIsLoading(true);
    try {
      // แปลง Date Object เป็นรูปแบบไทย (เช่น "29-ม.ค.-69") เพื่อเก็บลง text field
      const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
      const d = values.warranty_expiry;
      const thaiYearFull = d.getFullYear() + 543;
      const thaiYearShort = thaiYearFull.toString().slice(-2);
      const formattedThaiDate = `${d.getDate()}-${thaiMonths[d.getMonth()]}-${thaiYearShort}`;

      const { error } = await supabase
        .from("computers")
        .update({
          device_name: values.device_name,
          serial_number: values.serial_number,
          model: values.model,
          user_name: values.user_name,
          status: values.status,
          warranty_expiry: formattedThaiDate,
          notes: values.notes,
        })
        .eq("id", computer.id as any);

      if (error) throw error;

      toast.success("อัปเดตข้อมูลสำเร็จ");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error updating computer:", error);
      toast.error("เกิดข้อผิดพลาด: " + (error.message || "ไม่สามารถอัปเดตได้"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลคอมพิวเตอร์</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="device_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่ออุปกรณ์</FormLabel>
                  <FormControl>
                    <Input placeholder="เช่น PC-IT-01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="serial_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ซีเรียลนัมเบอร์</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>รุ่น/โมเดล</FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น HP ProBook" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="user_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อผู้ใช้งาน / แผนก</FormLabel>
                  <FormControl>
                    <Input placeholder="ระบุชื่อผู้ถือครอง" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>สถานะ</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกสถานะ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statuses.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warranty_expiry"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>วันหมดประกัน</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? (
                              format(field.value, "d MMM yyyy", { locale: th })
                            ) : (
                              <span>เลือกวันที่</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>หมายเหตุ</FormLabel>
                  <FormControl>
                    <Input placeholder="รายละเอียดเพิ่มเติม..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                บันทึกการแก้ไข
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}