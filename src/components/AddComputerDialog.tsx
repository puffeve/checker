import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { departments } from "@/data/mockComputers";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อคอมพิวเตอร์"),
  serial_number: z.string().min(1, "กรุณากรอกซีเรียลนัมเบอร์"),
  department: z.string().min(1, "กรุณาเลือกแผนก"),
  status: z.string().min(1, "กรุณาเลือกสถานะ"),
  registration_date: z.date(),
  warranty_end_date: z.date(),
});

type FormData = z.infer<typeof formSchema>;

interface AddComputerDialogProps {
  onSuccess: () => void;
}

export function AddComputerDialog({ onSuccess }: AddComputerDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
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

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("computers").insert({
        name: data.name,
        serial_number: data.serial_number,
        department: data.department,
        status: data.status,
        registration_date: format(data.registration_date, "yyyy-MM-dd"),
        warranty_end_date: format(data.warranty_end_date, "yyyy-MM-dd"),
      });

      if (error) throw error;

      toast.success("เพิ่มคอมพิวเตอร์สำเร็จ");
      form.reset();
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error adding computer:", error);
      toast.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDepartments = departments.filter((d) => d !== "ทั้งหมด");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มคอมพิวเตอร์
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>เพิ่มคอมพิวเตอร์ใหม่</DialogTitle>
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
                    <Input placeholder="PC-001" {...field} />
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
                    <Input placeholder="SN-XXXXXXXX" {...field} />
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
                      {filteredDepartments.map((dept) => (
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
                      <SelectItem value="active">ใช้งาน</SelectItem>
                      <SelectItem value="repair">ซ่อม</SelectItem>
                      <SelectItem value="retired">ปลดระวาง</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="registration_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>วันที่ลงทะเบียน</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
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
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
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

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "กำลังบันทึก..." : "เพิ่มคอมพิวเตอร์"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
