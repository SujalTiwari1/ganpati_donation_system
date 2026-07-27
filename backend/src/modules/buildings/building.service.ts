import { AuditAction, AuditEntity, Prisma, type Building } from "@prisma/client";

import { logger } from "../../config";

import { prisma } from "../../database";

import {
    BadRequestError,
    ConflictError,
    NotFoundError,
} from "../../shared/errors";

import { normalizeBuildingName } from "./building.utils";

import {
    BUILDING_MESSAGES,
} from "./building.constants";

import { auditService } from "../audit/audit.service";

import type {
    BuildingListQuery,
    CreateBuildingInput,
    PaginatedBuildings,
    UpdateBuildingInput,
} from "./building.types";

import {
    BuildingRepository,
    buildingRepository,
} from "./building.repository";

export class BuildingService {
    constructor(
        private readonly repository: BuildingRepository =
            buildingRepository
    ) {}

    //public methods
    async create(
    input: CreateBuildingInput,
    currentUserId: string,
    ipAddress?: string,
    userAgent?: string
): Promise<Building> {

    const normalizedName =
        normalizeBuildingName(
            input.name
        );

    await this.ensureUniqueName(
        normalizedName
    );

    const building = await prisma.$transaction(async (tx) => {
        const created = await this.repository.create(
            {
                name: input.name.trim(),
                normalizedName,
                area: input.area?.trim() || null,
                notes: input.notes?.trim() || null,
                createdById: currentUserId,
            },
            tx
        );

        await auditService.record(
            {
                userId: currentUserId,
                entity: AuditEntity.BUILDING,
                action: AuditAction.CREATE,
                entityId: created.id,
                entityLabel: created.name,
                newValue: JSON.parse(JSON.stringify(created)),
                ipAddress,
                userAgent,
            },
            tx
        );

        return created;
    });

    logger.info(
        "Building created successfully",
        {
            buildingId: building.id,
            createdBy: currentUserId,
        }
    );

    return building;
}

async getById(id: string): Promise<Building> {
    return await this.getBuildingOrThrow(id);
}

async list(
    query: BuildingListQuery
): Promise<PaginatedBuildings> {
    const [buildings, total] = await Promise.all([
        this.repository.list(query),
        this.repository.count(query.search),
    ]);

    return {
        data: buildings,
        pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: Math.ceil(total / query.limit),
        },
    };
}
async update(
    id: string,
    input: UpdateBuildingInput,
    currentUserId: string,
    ipAddress?: string,
    userAgent?: string
): Promise<Building> {
    const building = await this.getBuildingOrThrow(id);

    const data: Prisma.BuildingUncheckedUpdateInput = {
        updatedById: currentUserId, // FIX: was never set — every update silently left this null
    };

    if (input.name !== undefined) {
        const normalizedName = normalizeBuildingName(input.name);

        await this.ensureUniqueName(
            normalizedName,
            id
        );

        data.name = input.name.trim();
        data.normalizedName = normalizedName;
    }

    if (input.area !== undefined) {
        data.area = input.area?.trim() || null;
    }

    if (input.notes !== undefined) {
        data.notes = input.notes?.trim() || null;
    }

    const updated = await prisma.$transaction(async (tx) => {
        const result = await this.repository.update(building.id, data, tx);

        await auditService.record(
            {
                userId: currentUserId,
                entity: AuditEntity.BUILDING,
                action: AuditAction.UPDATE,
                entityId: result.id,
                entityLabel: result.name,
                oldValue: JSON.parse(JSON.stringify(building)),
                newValue: JSON.parse(JSON.stringify(result)),
                ipAddress,
                userAgent,
            },
            tx
        );

        return result;
    });

    logger.info("Building updated", {
        buildingId: updated.id,
        updatedBy: currentUserId,
    });

    return updated;
}
async delete(
    id: string,
    currentUserId: string,
    ipAddress?: string,
    userAgent?: string
): Promise<Building> {

    const building =
        await this.getBuildingOrThrow(id);

    await this.ensureCanDelete(id);

    const deleted = await prisma.$transaction(async (tx) => {
        const result = await this.repository.softDelete(building.id, currentUserId, tx);

        await auditService.record(
            {
                userId: currentUserId,
                entity: AuditEntity.BUILDING,
                action: AuditAction.DELETE,
                entityId: result.id,
                entityLabel: result.name,
                oldValue: JSON.parse(JSON.stringify(building)),
                ipAddress,
                userAgent,
            },
            tx
        );

        return result;
    });

    logger.info("Building deleted", {
        buildingId: deleted.id,
        deletedBy: currentUserId,
    });

    return deleted;
}

async restore(
    id: string
): Promise<Building> {

    const building =
        await this.getBuildingOrThrow(
            id,
            true
        );

    if (building.isActive) {
        throw new BadRequestError(
            BUILDING_MESSAGES.RESTORE_FORBIDDEN
        );
    }

    const restored =
        await this.repository.restore(id);

    logger.info("Building restored", {
        buildingId: restored.id,
    });

    return restored;
}


    //private helpers
    private async getBuildingOrThrow(
    id: string,
    includeDeleted = false
): Promise<Building> {
    const building =
        await this.repository.findById(
            id,
            includeDeleted
        );

    if (!building) {
        throw new NotFoundError(
            BUILDING_MESSAGES.NOT_FOUND
        );
    }

    return building;
}
private async ensureUniqueName(
    normalizedName: string,
    excludeId?: string
): Promise<void> {
    const existing = excludeId
        ? await this.repository.findByNormalizedNameExceptId(
              normalizedName,
              excludeId
          )
        : await this.repository.findByNormalizedName(
              normalizedName
          );

    if (existing) {
        throw new ConflictError(
            BUILDING_MESSAGES.ALREADY_EXISTS
        );
    }
}
private async ensureCanDelete(
    buildingId: string
): Promise<void> {
    const hasDonors =
        await this.repository.hasDonors(
            buildingId
        );

    if (hasDonors) {
        throw new BadRequestError(
            BUILDING_MESSAGES.DELETE_FORBIDDEN
        );
    }
}
}

export const buildingService = new BuildingService();