import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { buildingsService } from "@/api/services/buildings.service";
import type { Building } from "@/types/api";
import { cn } from "@/lib/utils";

export function BuildingCombobox({
  value,
  onChange,
  onCreateNew,
  className,
}: {
  value: string | null;
  onChange: (building: Building | null) => void;
  onCreateNew?: (typedName: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["buildings", "combobox", query],
    queryFn: () =>
      buildingsService.list({
        search: query || undefined,
        limit: 50,
        sortBy: "name",
        sortOrder: "asc",
      }),
    staleTime: 30 * 1000,
  });

  const buildings = data?.data ?? [];
  const selected = buildings.find((b) => b.id === value) ?? null;

  const handleCreate = () => {
    setOpen(false);
    onCreateNew?.(query);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
        >
          {selected ? selected.name : "Select building…"}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Search className="mr-2 size-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search buildings…"
              value={query}
              onValueChange={setQuery}
              className="h-9"
            />
          </div>
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading…" : "No building found."}
            </CommandEmpty>
            <CommandGroup>
              {buildings.map((building) => (
                <CommandItem
                  key={building.id}
                  value={building.id}
                  onSelect={() => {
                    onChange(building.id === value ? null : building);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      selected?.id === building.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex-1 truncate">{building.name}</span>
                  {building.area ? (
                    <span className="text-xs text-muted-foreground">{building.area}</span>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
            {query && onCreateNew ? (
              <CommandGroup>
                <CommandItem onSelect={handleCreate}>
                  <Plus className="mr-2 size-4 text-primary" />
                  <span className="text-primary">
                    Create new building: “{query}”
                  </span>
                </CommandItem>
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
