import { asyncHandler } from "../../utils/async-handler";
import { ApiResponse } from "../../shared/responses";
import { HTTP_STATUS } from "../../config/constants";
import { authService } from "./auth.service";
import { getCurrentUser } from "./auth.middleware";
import { AUTH_MESSAGES } from "./auth.constants";
import type { LoginInput, RegisterInput, ChangePasswordInput } from "./auth.schema";

/**
 * Every handler follows the same three-line shape:
 *   1. read validated input (body/params already parsed by `validate()`)
 *   2. delegate to authService
 *   3. respond with ApiResponse
 * No try/catch, no Prisma calls, no business rules here.
 */

export const login = asyncHandler(async (req, res) => {
  const input = req.body as LoginInput;

  const { user, accessToken } = await authService.login(input);

  ApiResponse.send(res, {
    statusCode: HTTP_STATUS.OK,
    message: AUTH_MESSAGES.LOGIN_SUCCESS,
    data: { user, accessToken },
  });
});

export const register = asyncHandler(async (req, res) => {
  const input = req.body as RegisterInput;
  const currentUser = getCurrentUser(req);

  const newUser = await authService.register(input, currentUser.userId);

  ApiResponse.send(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: AUTH_MESSAGES.REGISTER_SUCCESS,
    data: newUser,
  });
});

export const me = asyncHandler(async (req, res) => {
  const currentUser = getCurrentUser(req);

  const profile = await authService.getProfile(currentUser.userId);

  ApiResponse.send(res, {
    statusCode: HTTP_STATUS.OK,
    message: AUTH_MESSAGES.PROFILE_FETCHED,
    data: profile,
  });
});

export type { ChangePasswordInput } from "./auth.schema";

export const logout = asyncHandler(async (_req, res) => {
  // Stateless JWT: nothing to invalidate server-side today. Structured
  // this way so a refresh-token / blacklist store can be added later
  // by calling e.g. `await tokenBlacklistService.revoke(token)` here
  // without changing the route contract.
  ApiResponse.send(res, {
    statusCode: HTTP_STATUS.OK,
    message: AUTH_MESSAGES.LOGOUT_SUCCESS,
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const input = req.body as ChangePasswordInput;
  const currentUser = getCurrentUser(req);

  await authService.changePassword(
    currentUser.userId,
    input,
    req.ip,
    req.headers["user-agent"]
  );

  ApiResponse.send(res, {
    statusCode: HTTP_STATUS.OK,
    message: "Password changed successfully.",
  });
});
