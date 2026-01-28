import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface DeleteComputerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  computerIds: string[];
  onSuccess: () => void;
}

export function DeleteComputerDialog({
  open,
  onOpenChange,
  computerIds,
  onSuccess,
}: DeleteComputerDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (computerIds.length === 0) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("computers")
        .delete()
        .in("id", computerIds);

      if (error) throw error;

      toast.success(`ลบคอมพิวเตอร์ ${computerIds.length} รายการสำเร็จ`);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error deleting computers:", error);
      toast.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ยืนยันการลบข้อมูล</AlertDialogTitle>
          <AlertDialogDescription>
            คุณต้องการลบคอมพิวเตอร์ {computerIds.length} รายการหรือไม่?
            การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "กำลังลบ..." : "ลบข้อมูล"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
