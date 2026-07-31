export const USER_MESSAGES = {
  CREATED: "Volunteer created successfully",
  UPDATED: "Volunteer updated successfully",
  FETCHED: "Volunteer fetched successfully",
  FETCHED_ALL: "Volunteers fetched successfully",
  PASSWORD_RESET: "Password reset successfully",
  STATUS_UPDATED: "Volunteer status updated successfully",

  NOT_FOUND: "Volunteer not found",
  USERNAME_EXISTS: "A user with this username already exists",
  EMAIL_EXISTS: "A user with this email already exists",
  MOBILE_EXISTS: "A user with this mobile number already exists",
  CANNOT_DELETE: "Volunteers cannot be permanently deleted. Deactivate instead.",
  CANNOT_DEACTIVATE_SELF: "You cannot deactivate your own account",
  CANNOT_RESET_OWN: "You cannot reset your own password from this panel",
} as const;

export const USER_SORT_FIELDS = ["name", "createdAt", "updatedAt"] as const;
export type UserSortField = (typeof USER_SORT_FIELDS)[number];

export const USER_NAME_MIN_LENGTH = 2;
export const USER_NAME_MAX_LENGTH = 150;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 100;
