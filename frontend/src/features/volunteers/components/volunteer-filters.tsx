import { SearchInput } from "@/components/common/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function VolunteerFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sortBy,
  onSortByChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search name, username or phone…"
        className="lg:w-72"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="SUSPENDED">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt:desc">Newest</SelectItem>
            <SelectItem value="createdAt:asc">Oldest</SelectItem>
            <SelectItem value="name:asc">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
