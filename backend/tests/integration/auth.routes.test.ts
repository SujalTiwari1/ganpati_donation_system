import request from "supertest";
import { UserRole } from "@prisma/client";
import  app  from "../../src/app";
import { authService } from "../../src/modules/auth/auth.service";
import { generateAccessToken } from "../../src/modules/auth/auth.utils";
import { ConflictError, UnauthorizedError } from "../../src/shared/errors";
import { buildAdmin, buildUser } from "../helpers/fixtures";
import { toSafeUser } from "../../src/modules/auth/auth.utils";

jest.mock("../../src/modules/auth/auth.service");

const mockedAuthService = authService as jest.Mocked<typeof authService>;

function adminToken() {
  return generateAccessToken({ userId: "admin-1", role: UserRole.ADMIN, email: "admin@example.com" });
}

function volunteerToken() {
  return generateAccessToken({
    userId: "vol-1",
    role: UserRole.VOLUNTEER,
    email: "vol@example.com",
  });
}

describe("Auth routes (integration)", () => {
  describe("POST /api/v1/auth/login", () => {
    it("200s and returns { user, accessToken } for valid credentials", async () => {
      const user = buildUser({ email: "volunteer@example.com" });
      mockedAuthService.login.mockResolvedValue({
        user: toSafeUser(user),
        accessToken: "signed.jwt.token",
      });

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ identifier: "volunteer@example.com", password: "Sup3rSecret1!" });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        data: { accessToken: "signed.jwt.token" },
      });
      expect(res.body.data.user.email).toBe("volunteer@example.com");
      expect(res.body.data.user).not.toHaveProperty("passwordHash");
    });

    it("422s when the request body fails validation (identifier too short)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ identifier: "no", password: "x" });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(mockedAuthService.login).not.toHaveBeenCalled();
    });

    it("422s when the password field is missing entirely", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({ identifier: "a@example.com" });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it("401s when the service rejects the credentials", async () => {
      mockedAuthService.login.mockRejectedValue(new UnauthorizedError("Invalid email or password"));

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ identifier: "volunteer@example.com", password: "WrongPassword1" });

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ success: false, message: "Invalid email or password" });
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("401s when no Authorization header is sent", async () => {
      const res = await request(app).get("/api/v1/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(mockedAuthService.getProfile).not.toHaveBeenCalled();
    });

    it("401s when the token is malformed", async () => {
      const res = await request(app).get("/api/v1/auth/me").set("Authorization", "Bearer garbage");

      expect(res.status).toBe(401);
    });

    it("200s and returns the profile for a valid token", async () => {
      const user = buildUser();
      mockedAuthService.getProfile.mockResolvedValue(toSafeUser(user));

      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${volunteerToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(user.id);
      expect(res.body.data).not.toHaveProperty("passwordHash");
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("401s without a token", async () => {
      const res = await request(app).post("/api/v1/auth/logout");

      expect(res.status).toBe(401);
    });

    it("200s with a valid token and returns a success message", async () => {
      const res = await request(app)
        .post("/api/v1/auth/logout")
        .set("Authorization", `Bearer ${volunteerToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ success: true, message: "Logout successful" });
    });
  });

  describe("POST /api/v1/auth/register", () => {
    const validBody = {
      name: "New Volunteer",
      email: "new.volunteer@example.com",
      username: "new_volunteer",
      mobile: "9123456780",
      password: "Sup3rSecret1!",
    };

    it("401s without a token", async () => {
      const res = await request(app).post("/api/v1/auth/register").send(validBody);

      expect(res.status).toBe(401);
      expect(mockedAuthService.register).not.toHaveBeenCalled();
    });

    it("403s when the caller is a VOLUNTEER, not an ADMIN", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .set("Authorization", `Bearer ${volunteerToken()}`)
        .send(validBody);

      expect(res.status).toBe(403);
      expect(mockedAuthService.register).not.toHaveBeenCalled();
    });

    it("422s when the body is invalid (weak password), even for an ADMIN", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ ...validBody, password: "weak" });

      expect(res.status).toBe(422);
      expect(mockedAuthService.register).not.toHaveBeenCalled();
    });

    it("422s when the mobile number format is invalid", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ ...validBody, mobile: "12345" });

      expect(res.status).toBe(422);
    });

    it("201s and creates the user when called by an ADMIN with a valid body", async () => {
      const createdUser = buildUser({ ...validBody });
      mockedAuthService.register.mockResolvedValue(toSafeUser(createdUser));

      const res = await request(app)
        .post("/api/v1/auth/register")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(validBody.email);
      expect(res.body.data).not.toHaveProperty("passwordHash");
      expect(mockedAuthService.register).toHaveBeenCalledWith(
        expect.objectContaining({ email: validBody.email }),
        "admin-1"
      );
    });

    it("409s when the service reports a duplicate email", async () => {
      mockedAuthService.register.mockRejectedValue(
        new ConflictError("A user with this email already exists")
      );

      const res = await request(app)
        .post("/api/v1/auth/register")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send(validBody);

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        success: false,
        message: "A user with this email already exists",
      });
    });

    it("defaults role to VOLUNTEER when not provided", async () => {
      mockedAuthService.register.mockResolvedValue(toSafeUser(buildUser({ ...validBody })));

      await request(app)
        .post("/api/v1/auth/register")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send(validBody);

      expect(mockedAuthService.register).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRole.VOLUNTEER }),
        "admin-1"
      );
    });
  });

  describe("PATCH /api/v1/auth/change-password", () => {
    const validBody = {
      currentPassword: "OldPassword1!",
      newPassword: "NewPassword1!",
      confirmPassword: "NewPassword1!",
    };

    it("401s without a token", async () => {
      const res = await request(app).patch("/api/v1/auth/change-password").send(validBody);

      expect(res.status).toBe(401);
      expect(mockedAuthService.changePassword).not.toHaveBeenCalled();
    });

    it("422s when validation fails (passwords don't match)", async () => {
      const res = await request(app)
        .patch("/api/v1/auth/change-password")
        .set("Authorization", `Bearer ${volunteerToken()}`)
        .send({ ...validBody, confirmPassword: "DifferentPassword1!" });

      expect(res.status).toBe(422);
      expect(mockedAuthService.changePassword).not.toHaveBeenCalled();
    });

    it("422s when new password is the same as current password", async () => {
      const res = await request(app)
        .patch("/api/v1/auth/change-password")
        .set("Authorization", `Bearer ${volunteerToken()}`)
        .send({ ...validBody, newPassword: "OldPassword1!", confirmPassword: "OldPassword1!" });

      expect(res.status).toBe(422);
      expect(mockedAuthService.changePassword).not.toHaveBeenCalled();
    });

    it("401s when the service reports incorrect current password", async () => {
      mockedAuthService.changePassword.mockRejectedValue(
        new UnauthorizedError("Current password is incorrect.")
      );

      const res = await request(app)
        .patch("/api/v1/auth/change-password")
        .set("Authorization", `Bearer ${volunteerToken()}`)
        .send(validBody);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Current password is incorrect.");
    });

    it("200s and updates password for valid request", async () => {
      mockedAuthService.changePassword.mockResolvedValue(undefined);

      const res = await request(app)
        .patch("/api/v1/auth/change-password")
        .set("Authorization", `Bearer ${volunteerToken()}`)
        .send(validBody);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Password changed successfully.");
      expect(mockedAuthService.changePassword).toHaveBeenCalledWith(
        "vol-1",
        validBody,
        expect.any(String), // ip address from express (e.g. ::ffff:127.0.0.1)
        expect.any(String)  // user-agent (e.g. node-superagent)
      );
    });
  });

  describe("Unmatched routes", () => {
    it("404s with a consistent error envelope", async () => {
      const res = await request(app).get("/api/v1/auth/does-not-exist");

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // Only referenced to keep the buildAdmin import used and available for future tests.
  it("fixture sanity check: buildAdmin produces an ADMIN role user", () => {
    expect(buildAdmin().role).toBe(UserRole.ADMIN);
  });
});
