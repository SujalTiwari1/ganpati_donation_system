import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { asyncHandler } from "../../utils/async-handler";
import { ApiResponse } from "../../shared/responses";
import { HTTP_STATUS } from "../../config/constants";
import { getCurrentUser } from "../auth";
import { USER_MESSAGES } from "./user.constants";
import { UserService, userService as defaultUserService } from "./user.service";
import type { UserListQuery } from "./user.types";

export class UserController {
  constructor(
    private readonly userService: UserService = defaultUserService,
  ) {}

  private getIdParam(req: Request): string {
    const id = req.params.id;
    return Array.isArray(id) ? id[0] : id;
  }

  private buildListQuery(req: Request): UserListQuery {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const role = (req.query.role as UserRole) ?? UserRole.VOLUNTEER;

    return {
      page: Number.isFinite(page) && page > 0 ? page : 1,
      limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
      role,
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      status: typeof req.query.status === "string" ? (req.query.status as UserListQuery["status"]) : undefined,
      sortBy:
        typeof req.query.sortBy === "string" &&
        ["name", "createdAt", "updatedAt"].includes(req.query.sortBy)
          ? (req.query.sortBy as UserListQuery["sortBy"])
          : undefined,
      sortOrder:
        typeof req.query.sortOrder === "string" &&
        ["asc", "desc"].includes(req.query.sortOrder)
          ? (req.query.sortOrder as UserListQuery["sortOrder"])
          : undefined,
    };
  }

  create = asyncHandler(async (req: Request, res: Response) => {
    const currentUser = getCurrentUser(req);
    const user = await this.userService.create(req.body, currentUser.userId);
    ApiResponse.created(res, user, USER_MESSAGES.CREATED);
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.userService.list(this.buildListQuery(req));
    ApiResponse.success(res, result, USER_MESSAGES.FETCHED_ALL);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.getById(this.getIdParam(req));
    ApiResponse.success(res, user, USER_MESSAGES.FETCHED);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const currentUser = getCurrentUser(req);
    const user = await this.userService.update(
      this.getIdParam(req),
      req.body,
      currentUser.userId,
    );
    ApiResponse.updated(res, user, USER_MESSAGES.UPDATED);
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const currentUser = getCurrentUser(req);
    await this.userService.resetPassword(
      this.getIdParam(req),
      req.body,
      currentUser.userId,
    );
    ApiResponse.success(res, null, USER_MESSAGES.PASSWORD_RESET);
  });

  changeStatus = asyncHandler(async (req: Request, res: Response) => {
    const currentUser = getCurrentUser(req);
    const user = await this.userService.changeStatus(
      this.getIdParam(req),
      req.body,
      currentUser.userId,
    );
    ApiResponse.success(res, user, USER_MESSAGES.STATUS_UPDATED);
  });

  getStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await this.userService.getStats();
    ApiResponse.success(res, stats, HTTP_STATUS.OK.toString());
  });
}

export const userController = new UserController();
