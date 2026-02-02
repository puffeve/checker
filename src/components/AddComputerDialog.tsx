import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  device_name: z.string().min(1),
  serial_number: z.string().min(1),
  department: z.string().min(1),
  status: z.string(),
  contract_start: z.date(),
  warranty_expiry: z.date(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  onSuccess: () => void;
}

export function AddComputerDialog({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "active",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const payload = {
        device_name: values.device_name,
        serial_number: values.serial_number,
        user_name: values.department,
        status: values.status,
        contract_start: format(values.contract_start, "yyyy-MM-dd"),
        warranty_expiry: format(values.warranty_expiry, "yyyy-MM-dd"),
      };

      const { error } = await supabase.from("computers").insert(payload);

      if (error) throw error;

      toast.success("เพิ่มคอมพิวเตอร์สำเร็จ");
      setOpen(false);
      form.reset();
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>+ เพิ่มคอมพิวเตอร์</Button>

      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>เพิ่มคอมพิวเตอร์ใหม่</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="device_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อคอมพิวเตอร์</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>แผนก</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">ใช้งาน</SelectItem>
                      <SelectItem value="repair">ซ่อม</SelectItem>
                      <SelectItem value="retired">ปลดระวาง</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {["contract_start", "warranty_expiry"].map((key) => (
              <FormField
                key={key}
                control={form.control}
                name={key as "contract_start" | "warranty_expiry"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {key === "contract_start" ? "วันที่ลงทะเบียน" : "วันหมดประกัน"}
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal")}
                        >
                          {field.value ? format(field.value, "dd/MM/yyyy") : "เลือกวันที่"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
            ))}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                เพิ่มคอมพิวเตอร์
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}