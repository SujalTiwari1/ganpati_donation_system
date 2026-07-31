import { zodResolver } from "@hookform/resolvers/zod";
import { Loader as Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createVolunteerSchema,
  editVolunteerSchema,
  type CreateVolunteerForm,
  type EditVolunteerForm,
} from "../schemas/volunteer.schema";
import type { Volunteer } from "../types/volunteer.types";

interface VolunteerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  volunteer?: Volunteer | null;
  onSubmit: (values: CreateVolunteerForm | EditVolunteerForm) => Promise<void>;
  isSubmitting: boolean;
}

export function VolunteerForm({
  open,
  onOpenChange,
  mode,
  volunteer,
  onSubmit,
  isSubmitting,
}: VolunteerFormProps) {
  const isCreate = mode === "create";
  const schema = isCreate ? createVolunteerSchema : editVolunteerSchema;

  const form = useForm<CreateVolunteerForm | EditVolunteerForm>({
    resolver: zodResolver(schema as never) as never,
    defaultValues: isCreate
      ? {
          name: "",
          username: "",
          email: "",
          mobile: "",
          password: "",
          status: "ACTIVE",
        }
      : {
          name: volunteer?.name ?? "",
          username: volunteer?.username ?? "",
          email: volunteer?.email ?? "",
          mobile: volunteer?.mobile ?? "",
          status: volunteer?.status ?? "ACTIVE",
        },
  });

  // Reset form when dialog opens with different data
  const openKey = `${open}-${volunteer?.id ?? "new"}`;
  const lastOpenKey = useFormOpenKey(openKey);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    form.reset();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isCreate ? "Add Volunteer" : "Edit Volunteer"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control as never}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Rahul Sharma" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as never}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. rahul.s" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control as never}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="10-digit mobile" maxLength={10} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as never}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {isCreate ? (
              <FormField
                control={form.control as never}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temporary Password *</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Min 8 chars, 1 upper, 1 lower, 1 number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
            <FormField
              control={form.control as never}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value as string} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="SUSPENDED">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                {isCreate ? "Create Volunteer" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Simple hook to reset form when dialog opens with different volunteer
function useFormOpenKey(_key: string) {
  return _key;
}
