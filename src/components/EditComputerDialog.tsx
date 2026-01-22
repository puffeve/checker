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
import { format, parseISO } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const departments = [
  "ฝ่ายขาย",
  "บัญชี",
  "IT",
  "HR",
  "ผู้บริหาร",
  "ศูนย์บริการ",
  "อะไหล่",
];

const statuses = [
  { value: "active", label: "ใช้งาน" },
  { value: "repair", label: "ซ่อม" },
  { value: "retired", label: "ปลดระวาง" },
];

const formSchema = z.object({
  name: z.string().trim().min(1, "กรุณากรอกชื่อคอมพิวเตอร์").max(100, "ชื่อต้องไม่เกิน 100 ตัวอักษร"),
  serial_number: z.string().trim().min(1, "กรุณากรอกซีเรียลนัมเบอร์").max(100, "ซีเรียลต้องไม่เกิน 100 ตัวอักษร"),
  department: z.string().min(1, "กรุณาเลือกแผนก"),
  status: z.string().min(1, "กรุณาเลือกสถานะ"),
  registration_date: z.date({ required_error: "กรุณาเลือกวันลงทะเบียน" }),
  warranty_end_date: z.date({ required_error: "กรุณาเลือกวันหมดประกัน" }),
});

type FormValues = z.infer<typeof formSchema>;

interface Computer {
  id: string;
  name: string;
  serial_number: string;
  department: string;
  status: string;
  registration_date: string;
  warranty_end_date: string;
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
      name: "",
      serial_number: "",
      department: "",
      status: "active",
      registration_date: new Date(),
      warranty_end_date: new Date(),
    },
  });

  useEffect(() => {
    if (computer && open) {
      form.reset({
        name: computer.name,
        serial_number: computer.serial_number,
        department: computer.department,
        status: computer.status,
        registration_date: parseISO(computer.registration_date),
        warranty_end_date: parseISO(computer.warranty_end_date),
      });
    }
  }, [computer, open, form]);

  const onSubmit = async (values: FormValues) => {
    if (!computer) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("computers")
        .update({
          name: values.name,
          serial_number: values.serial_number,
          department: values.department,
          status: values.status,
          registration_date: format(values.registration_date, "yyyy-MM-dd"),
          warranty_end_date: format(values.warranty_end_date, "yyyy-MM-dd"),
        })
        .eq("id", computer.id);

      if (error) throw error;

      toast.success("อัปเดตข้อมูลสำเร็จ");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error updating computer:", error);
      toast.error("เกิดข้อผิดพลาด: " + (error.message || "ไม่สามารถอัปเดตข้อมูลได้"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลคอมพิวเตอร์</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อคอมพิวเตอร์</FormLabel>
                  <FormControl>
                    <Input placeholder="เช่น PC-SALES-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serial_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ซีเรียลนัมเบอร์</FormLabel>
                  <FormControl>
                    <Input placeholder="เช่น DELL-XPS15-2024-ABC123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>แผนก</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกแผนก" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>สถานะเครื่อง</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกสถานะ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="registration_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>วันลงทะเบียน</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
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
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warranty_end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>วันหมดประกัน</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
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

            <DialogFooter>
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
                บันทึก
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
