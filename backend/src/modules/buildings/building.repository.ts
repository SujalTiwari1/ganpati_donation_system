import {
    Building,
    Prisma,
} from "@prisma/client";

import { prisma } from "../../database";

import {
    BuildingListQuery,
    CreateBuildingInput,
    UpdateBuildingInput,
} from "./building.types";

 export class BuildingRepository {
    async findById(
    id: string,
    includeDeleted = false
): Promise<Building | null> {

    return prisma.building.findFirst({
        where: {
            id,
            ...(includeDeleted
                ? {}
                : {
                    deletedAt: null,
                }),
        },
    });

}

async findByNormalizedName(
    normalizedName: string
): Promise<Building | null> {

    return prisma.building.findFirst({

        where: {
            normalizedName,
        },

    });

}
async create(
    data: Prisma.BuildingUncheckedCreateInput,
    tx: Prisma.TransactionClient = prisma
): Promise<Building> {

    return tx.building.create({

        data,

    });

}
async update(
    id: string,
    data: Prisma.BuildingUncheckedUpdateInput,
    tx: Prisma.TransactionClient = prisma
): Promise<Building> {

    return tx.building.update({

        where: {
            id,
        },

        data,

    });

}
async softDelete(
    id: string,
    deletedById: string,
    tx: Prisma.TransactionClient = prisma
): Promise<Building> {

    return tx.building.update({

        where: {
            id,
        },

        data: {
            deletedAt: new Date(),
            deletedById, // FIX: was missing — deletedById column was never being set
        },

    });

}
async restore(
    id: string
): Promise<Building> {

    return prisma.building.update({

        where: {
            id,
        },

        data: {
            deletedAt: null,
            deletedById: null, // clear the audit trail pointer along with the soft-delete flag
        },

    });

}
async hasDonors(
    buildingId: string
): Promise<boolean> {

    const count =
        await prisma.donor.count({

            where: {

                buildingId,

                deletedAt: null,

            },

        });

    return count > 0;

}
async list(
    query: BuildingListQuery
) {

    const {

        page,

        limit,

        search,

        sortBy,

        sortOrder,

    } = query;

    return prisma.building.findMany({

        where: {

            deletedAt: null,

            ...(search && {

                name: {

                    contains: search,

                    mode: "insensitive",

                },

            }),

        },

        orderBy: {

            [sortBy ?? "name"]:
                sortOrder ?? "asc",

        },

        skip:
            (page - 1) * limit,

        take:
            limit,

    });

}
async count(
    search?: string
) {

    return prisma.building.count({

        where: {

            deletedAt: null,

            ...(search && {

                name: {

                    contains: search,

                    mode: "insensitive",

                },

            }),

        },

    });
}
async findByNormalizedNameExceptId(
    normalizedName: string,
    buildingId: string
): Promise<Building | null> {
    return prisma.building.findFirst({
        where: {
            normalizedName,
            NOT: {
                id: buildingId,
            },
        },
    });
}

}

export const buildingRepository = new BuildingRepository();