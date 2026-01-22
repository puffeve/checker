import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Monitor, ArrowLeft, Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().trim().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

type FormValues = z.infer<typeof formSchema>;

export function AuthForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(values.email, values.password);
        if (error) {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: error.message === "User already registered" 
              ? "อีเมลนี้ถูกใช้งานแล้ว" 
              : error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "สำเร็จ",
            description: "สร้างบัญชีเรียบร้อยแล้ว",
          });
        }
      } else {
        const { error } = await signIn(values.email, values.password);
        if (error) {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: error.message === "Invalid login credentials"
              ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
              : error.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดำเนินการได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sidebar via-background to-muted flex items-center justify-center p-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        กลับหน้าค้นหา
      </Button>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
            <Monitor className="h-10 w-10 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">
              {isSignUp ? "สร้างบัญชีผู้ดูแล" : "เข้าสู่ระบบผู้ดูแล"}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {isSignUp
                ? "สร้างบัญชีเพื่อจัดการข้อมูลคอมพิวเตอร์"
                : "กรุณาเข้าสู่ระบบเพื่อจัดการข้อมูล"}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>อีเมล</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>รหัสผ่าน</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSignUp ? "สร้างบัญชี" : "เข้าสู่ระบบ"}
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm"
            >
              {isSignUp
                ? "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ"
                : "ยังไม่มีบัญชี? สร้างบัญชีใหม่"}
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            ระบบตรวจสอบซีเรียลนัมเบอร์ | Greenwing & Angelway Group
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
