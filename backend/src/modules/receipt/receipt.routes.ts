import { Router } from "express";

import {
    authenticate,
} from "../auth";;
import { receiptController } from "./receipt.controller";

const router = Router();

router.get(
    "/transactions/:transactionId/receipt",
    authenticate,
    receiptController.generateReceipt.bind(receiptController)
);

export default router;