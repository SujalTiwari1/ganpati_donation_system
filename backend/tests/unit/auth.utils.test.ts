import {
  comparePassword,
  generateAccessToken,
  hashPassword,
  toSafeUser,
  verifyAccessToken,
} from "../../src/modules/auth/auth.utils";
import { UnauthorizedError } from "../../src/shared/errors";
import { buildUser } from "../helpers/fixtures";
import { UserRole } from "@prisma/client";
import jwt from "jsonwebtoken";

describe("auth.utils", () => {
  describe("hashPassword / comparePassword", () => {
    it("hashes a password to a bcrypt hash different from the original", async () => {
      const hash = await hashPassword("Sup3rSecret!");

      expect(hash).not.toBe("Sup3rSecret!");
      expect(hash).toMatch(/^\$2[aby]\$/); // bcrypt hash format
    });

    it("verifies a correct password against its hash", async () => {
      const hash = await hashPassword("Sup3rSecret!");

      await expect(comparePassword("Sup3rSecret!", hash)).resolves.toBe(true);
    });

    it("rejects an incorrect password against a hash", async () => {
      const hash = await hashPassword("Sup3rSecret!");

      await expect(comparePassword("WrongPassword!", hash)).resolves.toBe(false);
    });

    it("produces a different hash each time (unique salt)", async () => {
      const hashOne = await hashPassword("Sup3rSecret!");
      const hashTwo = await hashPassword("Sup3rSecret!");

      expect(hashOne).not.toBe(hashTwo);
    });
  });

  describe("generateAccessToken / verifyAccessToken", () => {
    const payload = { userId: "user-1", role: UserRole.ADMIN, email: "admin@example.com" };

    it("generates a token that verifies back to the original payload", () => {
      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.role).toBe(payload.role);
      expect(decoded.email).toBe(payload.email);
    });

    it("throws UnauthorizedError for a malformed token", () => {
      expect(() => verifyAccessToken("not-a-real-token")).toThrow(UnauthorizedError);
    });

    it("throws UnauthorizedError for a token signed with a different secret", () => {
      const foreignToken = jwt.sign(payload, "some-other-secret-entirely-different");

      expect(() => verifyAccessToken(foreignToken)).toThrow(UnauthorizedError);
    });

    it("throws UnauthorizedError for an expired token", () => {
      const expiredToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: -10, // already expired
      });

      expect(() => verifyAccessToken(expiredToken)).toThrow(UnauthorizedError);
    });
  });

  describe("toSafeUser", () => {
    it("strips passwordHash from the returned object", () => {
      const user = buildUser({ passwordHash: "super-secret-hash" });

      const safeUser = toSafeUser(user);

      expect(safeUser).not.toHaveProperty("passwordHash");
      expect((safeUser as Record<string, unknown>).id).toBe(user.id);
      expect((safeUser as Record<string, unknown>).email).toBe(user.email);
    });
  });
});
