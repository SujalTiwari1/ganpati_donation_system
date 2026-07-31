import { apiClient, unwrap } from "@/api/client";
import type { ApiEnvelope, User } from "@/types/api";

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

export interface UpdateMyProfilePayload {
  name?: string;
  username?: string;
  email?: string;
  mobile?: string;
}

export const usersService = {
  me: () => unwrap<User>(apiClient.get<ApiEnvelope<User>>("/users/me")),
  updateMyProfile: (payload: UpdateMyProfilePayload) =>
    unwrap<User>(apiClient.patch<ApiEnvelope<User>>("/users/me", payload)),
  myStatistics: () =>
    unwrap<VolunteerStatistics>(apiClient.get<ApiEnvelope<VolunteerStatistics>>("/users/me/statistics")),
  myDonations: (limit = 10) =>
    unwrap<VolunteerDonationListResult>(
      apiClient.get<ApiEnvelope<VolunteerDonationListResult>>("/users/me/donations", {
        params: { limit },
      }),
    ),
};
