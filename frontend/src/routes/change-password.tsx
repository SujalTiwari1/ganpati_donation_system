import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Loader as Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
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

export const Route = createFileRoute("/change-password")({
  head: () => ({
    meta: [
      { title: "Change Password — Vargani CMS" },
      {
        name: "description",
        content: "Set a new password to continue using the application.",
      },
    ],
  }),
  component: ChangePasswordPage,
});

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be at most 72 characters")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number")
      .regex(/[^a-zA-Z0-9]/, "Password must contain a special character"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

function ChangePasswordPage() {
  const { isAuthenticated, isBooting, mustChangePassword, changePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isBooting && !isAuthenticated) {
      navigate({ to: "/login", replace: true });
    }
  }, [isBooting, isAuthenticated, navigate]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await changePassword(values.currentPassword, values.newPassword);
      toast.success("Password changed successfully.");
      navigate({ to: "/dashboard", replace: true });
    } catch (caught) {
      const message =
        caught && typeof caught === "object" && "message" in caught
          ? String((caught as { message: string }).message)
          : "Could not change password";
      toast.error("Password change failed", { description: message });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="card-elevated rounded-xl">
          <CardHeader className="space-y-2 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-xl bg-primary/12 text-primary">
              <Lock className="size-6" />
            </span>
            <CardTitle className="text-xl">Change Password</CardTitle>
            <p className="text-sm text-muted-foreground">
              {mustChangePassword
                ? "You must set a new password before continuing."
                : "Set a new password for your account."}
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter current password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Min 8 chars, upper, lower, number, special"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Re-enter new password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full active:scale-95" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Change Password
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
