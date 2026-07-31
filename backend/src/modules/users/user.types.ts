import { UserRole, UserStatus } from "@prisma/client";

export interface CreateUserInput {
  name: string;
  username: string;
  email: string;
  mobile: string;
  password: string;
  role: UserRole;
  status?: UserStatus;
}

export interface UpdateUserInput {
  name?: string;
  username?: string;
  email?: string;
  mobile?: string;
  status?: UserStatus;
}

export interface UserListQuery {
  page: number;
  limit: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface UserPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedUsers {
  data: SafeUserWithMeta[];
  pagination: UserPaginationMeta;
}

export interface SafeUserWithMeta {
  id: string;
  name: string;
  username: string;
  email: string;
  mobile: string;
  role: UserRole;
  status: UserStatus;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResetPasswordInput {
  password: string;
}

export interface ChangeStatusInput {
  status: UserStatus;
}

export interface VolunteerStatistics {
  totalCollections: number;
  totalAmount: number;
  highestDonation: number;
  averageDonation: number;
  buildingsVisited: number;
}

export interface VolunteerDonation {
  id: string;
  receiptNumber: string;
  donorName: string;
  buildingName: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export interface VolunteerDonationListResult {
  data: VolunteerDonation[];
  total: number;
}
