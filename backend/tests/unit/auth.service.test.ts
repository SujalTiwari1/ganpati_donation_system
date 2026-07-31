import { UserRole, UserStatus } from "@prisma/client";
import { authService } from "../../src/modules/auth/auth.service";
import { authRepository } from "../../src/modules/auth/auth.repository";
import { auditService } from "../../src/modules/audit/audit.service";
import { hashPassword } from "../../src/modules/auth/auth.utils";
import { ConflictError, UnauthorizedError } from "../../src/shared/errors";
import { buildAdmin, buildUser } from "../helpers/fixtures";

jest.mock("../../src/modules/auth/auth.repository");
jest.mock("../../src/modules/audit/audit.service");

const mockedRepo = authRepository as jest.Mocked<typeof authRepository>;
const mockedAudit = auditService as jest.Mocked<typeof auditService>;

describe("authService", () => {
  describe("login", () => {
    it("returns a user and access token for valid credentials", async () => {
      const plainPassword = "Sup3rSecret!";
      const passwordHash = await hashPassword(plainPassword);
      const user = buildUser({ email: "volunteer@example.com", passwordHash });

      mockedRepo.findByIdentifier.mockResolvedValue(user);
      mockedRepo.updateLastLogin.mockResolvedValue({ ...user, lastLoginAt: new Date() });

      const result = await authService.login({ identifier: user.email!, password: plainPassword });

      expect(result.accessToken).toEqual(expect.any(String));
      expect(result.user.email).toBe(user.email);
      expect(result.user).not.toHaveProperty("passwordHash");
      expect(mockedRepo.updateLastLogin).toHaveBeenCalledWith(user.id);
    });

    it("throws UnauthorizedError when the user does not exist", async () => {
      mockedRepo.findByIdentifier.mockResolvedValue(null);

      await expect(
        authService.login({ identifier: "ghost@example.com", password: "whatever" })
      ).rejects.toThrow(UnauthorizedError);

      expect(mockedRepo.updateLastLogin).not.toHaveBeenCalled();
    });

    it("throws UnauthorizedError when the user is soft-deleted", async () => {
      const user = buildUser({ deletedAt: new Date() });
      mockedRepo.findByIdentifier.mockResolvedValue(user);

      await expect(
        authService.login({ identifier: user.email!, password: "whatever" })
      ).rejects.toThrow(UnauthorizedError);
    });

    it("throws UnauthorizedError when the account is INACTIVE", async () => {
      const user = buildUser({ status: UserStatus.INACTIVE });
      mockedRepo.findByIdentifier.mockResolvedValue(user);

      await expect(
        authService.login({ identifier: user.email!, password: "whatever" })
      ).rejects.toThrow(UnauthorizedError);

      expect(mockedRepo.updateLastLogin).not.toHaveBeenCalled();
    });

    it("throws UnauthorizedError when the password is incorrect", async () => {
      const passwordHash = await hashPassword("CorrectPassword1");
      const user = buildUser({ passwordHash });
      mockedRepo.findByIdentifier.mockResolvedValue(user);

      await expect(
        authService.login({ identifier: user.email!, password: "WrongPassword1" })
      ).rejects.toThrow(UnauthorizedError);

      expect(mockedRepo.updateLastLogin).not.toHaveBeenCalled();
    });

    it("never leaks the password hash on any success or failure path", async () => {
      const passwordHash = await hashPassword("Sup3rSecret!");
      const user = buildUser({ passwordHash });
      mockedRepo.findByIdentifier.mockResolvedValue(user);
      mockedRepo.updateLastLogin.mockResolvedValue(user);

      const result = await authService.login({ identifier: user.email!, password: "Sup3rSecret!" });

      expect(JSON.stringify(result)).not.toContain(passwordHash);
    });
  });

  describe("register", () => {
    const input = {
      name: "New Volunteer",
      email: "new.volunteer@example.com",
      username: "new_volunteer",
      mobile: "9123456780",
      password: "Sup3rSecret1!",
      role: UserRole.VOLUNTEER,
    };

    it("creates a new user when email and mobile are unique", async () => {
      mockedRepo.findByEmail.mockResolvedValue(null);
      mockedRepo.findByMobile.mockResolvedValue(null);
      mockedRepo.create.mockResolvedValue(buildUser({ ...input }));

      const result = await authService.register(input, "admin-1");

      expect(result.email).toBe(input.email);
      expect(result).not.toHaveProperty("passwordHash");
      expect(mockedRepo.create).toHaveBeenCalledTimes(1);
    });

    it("writes an audit log entry on successful registration", async () => {
      mockedRepo.findByEmail.mockResolvedValue(null);
      mockedRepo.findByMobile.mockResolvedValue(null);
      const createdUser = buildUser({ ...input });
      mockedRepo.create.mockResolvedValue(createdUser);

      await authService.register(input, "admin-1");

      expect(mockedAudit.record).toHaveBeenCalledWith(
        expect.objectContaining({ actorId: "admin-1", action: "USER_CREATED", targetId: createdUser.id })
      );
    });

    it("throws ConflictError when the email is already taken", async () => {
      mockedRepo.findByEmail.mockResolvedValue(buildUser({ email: input.email }));
      mockedRepo.findByMobile.mockResolvedValue(null);

      await expect(authService.register(input, "admin-1")).rejects.toThrow(ConflictError);
      expect(mockedRepo.create).not.toHaveBeenCalled();
    });

    it("throws ConflictError when the mobile is already taken", async () => {
      mockedRepo.findByEmail.mockResolvedValue(null);
      mockedRepo.findByMobile.mockResolvedValue(buildUser({ mobile: input.mobile }));

      await expect(authService.register(input, "admin-1")).rejects.toThrow(ConflictError);
      expect(mockedRepo.create).not.toHaveBeenCalled();
    });

    it("stores a bcrypt hash, never the plaintext password", async () => {
      mockedRepo.findByEmail.mockResolvedValue(null);
      mockedRepo.findByMobile.mockResolvedValue(null);
      mockedRepo.create.mockResolvedValue(buildUser({ ...input }));

      await authService.register(input, "admin-1");

      const createArg = mockedRepo.create.mock.calls[0][0] as { passwordHash: string };
      expect(createArg.passwordHash).not.toBe(input.password);
      expect(createArg.passwordHash).toMatch(/^\$2[aby]\$/);
    });
  });

  describe("getProfile", () => {
    it("returns the safe user for an active, non-deleted user", async () => {
      const user = buildAdmin();
      mockedRepo.findById.mockResolvedValue(user);

      const profile = await authService.getProfile(user.id);

      expect(profile.id).toBe(user.id);
      expect(profile).not.toHaveProperty("passwordHash");
    });

    it("throws UnauthorizedError when the user no longer exists", async () => {
      mockedRepo.findById.mockResolvedValue(null);

      await expect(authService.getProfile("missing-user")).rejects.toThrow(UnauthorizedError);
    });

    it("throws UnauthorizedError when the user was soft-deleted", async () => {
      const user = buildUser({ deletedAt: new Date() });
      mockedRepo.findById.mockResolvedValue(user);

      await expect(authService.getProfile(user.id)).rejects.toThrow(UnauthorizedError);
    });

    it("throws UnauthorizedError when the user is INACTIVE", async () => {
      const user = buildUser({ status: UserStatus.INACTIVE });
      mockedRepo.findById.mockResolvedValue(user);

      await expect(authService.getProfile(user.id)).rejects.toThrow(UnauthorizedError);
    });
  });
});
