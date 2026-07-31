import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CircleCheck as CheckCircle2, Download, Loader as Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { ReceiptPreviewCard } from "@/components/transactions/receipt-preview-card";
import { BuildingCombobox } from "@/components/transactions/building-combobox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateBuilding } from "@/hooks/queries/use-buildings";
import { useCreateTransaction } from "@/hooks/queries/use-transactions";
import { transactionsService } from "@/api/services/transactions.service";
import { useAuth } from "@/providers/auth-provider";
import { PAYMENT_METHODS } from "@/constants";
import { titleCase } from "@/utils/format";
import type { Building, PaymentMethod, Transaction } from "@/types/api";

export const Route = createFileRoute("/transactions/new")({
  head: () => ({
    meta: [
      { title: "New Donation — Vargani CMS" },
      {
        name: "description",
        content: "Record a new Ganpati vargani donation with a live receipt preview.",
      },
      { property: "og:title", content: "New Donation — Vargani CMS" },
      { property: "og:description", content: "Fast, validated donation entry with receipt." },
    ],
  }),
  component: NewDonationPage,
});

const formSchema = z.object({
  buildingId: z.string().min(1, "Select a building"),
  donorName: z.string().trim().min(2, "Donor name is required").max(150),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  roomNumber: z.string().trim().min(1, "Room number is required").max(20),
  amount: z.coerce.number().positive("Amount must be greater than 0").max(1_000_000, "Amount too large"),
  paymentMethod: z.enum(PAYMENT_METHODS),
  notes: z.string().trim().max(500).optional(),
  year: z.coerce.number().int().min(2000).max(new Date().getFullYear() + 1),
});

type FormValues = z.infer<typeof formSchema>;

function NewDonationPage() {
  return (
    <AppShell>
      <NewDonationContent />
    </AppShell>
  );
}

function NewDonationContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createTransaction = useCreateTransaction();
  const createBuilding = useCreateBuilding();

  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [savedTransaction, setSavedTransaction] = useState<Transaction | null>(null);
  const [downloading, setDownloading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      buildingId: "",
      donorName: "",
      mobile: "",
      roomNumber: "",
      amount: 0,
      paymentMethod: "UPI",
      notes: "",
      year: new Date().getFullYear(),
    },
  });

  const watched = form.watch();

  const previewData = useMemo(
    () => ({
      donorName: watched.donorName,
      donorMobile: watched.mobile,
      buildingName: selectedBuilding?.name ?? "",
      roomNumber: watched.roomNumber,
      amount: Number(watched.amount) || 0,
      paymentMethod: watched.paymentMethod as PaymentMethod,
      volunteerName: user?.name,
    }),
    [watched, selectedBuilding, user?.name],
  );

  const handleCreateBuilding = async (typedName: string) => {
    try {
      const building = await createBuilding.mutateAsync({ name: typedName });
      setSelectedBuilding(building);
      form.setValue("buildingId", building.id, { shouldValidate: true });
      toast.success("Building created", { description: building.name });
    } catch {
      // toast handled in mutation
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const transaction = await createTransaction.mutateAsync({
        buildingId: values.buildingId,
        donorName: values.donorName,
        mobile: values.mobile,
        roomNumber: values.roomNumber,
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        notes: values.notes,
        year: values.year,
      });
      setSavedTransaction(transaction);
      toast.success("Donation recorded", {
        description: `Receipt ${transaction.receiptNumber}`,
      });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not save donation";
      toast.error("Could not save donation", { description: message });
    }
  };

  const handleDownload = async () => {
    if (!savedTransaction) return;
    setDownloading(true);
    try {
      const blob = await transactionsService.receiptBlob(savedTransaction.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Receipt_${savedTransaction.receiptNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Receipt downloaded successfully.");
    } catch (e: any) {
      if (e?.status === 404) {
        toast.error("Receipt not found.");
      } else {
        toast.error("Unable to download receipt.");
      }
    } finally {
      setDownloading(false);
    }
  };

  if (savedTransaction) {
    return (
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="card-elevated rounded-xl">
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
              <span className="grid size-16 place-items-center rounded-full bg-success/12 text-success">
                <CheckCircle2 className="size-8" />
              </span>
              <div className="space-y-1">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Donation recorded
                </h2>
                <p className="text-sm text-muted-foreground">
                  Receipt number
                </p>
                <p className="font-mono text-2xl font-semibold text-primary">
                  {savedTransaction.receiptNumber}
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="active:scale-95"
                >
                  {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                  Download receipt
                </Button>
                <Button
                  variant="outline"
                  className="active:scale-95"
                  onClick={() => {
                    setSavedTransaction(null);
                    form.reset();
                    setSelectedBuilding(null);
                  }}
                >
                  <Plus className="size-4" /> Record next donation
                </Button>
                <Button
                  variant="ghost"
                  className="active:scale-95"
                  onClick={() => navigate({ to: "/transactions" })}
                >
                  View all transactions
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Donation"
        description="Record a donation with a live receipt preview."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <Card className="card-elevated rounded-xl">
                <CardContent className="space-y-4 p-5">
                  <FormField
                    control={form.control}
                    name="buildingId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Building</FormLabel>
                        <FormControl>
                          <BuildingCombobox
                            value={field.value}
                            onChange={(building) => {
                              setSelectedBuilding(building);
                              field.onChange(building?.id ?? "");
                            }}
                            onCreateNew={handleCreateBuilding}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="donorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Donor Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Name of donor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number</FormLabel>
                          <FormControl>
                            <Input placeholder="10-digit mobile" maxLength={10} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="roomNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Room #" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Donation Amount (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              step="any"
                              placeholder="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="grid grid-cols-2 gap-2 sm:grid-cols-3"
                          >
                            {PAYMENT_METHODS.map((method) => (
                              <label
                                key={method}
                                className="flex cursor-pointer items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm transition-colors hover:bg-muted/40 has-[:checked]:border-primary has-[:checked]:bg-primary/8"
                              >
                                <RadioGroupItem value={method} />
                                {titleCase(method)}
                              </label>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any remarks about this donation"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Festival Year</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Button
                type="submit"
                size="lg"
                className="w-full active:scale-95"
                disabled={createTransaction.isPending}
              >
                {createTransaction.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                {createTransaction.isPending ? "Saving…" : "Save & Send Receipt"}
              </Button>
            </form>
          </Form>
        </div>

        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-20">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Live receipt preview
            </p>
            <ReceiptPreviewCard data={previewData} />
          </div>
        </div>
      </div>
    </div>
  );
}
