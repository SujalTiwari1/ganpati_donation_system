import { Request, Response } from "express";

import { asyncHandler } from "../../utils/async-handler";
import { ApiResponse } from "../../shared/responses";

import { auditService, AuditService } from "./audit.service";
import type { AuditLogListQuery } from "./audit.types";

class AuditController {
    constructor(
        private readonly service: AuditService = auditService
    ) {}

    private getIdParam(req: Request): string {
        const id = req.params.id;
        return Array.isArray(id) ? id[0] : id;
    }

    /**
     * GET /audit-logs
     * Returns paginated audit logs.
     */
    list = asyncHandler(async (req: Request, res: Response) => {
        const query = req.query as unknown as AuditLogListQuery;

        const result = await this.service.list(query);

        ApiResponse.success(res, result, "Audit logs fetched successfully.");
    });

    /**
     * GET /audit-logs/:id
     * Returns a single audit log.
     */
    getById = asyncHandler(async (req: Request, res: Response) => {
        const auditLog = await this.service.getById(this.getIdParam(req));

        ApiResponse.success(res, auditLog, "Audit log fetched successfully.");
    });
}

export const auditController = new AuditController();