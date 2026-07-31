import { Request, Response } from "express";

import { asyncHandler } from "../../utils/async-handler";
import { ApiResponse } from "../../shared/responses";
import { getCurrentUser } from "../auth";

import { BUILDING_MESSAGES } from "./building.constants";
import { BuildingService } from "./building.service";
import type { BuildingListQuery } from "./building.types";


export class BuildingController {
    constructor(
        private readonly buildingService: BuildingService =
            new BuildingService()
    ) {}

    private getIdParam(req: Request): string {
        const id = req.params.id;
        return Array.isArray(id) ? id[0] : id;
    }

    private buildListQuery(req: Request): BuildingListQuery {
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 10);

        return {
            page: Number.isFinite(page) && page > 0 ? page : 1,
            limit: Number.isFinite(limit) && limit > 0 ? limit : 10,
            search: typeof req.query.search === "string" ? req.query.search : undefined,
            sortBy:
                typeof req.query.sortBy === "string" &&
                ["name", "createdAt", "updatedAt"].includes(req.query.sortBy)
                    ? (req.query.sortBy as BuildingListQuery["sortBy"])
                    : undefined,
            sortOrder:
                typeof req.query.sortOrder === "string" &&
                ["asc", "desc"].includes(req.query.sortOrder)
                    ? (req.query.sortOrder as BuildingListQuery["sortOrder"])
                    : undefined,
        };
    }

    create = asyncHandler(
    async (req: Request, res: Response) => {

        const user = getCurrentUser(req);

        const building =
            await this.buildingService.create(
                req.body,
                user.userId
            );

        ApiResponse.created(res, building, BUILDING_MESSAGES.CREATED);
    }
);

list = asyncHandler(
    async (req: Request, res: Response) => {

        const buildings =
            await this.buildingService.list(this.buildListQuery(req));

        ApiResponse.success(res, buildings, BUILDING_MESSAGES.FETCHED_ALL);
    }
);
getById = asyncHandler(
    async (req: Request, res: Response) => {

        const building =
            await this.buildingService.getById(
                this.getIdParam(req)
            );

        ApiResponse.success(res, building, BUILDING_MESSAGES.FETCHED);
    }
);
update = asyncHandler(
    async (req: Request, res: Response) => {

        const user = getCurrentUser(req);

        const building =
            await this.buildingService.update(
                this.getIdParam(req),
                req.body,
                user.userId
            );

        ApiResponse.updated(res, building, BUILDING_MESSAGES.UPDATED);
    }
);
delete = asyncHandler(
    async (req: Request, res: Response) => {

        const user = getCurrentUser(req);

        const building =
            await this.buildingService.delete(
                this.getIdParam(req),
                user.userId
            );

        ApiResponse.deleted(res, building, BUILDING_MESSAGES.DELETED);
    }
);
restore = asyncHandler(
    async (req: Request, res: Response) => {

        await this.buildingService.restore(this.getIdParam(req));

        ApiResponse.restored(res, null, BUILDING_MESSAGES.RESTORED);
    }
);

getDonatedRooms = asyncHandler(
    async (req: Request, res: Response) => {
        const rooms = await this.buildingService.getDonatedRooms(this.getIdParam(req));
        // We can use a generic success message or add one to BUILDING_MESSAGES
        ApiResponse.success(res, rooms, "Donated rooms fetched successfully");
    }
);
}

export const buildingController =
    new BuildingController();