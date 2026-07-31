export type VolunteerStatus = "ACTIVE" | "SUSPENDED";

export interface Volunteer {
  id: string;
  name: string;
  username: string;
  email: string;
  mobile: string;
  role: "ADMIN" | "VOLUNTEER";
  status: VolunteerStatus;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VolunteerStats {
  total: number;
  active: number;
  inactive: number;
  pendingPasswordChange: number;
}

export interface VolunteerListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: "ADMIN" | "VOLUNTEER";
  status?: VolunteerStatus;
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface CreateVolunteerPayload {
  name: string;
  username: string;
  email: string;
  mobile: string;
  password: string;
  role?: "ADMIN" | "VOLUNTEER";
  status?: VolunteerStatus;
}

export interface UpdateVolunteerPayload {
  name?: string;
  username?: string;
  email?: string;
  mobile?: string;
  status?: VolunteerStatus;
}

export interface ResetPasswordPayload {
  password: string;
}

export interface ChangeStatusPayload {
  status: VolunteerStatus;
}
