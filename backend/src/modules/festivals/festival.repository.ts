// INTERNAL USE ONLY.
// There is deliberately no festival.controller.ts / festival.route.ts —
// per product decision, there's no festival-management UI yet. This repository
// exists so transaction.service.ts can (a) find-or-create a Festival by year,
// and (b) atomically allocate the next receipt number per festival.

import { Festival, Prisma } from "@prisma/client";
import { prisma } from "../../database";

export class FestivalRepository {
    async findByYear(
        year: number,
        tx: Prisma.TransactionClient = prisma
    ): Promise<Festival | null> {
        return tx.festival.findUnique({ where: { year } });
    }

    async create(
        data: Prisma.FestivalUncheckedCreateInput,
        tx: Prisma.TransactionClient = prisma
    ): Promise<Festival> {
        return tx.festival.create({ data });
    }

    /**
     * Atomically increments lastReceiptSeq and returns the NEW value.
     * Must be called inside the same prisma.$transaction as the
     * Transaction insert it's generating a receipt number for —
     * Postgres row-locks this UPDATE, so concurrent callers serialize
     * naturally instead of racing on a read-then-write.
     */
    async incrementReceiptSeq(
        festivalId: string,
        tx: Prisma.TransactionClient = prisma
    ): Promise<number> {
        const updated = await tx.festival.update({
            where: { id: festivalId },
            data: { lastReceiptSeq: { increment: 1 } },
            select: { lastReceiptSeq: true },
        });
        return updated.lastReceiptSeq;
    }
}

export const festivalRepository = new FestivalRepository();
