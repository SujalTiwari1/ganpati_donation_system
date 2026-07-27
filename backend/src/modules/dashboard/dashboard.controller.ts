import { Request, Response } from "express";

import { asyncHandler } from "../../utils/async-handler";
import { ApiResponse } from "../../shared/responses";
import { getCurrentUser } from "../auth";

import { DASHBOARD_MESSAGES } from "./dashboard.constants";
import { DashboardService, dashboardService } from "./dashboard.service";

export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService =
            new DashboardService()
    ) {}

    getDashboard = asyncHandler(
        async (req: Request, res: Response) => {

            const user = getCurrentUser(req);

            const dashboard =
                await this.dashboardService.getDashboard(user.userId);

            ApiResponse.success(res, dashboard, DASHBOARD_MESSAGES.FETCHED);
        }
    );
}

export const dashboardController =
    new DashboardController();
