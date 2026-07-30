import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Building2, MoveVertical as MoreVertical, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/common/search-input";
import { StatusBadge } from "@/components/common/status-badge";
import { DataPagination } from "@/components/common/data-pagination";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { TableSkeleton } from "@/components/common/skeletons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useBuildings,
  useCreateBuilding,
  useUpdateBuilding,
  useDeleteBuilding,
  useRestoreBuilding,
} from "@/hooks/queries/use-buildings";
import { useUrlSearchParams } from "@/hooks/use-url-search-params";
import { useAuth } from "@/providers/auth-provider";
import { formatDate, normalizeBuildingName } from "@/utils/format";
import type { Building } from "@/types/api";

export const Route = createFileRoute("/buildings/")({
  head: () => ({
    meta: [
      { title: "Buildings — Vargani CMS" },
      {
        name: "description",
        content: "Manage buildings and societies for vargani collection.",
      },
      { property: "og:title", content: "Buildings — Vargani CMS" },
    ],
  }),
  component: BuildingsPage,
});

const formSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(150),
  area: z.string().trim().max(150).optional(),
  notes: z.string().trim().max(1000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function BuildingsPage() {
  return (
    <AppShell>
      <BuildingsContent />
    </AppShell>
  );
}

function BuildingsContent() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { params: searchParams, setParams } = useUrlSearchParams();

  const page = Number(searchParams.get("page") ?? 1) || 1;
  const limit = Number(searchParams.get("limit") ?? 20) || 20;
  const search = searchParams.get("search") ?? "";
  const sortBy = (searchParams.get("sortBy") ?? "name") as "name" | "createdAt" | "updatedAt";
  const sortOrder = (searchParams.get("sortOrder") ?? "asc") as "asc" | "desc";

  const { data, isLoading, isError, error, refetch } = useBuildings({
    page,
    limit,
    search: search || undefined,
    sortBy,
    sortOrder,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Building | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Building | null>(null);

  const createMutation = useCreateBuilding();
  const updateMutation = useUpdateBuilding();
  const deleteMutation = useDeleteBuilding();
  const restoreMutation = useRestoreBuilding();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", area: "", notes: "" },
  });

  const watchedName = form.watch("name");

  useEffect(() => {
    if (!dialogOpen) {
      setEditing(null);
      form.reset({ name: "", area: "", notes: "" });
    }
  }, [dialogOpen, form]);

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: "", area: "", notes: "" });
    setDialogOpen(true);
  };

  const openEdit = (building: Building) => {
    setEditing(building);
    form.reset({
      name: building.name,
      area: building.area ?? "",
      notes: building.notes ?? "",
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload: values });
      } else {
        await createMutation.mutateAsync(values);
      }
      setDialogOpen(false);
    } catch {
      // toast handled in mutation
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // toast handled in mutation
    }
  };

  const handleRestore = async (building: Building) => {
    try {
      await restoreMutation.mutateAsync(building.id);
    } catch {
      // toast handled in mutation
    }
  };

  const updateParams = (updates: Record<string, string | null>) => {
    setParams(updates);
  };

  const rows = data?.data ?? [];
  const pagination = data?.pagination;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buildings"
        description="Manage the societies and buildings you collect from."
        actions={
          isAdmin ? (
            <Button onClick={openCreate} className="active:scale-95">
              <Plus className="size-4" /> Add Building
            </Button>
          ) : null
        }
      />

      <Card className="card-elevated rounded-xl">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
          <SearchInput
            value={search}
            onChange={(value) => updateParams({ search: value, page: null })}
            placeholder="Search buildings…"
            className="lg:w-72"
          />
          <div className="flex items-center gap-2">
            <Select
              value={sortBy}
              onValueChange={(value) => updateParams({ sortBy: value, page: null })}
            >
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="createdAt">Created date</SelectItem>
                <SelectItem value="updatedAt">Updated date</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortOrder}
              onValueChange={(value) => updateParams({ sortOrder: value, page: null })}
            >
              <SelectTrigger className="h-9 w-[110px]">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isError ? (
          <ErrorState message={(error as Error)?.message} onRetry={() => void refetch()} />
        ) : isLoading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No buildings yet"
            description="Add your first building to start recording donations."
            action={
              isAdmin ? (
                <Button size="sm" onClick={openCreate}>
                  Add building
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Area</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((building, index) => (
                  <motion.tr
                    key={building.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.3) }}
                    className="cursor-pointer transition-colors hover:bg-muted/40"
                    onClick={() => navigate({ to: "/buildings/$id", params: { id: building.id } })}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{building.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {building.normalizedName}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {building.area || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {building.deletedAt ? (
                        <StatusBadge value="DELETED" tone="danger" />
                      ) : (
                        <StatusBadge value="ACTIVE" tone="success" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(building.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      {isAdmin ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => openEdit(building)}>
                              <Pencil className="size-4" /> Edit
                            </DropdownMenuItem>
                            {building.deletedAt ? (
                              <DropdownMenuItem onSelect={() => handleRestore(building)}>
                                <RotateCcw className="size-4" /> Restore
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onSelect={() => setDeleteTarget(building)}
                                className="text-destructive"
                              >
                                <Trash2 className="size-4" /> Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : null}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !isError && pagination ? (
          <DataPagination
            pagination={pagination}
            onPageChange={(p) => updateParams({ page: String(p) })}
            onLimitChange={(l) => updateParams({ limit: String(l), page: "1" })}
          />
        ) : null}
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Building" : "Add Building"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Sai Niwas, B-Wing" {...field} />
                    </FormControl>
                    {watchedName ? (
                      <p className="text-xs text-muted-foreground">
                        Normalized:{" "}
                        <span className="font-mono">{normalizeBuildingName(watchedName)}</span>
                      </p>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Ghansoli" {...field} />
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
                      <Textarea rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving…" : editing ? "Save changes" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this building?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteTarget?.name}? This action will
              fail if the building is linked to active donor profiles.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructiveforeground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
