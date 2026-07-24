import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { authenticate, requireRole, getCurrentUser } from "../../src/modules/auth/auth.middleware";
import { generateAccessToken } from "../../src/modules/auth/auth.utils";
import { UnauthorizedError, ForbiddenError } from "../../src/shared/errors";

function makeReq(overrides: Partial<Request> = {}): Request {
  return { headers: {}, ...overrides } as Request;
}

const res = {} as Response;

describe("auth.middleware", () => {
  describe("authenticate", () => {
    it("calls next() with no error and attaches req.user for a valid token", () => {
      const token = generateAccessToken({
        userId: "user-1",
        role: UserRole.VOLUNTEER,
        email: "v@example.com",
      });
      const req = makeReq({ headers: { authorization: `Bearer ${token}` } });
      const next = jest.fn() as NextFunction;

      authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(); // called with no error
      expect(req.user).toMatchObject({ userId: "user-1", role: UserRole.VOLUNTEER });
    });

    it("calls next(UnauthorizedError) when the Authorization header is missing", () => {
      const req = makeReq();
      const next = jest.fn() as NextFunction;

      authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it("calls next(UnauthorizedError) when the header doesn't start with 'Bearer '", () => {
      const req = makeReq({ headers: { authorization: "Token abc123" } });
      const next = jest.fn() as NextFunction;

      authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it("calls next(UnauthorizedError) when the token portion is empty", () => {
      const req = makeReq({ headers: { authorization: "Bearer " } });
      const next = jest.fn() as NextFunction;

      authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it("calls next(UnauthorizedError) for a garbage/invalid token", () => {
      const req = makeReq({ headers: { authorization: "Bearer not-a-real-jwt" } });
      const next = jest.fn() as NextFunction;

      authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  describe("requireRole", () => {
    it("calls next() with no error when the user's role is allowed", () => {
      const req = makeReq({ user: { userId: "u1", role: UserRole.ADMIN, email: "a@example.com" } });
      const next = jest.fn() as NextFunction;

      requireRole(UserRole.ADMIN)(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it("allows access when the user's role is one of several allowed roles", () => {
      const req = makeReq({
        user: { userId: "u1", role: UserRole.VOLUNTEER, email: "v@example.com" },
      });
      const next = jest.fn() as NextFunction;

      requireRole(UserRole.ADMIN, UserRole.VOLUNTEER)(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it("calls next(ForbiddenError) when the user's role is not allowed", () => {
      const req = makeReq({
        user: { userId: "u1", role: UserRole.VOLUNTEER, email: "v@example.com" },
      });
      const next = jest.fn() as NextFunction;

      requireRole(UserRole.ADMIN)(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it("calls next(UnauthorizedError) when req.user is missing (authenticate didn't run)", () => {
      const req = makeReq();
      const next = jest.fn() as NextFunction;

      requireRole(UserRole.ADMIN)(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  describe("getCurrentUser", () => {
    it("returns req.user when present", () => {
      const user = { userId: "u1", role: UserRole.ADMIN, email: "a@example.com" };
      const req = makeReq({ user });

      expect(getCurrentUser(req)).toEqual(user);
    });

    it("throws UnauthorizedError when req.user is missing", () => {
      const req = makeReq();

      expect(() => getCurrentUser(req)).toThrow(UnauthorizedError);
    });
  });
});
