/**
 * Lightweight, framework-agnostic route documentation for the auth
 * module. Not wired into a Swagger UI yet, but kept in one place so
 * it can be fed into an OpenAPI generator later without touching
 * routes/controllers.
 */
export const authDocs = {
  "POST /auth/login": {
    summary: "Authenticate a user and receive a JWT access token",
    auth: "public",
    body: { identifier: "string", password: "string" },
    examples: [
      { identifier: "rahul_1", password: "Test@123" },
      { identifier: "rahul@gmail.com", password: "Test@123" },
      { identifier: "9876543210", password: "Test@123" },
    ],
    responses: { 200: "LoginResult", 401: "Invalid credentials / inactive account" },
  },
  "GET /auth/me": {
    summary: "Get the current authenticated user's profile",
    auth: "bearer",
    responses: { 200: "SafeUser", 401: "Unauthenticated" },
  },
  "POST /auth/logout": {
    summary: "Log out the current session (stateless JWT no-op today)",
    auth: "bearer",
    responses: { 200: "Success message" },
  },
  "POST /auth/register": {
    summary: "Create a new user (ADMIN only)",
    auth: "bearer",
    roles: ["ADMIN"],
    body: { name: "string", email: "string", mobile: "string", password: "string", role: "UserRole" },
    responses: { 201: "SafeUser", 409: "Email/mobile already exists" },
  },
  "PATCH /auth/change-password": {
    summary: "Change the password of the current authenticated user",
    auth: "bearer",
    roles: ["ADMIN", "VOLUNTEER"],
    body: { currentPassword: "string", newPassword: "string", confirmPassword: "string" },
    responses: { 200: "Success message", 400: "Validation failed / passwords match", 401: "Unauthenticated / incorrect current password" },
  },
} as const;
