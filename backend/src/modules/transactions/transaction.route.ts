import { Router, Request, Response, NextFunction } from "express";

import {
    authenticate,
    requireRole,
} from "../auth";

import { UserRole } from "@prisma/client";

import { validate } from "../../middleware";
import { idParamSchema } from "../../shared/validators";
import { NotFoundError } from "../../shared/errors";

import { normalizeBuildingName } from "../buildings/building.utils";
import { buildingRepository } from "../buildings/building.repository";

import {
    createTransactionSchema,
    updateTransactionSchema,
    listTransactionsSchema,
} from "./transaction.schema";

import { transactionController } from "./transaction.controller";

const router = Router();

const transformTransactionCreatePayload = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    const body = req.body as {
        buildingId?: string;
        buildingNormalizedName?: string;
    };

    if (!body.buildingId && body.buildingNormalizedName) {
        const normalizedName = normalizeBuildingName(body.buildingNormalizedName);
        const building = await buildingRepository.findByNormalizedName(normalizedName);

        if (!building) {
            return next(new NotFoundError("Building not found"));
        }

        body.buildingId = building.id;
    }

    next();
};

router.post(
    "/",
    authenticate,
    requireRole(UserRole.ADMIN, UserRole.VOLUNTEER),
    validate(createTransactionSchema),
    transformTransactionCreatePayload,
    transactionController.create
);

router.get(
    "/",
    authenticate,
    validate(listTransactionsSchema, "query"),
    transactionController.list
);

router.get(
    "/:id",
    authenticate,
    validate(idParamSchema, "params"),
    transactionController.getById
);

router.patch(
    "/:id",
    authenticate,
    requireRole(UserRole.ADMIN, UserRole.VOLUNTEER),
    validate(idParamSchema, "params"),
    validate(updateTransactionSchema),
    transactionController.update
);

// Cancel is treated as the destructive action here (schema explicitly
// designed it to replace hard delete) - admin-only, same as delete/restore
// on buildings. Loosen to include VOLUNTEER if you want volunteers to be
// able to self-correct their own mistaken entries on the spot.
router.patch(
    "/:id/cancel",
    authenticate,
    requireRole(UserRole.ADMIN),
    validate(idParamSchema, "params"),
    transactionController.cancel
);

export { router as transactionRouter };
