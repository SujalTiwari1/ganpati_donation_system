import { Request, Response } from "express";

import { asyncHandler } from "../../utils/async-handler";
import { ApiResponse } from "../../shared/responses";
import { getCurrentUser } from "../auth";

import { TRANSACTION_MESSAGES } from "./transaction.constants";
import { TransactionService, transactionService } from "./transaction.service";
import type { TransactionListQuery } from "./transaction.schema";

export class TransactionController {
    constructor(
        private readonly transactionService: TransactionService =
            new TransactionService()
    ) {}

    private getIdParam(req: Request): string {
        const id = req.params.id;
        return Array.isArray(id) ? id[0] : id;
    }

    create = asyncHandler(
        async (req: Request, res: Response) => {

            const user = getCurrentUser(req);

            const transaction =
                await this.transactionService.create(
                    req.body,
                    user.userId
                );

            ApiResponse.created(res, transaction, TRANSACTION_MESSAGES.CREATED);
        }
    );

    list = asyncHandler(
        async (req: Request, res: Response) => {

            // validate(listTransactionsSchema, "query") already parsed/coerced
            // req.query in place — no manual re-parsing needed here.
            const transactions =
                await this.transactionService.list(
                    req.query as unknown as TransactionListQuery
                );

            ApiResponse.success(res, transactions, TRANSACTION_MESSAGES.FETCHED_ALL);
        }
    );

    getById = asyncHandler(
        async (req: Request, res: Response) => {

            const transaction =
                await this.transactionService.getById(
                    this.getIdParam(req)
                );

            ApiResponse.success(res, transaction, TRANSACTION_MESSAGES.FETCHED);
        }
    );

    update = asyncHandler(
        async (req: Request, res: Response) => {

            const user = getCurrentUser(req);

            const transaction =
                await this.transactionService.update(
                    this.getIdParam(req),
                    req.body,
                    user.userId
                );

            ApiResponse.updated(res, transaction, TRANSACTION_MESSAGES.UPDATED);
        }
    );

    cancel = asyncHandler(
        async (req: Request, res: Response) => {

            const user = getCurrentUser(req);

            const transaction =
                await this.transactionService.cancel(
                    this.getIdParam(req),
                    user.userId
                );

            ApiResponse.updated(res, transaction, TRANSACTION_MESSAGES.CANCELLED);
        }
    );
}

export const transactionController =
    new TransactionController();
