// INTERNAL USE ONLY.
// There is deliberately no donor.controller.ts / donor.route.ts / donor.schema.ts —
// per product decision, Donor has no standalone CRUD API. This repository exists
// solely so transaction.service.ts can find-or-create a Donor as a side effect of
// recording a transaction.

import { Donor, Prisma } from "@prisma/client";
import { prisma } from "../../database";

export class DonorRepository {
    async findByMobileBuildingRoom(
        mobile: string,
        buildingId: string,
        roomNumber: string,
        tx: Prisma.TransactionClient = prisma
    ): Promise<Donor | null> {
        // Matches the @@unique([mobile, buildingId, roomNumber]) constraint —
        // this is a donor's identity in a system with no dedicated donor UI.
        return tx.donor.findUnique({
            where: {
                mobile_buildingId_roomNumber: {
                    mobile,
                    buildingId,
                    roomNumber,
                },
            },
        });
    }

    async create(
        data: Prisma.DonorUncheckedCreateInput,
        tx: Prisma.TransactionClient = prisma
    ): Promise<Donor> {
        return tx.donor.create({ data });
    }
}

export const donorRepository = new DonorRepository();
