import { Request, Response } from "express";
import { prisma } from "../database";

export const healthCheck = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const start = Date.now();

  await prisma.$queryRaw`SELECT 1`;

  const dbLatency = Date.now() - start;

  res.status(200).json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: "connected",
      latency: `${dbLatency}ms`,
    },
  });
};