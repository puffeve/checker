import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { departments } from "@/data/mockComputers";
import type { ComputerWithWarranty } from "@/types/computer";
import type { ComputerInput } from "@/hooks/useComputers";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().trim().min(1, "กรุณากรอกชื่อคอมพิวเตอร์").max(100, "ชื่อต้องไม่เกิน 100 ตัวอักษร"),
  serial_number: z.string().trim().min(1, "กรุณากรอกซีเรียลนัมเบอร์").max(100, "ซีเรียลต้องไม่เกิน 100 ตัวอักษร"),
  department: z.string().min(1, "กรุณาเลือกแผนก"),
  registration_date: z.string().min(1, "กรุณาเลือกวันที่ลงทะเบียน"),
  warranty_end_date: z.string().min(1, "กรุณาเลือกวันหมดประกัน"),
  status: z.enum(["active", "repair", "retired"]),
});

type FormValues = z.infer<typeof formSchema>;

interface ComputerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  computer?: ComputerWithWarranty | null;
  onSubmit: (data: ComputerInput) => Promise<boolean>;
}

export function ComputerFormDialog({
  open,
  onOpenChange,
  computer,
  onSubmit,
}: ComputerFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!computer;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      serial_number: "",
      department: "",
      registration_date: new Date().toISOString().split("T")[0],
      warranty_end_date: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (open) {
      if (computer) {
        form.reset({
          name: computer.name,
          serial_number: computer.serialNumber,
          department: computer.department,
          registration_date: computer.registrationDate,
          warranty_end_date: computer.warrantyEndDate,
          status: computer.status,
        });
      } else {
        form.reset({
          name: "",
          serial_number: "",
          department: "",
          registration_date: new Date().toISOString().split("T")[0],
          warranty_end_date: "",
          status: "active",
        });
      }
    }
  }, [open, computer, form]);

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    const input: ComputerInput = {
      name: values.name,
      serial_number: values.serial_number,
      department: values.department,
      registration_date: values.registration_date,
      warranty_end_date: values.warranty_end_date,
      status: values.status,
    };
    const success = await onSubmit(input);
    setIsSubmitting(false);
    if (success) {
      onOpenChange(false);
    }
  };

  const filteredDepartments = departments.filter((d) => d !== "ทั้งหมด");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "แก้ไขข้อมูลคอมพิวเตอร์" : "เพิ่มคอมพิวเตอร์ใหม่"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="registration_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>วันที่ลงทะเบียน</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warranty_end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>วันหมดประกัน</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "บันทึกการแก้ไข" : "เพิ่มข้อมูล"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
